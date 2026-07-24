#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

uv run python -m grpc_tools.protoc \
  -I proto \
  --python_out=. \
  --grpc_python_out=. \
  --pyi_out=. \
  proto/planner/v1/types.proto \
  proto/planner/v1/planner.proto
