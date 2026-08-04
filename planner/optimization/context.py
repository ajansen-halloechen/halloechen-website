"""Shared CP-SAT model state for constraint/objective builders."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field

from ortools.sat.python import cp_model

from planner.optimization.input import PlanningProblem, UserPreference


@dataclass
class OptimizationContext:
    problem: PlanningProblem
    model: cp_model.CpModel
    x: dict[tuple[str, str], cp_model.IntVar]
    vars_by_shift: dict[str, list[cp_model.IntVar]] = field(default_factory=dict)
    vars_by_user: dict[str, list[cp_model.IntVar]] = field(default_factory=dict)

    @property
    def preferences_by_user(self) -> dict[str, UserPreference]:
        return dict(self.problem.preferences_by_user)


def create_context(problem: PlanningProblem) -> OptimizationContext:
    """Create decision variables and indexes; does not add constraints."""
    model = cp_model.CpModel()
    x: dict[tuple[str, str], cp_model.IntVar] = {}
    for user_id, shift_id in problem.eligible_pairs:
        x[(user_id, shift_id)] = model.NewBoolVar(f"x_{user_id}_{shift_id}")

    vars_by_shift: dict[str, list[cp_model.IntVar]] = defaultdict(list)
    vars_by_user: dict[str, list[cp_model.IntVar]] = defaultdict(list)
    for (user_id, shift_id), var in x.items():
        vars_by_shift[shift_id].append(var)
        vars_by_user[user_id].append(var)

    return OptimizationContext(
        problem=problem,
        model=model,
        x=x,
        vars_by_shift=dict(vars_by_shift),
        vars_by_user=dict(vars_by_user),
    )
