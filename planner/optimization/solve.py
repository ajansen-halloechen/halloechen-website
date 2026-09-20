"""Build and solve the monthly shift assignment CP-SAT model."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass

from ortools.sat.python import cp_model

from planner.optimization.constraints import (
    add_max_shifts_per_month,
    add_no_consecutive_days,
    add_no_consecutive_weeks,
    add_shift_capacity,
)
from planner.optimization.context import OptimizationContext, create_context
from planner.optimization.input import PlanningProblem
from planner.optimization.objectives import (
    add_consecutive_weeks_soft_penalty,
    add_fairness_objective,
    add_fill_objective,
    add_preference_objective,
)


@dataclass(frozen=True)
class AssignmentResult:
    status_name: str
    assignments: list[tuple[str, str]]  # (planned_shift_id, user_id)
    loads: Mapping[str, int]
    objective_value: int | None


def solve(
    problem: PlanningProblem,
    time_limit_seconds: float | None = None,
) -> AssignmentResult:
    """Build the CP-SAT model, solve it, and extract assignments."""
    ctx = create_context(problem)

    add_shift_capacity(ctx)
    add_max_shifts_per_month(ctx)
    add_no_consecutive_days(ctx)
    add_no_consecutive_weeks(ctx)

    objective_terms = [
        *add_fill_objective(ctx),
        *add_preference_objective(ctx),
        *add_fairness_objective(ctx),
        *add_consecutive_weeks_soft_penalty(ctx),
    ]
    if objective_terms:
        ctx.model.Maximize(sum(objective_terms))

    solver = cp_model.CpSolver()
    if time_limit_seconds is not None:
        solver.parameters.max_time_in_seconds = time_limit_seconds
    solver.parameters.num_search_workers = 8

    status = solver.Solve(ctx.model)
    return _extract_result(solver, status, ctx)


def _extract_result(
    solver: cp_model.CpSolver,
    status: int,
    ctx: OptimizationContext,
) -> AssignmentResult:
    status_name = solver.StatusName(status)
    assignments: list[tuple[str, str]] = []
    loads: dict[str, int] = {user_id: 0 for user_id in ctx.problem.user_ids}

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for (user_id, shift_id), var in ctx.x.items():
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
