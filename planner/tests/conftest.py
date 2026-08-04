from collections.abc import Iterator

import grpc
import pytest

from planner.server import create_server
from planner.v1 import planner_pb2_grpc


@pytest.fixture
def planner_stub() -> Iterator[planner_pb2_grpc.ShiftPlannerServiceStub]:
    host = "127.0.0.1"
    server, port = create_server(host=host, port=0)
    channel = grpc.insecure_channel(f"{host}:{port}")
    try:
        yield planner_pb2_grpc.ShiftPlannerServiceStub(channel)
    finally:
        channel.close()
        server.stop(grace=None)
