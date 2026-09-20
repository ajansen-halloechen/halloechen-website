"""Hard constraints for the monthly shift CP-SAT model.

Each public function adds exactly one constraint family.
"""

from __future__ import annotations

from planner.optimization.context import OptimizationContext
from planner.optimization.input import PlannedShift
from planner.optimization.weeks import are_consecutive_iso_weeks


def add_shift_capacity(ctx: OptimizationContext) -> None:
    """sum_u x[u, s] <= number_of_persons[s] for every shift."""
    for shift in ctx.problem.shifts:
        assigned = ctx.vars_by_shift.get(shift.id, [])
        if assigned:
            ctx.model.Add(sum(assigned) <= shift.number_of_persons)


def add_max_shifts_per_month(ctx: OptimizationContext) -> None:
    """sum_s x[u, s] <= max_shifts_per_month[u] for every user with a preference."""
    for user_id, preference in ctx.problem.preferences_by_user.items():
        user_vars = ctx.vars_by_user.get(user_id, [])
        if not user_vars:
            continue
        ctx.model.Add(sum(user_vars) <= preference.max_shifts_per_month)


def add_no_consecutive_days(ctx: OptimizationContext) -> None:
    """Forbid both ends of consecutive-calendar-day pairs when preference is false."""
    for user_id, preference in ctx.problem.preferences_by_user.items():
        if preference.shifts_on_consecutive_days:
            continue
        ordered = _eligible_shifts_for_user(ctx, user_id)
        for i, shift_a in enumerate(ordered):
            for shift_b in ordered[i + 1 :]:
                if abs((shift_a.date - shift_b.date).days) != 1:
                    continue
                _forbid_both(ctx, user_id, shift_a.id, shift_b.id)


def add_no_consecutive_weeks(ctx: OptimizationContext) -> None:
    """Forbid both ends of consecutive-ISO-week pairs when preference is false."""
    for user_id, preference in ctx.problem.preferences_by_user.items():
        if preference.shifts_in_consecutive_weeks:
            continue
        ordered = _eligible_shifts_for_user(ctx, user_id)
        for i, shift_a in enumerate(ordered):
            for shift_b in ordered[i + 1 :]:
                if not are_consecutive_iso_weeks(shift_a.iso_week, shift_b.iso_week):
                    continue
                _forbid_both(ctx, user_id, shift_a.id, shift_b.id)


def _eligible_shifts_for_user(
    ctx: OptimizationContext,
    user_id: str,
) -> list[PlannedShift]:
    shifts_by_id: dict[str, PlannedShift] = {}
    for uid, shift_id in ctx.problem.eligible_pairs:
        if uid != user_id:
            continue
        shifts_by_id[shift_id] = ctx.problem.shifts_by_id[shift_id]
    return sorted(shifts_by_id.values(), key=lambda s: s.date)


def _forbid_both(
    ctx: OptimizationContext,
    user_id: str,
    shift_a_id: str,
    shift_b_id: str,
) -> None:
    var_a = ctx.x.get((user_id, shift_a_id))
    var_b = ctx.x.get((user_id, shift_b_id))
    if var_a is None or var_b is None:
        return
    # At most one of the two assignments may be true.
    ctx.model.Add(var_a + var_b <= 1)
