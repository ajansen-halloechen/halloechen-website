"""OR-Tools CP-SAT model for monthly shift assignment.

We treat monthly shift planning as a constraint-satisfaction / optimization
problem: for each (user, shift) pair where the user marked themselves as
available or preferred, decide whether to assign them.

Hard constraints (must never be violated):
  - A shift never gets more people than its ``numberOfPersons``.
  - A user works at most one shift per ISO week.

Soft goals (pushed via a weighted objective, never as hard rules):
  - Fill as many shift slots as possible.
  - Prefer people who marked "preference" over plain "available".
  - Keep total loads roughly equal across assignable users.
  - Avoid giving the same person shifts in consecutive ISO weeks.

Because fill dominates the weights, the solver will never leave a slot empty
just to improve fairness or spread — those only break ties.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List, Mapping, Optional, Tuple

from ortools.sat.python import cp_model

from planning_io import PlanningInput, PlannedShift

# Priority weights for the soft objective. Magnitudes are spaced so a lower-
# priority term can never outweigh a higher one for realistic problem sizes.
# Example: one filled slot (10_000) beats 100 preference bonuses (100 each).
W_FILL = 10_000  # reward every assigned person-slot
W_PREF = 100  # extra reward when that assignment is a "preference"
W_FAIR = 10  # penalty per unit of (max_load - min_load)
W_SPREAD = 1  # penalty when one user works consecutive ISO weeks


@dataclass(frozen=True)
class AssignmentResult:
    status_name: str
    assignments: List[Tuple[str, str]]  # (planned_shift_id, user_id)
    loads: Mapping[str, int]  # user_id -> number of assigned shifts
    objective_value: Optional[int]


def build_and_solve(
    planning: PlanningInput,
    time_limit_seconds: Optional[float] = None,
) -> AssignmentResult:
    """Build the CP-SAT model from ``planning``, solve it, and extract assignments."""
    model = cp_model.CpModel()

    # ------------------------------------------------------------------
    # Decision variables
    #
    # x[u, s] = 1  <=>  assign user u to shift s.
    # We only create a variable for eligible pairs (user marked available or
    # preference for that shift). Ineligible pairs simply do not exist in the
    # model, so they can never be chosen.
    # ------------------------------------------------------------------
    x: Dict[Tuple[str, str], cp_model.IntVar] = {}
    for user_id, shift_id in planning.eligible_pairs:
        x[(user_id, shift_id)] = model.NewBoolVar("x_{}_{}".format(user_id, shift_id))

    # Index the same variables by shift / user / (user, week) so constraints
    # below can sum over the relevant subset without scanning all of x again.
    vars_by_shift: Dict[str, List[cp_model.IntVar]] = defaultdict(list)
    vars_by_user: Dict[str, List[cp_model.IntVar]] = defaultdict(list)
    vars_by_user_week: Dict[Tuple[str, Tuple[int, int]], List[cp_model.IntVar]] = (
        defaultdict(list)
    )

    for (user_id, shift_id), var in x.items():
        shift = planning.shifts_by_id[shift_id]
        vars_by_shift[shift_id].append(var)
        vars_by_user[user_id].append(var)
        vars_by_user_week[(user_id, shift.iso_week)].append(var)

    # ------------------------------------------------------------------
    # Hard constraint: capacity per shift
    #
    # sum_u x[u, s] <= numberOfPersons[s]
    #
    # Under-staffing is allowed (soft fill in the objective). Over-staffing
    # is forbidden. If nobody is eligible for a shift, its var list is empty
    # and the shift stays unfilled.
    # ------------------------------------------------------------------
    for shift in planning.shifts:
        assigned = vars_by_shift.get(shift.id, [])
        if assigned:
            model.Add(sum(assigned) <= shift.number_of_persons)

    # ------------------------------------------------------------------
    # Hard constraint: at most one shift per user per ISO week
    #
    # Prevents e.g. Tuesday + Friday in the same calendar week for one person.
    # A single candidate variable already implies <= 1, so we only add the
    # inequality when there are multiple options that week.
    # ------------------------------------------------------------------
    for (_user_id, _week), week_vars in vars_by_user_week.items():
        if len(week_vars) > 1:
            model.Add(sum(week_vars) <= 1)

    # ------------------------------------------------------------------
    # Soft objective: maximize a weighted linear combination of rewards /
    # penalties. CP-SAT maximizes, so penalties enter with a minus sign.
    # ------------------------------------------------------------------
    objective_terms: List[cp_model.LinearExpr] = []

    # (1) Fill — each assigned person-slot contributes W_FILL.
    #     Dominates all other terms, so the solver fills every slot it can.
    if x:
        objective_terms.append(W_FILL * sum(x.values()))

    # (2) Preference — among ways to fill a slot, prefer users who marked
    #     "preference" over those who only marked "available".
    pref_vars = [
        var
        for (user_id, shift_id), var in x.items()
        if planning.availability_by_pair[(user_id, shift_id)] == "preference"
    ]
    if pref_vars:
        objective_terms.append(W_PREF * sum(pref_vars))

    # (3) Fairness — minimize the gap between the busiest and least-busy
    #     assignable user (max_load - min_load).
    #
    #     We introduce an integer load[u] = sum of that user's assignment vars,
    #     then max_load / min_load over those loads, then imbalance = max - min.
    #     Penalizing imbalance in the objective spreads work without forcing
    #     perfect equality (which could conflict with fill / preferences).
    assignable_users = sorted(
        {
            user_id
            for user_id, _shift_id in planning.eligible_pairs
        }
    )
    load_vars: Dict[str, cp_model.IntVar] = {}
    max_possible_load = len(planning.shifts)
    if assignable_users:
        for user_id in assignable_users:
            user_vars = vars_by_user.get(user_id, [])
            load = model.NewIntVar(0, max_possible_load, "load_{}".format(user_id))
            if user_vars:
                model.Add(load == sum(user_vars))
            else:
                model.Add(load == 0)
            load_vars[user_id] = load

        max_load = model.NewIntVar(0, max_possible_load, "max_load")
        min_load = model.NewIntVar(0, max_possible_load, "min_load")
        model.AddMaxEquality(max_load, list(load_vars.values()))
        model.AddMinEquality(min_load, list(load_vars.values()))
        imbalance = model.NewIntVar(0, max_possible_load, "imbalance")
        model.Add(imbalance == max_load - min_load)
        objective_terms.append(-W_FAIR * imbalance)

    # (4) Spread — discourage the same user working in consecutive ISO weeks
    #     (e.g. week 12 then week 13). This is the weakest soft goal.
    #
    #     For each user and each pair of their eligible shifts that fall in
    #     consecutive weeks, introduce a boolean ``both`` that is true iff
    #     both assignment vars are 1, and subtract W_SPREAD when it is true:
    #
    #       both <=> (var_a AND var_b)
    #       encoded with:
    #         AddBoolAnd([var_a, var_b]).OnlyEnforceIf(both)      # both => both vars
    #         AddBoolOr([~var_a, ~var_b]).OnlyEnforceIf(~both)    # ~both => at least one off
    #
    #     Note: the hard "one shift per week" rule already prevents two shifts
    #     in the *same* week; this only looks across adjacent weeks.
    shifts_by_user_eligible: Dict[str, List[PlannedShift]] = defaultdict(list)
    for user_id, shift_id in planning.eligible_pairs:
        shifts_by_user_eligible[user_id].append(planning.shifts_by_id[shift_id])

    for user_id, user_shifts in shifts_by_user_eligible.items():
        # Deduplicate (a user can only have one eligibility row per shift) and
        # sort chronologically so we only compare each pair once.
        unique = {s.id: s for s in user_shifts}
        ordered = sorted(unique.values(), key=lambda s: s.date)
        for i, shift_a in enumerate(ordered):
            week_a = shift_a.iso_week
            for shift_b in ordered[i + 1 :]:
                week_b = shift_b.iso_week
                if not _are_consecutive_iso_weeks(week_a, week_b):
                    continue
                var_a = x.get((user_id, shift_a.id))
                var_b = x.get((user_id, shift_b.id))
                if var_a is None or var_b is None:
                    continue
                both = model.NewBoolVar(
                    "consec_{}_{}_{}".format(user_id, shift_a.id, shift_b.id)
                )
                model.AddBoolAnd([var_a, var_b]).OnlyEnforceIf(both)
                model.AddBoolOr([var_a.Not(), var_b.Not()]).OnlyEnforceIf(both.Not())
                objective_terms.append(-W_SPREAD * both)

    if objective_terms:
        model.Maximize(sum(objective_terms))

    # ------------------------------------------------------------------
    # Solve
    # ------------------------------------------------------------------
    solver = cp_model.CpSolver()
    if time_limit_seconds is not None:
        solver.parameters.max_time_in_seconds = time_limit_seconds
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)
    status_name = solver.StatusName(status)

    # ------------------------------------------------------------------
    # Extract solution: which x[u,s] the solver set to 1, plus per-user loads.
    # OPTIMAL = proven best; FEASIBLE = valid solution found within the time
    # limit but not necessarily proven optimal. Anything else → no assignment.
    # ------------------------------------------------------------------
    assignments: List[Tuple[str, str]] = []
    loads: Dict[str, int] = {user_id: 0 for user_id in planning.user_ids}

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for (user_id, shift_id), var in x.items():
            if solver.Value(var) == 1:
                assignments.append((shift_id, user_id))
                loads[user_id] = loads.get(user_id, 0) + 1
        objective_value = int(solver.ObjectiveValue())
    else:
        objective_value = None

    assignments.sort(key=lambda pair: (pair[0], pair[1]))
    return AssignmentResult(
        status_name=status_name,
        assignments=assignments,
        loads=loads,
        objective_value=objective_value,
    )


def _are_consecutive_iso_weeks(
    week_a: Tuple[int, int],
    week_b: Tuple[int, int],
) -> bool:
    """True if the two (iso_year, iso_week) pairs are adjacent on the calendar.

    Same year: week numbers differ by exactly 1 (e.g. 12 and 13).

    Across a year boundary: one side is week 1 of year N+1 and the other is
    the last week of year N (ISO years have 52 or 53 weeks, so "last" means
    week number >= 52).
    """
    year_a, w_a = week_a
    year_b, w_b = week_b
    if year_a == year_b:
        return abs(w_a - w_b) == 1
    # Order so earlier/later is well-defined for the year-boundary check.
    earlier, later = (week_a, week_b) if week_a < week_b else (week_b, week_a)
    y0, w0 = earlier
    y1, w1 = later
    if y1 != y0 + 1 or w1 != 1:
        return False
    return w0 >= 52
