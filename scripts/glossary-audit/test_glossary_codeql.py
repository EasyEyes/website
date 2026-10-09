"""Opt-in real CodeQL query test: set CODEQL_BIN to enable."""
import os
import tempfile
import unittest
import shutil
from unittest.mock import patch
from pathlib import Path

import sys
sys.path.append(str(Path(__file__).resolve().parent.parent / "phrases-audit"))

import run as phrase_audit
import glossary_run


@unittest.skipUnless(os.environ.get("CODEQL_BIN"), "Set CODEQL_BIN for real query test")
class CodeQLTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        pack = Path(temporary.name)
        for pattern in ("*.ql", "*.qll", "qlpack.yml", "codeql-pack.lock.yml"):
            for source in glossary_run.HERE.glob(pattern):
                shutil.copy2(source, pack / source.name)
        shutil.copytree(glossary_run.HERE / "fixtures", pack / "fixtures")
        patcher = patch.object(glossary_run, "HERE", pack)
        patcher.start()
        self.addCleanup(patcher.stop)
        glossary_run.write_key_input([
            "font", "fontSource", "instructionFont", "fontColorRGBA", "fontMaxPx",
            "calibrateSound1000HzDB", "_calibrateSound1000HzMaxSD_dB",
            "questionAndAnswer@@", "questionAnswer@@",
        ])

    def test_query_reference_kinds_and_comment_exclusion(self):
        # Uses an isolated query pack and fixed fixture keys, not a live glossary.
        with tempfile.TemporaryDirectory() as directory:
            rows = phrase_audit.analyze(
                os.environ["CODEQL_BIN"], glossary_run.HERE / "fixtures/glossary",
                Path(directory), glossary_run.HERE / "glossary-usage.ql"
            )
            flows = glossary_run.analyze_flow(
                os.environ["CODEQL_BIN"], Path(directory),
                glossary_run.HERE / "fixtures/glossary", "fixture"
            )
            numbered = glossary_run.analyze_numbered(
                os.environ["CODEQL_BIN"], Path(directory),
                glossary_run.HERE / "fixtures/glossary", "fixture"
            )
            comment_rows = glossary_run.analyze_comments(os.environ["CODEQL_BIN"], Path(directory))
            comments = glossary_run.comment_references(comment_rows, ["_online2PayCurrency", "_online2PayCurrencyCode"], "fixture")
            self.assertEqual(comments["_online2PayCurrency"][0]["line"], 4)
            self.assertEqual(comments["_online2PayCurrencyCode"][0]["line"], 6)
            names = glossary_run.analyze_source_names(os.environ["CODEQL_BIN"], Path(directory))
        self.assertEqual({(key, ref["line"]) for key, ref in numbered},
                         {("questionAndAnswer@@", 8), ("questionAnswer@@", 12)})
        self.assertTrue(all(ref["numberRange"]["maximum"] == 99 for _, ref in numbered))
        self.assertEqual({(key, int(line), kind) for key, path, line, kind in names[1:]
                          if path == "source-names.js"}, {
            ("fontMaxPx", 1, "sourceIdentifier"),
            ("calibrateSound1000HzDB", 2, "sourceDefinition"),
            ("calibrateSound1000HzDB", 3, "sourceProperty"),
        })
        caller_flows = [(key, evidence) for key, evidence in flows if evidence["path"] == "caller-flow.js"]
        self.assertEqual({key for key, _ in caller_flows}, {"font", "instructionFont", "fontSource", "fontColorRGBA"})
        self.assertTrue(all(evidence["line"] == 2 for _, evidence in caller_flows))
        font_paths = [path for key, evidence in caller_flows if key == "font" for path in evidence["dataFlowPaths"]]
        self.assertTrue(any(len(path) >= 3 for path in font_paths))
        self.assertTrue(any(any(step["line"] == 7 for step in path) for path in font_paths))
        actual = {(key, int(line), kind) for key, path, line, kind in rows[1:] if path == "references.js"}
        self.assertEqual(actual, {
            ("font", 1, "readerLiteral"), ("fontSource", 2, "readerLiteral"),
            ("font", 3, "stringLiteral"), ("font", 6, "glossaryProperty"),
            ("", 7, "unresolvedReader"), ("", 8, "unresolvedReader"),
            ("_calibrateSound1000HzMaxSD_dB", 9, "readerGlossaryName"),
            ("font", 10, "readerGlossaryName"), ("font", 10, "stringLiteral"),
            ("", 11, "unresolvedReader"), ("", 12, "unresolvedReader"),
            ("", 13, "unresolvedReader"),
        })


if __name__ == "__main__":
    unittest.main()
