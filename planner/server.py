from concurrent import futures

import grpc

from planner.service import ShiftPlannerServiceServicer
from planner.v1 import planner_pb2_grpc


def create_server(host: str, port: int) -> tuple[grpc.Server, int]:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
    planner_pb2_grpc.add_ShiftPlannerServiceServicer_to_server(
        ShiftPlannerServiceServicer(),
        server,
    )
    address = f"{host}:{port}"
    bound_port = server.add_insecure_port(address)
    server.start()

    return server, bound_port


def serve(host: str, port: int) -> None:
    server, bound_port = create_server(host=host, port=port)
    print(f"ShiftPlannerService gRPC server listening on {host}:{bound_port}")
    server.wait_for_termination()
