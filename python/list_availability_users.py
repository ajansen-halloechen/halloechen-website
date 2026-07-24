#!/usr/bin/env python3
"""List unique users referenced in shift-availabilities.json."""

from __future__ import annotations

from pathlib import Path

from planning_io import load_json_list, load_user_names

DIR = Path(__file__).resolve().parent


def main() -> None:
    availabilities = load_json_list(DIR / "./data/202609/shift-blockers.json")
    names = load_user_names(DIR / "../users.json")

    user_ids = sorted(
        {str(row["userId"]) for row in availabilities if "userId" in row},
        key=lambda uid: names.get(uid, uid).lower(),
    )

    for user_id in user_ids:
        print(names.get(user_id, user_id))

    missing_user_ids = set(names.keys()) - set(user_ids) 


    print()
    print("Missing Blockers:")
    for user_id in missing_user_ids:
        print(names.get(user_id, user_id))
    

if __name__ == "__main__":
    main()
