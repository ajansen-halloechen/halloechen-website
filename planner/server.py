from concurrent import futures

import grpc

from planner.service import ShiftPlannerServiceServicer
from planner.v1 import planner_pb2_grpc

HOST = "127.0.0.1"
PORT = 50051


def serve() -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
    planner_pb2_grpc.add_ShiftPlannerServiceServicer_to_server(
        ShiftPlannerServiceServicer(),
        server,
    )
    address = f"{HOST}:{PORT}"
    server.add_insecure_port(address)
    server.start()
    print(f"ShiftPlannerService gRPC server listening on {address}")
    server.wait_for_termination()
