"""Unit tests for CP-SAT optimization constraints and soft goals."""

from __future__ import annotations

import grpc
import pytest

from planner.optimization import planning_problem_from_request, solve
from planner.optimization.input import PlanningInputError
from planner.v1 import planner_pb2, planner_pb2_grpc, types_pb2


def _pref(
    user_id: str,
    *,
    max_bar: int = 10,
    max_bar_support: int = 10,
    max_cleaning: int = 10,
    consecutive_days: bool = True,
    consecutive_weeks: bool = True,
) -> types_pb2.UserPreference:
    return types_pb2.UserPreference(
        user_id=user_id,
        max_bar_shifts_per_month=max_bar,
        max_bar_support_shifts_per_month=max_bar_support,
        max_cleaning_shifts_per_month=max_cleaning,
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


def _shift(
    shift_id: str,
    day: str,
    persons: int = 1,
    shift_type: int = types_pb2.SHIFT_TYPE_BAR,
) -> types_pb2.PlannedShift:
    return types_pb2.PlannedShift(
        id=shift_id,
        date=day,
        number_of_persons=persons,
        type=shift_type,
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


def test_max_bar_shifts_per_month() -> None:
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
        user_preferences=[_pref("u1", max_bar=1)],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 1
    assert result.loads["u1"] == 1


def test_per_type_max_shifts_independent() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("bar1", "2026-08-03", shift_type=types_pb2.SHIFT_TYPE_BAR),
            _shift("bar2", "2026-08-10", shift_type=types_pb2.SHIFT_TYPE_BAR),
            _shift(
                "clean1",
                "2026-08-17",
                shift_type=types_pb2.SHIFT_TYPE_CLEANING,
            ),
            _shift(
                "support1",
                "2026-08-24",
                shift_type=types_pb2.SHIFT_TYPE_BAR_SUPPORT,
            ),
        ],
        availabilities=[
            _avail("u1", "bar1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "bar2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "clean1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "support1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[
            _pref("u1", max_bar=1, max_bar_support=1, max_cleaning=1),
        ],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assigned_ids = {shift_id for shift_id, _ in result.assignments}
    assert len(assigned_ids & {"bar1", "bar2"}) == 1
    assert "clean1" in assigned_ids
    assert "support1" in assigned_ids
    assert result.loads["u1"] == 3


def test_no_bar_and_support_same_day() -> None:
    """Same user cannot take both a bar and a bar-support shift on one day."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("bar1", "2026-08-03", shift_type=types_pb2.SHIFT_TYPE_BAR),
            _shift(
                "support1",
                "2026-08-03",
                shift_type=types_pb2.SHIFT_TYPE_BAR_SUPPORT,
            ),
        ],
        availabilities=[
            _avail("u1", "bar1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "support1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1")],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 1
    assert result.loads["u1"] == 1
    # Bar fill is weighted higher, so the single assignment prefers bar.
    assert result.assignments == [("bar1", "u1")]


def test_cleaning_and_bar_same_day_allowed() -> None:
    """Cleaning may share a day with bar; fill still prefers assigning both."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("bar1", "2026-08-03", shift_type=types_pb2.SHIFT_TYPE_BAR),
            _shift(
                "clean1",
                "2026-08-03",
                shift_type=types_pb2.SHIFT_TYPE_CLEANING,
            ),
        ],
        availabilities=[
            _avail("u1", "bar1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "clean1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1")],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert set(result.assignments) == {("bar1", "u1"), ("clean1", "u1")}


def test_same_day_spread_prefers_other_user_for_cleaning() -> None:
    """Soft same-day penalty: prefer giving cleaning to someone without a bar shift."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("bar1", "2026-08-03", shift_type=types_pb2.SHIFT_TYPE_BAR),
            _shift(
                "clean1",
                "2026-08-03",
                shift_type=types_pb2.SHIFT_TYPE_CLEANING,
            ),
        ],
        availabilities=[
            _avail("u1", "bar1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "clean1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "clean1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1"), _pref("u2")],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert set(result.assignments) == {("bar1", "u1"), ("clean1", "u2")}


def test_bar_fill_preferred_over_support_when_scarce() -> None:
    """When consecutive weeks force a single pick, prefer bar over support."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("bar1", "2026-08-03", shift_type=types_pb2.SHIFT_TYPE_BAR),
            _shift(
                "support1",
                "2026-08-10",
                shift_type=types_pb2.SHIFT_TYPE_BAR_SUPPORT,
            ),
        ],
        availabilities=[
            _avail("u1", "bar1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "support1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1", consecutive_weeks=False)],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert result.assignments == [("bar1", "u1")]


def test_zero_max_forbids_type() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift(
                "clean1",
                "2026-08-03",
                shift_type=types_pb2.SHIFT_TYPE_CLEANING,
            ),
        ],
        availabilities=[
            _avail("u1", "clean1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1", max_cleaning=0)],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert result.assignments == []


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


def test_fixed_assignments_kept_and_open_slots_filled() -> None:
    """Fill mode pins existing assignments and only fills remaining capacity."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03", persons=2)],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1"), _pref("u2")],
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
        ],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert set(result.assignments) == {("s1", "u1"), ("s1", "u2")}


def test_fixed_assignments_respect_remaining_capacity() -> None:
    """A fully fixed shift must not gain extra people."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03", persons=1)],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1"), _pref("u2")],
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
        ],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert result.assignments == [("s1", "u1")]


def test_fixed_assignment_without_availability_is_kept() -> None:
    """Pinned assignments survive even when the user is no longer eligible."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03", persons=2)],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_UNAVAILABLE),
            _avail("u2", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1"), _pref("u2")],
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
        ],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert set(result.assignments) == {("s1", "u1"), ("s1", "u2")}


def test_fixed_blocks_new_consecutive_day_assignment() -> None:
    """Hard consecutive-day rule still applies between fixed and new fills."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("s1", "2026-08-03"),
            _shift("s2", "2026-08-04"),
        ],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[
            _pref("u1", consecutive_days=False),
            _pref("u2"),
        ],
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
        ],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert ("s1", "u1") in result.assignments
    assert ("s2", "u1") not in result.assignments
    assert ("s2", "u2") in result.assignments


def test_fixed_pair_that_violates_consecutive_days_is_kept() -> None:
    """Two already-committed consecutive-day assignments stay pinned."""
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
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
            types_pb2.Assignment(planned_shift_id="s2", user_id="u1"),
        ],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert set(result.assignments) == {("s1", "u1"), ("s2", "u1")}


def test_fixed_exceeding_max_cap_is_kept_but_blocks_more() -> None:
    """Effective max is raised to fixed count; no additional shifts of that type."""
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            _shift("s1", "2026-08-03"),
            _shift("s2", "2026-08-10"),
        ],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u1", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "s2", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1", max_bar=0), _pref("u2")],
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
        ],
    )
    result = _solve(request)
    assert result.status_name in ("OPTIMAL", "FEASIBLE")
    assert ("s1", "u1") in result.assignments
    assert ("s2", "u1") not in result.assignments
    assert ("s2", "u2") in result.assignments


def test_fixed_over_capacity_is_invalid() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03", persons=1)],
        availabilities=[
            _avail("u1", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
            _avail("u2", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u1"), _pref("u2")],
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
            types_pb2.Assignment(planned_shift_id="s1", user_id="u2"),
        ],
    )
    with pytest.raises(PlanningInputError, match="capacity"):
        planning_problem_from_request(request)


def test_fixed_only_user_without_availability_needs_preference() -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[_shift("s1", "2026-08-03", persons=2)],
        availabilities=[
            _avail("u2", "s1", types_pb2.AVAILABILITY_STATUS_AVAILABLE),
        ],
        user_preferences=[_pref("u2")],
        fixed_assignments=[
            types_pb2.Assignment(planned_shift_id="s1", user_id="u1"),
        ],
    )
    with pytest.raises(PlanningInputError, match="missing user_preferences"):
        planning_problem_from_request(request)
