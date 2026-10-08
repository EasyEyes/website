#!/usr/bin/env python3
"""Run every phrase audit and publish one combined JSON report."""

import json
import os
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path


HERE = Path(__file__).resolve().parent
STAGES = (
    ("phraseUsage", "run.py", "report.json"),
    ("history", "history.py", "history-report.json"),
    ("missingFromSheet", "missing_sheet.py", "missing-sheet-report.json"),
)


def find_mismatches(reports):
    usage = reports["phraseUsage"]
    history = reports["history"]
    sheet = reports["missingFromSheet"]
    repositories = []
    keys = {}
    report_checks = []

    if history["phrasesVersion"] != usage["source"]["version"]:
        report_checks.append({
            "kind": "phrasesVersion",
            "usageVersion": usage["source"]["version"],
            "historyVersion": history["phrasesVersion"],
            "description": "Historical removal evidence was generated for a different published phrases version.",
        })

    for key in sorted(set(history["keys"]) - set(usage["unused"])):
        keys.setdefault(key, []).append({
            "kind": "statusConflict",
            "description": "The history report calls this key unused, but the usage report does not list it as unused.",
        })

    for name, details in usage["repositories"].items():
        commits = {
            "phraseUsage": details["commit"],
            "history": history["repositories"][name]["head"],
            "missingFromSheet": sheet["repositories"][name]["commit"],
        }
        if len(set(commits.values())) == 1:
            continue
        repositories.append({
            "repository": name,
            "commits": commits,
            "description": "The audits read different source commits. Key entries below are review candidates, not proof that a reference changed.",
        })

        observed = {}
        for key, references in usage["used"].items():
            if any(reference["repository"] == name for reference in references):
                observed.setdefault(key, []).append("phraseUsage found a reference")
        for key, references in sheet["missing"].items():
            if any(reference["repository"] == name for reference in references):
                observed.setdefault(key, []).append("missingFromSheet found a source reference absent from the sheet")
        if commits["history"] != commits["phraseUsage"]:
            for key in usage["unused"]:
                observed.setdefault(key, []).append("history checked this unused-key candidate")

        for key, observations in observed.items():
            keys.setdefault(key, []).append({
                "kind": "sourceCommitMismatch",
                "repository": name,
                "commits": commits,
                "observations": observations,
                "description": f"{key} was observed in {name} by the listed scan(s), but the scans used different commits. Its status across those commits is unverified; review this key before acting on the report.",
            })

    return {
        "repositories": repositories,
        "keys": {key: keys[key] for key in sorted(keys, key=str.casefold)},
        "reportChecks": report_checks,
    }


def main():
    started = time.monotonic()
    codeql = os.environ.get("CODEQL_BIN", "codeql")
    print("Installing the CodeQL query pack", flush=True)
    install_started = time.monotonic()
    subprocess.run([codeql, "pack", "install", str(HERE)], check=True)

    reports = {}
    durations = {"packInstall": round(time.monotonic() - install_started, 2)}
    for name, script, filename in STAGES:
        print(f"Running {script}", flush=True)
        stage_started = time.monotonic()
        subprocess.run([sys.executable, str(HERE / script)], check=True)
        durations[name] = round(time.monotonic() - stage_started, 2)
        reports[name] = json.loads((HERE / filename).read_text(encoding="utf-8"))

    mismatches = find_mismatches(reports)

    combined = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "durationSeconds": round(time.monotonic() - started, 2),
        "stageDurationSeconds": durations,
        **reports,
        "mismatches": mismatches,
    }
    destination = HERE / "all-reports.json"
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=HERE, prefix=".all-reports-", suffix=".json", delete=False) as temporary:
        temporary_path = Path(temporary.name)
        json.dump(combined, temporary, indent=2, ensure_ascii=False)
        temporary.write("\n")
    temporary_path.replace(destination)
    print(json.dumps({"report": str(destination), "durationSeconds": combined["durationSeconds"]}), flush=True)


if __name__ == "__main__":
    main()
