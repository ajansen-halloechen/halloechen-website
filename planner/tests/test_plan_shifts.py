from planner.v1 import planner_pb2, planner_pb2_grpc, types_pb2


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
            types_pb2.UserPreference(
                user_id="user-1",
                max_shifts_per_month=4,
                shifts_on_consecutive_days=False,
                shifts_in_consecutive_weeks=True,
            ),
            types_pb2.UserPreference(
                user_id="user-2",
                max_shifts_per_month=4,
                shifts_on_consecutive_days=False,
                shifts_in_consecutive_weeks=True,
            ),
        ],
    )

    response = planner_stub.PlanShifts(request)

    assert isinstance(response, planner_pb2.PlanShiftsResponse)
    assert list(response.assignments) == []
