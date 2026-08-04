from planner.v1 import planner_pb2, planner_pb2_grpc, types_pb2


def _preference(
    user_id: str,
    *,
    max_shifts: int = 4,
    consecutive_days: bool = True,
    consecutive_weeks: bool = True,
) -> types_pb2.UserPreference:
    return types_pb2.UserPreference(
        user_id=user_id,
        max_shifts_per_month=max_shifts,
        shifts_on_consecutive_days=consecutive_days,
        shifts_in_consecutive_weeks=consecutive_weeks,
    )


def test_plan_shifts_round_trip(
    planner_stub: planner_pb2_grpc.ShiftPlannerServiceStub,
) -> None:
    request = planner_pb2.PlanShiftsRequest(
        month="2026-08",
        planned_shifts=[
            types_pb2.PlannedShift(
                id="shift-1",
                date="2026-08-06",
                number_of_persons=2,
            ),
        ],
        availabilities=[
            types_pb2.Availability(
                user_id="user-1",
                planned_shift_id="shift-1",
                status=types_pb2.AVAILABILITY_STATUS_AVAILABLE,
            ),
            types_pb2.Availability(
                user_id="user-2",
                planned_shift_id="shift-1",
                status=types_pb2.AVAILABILITY_STATUS_PREFERENCE,
            ),
            types_pb2.Availability(
                user_id="user-3",
                planned_shift_id="shift-1",
                status=types_pb2.AVAILABILITY_STATUS_UNAVAILABLE,
            ),
        ],
        user_preferences=[
            _preference("user-1"),
            _preference("user-2"),
            _preference("user-3"),
        ],
    )

    response = planner_stub.PlanShifts(request)

    assert isinstance(response, planner_pb2.PlanShiftsResponse)
    assigned = {(a.planned_shift_id, a.user_id) for a in response.assignments}
    assert assigned == {("shift-1", "user-1"), ("shift-1", "user-2")}
