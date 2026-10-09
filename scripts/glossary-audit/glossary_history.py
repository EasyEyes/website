#!/usr/bin/env python3
"""Attach verified file-reference removals to currently unreferenced glossary keys."""
import json
import os
import re
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import sys
sys.path.append(str(Path(__file__).resolve().parent.parent / "phrases-audit"))

import history
from glossary_run import repository_evidence
import run


def key_pattern(keys):
    return re.compile(r"(?<![A-Za-z0-9_$@])(?:" + "|".join(re.escape(key) for key in keys) + r")(?![A-Za-z0-9_$@])")


def candidates(repository, environment, head, roots, keys):
    pattern = key_pattern(keys)
    output = history.git(repository, "log", head, "--first-parent", "--diff-merges=first-parent",
                         "--no-renames", "-p", "--unified=0", "-G" + "|".join(re.escape(k) for k in keys),
                         "--format=@@COMMIT@@%H%x09%cI", "--", *roots, env=environment).decode(errors="replace")
    events = defaultdict(set)
    commit = date = path = None
    for line in output.splitlines():
        if line.startswith("@@COMMIT@@"):
            commit, date = line[10:].split("\t", 1)
        elif line.startswith("--- a/"):
            path = line[6:]
        elif line.startswith("-") and not line.startswith("---") and commit and path and history.source_path(path) and Path(path).name not in {"glossary.ts", "glossary-full.ts", "glossary.js"}:
            for match in pattern.finditer(line[1:]):
                events[commit, date, match.group()].add(path)
    return events


def verified(name, events, rows, source_root):
    references = defaultdict(list)
    for key, filename, line in rows:
        parts = Path(filename).parts
        if len(parts) < 3 or parts[1] != "before":
            continue
        references[parts[0], key, str(Path(*parts[2:]))].append(int(line))
    results = defaultdict(list)
    for (commit, date, key), paths in events.items():
        for path in sorted(paths):
            lines = sorted(set(references[commit, key, path]))
            before = source_root / commit / "before" / path
            after = source_root / commit / "after" / path
            # Require absence even from comments after deletion, avoiding uncertain parser coverage.
            if not lines or (after.exists() and key_pattern([key]).search(after.read_text(errors="replace"))):
                continue
            results[key].append({
                "repository": name, "commit": commit, "removedAt": date,
                "commitUrl": f"https://github.com/EasyEyes/{history.REMOTES[name]}/commit/{commit}",
                "path": path, "scope": "referenceRemovedFromFile",
                "previousReferences": [{"line": line} for line in lines],
            })
    return results


def main():
    destination = Path(__file__).resolve().parent / "glossary-report.json"
    report = json.loads(destination.read_text())
    entries = report["unused"]
    if not entries:
        return
    codeql = os.environ.get("CODEQL_BIN", "codeql")
    metadata = {}
    removals = defaultdict(list)
    with tempfile.TemporaryDirectory(prefix="easyeyes-glossary-history-") as temporary:
        work = Path(temporary)
        cache = Path(os.environ.get("HISTORY_REPO_DIR", work / "git"))
        cache.mkdir(parents=True, exist_ok=True)
        for name, local, branch, roots in run.REPOSITORIES:
            head = report["repositories"][name]["commit"]
            repository, environment = history.history_repository(name, local, branch, head, cache)
            events = candidates(repository, environment, head, roots, entries)
            metadata[name] = {"commit": head, "candidateEvents": len(events), "completeHistory": True}
            print(f"{name}: checking {len(events)} candidate events", flush=True)
            if events:
                sources = work / "sources" / name
                history.historical_sources(repository, environment, events, sources)
                rows = run.analyze(codeql, sources, work / "codeql" / name, Path(__file__).resolve().parent / "glossary-history.ql")
                for key, evidence in verified(name, events, rows[1:], sources).items():
                    for item in evidence:
                        item["previousCommit"] = history.git(repository, "rev-parse", item["commit"] + "^", env=environment).decode().strip()
                    removals[key].extend(evidence)
    for key, entry in entries.items():
        entry["removalEvidence"] = repository_evidence(sorted(removals[key], key=lambda item: item["removedAt"], reverse=True))
    report["historyScan"] = {
        "generatedAt": datetime.now(timezone.utc).isoformat(), "repositories": metadata,
    }
    destination.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"keysWithRemovalEvidence": sum(bool(value) for value in removals.values()), "report": str(destination)}))


if __name__ == "__main__":
    main()
