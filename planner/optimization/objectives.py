"""Soft objective terms for the monthly shift CP-SAT model.

Each public function adds supporting variables as needed and returns the
linear terms to include in the maximized objective.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Callable

from ortools.sat.python import cp_model

from planner.optimization.context import OptimizationContext
from planner.optimization.input import AvailabilityKind, PlannedShift, ShiftType
from planner.optimization.weeks import are_consecutive_iso_weeks

# Priority weights spaced so a lower-priority term cannot outweigh a higher one
# for realistic problem sizes. Bar fill outranks cleaning/support so one bar
# person-slot beats filling every non-bar slot in a typical month.
W_FILL_BAR = 10_000
W_FILL_CLEANING = 100
W_FILL_SUPPORT = 100
W_PREF = 100
W_FAIR = 10
W_SPREAD = 1

_FILL_WEIGHT_BY_TYPE = {
    ShiftType.BAR: W_FILL_BAR,
    ShiftType.CLEANING: W_FILL_CLEANING,
    ShiftType.BAR_SUPPORT: W_FILL_SUPPORT,
}


def add_fill_objective(ctx: OptimizationContext) -> list[cp_model.LinearExpr]:
    """Reward assigned person-slots, with bar weighted above other types."""
    if not ctx.x:
        return []
    return [
        _FILL_WEIGHT_BY_TYPE[ctx.problem.shifts_by_id[shift_id].type] * var
        for (_user_id, shift_id), var in ctx.x.items()
    ]


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


def add_same_day_soft_penalty(
    ctx: OptimizationContext,
) -> list[cp_model.LinearExpr]:
    """Soft-penalize two assignments for the same user on the same calendar day.

    Cleaning + bar/support on one day stays allowed; the penalty only makes
    stacking less attractive when another person can take the second shift.
    """
    return _pairwise_soft_penalty(
        ctx,
        pair_name="same_day",
        should_penalize=lambda a, b: a.date == b.date,
    )


def add_consecutive_weeks_soft_penalty(
    ctx: OptimizationContext,
) -> list[cp_model.LinearExpr]:
    """Soft-penalize consecutive ISO-week assignments for every user."""
    return _pairwise_soft_penalty(
        ctx,
        pair_name="consec_soft",
        should_penalize=lambda a, b: are_consecutive_iso_weeks(a.iso_week, b.iso_week),
    )


def _pairwise_soft_penalty(
    ctx: OptimizationContext,
    *,
    pair_name: str,
    should_penalize: Callable[[PlannedShift, PlannedShift], bool],
) -> list[cp_model.LinearExpr]:
    shifts_by_user: dict[str, list[PlannedShift]] = defaultdict(list)
    for user_id, shift_id in ctx.problem.eligible_pairs:
        shifts_by_user[user_id].append(ctx.problem.shifts_by_id[shift_id])

    terms: list[cp_model.LinearExpr] = []
    for user_id, user_shifts in shifts_by_user.items():
        unique = {s.id: s for s in user_shifts}
        ordered = sorted(unique.values(), key=lambda s: s.date)
        for i, shift_a in enumerate(ordered):
            for shift_b in ordered[i + 1 :]:
                if not should_penalize(shift_a, shift_b):
                    continue
                var_a = ctx.x.get((user_id, shift_a.id))
                var_b = ctx.x.get((user_id, shift_b.id))
                if var_a is None or var_b is None:
                    continue
                both = ctx.model.NewBoolVar(
                    f"{pair_name}_{user_id}_{shift_a.id}_{shift_b.id}"
                )
                ctx.model.AddBoolAnd([var_a, var_b]).OnlyEnforceIf(both)
                ctx.model.AddBoolOr([var_a.Not(), var_b.Not()]).OnlyEnforceIf(
                    both.Not()
                )
                terms.append(-W_SPREAD * both)
    return terms
