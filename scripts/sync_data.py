"""
Copies canonical data/executions.json to app/public/executions.json
for local dashboard development.
"""

import json
import os
import shutil
import sys

SOURCE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "executions.json")
TARGET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app", "public", "executions.json")


def sync_executions_data(source_path=SOURCE_PATH, target_path=TARGET_PATH):
    """
    Copies source executions JSON to target directory.
    Returns the number of records synced.
    """
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source file not found: {source_path}")

    with open(source_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    if not isinstance(records, list):
        raise ValueError(f"Expected list in {source_path}, got {type(records).__name__}")

    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    shutil.copyfile(source_path, target_path)

    size_bytes = os.path.getsize(target_path)
    return len(records), size_bytes


def main():
    try:
        count, size_bytes = sync_executions_data()
        size_kb = size_bytes / 1024
        print(f"Successfully synced {count} records ({size_kb:.1f} KB) to app/public/executions.json")
    except Exception as e:
        print(f"Error syncing executions data: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
