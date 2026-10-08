"""Checks for incremental history checkpoint decisions."""

import unittest
from unittest.mock import patch

import history
import history_state


HEAD = "a" * 40
NEW_HEAD = "b" * 40


class HistoryCheckpointTests(unittest.TestCase):
    def setUp(self):
        self.removal = {"repository": "website", "commit": HEAD, "removedAt": "2026-01-01T00:00:00+00:00"}
        self.state = history_state.checkpoint({
            "repositories": {"website": {"head": HEAD, "completeHistory": True}},
            "keys": {"EE_old": {"removalsByRepository": {"website": self.removal}}},
        }, ["EE_old", "EE_absent"])

    def test_same_head_reuses_positive_and_negative_results(self):
        checked, removals, old_head = history.reusable_history(
            self.state, "website", "/unused", HEAD, ["EE_old", "EE_absent", "EE_new"]
        )
        self.assertEqual(checked, {"EE_old", "EE_absent"})
        self.assertEqual(removals, {"EE_old": self.removal})
        self.assertEqual(old_head, HEAD)

    @patch("history.command", return_value=b"")
    def test_descendant_scans_only_new_history_for_checked_keys(self, command):
        checked, removals, old_head = history.reusable_history(
            self.state, "website", "/unused", NEW_HEAD, ["EE_old", "EE_new"]
        )
        self.assertEqual(checked, {"EE_old"})
        self.assertEqual(removals, {"EE_old": self.removal})
        self.assertEqual(old_head, HEAD)
        command.assert_called_once()

    @patch("history.command", return_value=None)
    def test_rewritten_history_discards_checkpoint(self, command):
        self.assertEqual(history.reusable_history(
            self.state, "website", "/unused", NEW_HEAD, ["EE_old"]
        ), (set(), {}, None))

    def test_changed_logic_discards_checkpoint(self):
        self.state["logicVersion"] += 1
        self.assertEqual(history.reusable_history(
            self.state, "website", "/unused", HEAD, ["EE_old"]
        ), (set(), {}, None))

    def test_incomplete_history_discards_checkpoint(self):
        self.state["report"]["repositories"]["website"]["completeHistory"] = False
        self.assertEqual(history.reusable_history(
            self.state, "website", "/unused", HEAD, ["EE_old"]
        ), (set(), {}, None))


if __name__ == "__main__":
    unittest.main()
