import grpc

from planner.optimization import planning_problem_from_request, solve
from planner.optimization.input import PlanningInputError
from planner.v1 import planner_pb2, planner_pb2_grpc, types_pb2


class ShiftPlannerServiceServicer(planner_pb2_grpc.ShiftPlannerServiceServicer):
    def PlanShifts(
        self,
        request: planner_pb2.PlanShiftsRequest,
        context: grpc.ServicerContext,
    ) -> planner_pb2.PlanShiftsResponse:
        try:
            problem = planning_problem_from_request(request)
        except PlanningInputError as exc:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))

        result = solve(problem)
        if result.status_name not in ("OPTIMAL", "FEASIBLE"):
            context.abort(
                grpc.StatusCode.FAILED_PRECONDITION,
                f"solver returned status {result.status_name}",
            )

        return planner_pb2.PlanShiftsResponse(
            assignments=[
                types_pb2.Assignment(
                    planned_shift_id=shift_id,
                    user_id=user_id,
                )
                for shift_id, user_id in result.assignments
            ]
        )
