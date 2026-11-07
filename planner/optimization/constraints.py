"""Hard constraints for the monthly shift CP-SAT model.

Each public function adds exactly one constraint family.
"""

from __future__ import annotations

from planner.optimization.context import OptimizationContext
from planner.optimization.input import PlannedShift, ShiftType
from planner.optimization.weeks import are_consecutive_iso_weeks


def add_shift_capacity(ctx: OptimizationContext) -> None:
    """sum_u x[u, s] <= number_of_persons[s] for every shift."""
    for shift in ctx.problem.shifts:
        assigned = ctx.vars_by_shift.get(shift.id, [])
        if assigned:
            ctx.model.Add(sum(assigned) <= shift.number_of_persons)


def add_max_shifts_per_month(ctx: OptimizationContext) -> None:
    """Per-type monthly caps: sum of x[u,s] for shifts of each type <= max for that type."""
    for user_id, preference in ctx.problem.preferences_by_user.items():
        for shift_type in ShiftType:
            typed_vars = [
                var
                for (uid, shift_id), var in ctx.x.items()
                if uid == user_id
                and ctx.problem.shifts_by_id[shift_id].type is shift_type
            ]
            if not typed_vars:
                continue
            ctx.model.Add(sum(typed_vars) <= preference.max_for_type(shift_type))


def add_no_bar_and_support_same_day(ctx: OptimizationContext) -> None:
    """A user may not be assigned both a bar and a bar-support shift on the same day."""
    for user_id in ctx.problem.preferences_by_user:
        ordered = _eligible_shifts_for_user(ctx, user_id)
        for i, shift_a in enumerate(ordered):
            for shift_b in ordered[i + 1 :]:
                if shift_a.date != shift_b.date:
                    continue
                types = {shift_a.type, shift_b.type}
                if types != {ShiftType.BAR, ShiftType.BAR_SUPPORT}:
                    continue
                _forbid_both(ctx, user_id, shift_a.id, shift_b.id)


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
