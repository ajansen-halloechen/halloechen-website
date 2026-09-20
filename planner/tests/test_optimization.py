"""Unit tests for CP-SAT optimization constraints and soft goals."""

from __future__ import annotations

import grpc
import pytest

from planner.optimization import planning_problem_from_request, solve
from planner.v1 import planner_pb2, planner_pb2_grpc, types_pb2


def _pref(
    user_id: str,
    *,
    max_shifts: int = 10,
    consecutive_days: bool = True,
    consecutive_weeks: bool = True,
) -> types_pb2.UserPreference:
    return types_pb2.UserPreference(
        user_id=user_id,
        max_shifts_per_month=max_shifts,
        shifts_on_consecutive_days=consecutive_days,
        shifts_in_consecutive_weeks=consecutive_weeks,
    )


def _avail(
    user_id: str,
    shift_id: str,
    status: int,
) -> types_pb2.Availability:
    return types_pb2.Availability(
        user_id=user_id,
        planned_shift_id=shift_id,
        status=status,
    )


def _shift(shift_id: str, day: str, persons: int = 1) -> types_pb2.PlannedShift:
    return types_pb2.PlannedShift(
        id=shift_id,
        date=day,
        number_of_persons=persons,
    )


def _solve(request: planner_pb2.PlanShiftsRequest):
    return solve(planning_problem_from_request(request))


def test_capacity_allows_underfill_forbids_overfill() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03", persons=1)],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1"), _pref("u2")],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 1
    assert all(shift_id == "s1" for shift_id, _ in result.assignments)


def test_max_shifts_per_month() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("s1", "2026-08-03"),
            _shift("s2", "2026-08-10"),
            _shift("s3", "2026-08-17"),
        ],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "s3", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1", max_shifts=1)],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 1
    assert result.loads["u1"] == 1


def test_consecutive_days_hard_forbid() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("s1", "2026-08-03"),
            _shift("s2", "2026-08-04"),
        ],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1", consecutive_days=False)],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 1


def test_consecutive_weeks_hard_forbid() -> None:
    # Monday 2026-08-03 is ISO week 32; Monday 2026-08-10 is ISO week 33.
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("s1", "2026-08-03"),
            _shift("s2", "2026-08-10"),
        ],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1", consecutive_weeks=False)],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 1


def test_consecutive_weeks_allowed_can_assign_both() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("s1", "2026-08-03"),
            _shift("s2", "2026-08-10"),
        ],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1", consecutive_weeks=True)],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    # Soft penalty exists but fill dominates, so both slots are filled.
    assert len(result.assignments) == 2


def test_preference_beats_available_for_single_slot() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03", persons=1)],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "s1", types_pb2.AVAILABILITY_STATUS_PREFERENCE),
        ],
        user_preferences=[_pref("u1"), _pref("u2")],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert result.assignments == [("s1", "u2")]


def test_invalid_request_returns_invalid_argument(
    planner_stub: planner_pb2_grpc.ShiftPlannerServiceStub,
) -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03")],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[],  # missing preference for u1
    )
    with pytest.raises(grpc.RpcError) as exc_info:
        planner_stub.PlanShifts(request)
    assert exc_info.value.code() == grpc.StatusCode.INVALID_ARGUMENT
