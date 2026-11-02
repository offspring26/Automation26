"""
Validates schema and data integrity of data/executions.json.
"""

import json
import sys
from datetime import datetime

DATA_PATH = "data/executions.json"
REQUIRED_FIELDS = {
    "run_id",
    "run_attempt",
    "trigger",
    "actual_time_utc",
    "scheduled_time_utc",
    "delay_seconds",
}
VALID_TRIGGERS = {"schedule", "workflow_dispatch"}


def validate_file(path=DATA_PATH):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"ERROR: Failed to read or parse JSON from {path}: {e}", file=sys.stderr)
        return False

    if not isinstance(data, list):
        print(f"ERROR: Expected list of records, got {type(data).__name__}", file=sys.stderr)
        return False

    errors = []
    prev_time = None

    for i, record in enumerate(data):
        prefix = f"Record #{i} (run_id: {record.get('run_id', 'unknown')}):"
        if not isinstance(record, dict):
            errors.append(f"{prefix} Record is not an object")
            continue

        missing = REQUIRED_FIELDS - set(record.keys())
        if missing:
            errors.append(f"{prefix} Missing required fields: {missing}")

        trigger = record.get("trigger")
        if trigger not in VALID_TRIGGERS:
            errors.append(f"{prefix} Invalid trigger '{trigger}' (expected one of {VALID_TRIGGERS})")

        actual_time_str = record.get("actual_time_utc")
        actual_time = None
        if not actual_time_str or not isinstance(actual_time_str, str):
            errors.append(f"{prefix} actual_time_utc must be a non-empty string")
        else:
            try:
                actual_time = datetime.fromisoformat(actual_time_str)
            except ValueError as e:
                errors.append(f"{prefix} Invalid actual_time_utc ISO timestamp '{actual_time_str}': {e}")

        if trigger == "schedule":
            sched_time_str = record.get("scheduled_time_utc")
            if not sched_time_str or not isinstance(sched_time_str, str):
                errors.append(f"{prefix} Scheduled run must have string scheduled_time_utc")
            else:
                try:
                    datetime.fromisoformat(sched_time_str)
                except ValueError as e:
                    errors.append(f"{prefix} Invalid scheduled_time_utc ISO timestamp '{sched_time_str}': {e}")

            delay = record.get("delay_seconds")
            if delay is None or not isinstance(delay, (int, float)) or delay < 0:
                errors.append(f"{prefix} Scheduled run must have non-negative numeric delay_seconds, got {delay}")
        elif trigger == "workflow_dispatch":
            if record.get("delay_seconds") is not None:
                errors.append(f"{prefix} Manual dispatch run should have delay_seconds: null")

        if actual_time and prev_time and actual_time < prev_time:
            # Note: Out of order executions can happen if parallel runs occur, print notice
            print(f"NOTICE: {prefix} Timestamp {actual_time_str} is earlier than previous record {prev_time.isoformat()}")

        if actual_time:
            prev_time = actual_time

    if errors:
        print(f"Validation failed with {len(errors)} error(s):", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return False

    print(f"Validation passed: {len(data)} records in {path} are valid.")
    return True


if __name__ == "__main__":
    success = validate_file()
    sys.exit(0 if success else 1)
