from planner.server import serve
import os

def main() -> None:
    host = os.getenv("PLANNER_HOST", "localhost")
    port = os.getenv("PLANNER_PORT", 50051)

    serve(host=host, port=port)


if __name__ == "__main__":
    main()
