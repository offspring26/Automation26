import json
import os
import tempfile
import unittest

from scripts.validate_executions import validate_file


class TestValidateExecutions(unittest.TestCase):
    def test_valid_records(self):
        records = [
            {
                "run_id": "1",
                "run_attempt": "1",
                "trigger": "schedule",
                "actual_time_utc": "2026-11-01T03:15:00+00:00",
                "scheduled_time_utc": "2026-11-01T03:14:00+00:00",
                "delay_seconds": 60,
            },
            {
                "run_id": "2",
                "run_attempt": "1",
                "trigger": "workflow_dispatch",
                "actual_time_utc": "2026-11-01T12:00:00+00:00",
                "scheduled_time_utc": None,
                "delay_seconds": None,
            },
        ]
        with tempfile.NamedTemporaryFile("w", delete=False) as f:
            json.dump(records, f)
            path = f.name
        try:
            self.assertTrue(validate_file(path))
        finally:
            os.remove(path)

    def test_invalid_trigger(self):
        records = [
            {
                "run_id": "1",
                "run_attempt": "1",
                "trigger": "invalid_trigger",
                "actual_time_utc": "2026-11-01T03:15:00+00:00",
                "scheduled_time_utc": None,
                "delay_seconds": None,
            }
        ]
        with tempfile.NamedTemporaryFile("w", delete=False) as f:
            json.dump(records, f)
            path = f.name
        try:
            self.assertFalse(validate_file(path))
        finally:
            os.remove(path)

    def test_negative_delay(self):
        records = [
            {
                "run_id": "1",
                "run_attempt": "1",
                "trigger": "schedule",
                "actual_time_utc": "2026-11-01T03:15:00+00:00",
                "scheduled_time_utc": "2026-11-01T03:14:00+00:00",
                "delay_seconds": -10,
            }
        ]
        with tempfile.NamedTemporaryFile("w", delete=False) as f:
            json.dump(records, f)
            path = f.name
        try:
            self.assertFalse(validate_file(path))
        finally:
            os.remove(path)


if __name__ == "__main__":
    unittest.main()
