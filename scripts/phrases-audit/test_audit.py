"""Regression checks for combined audit mismatch reporting."""

import copy
import unittest

from audit import find_mismatches


class MismatchReportTests(unittest.TestCase):
    def setUp(self):
        self.reports = {
            "phraseUsage": {
                "source": {"version": "63.21"},
                "repositories": {"psychojs": {"commit": "A"}},
                "used": {"EE_504UploadError": [{"repository": "psychojs"}]},
                "unused": ["EE_oldMessage"],
            },
            "history": {
                "phrasesVersion": "63.21",
                "repositories": {"psychojs": {"head": "A"}},
                "keys": {"EE_oldMessage": {}},
            },
            "missingFromSheet": {
                "repositories": {"psychojs": {"commit": "A"}},
                "missing": {},
            },
        }

    def test_matching_snapshots_have_no_mismatches(self):
        self.assertEqual(find_mismatches(self.reports), {
            "repositories": [], "keys": {}, "reportChecks": [],
        })

    def test_branch_advance_reports_key_without_claiming_it_changed(self):
        reports = copy.deepcopy(self.reports)
        reports["missingFromSheet"]["repositories"]["psychojs"]["commit"] = "B"

        mismatches = find_mismatches(reports)

        self.assertEqual(mismatches["repositories"][0]["commits"], {
            "phraseUsage": "A", "history": "A", "missingFromSheet": "B",
        })
        candidate = mismatches["keys"]["EE_504UploadError"][0]
        self.assertEqual(candidate["kind"], "sourceCommitMismatch")
        self.assertEqual(candidate["observations"], ["phraseUsage found a reference"])
        self.assertIn("unverified", candidate["description"])

    def test_status_conflict_and_version_difference_are_reported(self):
        reports = copy.deepcopy(self.reports)
        reports["history"]["phrasesVersion"] = "63.20"
        reports["history"]["keys"]["EE_504UploadError"] = {}

        mismatches = find_mismatches(reports)

        self.assertEqual(mismatches["reportChecks"][0]["kind"], "phrasesVersion")
        self.assertEqual(mismatches["keys"]["EE_504UploadError"][0]["kind"], "statusConflict")


if __name__ == "__main__":
    unittest.main()
