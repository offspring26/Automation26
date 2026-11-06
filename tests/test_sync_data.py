import json
import os
import tempfile
import unittest

from scripts.sync_data import sync_executions_data


class TestSyncData(unittest.TestCase):
    def test_sync_executions_data_success(self):
        records = [
            {"run_id": "1", "trigger": "schedule", "actual_time_utc": "2026-11-06T03:14:00+00:00"}
        ]
        with tempfile.TemporaryDirectory() as tmpdir:
            src = os.path.join(tmpdir, "source", "executions.json")
            dst = os.path.join(tmpdir, "app", "public", "executions.json")
            os.makedirs(os.path.dirname(src), exist_ok=True)
            with open(src, "w", encoding="utf-8") as f:
                json.dump(records, f)

            count, size = sync_executions_data(source_path=src, target_path=dst)
            self.assertEqual(count, 1)
            self.assertTrue(os.path.exists(dst))

            with open(dst, "r", encoding="utf-8") as f:
                copied = json.load(f)
            self.assertEqual(copied, records)

    def test_sync_missing_source(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            src = os.path.join(tmpdir, "missing.json")
            dst = os.path.join(tmpdir, "out.json")
            with self.assertRaises(FileNotFoundError):
                sync_executions_data(source_path=src, target_path=dst)

    def test_sync_invalid_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            src = os.path.join(tmpdir, "invalid.json")
            dst = os.path.join(tmpdir, "out.json")
            with open(src, "w", encoding="utf-8") as f:
                json.dump({"not": "a list"}, f)
            with self.assertRaises(ValueError):
                sync_executions_data(source_path=src, target_path=dst)


if __name__ == "__main__":
    unittest.main()
