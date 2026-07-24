import grpc

from planner.v1 import planner_pb2, planner_pb2_grpc


class ShiftPlannerServiceServicer(planner_pb2_grpc.ShiftPlannerServiceServicer):
    def PlanShifts(
        self,
        request: planner_pb2.PlanShiftsRequest,
        context: grpc.ServicerContext,
    ) -> planner_pb2.PlanShiftsResponse:
        return planner_pb2.PlanShiftsResponse()
