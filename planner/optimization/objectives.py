"""Soft objective terms for the monthly shift CP-SAT model.

Each public function adds supporting variables as needed and returns the
linear terms to include in the maximized objective.
"""

from __future__ import annotations

from collections import defaultdict

from ortools.sat.python import cp_model

from planner.optimization.context import OptimizationContext
from planner.optimization.input import AvailabilityKind, PlannedShift
from planner.optimization.weeks import are_consecutive_iso_weeks

# Priority weights spaced so a lower-priority term cannot outweigh a higher one
# for realistic problem sizes.
W_FILL = 10_000
W_PREF = 100
W_FAIR = 10
W_SPREAD = 1


def add_fill_objective(ctx: OptimizationContext) -> list[cp_model.LinearExpr]:
    """Reward every assigned person-slot."""
    if not ctx.x:
        return []
    return [W_FILL * sum(ctx.x.values())]


def add_preference_objective(ctx: OptimizationContext) -> list[cp_model.LinearExpr]:
    """Extra reward when an assignment uses a PREFERENCE availability."""
    pref_vars = [
        var
        for (user_id, shift_id), var in ctx.x.items()
        if ctx.problem.availability_by_pair[(user_id, shift_id)]
        == AvailabilityKind.PREFERENCE
    ]
    if not pref_vars:
        return []
    return [W_PREF * sum(pref_vars)]


def add_fairness_objective(ctx: OptimizationContext) -> list[cp_model.LinearExpr]:
    """Penalize (max_load - min_load) across assignable users."""
    assignable_users = sorted({user_id for user_id, _ in ctx.problem.eligible_pairs})
    if not assignable_users:
        return []

    max_possible_load = len(ctx.problem.shifts)
    load_vars: list[cp_model.IntVar] = []
    for user_id in assignable_users:
        user_vars = ctx.vars_by_user.get(user_id, [])
        load = ctx.model.NewIntVar(0, max_possible_load, f"load_{user_id}")
        if user_vars:
            ctx.model.Add(load == sum(user_vars))
        else:
            ctx.model.Add(load == 0)
        load_vars.append(load)

    max_load = ctx.model.NewIntVar(0, max_possible_load, "max_load")
    min_load = ctx.model.NewIntVar(0, max_possible_load, "min_load")
    ctx.model.AddMaxEquality(max_load, load_vars)
    ctx.model.AddMinEquality(min_load, load_vars)
    imbalance = ctx.model.NewIntVar(0, max_possible_load, "imbalance")
    ctx.model.Add(imbalance == max_load - min_load)
    return [-W_FAIR * imbalance]


def add_consecutive_weeks_soft_penalty(
    ctx: OptimizationContext,
) -> list[cp_model.LinearExpr]:
    """Soft-penalize consecutive ISO-week assignments for every user."""
    shifts_by_user: dict[str, list[PlannedShift]] = defaultdict(list)
    for user_id, shift_id in ctx.problem.eligible_pairs:
        shifts_by_user[user_id].append(ctx.problem.shifts_by_id[shift_id])

    terms: list[cp_model.LinearExpr] = []
    for user_id, user_shifts in shifts_by_user.items():
        unique = {s.id: s for s in user_shifts}
        ordered = sorted(unique.values(), key=lambda s: s.date)
        for i, shift_a in enumerate(ordered):
            for shift_b in ordered[i + 1 :]:
                if not are_consecutive_iso_weeks(shift_a.iso_week, shift_b.iso_week):
                    continue
                var_a = ctx.x.get((user_id, shift_a.id))
                var_b = ctx.x.get((user_id, shift_b.id))
                if var_a is None or var_b is None:
                    continue
                both = ctx.model.NewBoolVar(
                    f"consec_soft_{user_id}_{shift_a.id}_{shift_b.id}"
                )
                ctx.model.AddBoolAnd([var_a, var_b]).OnlyEnforceIf(both)
                ctx.model.AddBoolOr([var_a.Not(), var_b.Not()]).OnlyEnforceIf(
                    both.Not()
                )
                terms.append(-W_SPREAD * both)
    return terms
