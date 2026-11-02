import json
import os
import tempfile
import unittest
from datetime import datetime, timezone

from scripts.record_execution import build_record, load_data, save_data, DATA_PATH


class TestRecordExecution(unittest.TestCase):
    def test_scheduled_exact_time(self):
        t = datetime(2026, 11, 2, 3, 14, 0, tzinfo=timezone.utc)
        record = build_record(now=t, event_name="schedule", run_id="123", run_attempt="1")
        self.assertEqual(record["trigger"], "schedule")
        self.assertEqual(record["delay_seconds"], 0)
        self.assertEqual(record["scheduled_time_utc"], "2026-11-02T03:14:00+00:00")
        self.assertEqual(record["run_id"], "123")

    def test_scheduled_with_delay(self):
        t = datetime(2026, 11, 2, 3, 19, 30, tzinfo=timezone.utc)
        record = build_record(now=t, event_name="schedule", run_id="456", run_attempt="2")
        self.assertEqual(record["trigger"], "schedule")
        self.assertEqual(record["delay_seconds"], 330)
        self.assertEqual(record["scheduled_time_utc"], "2026-11-02T03:14:00+00:00")

    def test_scheduled_before_slot_rolls_back_one_day(self):
        t = datetime(2026, 11, 2, 3, 13, 0, tzinfo=timezone.utc)
        record = build_record(now=t, event_name="schedule")
        self.assertEqual(record["scheduled_time_utc"], "2026-11-01T03:14:00+00:00")
        self.assertEqual(record["delay_seconds"], 86340)

    def test_workflow_dispatch_has_no_delay(self):
        t = datetime(2026, 11, 2, 10, 0, 0, tzinfo=timezone.utc)
        record = build_record(now=t, event_name="workflow_dispatch", run_id="manual-1")
        self.assertEqual(record["trigger"], "workflow_dispatch")
        self.assertIsNone(record["delay_seconds"])
        self.assertIsNone(record["scheduled_time_utc"])

    def test_save_and_load_data(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            test_path = os.path.join(tmpdir, "executions.json")
            orig_path = DATA_PATH
            import scripts.record_execution as mod
            mod.DATA_PATH = test_path
            try:
                self.assertEqual(load_data(), [])
                sample = [{"run_id": "test", "actual_time_utc": "2026-11-02T03:14:00+00:00"}]
                save_data(sample)
                loaded = load_data()
                self.assertEqual(loaded, sample)
            finally:
                mod.DATA_PATH = orig_path


if __name__ == "__main__":
    unittest.main()
