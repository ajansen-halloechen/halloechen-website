"""Proto-aligned planning input and request mapping."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import date
from enum import Enum

from planner.v1 import planner_pb2, types_pb2


class AvailabilityKind(str, Enum):
    AVAILABLE = "available"
    PREFERENCE = "preference"
    UNAVAILABLE = "unavailable"


ELIGIBLE_KINDS = frozenset({AvailabilityKind.AVAILABLE, AvailabilityKind.PREFERENCE})

_STATUS_MAP = {
    types_pb2.AVAILABILITY_STATUS_AVAILABLE: AvailabilityKind.AVAILABLE,
    types_pb2.AVAILABILITY_STATUS_PREFERENCE: AvailabilityKind.PREFERENCE,
    types_pb2.AVAILABILITY_STATUS_UNAVAILABLE: AvailabilityKind.UNAVAILABLE,
}


class PlanningInputError(ValueError):
    """Invalid PlanShiftsRequest payload."""


@dataclass(frozen=True)
class PlannedShift:
    id: str
    date: date
    number_of_persons: int

    @property
    def iso_week(self) -> tuple[int, int]:
        iso = self.date.isocalendar()
        return (iso[0], iso[1])


@dataclass(frozen=True)
class UserPreference:
    user_id: str
    max_shifts_per_month: int
    shifts_on_consecutive_days: bool
    shifts_in_consecutive_weeks: bool


@dataclass(frozen=True)
class PlanningProblem:
    month: str
    shifts: list[PlannedShift]
    shifts_by_id: Mapping[str, PlannedShift]
    availability_by_pair: Mapping[tuple[str, str], AvailabilityKind]
    eligible_pairs: list[tuple[str, str]]
    user_ids: list[str]
    preferences_by_user: Mapping[str, UserPreference]


def _parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise PlanningInputError(f"invalid date {value!r}: expected YYYY-MM-DD") from exc


def _parse_month(value: str) -> str:
    if len(value) != 7 or value[4] != "-":
        raise PlanningInputError(f"invalid month {value!r}: expected YYYY-MM")
    try:
        year = int(value[:4])
        month = int(value[5:7])
        date(year, month, 1)
    except ValueError as exc:
        raise PlanningInputError(f"invalid month {value!r}: expected YYYY-MM") from exc
    return value


def planning_problem_from_request(
    request: planner_pb2.PlanShiftsRequest,
) -> PlanningProblem:
    """Validate and map a PlanShiftsRequest into a PlanningProblem."""
    month = _parse_month(request.month.strip())
    if not request.planned_shifts:
        raise PlanningInputError("planned_shifts must not be empty")

    shifts: list[PlannedShift] = []
    shifts_by_id: dict[str, PlannedShift] = {}
    for raw in request.planned_shifts:
        shift_id = raw.id.strip()
        if not shift_id:
            raise PlanningInputError("planned shift id must not be empty")
        if shift_id in shifts_by_id:
            raise PlanningInputError(f"duplicate planned shift id: {shift_id}")
        if raw.number_of_persons < 1:
            raise PlanningInputError(
                f"number_of_persons must be >= 1 for shift {shift_id}"
            )
        shift = PlannedShift(
            id=shift_id,
            date=_parse_date(raw.date.strip()),
            number_of_persons=raw.number_of_persons,
        )
        shift_month = f"{shift.date.year:04d}-{shift.date.month:02d}"
        if shift_month != month:
            raise PlanningInputError(
                f"shift {shift_id} date {shift.date} is outside month {month}"
            )
        shifts.append(shift)
        shifts_by_id[shift_id] = shift

    availability_by_pair: dict[tuple[str, str], AvailabilityKind] = {}
    for raw in request.availabilities:
        user_id = raw.user_id.strip()
        shift_id = raw.planned_shift_id.strip()
        if not user_id or not shift_id:
            raise PlanningInputError("availability user_id and planned_shift_id required")
        if shift_id not in shifts_by_id:
            raise PlanningInputError(
                f"availability references unknown shift {shift_id}"
            )
        if raw.status == types_pb2.AVAILABILITY_STATUS_UNSPECIFIED:
            raise PlanningInputError(
                f"availability status unspecified for ({user_id}, {shift_id})"
            )
        kind = _STATUS_MAP.get(raw.status)
        if kind is None:
            raise PlanningInputError(
                f"unknown availability status {raw.status} for ({user_id}, {shift_id})"
            )
        key = (user_id, shift_id)
        if key in availability_by_pair:
            raise PlanningInputError(f"duplicate availability for {key}")
        availability_by_pair[key] = kind

    user_ids = sorted({user_id for user_id, _shift_id in availability_by_pair})
    preferences_by_user: dict[str, UserPreference] = {}
    for raw in request.user_preferences:
        user_id = raw.user_id.strip()
        if not user_id:
            raise PlanningInputError("user preference user_id must not be empty")
        if user_id in preferences_by_user:
            raise PlanningInputError(f"duplicate user preference for {user_id}")
        if raw.max_shifts_per_month < 0:
            raise PlanningInputError(
                f"max_shifts_per_month must be >= 0 for user {user_id}"
            )
        preferences_by_user[user_id] = UserPreference(
            user_id=user_id,
            max_shifts_per_month=raw.max_shifts_per_month,
            shifts_on_consecutive_days=raw.shifts_on_consecutive_days,
            shifts_in_consecutive_weeks=raw.shifts_in_consecutive_weeks,
        )

    missing_prefs = [uid for uid in user_ids if uid not in preferences_by_user]
    if missing_prefs:
        raise PlanningInputError(
            "missing user_preferences for: " + ", ".join(missing_prefs)
        )

    eligible_pairs = [
        (user_id, shift_id)
        for (user_id, shift_id), kind in availability_by_pair.items()
        if kind in ELIGIBLE_KINDS
    ]

    return PlanningProblem(
        month=month,
        shifts=shifts,
        shifts_by_id=shifts_by_id,
        availability_by_pair=availability_by_pair,
        eligible_pairs=eligible_pairs,
        user_ids=user_ids,
        preferences_by_user=preferences_by_user,
    )
