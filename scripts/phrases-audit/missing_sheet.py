#!/usr/bin/env python3
"""Find direct phrase references absent from the live International Phrases sheet."""

import csv
import hashlib
import io
import json
import os
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from run import HERE, REPOSITORIES, add_match_evidence, add_runtime_references, analyze, run, snapshot


SHEET_ID = "1UFfNikfLuo8bSromE34uWDuJrMPFiJG3VpoQKdCGkII"
SHEET_GID = 0
SHEET_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&gid={SHEET_GID}&headers=0&tq=select%20A"


def fetch_sheet_keys():
    payload = run("curl", "-fLsS", "--connect-timeout", "8", "--max-time", "25", "--retry", "2", SHEET_URL, capture=True)
    rows = list(csv.reader(io.StringIO(payload.decode("utf-8-sig"))))
    if not rows or not rows[0] or rows[0][0].strip() != "EE_LanguageCode":
        raise RuntimeError("The sheet export does not have the expected International Phrases header")
    keys = [row[0].strip() for row in rows[1:] if row and row[0].strip()]
    if not keys or len(keys) != len(set(keys)):
        raise RuntimeError("The sheet export has no keys or contains duplicate phrase keys")
    return sorted(keys, key=str.casefold), hashlib.sha256(payload).hexdigest()


def write_sheet_keys(keys):
    terms = [f"key = {json.dumps(key, ensure_ascii=True)}" for key in keys]
    (HERE / "sheetPhraseKeys.qll").write_text(
        "/** Generated from the live International Phrases sheet by missing_sheet.py. */\n"
        "predicate sheetPhraseKey(string key) {\n  " + "\n  or ".join(terms) + "\n}\n",
        encoding="utf-8",
    )


def main():
    keys, sheet_sha256 = fetch_sheet_keys()
    sheet_keys = set(keys)
    write_sheet_keys(keys)

    codeql = os.environ.get("CODEQL_BIN", "codeql")
    repositories = {}
    matches = defaultdict(list)
    source_roots = {}
    with tempfile.TemporaryDirectory(prefix="easyeyes-missing-sheet-codeql-") as temporary:
        workdir = Path(temporary)
        for name, repository, branch, roots in REPOSITORIES:
            info, source_root = snapshot(name, repository, branch, roots, workdir / "sources")
            repositories[name] = info
            source_roots[name] = source_root
            rows = analyze(codeql, source_root, workdir / name, HERE / "missing-sheet-keys.ql")
            for key, path, line, match_kind in rows[1:]:
                if key not in sheet_keys:
                    matches[key].append({
                        "repository": name,
                        "path": path,
                        "line": int(line),
                        "method": "codeql",
                        "matchKind": match_kind,
                    })
            print(f"{name}: {info['sourceFiles']} source files, {len(rows) - 1} missing references", flush=True)

        add_runtime_references(None, source_roots, matches)
        missing = {key: references for key, references in matches.items() if key not in sheet_keys}
        add_match_evidence(missing, source_roots)

    sorted_missing = {
        key: sorted(missing[key], key=lambda item: (item["repository"], item["path"], item["line"], item["method"]))
        for key in sorted(missing, key=str.casefold)
    }
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sheet": {"url": SHEET_URL, "sha256": sheet_sha256, "keyCount": len(keys)},
        "method": "CodeQL finds direct readi18nPhrases literal arguments and phrases property accesses absent from the live sheet. The labeled source fallback covers threshold.js; finite digit and movie key rewrites are included. Dynamic variable lookups remain unresolved. Findings are candidates for review.",
        "repositories": repositories,
        "counts": {"sheetKeys": len(keys), "missingKeys": len(sorted_missing), "references": sum(map(len, sorted_missing.values()))},
        "missing": sorted_missing,
    }
    output = HERE / "missing-sheet-report.json"
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(output), **report["counts"]}))


if __name__ == "__main__":
    main()
