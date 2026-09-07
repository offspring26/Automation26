"""
Appends one record per workflow run to data/executions.json.

For scheduled runs, computes how many seconds after the intended
03:14 UTC trigger time the job actually started. For manually
triggered (workflow_dispatch) runs, there is no "scheduled" time to
compare against, so delay is recorded as null and the run is tagged
separately.
"""

import json
import os
from datetime import datetime, timedelta, timezone

DATA_PATH = "data/executions.json"
SCHEDULED_HOUR_UTC = 3
SCHEDULED_MINUTE_UTC = 14


def load_data():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, encoding="utf-8") as f:
            content = f.read().strip()
            return json.loads(content) if content else []
    return []


def save_data(data):
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def main():
    now = datetime.now(timezone.utc)
    event_name = os.environ.get("GITHUB_EVENT_NAME", "unknown")
    run_id = os.environ.get("GITHUB_RUN_ID", "")
    run_attempt = os.environ.get("GITHUB_RUN_ATTEMPT", "1")

    is_scheduled = event_name == "schedule"

    record = {
        "run_id": run_id,
        "run_attempt": run_attempt,
        "trigger": "schedule" if is_scheduled else "workflow_dispatch",
        "actual_time_utc": now.isoformat(),
        "scheduled_time_utc": None,
        "delay_seconds": None,
    }

    if is_scheduled:
        scheduled = now.replace(
            hour=SCHEDULED_HOUR_UTC,
            minute=SCHEDULED_MINUTE_UTC,
            second=0,
            microsecond=0,
        )
        # Guard against the (rare) case where the runner's clock/queue
        # puts "now" just before today's scheduled slot.
        if now < scheduled:
            scheduled -= timedelta(days=1)

        delay_seconds = round((now - scheduled).total_seconds())
        record["scheduled_time_utc"] = scheduled.isoformat()
        record["delay_seconds"] = delay_seconds

    data = load_data()
    data.append(record)
    save_data(data)

    print(f"Recorded execution: {record}")


if __name__ == "__main__":
    main()
