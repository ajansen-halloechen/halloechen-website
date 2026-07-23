"""Load and index planned shifts and shift availabilities."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List, Mapping, Set, Tuple

VALID_AVAILABILITIES = frozenset({"available", "preference", "unavailable"})
ELIGIBLE_AVAILABILITIES = frozenset({"available", "preference"})


@dataclass(frozen=True)
class PlannedShift:
    id: str
    shift_template_id: str
    date: date
    start_time: str
    end_time: str
    plus_one_day: bool
    number_of_persons: int
    shift_type: str

    @property
    def iso_week(self) -> Tuple[int, int]:
        iso = self.date.isocalendar()
        return (iso[0], iso[1])


@dataclass(frozen=True)
class ShiftAvailability:
    id: str
    user_id: str
    planned_shift_id: str
    availability: str


@dataclass(frozen=True)
class PlanningInput:
    shifts: List[PlannedShift]
    availabilities: List[ShiftAvailability]
    availability_by_pair: Mapping[Tuple[str, str], str]
    user_ids: List[str]
    shifts_by_id: Mapping[str, PlannedShift]
    eligible_pairs: List[Tuple[str, str]]
    month: str


def _parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def _load_planned_shift(raw: dict) -> PlannedShift:
    required = (
        "id",
        "shiftTemplateId",
        "date",
        "startTime",
        "endTime",
        "plusOneDay",
        "numberOfPersons",
        "shiftType",
    )
    missing = [k for k in required if k not in raw]
    if missing:
        raise ValueError("planned shift missing keys: {}".format(missing))

    number_of_persons = raw["numberOfPersons"]
    if not isinstance(number_of_persons, int) or number_of_persons < 1:
        raise ValueError(
            "numberOfPersons must be a positive int, got {!r}".format(
                number_of_persons
            )
        )

    return PlannedShift(
        id=str(raw["id"]),
        shift_template_id=str(raw["shiftTemplateId"]),
        date=_parse_date(str(raw["date"])),
        start_time=str(raw["startTime"]),
        end_time=str(raw["endTime"]),
        plus_one_day=bool(raw["plusOneDay"]),
        number_of_persons=number_of_persons,
        shift_type=str(raw["shiftType"]),
    )


def _load_availability(raw: dict) -> ShiftAvailability:
    required = ("id", "userId", "plannedShiftId", "availability")
    missing = [k for k in required if k not in raw]
    if missing:
        raise ValueError("availability missing keys: {}".format(missing))

    availability = str(raw["availability"])
    if availability not in VALID_AVAILABILITIES:
        raise ValueError("invalid availability status: {!r}".format(availability))

    return ShiftAvailability(
        id=str(raw["id"]),
        user_id=str(raw["userId"]),
        planned_shift_id=str(raw["plannedShiftId"]),
        availability=availability,
    )


def load_json_list(path: Path) -> List[dict]:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("{} must contain a JSON array".format(path))
    return data


def load_planning_input(
    planned_shifts_path: Path,
    availabilities_path: Path,
) -> PlanningInput:
    shifts = [_load_planned_shift(item) for item in load_json_list(planned_shifts_path)]
    availabilities = [
        _load_availability(item) for item in load_json_list(availabilities_path)
    ]

    if not shifts:
        raise ValueError("planned shifts list is empty")

    shifts_by_id = {}  # type: Dict[str, PlannedShift]
    for shift in shifts:
        if shift.id in shifts_by_id:
            raise ValueError("duplicate planned shift id: {}".format(shift.id))
        shifts_by_id[shift.id] = shift

    availability_by_pair = {}  # type: Dict[Tuple[str, str], str]
    for row in availabilities:
        if row.planned_shift_id not in shifts_by_id:
            raise ValueError(
                "availability references unknown shift {}".format(row.planned_shift_id)
            )
        key = (row.user_id, row.planned_shift_id)
        if key in availability_by_pair:
            raise ValueError("duplicate availability for {}".format(key))
        availability_by_pair[key] = row.availability

    user_ids = sorted({row.user_id for row in availabilities})
    eligible_pairs = [
        (user_id, shift_id)
        for (user_id, shift_id), status in availability_by_pair.items()
        if status in ELIGIBLE_AVAILABILITIES
    ]

    months = {
        "{:04d}-{:02d}".format(s.date.year, s.date.month) for s in shifts
    }  # type: Set[str]
    if len(months) != 1:
        raise ValueError(
            "planned shifts must be within a single month, got {}".format(months)
        )
    month = next(iter(months))

    return PlanningInput(
        shifts=shifts,
        availabilities=availabilities,
        availability_by_pair=availability_by_pair,
        user_ids=user_ids,
        shifts_by_id=shifts_by_id,
        eligible_pairs=eligible_pairs,
        month=month,
    )


def write_assignments_json(path: Path, payload: Mapping) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")


def format_user_name(raw: dict) -> str:
    first = raw.get("firstName")
    last = raw.get("lastName")
    parts = [p for p in (first, last) if isinstance(p, str) and p.strip()]
    if parts:
        return " ".join(parts)
    email = raw.get("email")
    if isinstance(email, str) and email.strip():
        return email
    return str(raw.get("id", "unknown"))


def load_user_names(path: Path) -> Dict[str, str]:
    """Map user id → display name from users.json."""
    rows = load_json_list(path)
    names = {}  # type: Dict[str, str]
    for raw in rows:
        if "id" not in raw:
            raise ValueError("user record missing id")
        user_id = str(raw["id"])
        if user_id in names:
            raise ValueError("duplicate user id: {}".format(user_id))
        names[user_id] = format_user_name(raw)
    return names
