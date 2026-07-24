#!/usr/bin/env python3
"""CLI: optimize monthly shift assignments with OR-Tools CP-SAT."""

from __future__ import annotations

import argparse
import sys
from collections import Counter, defaultdict
from collections.abc import Mapping, Sequence
from pathlib import Path

from model import AssignmentResult, build_and_solve
from planning_io import (
    PlanningInput,
    load_planning_input,
    load_user_names,
    write_assignments_json,
)

DEFAULT_DIR = Path(__file__).resolve().parent
WEEKDAY_NAMES = (
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
)


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Assign users to planned shifts for one month (CP-SAT)."
    )
    parser.add_argument(
        "--planned-shifts",
        type=Path,
        default=DEFAULT_DIR / "planned-shifts.json",
        help="Path to planned-shifts.json",
    )
    parser.add_argument(
        "--availabilities",
        type=Path,
        default=DEFAULT_DIR / "shift-availabilities.json",
        help="Path to shift-availabilities.json",
    )
    parser.add_argument(
        "--users",
        type=Path,
        default=DEFAULT_DIR / "../users.json",
        help="Path to users.json (for display names)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_DIR / "assignments.json",
        help="Path to write assignments.json",
    )
    parser.add_argument(
        "--time-limit",
        type=float,
        default=None,
        help="Optional solver time limit in seconds",
    )
    return parser.parse_args(list(argv))


def display_name(user_id: str, names: Mapping[str, str]) -> str:
    return names.get(user_id, user_id)


def build_payload(
    planning: PlanningInput,
    result: AssignmentResult,
) -> dict:
    assigned_by_shift = defaultdict(list)  # type: Dict[str, List[str]]
    for shift_id, user_id in result.assignments:
        assigned_by_shift[shift_id].append(user_id)

    unfilled = []
    total_slots = 0
    filled = 0
    for shift in planning.shifts:
        required = shift.number_of_persons
        assigned_count = len(assigned_by_shift.get(shift.id, []))
        total_slots += required
        filled += assigned_count
        if assigned_count < required:
            unfilled.append(
                {
                    "plannedShiftId": shift.id,
                    "date": shift.date.isoformat(),
                    "required": required,
                    "assigned": assigned_count,
                }
            )

    return {
        "month": planning.month,
        "status": result.status_name,
        "objectiveValue": result.objective_value,
        "assignments": [
            {"plannedShiftId": shift_id, "userId": user_id}
            for shift_id, user_id in result.assignments
        ],
        "unfilled": unfilled,
        "stats": {
            "totalSlots": total_slots,
            "filled": filled,
            "loads": dict(sorted(result.loads.items())),
        },
    }


def validate_solution(planning: PlanningInput, result: AssignmentResult) -> None:
    """Post-solve assertions; raises AssertionError on violation."""
    avail = planning.availability_by_pair
    assigned_by_shift = defaultdict(list)  # type: Dict[str, List[str]]
    user_week_counts = Counter()  # type: Counter

    for shift_id, user_id in result.assignments:
        status = avail.get((user_id, shift_id))
        assert status is not None, "assignment without availability row"
        assert status != "unavailable", (
            f"assigned unavailable user {user_id} to shift {shift_id}"
        )
        assert status in ("available", "preference"), status

        shift = planning.shifts_by_id[shift_id]
        assigned_by_shift[shift_id].append(user_id)
        user_week_counts[(user_id, shift.iso_week)] += 1

    for shift in planning.shifts:
        count = len(assigned_by_shift.get(shift.id, []))
        assert count <= shift.number_of_persons, (
            f"overstaffed shift {shift.id}: {count} > {shift.number_of_persons}"
        )

    for (user_id, week), count in user_week_counts.items():
        assert count <= 1, (
            f"user {user_id} has {count} shifts in ISO week {week}"
        )


def print_summary(
    planning: PlanningInput,
    payload: Mapping,
    names: Mapping[str, str],
) -> None:
    stats = payload["stats"]
    loads = stats["loads"]

    print("=" * 60)
    print("Shift plan — {}".format(payload["month"]))
    print("=" * 60)
    print("Solver: {}".format(payload["status"]))
    print("Slots filled: {} / {}".format(stats["filled"], stats["totalSlots"]))
    if payload["objectiveValue"] is not None:
        print("Objective: {}".format(payload["objectiveValue"]))
    print()

    assigned_by_shift = defaultdict(list)  # type: Dict[str, List[str]]
    for row in payload["assignments"]:
        assigned_by_shift[row["plannedShiftId"]].append(row["userId"])

    print("Schedule")
    print("-" * 60)
    for shift in sorted(planning.shifts, key=lambda s: (s.date, s.start_time)):
        weekday = WEEKDAY_NAMES[shift.date.weekday()]
        end_note = " (+1)" if shift.plus_one_day else ""
        people = [
            display_name(user_id, names)
            for user_id in sorted(
                assigned_by_shift.get(shift.id, []),
                key=lambda uid: display_name(uid, names).lower(),
            )
        ]
        assigned_count = len(people)
        required = shift.number_of_persons
        if people:
            who = ", ".join(people)
        else:
            who = "(unassigned)"
        gap = ""
        if assigned_count < required:
            gap = f"  [need {required - assigned_count} more]"
        print(
            f"  {weekday} {shift.date.isoformat()}  {shift.start_time[:5]}–{shift.end_time[:5]}{end_note}  ({assigned_count}/{required})  {who}"
            + gap
        )
    print()

    print("Load per person")
    print("-" * 60)
    load_rows = sorted(
        loads.items(),
        key=lambda item: (-item[1], display_name(item[0], names).lower()),
    )
    for user_id, load in load_rows:
        print(f"  {load:>2}  {display_name(user_id, names)}")
    print()

    load_hist = Counter(loads.values())
    print("Load histogram: " + ", ".join(
        f"{count}×{load}" for load, count in sorted(load_hist.items())
    ))

    unfilled = payload["unfilled"]
    if not unfilled:
        print("Unfilled shifts: none")
    else:
        print(f"Unfilled shifts ({len(unfilled)}):")
        for row in unfilled:
            print(
                "  {} — assigned {}/{}".format(
                    row["date"],
                    row["assigned"],
                    row["required"],
                )
            )


def main(argv=None):
    # type: (Optional[Sequence[str]]) -> int
    args = parse_args(argv if argv is not None else sys.argv[1:])

    planning = load_planning_input(args.planned_shifts, args.availabilities)
    names = load_user_names(args.users)
    result = build_and_solve(planning, time_limit_seconds=args.time_limit)

    if result.status_name not in ("OPTIMAL", "FEASIBLE"):
        print(
            f"Solver failed with status {result.status_name}",
            file=sys.stderr,
        )
        return 1

    validate_solution(planning, result)
    payload = build_payload(planning, result)
    write_assignments_json(args.output, payload)
    print_summary(planning, payload, names)
    print()
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
