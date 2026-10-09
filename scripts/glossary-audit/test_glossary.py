import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import glossary_run as audit


class GlossaryAuditTests(unittest.TestCase):
    def test_report_evidence_omits_internal_fields_recursively(self):
        raw = {"evidence": [{"method": "codeql", "matchKind": "readerLiteral",
                             "path": "x.js", "line": 4}]}
        self.assertEqual(audit.report_evidence(raw),
                         {"evidence": [{"path": "x.js", "line": [4]}]})
        self.assertIn("matchKind", raw["evidence"][0])

    def test_report_combines_only_equivalent_locations(self):
        entries = [{"repository": "a", "path": "x.js", "line": n} for n in [8, 2, 8]]
        entries.append({"repository": "b", "path": "x.js", "line": 3})
        result = audit.report_evidence(entries)
        self.assertEqual(result, [{"repository": "a", "path": "x.js", "line": [2, 8]},
                                  {"repository": "b", "path": "x.js", "line": [3]}])
        self.assertEqual(audit.report_evidence(result), result)
        steps = audit.report_evidence({"steps": entries[:3]})["steps"]
        self.assertEqual(len(steps), 3)

    def test_compact_report_shares_loops_and_preserves_paths(self):
        loop = {"repository": "threshold", "path": "utils.js", "line": [10],
                "filters": {"excludedType": "obsolete"}}
        raw = {"repositories": {"threshold": {"commit": "abc"}},
               "used": {"font": {"glossaryIterationReaderKeys": [dict(loop)],
                                  "directReaderKeys": [
                                      {"repository": "threshold", "path": "a.js", "line": [4]},
                                      {"repository": "threshold", "path": "a.js", "line": [8]}]},
                        "color": {"glossaryIterationReaderKeys": [dict(loop)]}},
               "unused": {}}
        result = audit.compact_report(raw)
        self.assertEqual(len(result["sharedEvidence"]), 1)
        self.assertEqual(result["used"]["font"]["directReaderKeys"],
                         {"threshold": {"a.js": [4, 8]}})
        self.assertEqual(result["used"]["font"]["glossaryIterationReaderKeys"],
                         result["used"]["color"]["glossaryIterationReaderKeys"])
        self.assertEqual(result["repositories"]["threshold"]["github"], "EasyEyes/threshold")

    def test_obsolete_used_partition_preserves_evidence(self):
        matches = {key: [{"repository": "threshold", "path": "a.js", "line": 5,
                          "matchKind": "readerLiteral"}] for key in ("active", "old")}
        glossary = {"active": {"type": "text"}, "old": {"type": "obsolete"},
                    "oldUnused": {"type": "obsolete"}}
        report = audit.build_report({"version": "1", "glossary": glossary}, {}, matches, [])
        self.assertEqual(list(report["used"]), ["active"])
        self.assertEqual(list(report["obsoleteUsed"]), ["old"])
        self.assertEqual(list(report["unused"]), ["oldUnused"])
        self.assertEqual(report["obsoleteUsed"]["old"],
                         {"threshold": {"a.js": [5]}})
        self.assertEqual(report["counts"]["used"], 1)
        self.assertEqual(report["counts"]["obsoleteUsed"], 1)
        self.assertEqual(report["counts"]["total"], 3)

    def test_flat_locations_merge_methods_and_resolve_shared_evidence(self):
        report = {"used": {"font": {
            "directReaderKeys": {"threshold": {"a.js": [4]}},
            "otherReferences": {"threshold": {"a.js": [4, 9]}},
            "dataFlowReaderKeys": {"threshold": [{"origin": {"path": "b.js", "line": [2]},
                "reader": {"path": "a.js", "line": [4]},
                "steps": [{"path": "b.js", "line": [3]}]}]},
            "glossaryIterationReaderKeys": {"sharedEvidenceNames": ["loop"]}}},
            "obsoleteUsed": {}, "unused": {"old": {}},
            "sharedEvidence": {"loop": {"threshold": {"path": "utils.js", "line": [631]}}}}
        result = audit.flatten_used_locations(report)
        self.assertEqual(result["used"]["font"], {"threshold": {
            "a.js": [4, 9], "b.js": [2, 3], "utils.js": [631]}})
        self.assertNotIn("sharedEvidence", result)
        self.assertEqual(result["unused"], {"old": {}})

    def test_literal_only_is_not_a_direct_read(self):
        report = audit.build_report(
            {"version": "1", "glossary": {"font": {}, "unused": {}}}, {},
            {"font": [{"repository": "threshold", "path": "x.js", "line": 1, "matchKind": "stringLiteral"}]}, []
        )
        self.assertEqual(report["used"]["font"], {"threshold": {"x.js": [1]}})
        self.assertEqual(list(report["unused"]), ["unused"])
        self.assertEqual(report["counts"]["used"], 1)
        self.assertNotIn("otherReferences", report["used"]["font"])
        self.assertEqual(report["counts"]["used"], 1)
        self.assertNotIn("directReaderKeys", report)
        self.assertNotIn("dataFlowReaderKeys", report)

    def test_glossary_name_argument_counts_as_direct_read(self):
        report = audit.build_report(
            {"version": "1", "glossary": {"font": {}}}, {},
            {"font": [{"repository": "threshold", "path": "x.js", "line": 1, "matchKind": "readerGlossaryName"}]}, []
        )
        self.assertEqual(list(report["used"]), ["font"])
        self.assertEqual(report["used"]["font"], {"threshold": {"x.js": [1]}})
        self.assertEqual(report["unused"], {})

    def test_data_flow_evidence_exposes_origin_and_reader(self):
        steps = [
            {"path": "caller.js", "line": 4},
            {"path": "helper.js", "line": 8},
        ]
        matches = {"font": [{"repository": "threshold", "path": "helper.js", "line": 8,
                             "matchKind": "readerDataFlow",
                             "dataFlowPaths": [steps]}]}
        evidence = audit.data_flow_evidence(matches)["font"][0]
        self.assertEqual(evidence["origin"], steps[0])
        self.assertEqual(evidence["reader"], steps[-1])
        self.assertEqual(evidence["steps"], steps)
        self.assertEqual(evidence["commit"], None)

    def test_used_keys_are_unique_and_preserve_all_evidence(self):
        direct = {"path": "a.js", "line": 1}
        other = {"path": "b.js", "line": 2}
        result = audit.keyed_usage({"directReaderKeys": {"font": [direct]},
                                    "otherReferences": {"font": [other]}})
        self.assertEqual(list(result), ["font"])
        self.assertEqual(list(result["font"]), ["directReaderKeys", "otherReferences"])
        self.assertNotIn("evidence", result["font"])
        self.assertNotIn("detectionMethods", result["font"])
        self.assertEqual(result["font"]["directReaderKeys"], [direct])
        self.assertEqual(result["font"]["otherReferences"], [other])

    def test_report_contains_keys_without_unresolved_sites(self):
        site = {"matchKind": "unresolvedReader"}
        report = audit.build_report({"version": "1", "glossary": {"font": {}}}, {}, {}, [site])
        self.assertNotIn("unresolvedReferences", report["unused"])
        self.assertEqual(report["counts"]["unused"], 1)

    def test_glossary_iteration_includes_nonobsolete_keys(self):
        source = audit.GLOSSARY_ITERATION_MODEL
        payload = {"version": "1", "glossary": {
            "font": {"type": "text"}, "old": {"type": "obsolete"},
            "_calibrateDistanceCheckCm": {"type": "text"},
        }}
        refs = audit.glossary_iteration_references(source, payload)
        self.assertEqual([key for key, _ in refs], ["font"])
        self.assertEqual(refs[0][1]["matchKind"], "readerGlossaryIteration")
        with self.assertRaises(ValueError):
            audit.glossary_iteration_references(source.replace("reader.read", "reader.has"), payload)

    def test_comment_information_does_not_count_as_usage(self):
        rows = [["path", "line", "text"], ["source.js", "10", "_online2PayCurrencyCode\nfontLeftToRightBool"]]
        evidence = audit.comment_references(rows, ["_online2PayCurrency", "_online2PayCurrencyCode", "fontLeftToRightBool"], "threshold")
        self.assertNotIn("_online2PayCurrency", evidence)
        self.assertEqual(evidence["fontLeftToRightBool"][0]["line"], 11)
        report = audit.build_report({"version": "1", "glossary": {"fontLeftToRightBool": {}}}, {}, {}, [], evidence)
        self.assertEqual(report["counts"]["used"], 0)
        self.assertEqual(list(report["unused"]), ["fontLeftToRightBool"])
        self.assertEqual(report["unused"]["fontLeftToRightBool"]["commentReferences"], audit.repository_evidence(evidence["fontLeftToRightBool"]))
        self.assertNotIn("supplementaryInformation", report)

    def test_key_input_escapes_and_rejects_empty_catalog(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(audit, "HERE", Path(directory)):
            audit.write_key_input(['a"b', "questionAndAnswer@@"])
            self.assertIn('a\\"b', (Path(directory) / "glossaryKeys.qll").read_text())
            with self.assertRaises(ValueError):
                audit.write_key_input([])


if __name__ == "__main__":
    unittest.main()
