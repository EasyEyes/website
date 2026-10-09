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
import history_state
from glossary_run import repository_evidence
import run


def key_pattern(keys):
    return re.compile(r"(?<![A-Za-z0-9_$@])(?:" + "|".join(re.escape(key) for key in keys) + r")(?![A-Za-z0-9_$@])")


def candidates(repository, environment, head, roots, keys):
    if not keys:
        return {}
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
    url = os.environ.get("CATALOG_USAGE_REPORT_URL")
    secret = os.environ.get("CATALOG_USAGE_REPORT_SECRET")
    if bool(url) != bool(secret):
        raise RuntimeError("Both history checkpoint URL and secret must be configured")
    state = history_state.load() if url else None
    base_revision = state.get("revision") if state else None
    metadata = {}
    removals = defaultdict(list)
    with tempfile.TemporaryDirectory(prefix="easyeyes-glossary-history-") as temporary:
        work = Path(temporary)
        cache = Path(os.environ.get("HISTORY_REPO_DIR", work / "git"))
        cache.mkdir(parents=True, exist_ok=True)
        for name, local, branch, roots in run.REPOSITORIES:
            head = report["repositories"][name]["commit"]
            checked, prior, old_head = history.reusable_history(state, name, None, head, entries)
            if old_head == head and checked == set(entries):
                for key, evidence in prior.items():
                    removals[key].extend(evidence)
                metadata[name] = {"head": head, "candidateEvents": 0, "completeHistory": True, "reusedKeys": len(checked)}
                print(f"{name}: reused history for {len(checked)} keys", flush=True)
                continue
            repository, environment = history.history_repository(name, local, branch, head, cache)
            checked, prior, old_head = history.reusable_history(state, name, repository, head, entries)
            for key, evidence in prior.items():
                removals[key].extend(evidence)
            events = candidates(repository, environment, head, roots, set(entries) - checked)
            if checked and old_head != head:
                events.update(candidates(repository, environment, f"{old_head}..{head}", roots, checked))
            metadata[name] = {"head": head, "candidateEvents": len(events), "completeHistory": True, "reusedKeys": len(checked)}
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
    if url:
        keys = {key: {"removalsByRepository": {
            name: [item for item in evidence if item["repository"] == name]
            for name in metadata if any(item["repository"] == name for item in evidence)
        }} for key, evidence in removals.items() if evidence}
        checkpoint_report = {"repositories": metadata, "keys": keys}
        history_state.save(history_state.checkpoint(checkpoint_report, entries), base_revision)
    print(json.dumps({"keysWithRemovalEvidence": sum(bool(value) for value in removals.values()), "report": str(destination)}))


if __name__ == "__main__":
    main()
