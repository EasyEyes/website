#!/usr/bin/env python3
"""Find when currently unused phrase references left default-branch source."""

import csv
import json
import os
import re
import subprocess
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import history_state
from run import EXCLUDED_NAMES, EXCLUDED_PARTS, HERE, REPOSITORIES, ROOT, SUFFIXES, reader_calls


REMOTES = {
    "website": "website",
    "threshold-scientists": "threshold-scientist",
    "threshold": "threshold",
    "psychojs": "psychojs",
    "remote-calibrator": "remote-calibrator",
    "speaker-calibrator": "speaker-calibration",
}
KEY_TOKEN = re.compile(r"(?<![A-Za-z0-9_'-])(?:(?:EE|RC|T)_[A-Za-z0-9_'-]+|DOCUMENTATION_OF_THIS_TABLE|TRANSLATION_INSTRUCTIONS)(?![A-Za-z0-9_'-])")
HISTORICAL_CATALOGS = {"components/i18n.js", "src/i18n.js", "src/i18n/phrases.js"}


def command(args, env=None, allow_missing=False):
    result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    if result.returncode and not allow_missing:
        raise RuntimeError(f"Command failed: {args[:5]}: {result.stderr.decode(errors='replace')[:500]}")
    return result.stdout if result.returncode == 0 else None


def git(repository, *args, env=None, allow_missing=False):
    return command(["git", "-C", str(repository), *args], env=env, allow_missing=allow_missing)


def source_path(path):
    item = Path(path)
    return (
        item.suffix in SUFFIXES
        and path not in HISTORICAL_CATALOGS
        and not item.name.endswith(".d.ts")
        and item.name not in EXCLUDED_NAMES
        and not item.name.endswith((".test.js", ".test.ts", ".spec.js", ".spec.ts"))
        and not set(item.parts) & EXCLUDED_PARTS
    )


def write_key_predicate(keys, filename, predicate, source):
    parts = [f"key = {json.dumps(key, ensure_ascii=True)}" for key in keys]
    body = "\n  or ".join(parts) if parts else "none()"
    (HERE / filename).write_text(
        f"/** Generated from {source} by history.py. */\n"
        f"predicate {predicate}(string key) {{\n  {body}\n}}\n",
        encoding="utf-8",
    )


def history_repository(name, local_path, branch, head, cache):
    remote = REMOTES[name]
    repository = cache / f"{remote}.git"
    if not repository.exists():
        command([
            "git", "clone", "--quiet", "--filter=blob:none", "--bare",
            "--single-branch", "--branch", branch,
            f"https://github.com/EasyEyes/{remote}.git", str(repository),
        ])
    recorded = git(repository, "rev-parse", "--verify", f"{head}^{{commit}}", allow_missing=True)
    if not recorded:
        git(repository, "fetch", "--quiet", "origin", branch)
        recorded = git(repository, "rev-parse", "--verify", f"{head}^{{commit}}", allow_missing=True)
    if not recorded:
        raise RuntimeError(f"{name} history does not contain report commit {head}")
    if git(repository, "rev-parse", "--is-shallow-repository").strip() != b"false":
        raise RuntimeError(f"{name} history is shallow")
    alternate = git(ROOT / local_path, "rev-parse", "--path-format=absolute", "--git-path", "objects").decode().strip()
    environment = os.environ.copy()
    environment["GIT_ALTERNATE_OBJECT_DIRECTORIES"] = alternate
    return repository, environment


def removal_candidates(repository, environment, revision, roots, keys):
    if not keys:
        return {}
    pattern = "(" + "|".join(re.escape(key) for key in sorted(keys, key=len, reverse=True)) + ")"
    args = [
        "git", "-C", str(repository), "log", revision, "--first-parent",
        "--diff-merges=first-parent", "--no-renames", "-p", "--unified=0",
        "-G" + pattern, "--format=@@COMMIT@@%H%x09%cI", "--", *roots,
        *(f":(exclude){path}" for path in HISTORICAL_CATALOGS),
    ]
    process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=environment)
    assert process.stdout is not None
    events = parse_history_lines((line.decode("utf-8", errors="replace") for line in process.stdout), set(keys))
    stderr = process.stderr.read() if process.stderr else b""
    if process.wait():
        raise RuntimeError(f"Git history search failed: {stderr.decode(errors='replace')[:500]}")
    return events


def reusable_history(state, name, repository, head, keys):
    if (not state or state.get("schemaVersion") != history_state.SCHEMA_VERSION
            or state.get("logicVersion") != history_state.LOGIC_VERSION):
        return set(), {}, None
    prior = state.get("report", {})
    old_repository = prior.get("repositories", {}).get(name, {})
    if old_repository.get("completeHistory") is not True:
        return set(), {}, None
    old_head = old_repository.get("head")
    if not isinstance(old_head, str) or not re.fullmatch(r"[0-9a-f]{40}", old_head):
        return set(), {}, None
    checked = set(state.get("checkedKeys", [])) & set(keys)
    if repository is None and old_head != head:
        return set(), {}, None
    if not checked:
        return set(), {}, None
    if old_head != head and command(
            ["git", "-C", str(repository), "merge-base", "--is-ancestor", old_head, head],
            allow_missing=True) is None:
        return set(), {}, None
    removals = {
        key: entry["removalsByRepository"][name]
        for key, entry in prior.get("keys", {}).items()
        if key in checked and name in entry.get("removalsByRepository", {})
    }
    return checked, removals, old_head


def parse_history_lines(lines, keys):
    events = defaultdict(set)
    commit = date = path = None
    for raw in lines:
        line = raw.rstrip("\r\n")
        if line.startswith("@@COMMIT@@"):
            commit, date = line[len("@@COMMIT@@"):].split("\t", 1)
            path = None
        elif line.startswith("diff --git a/") and " b/" in line:
            path = line.split(" b/", 1)[1]
        elif commit and path and source_path(path) and line.startswith("-") and not line.startswith("---"):
            if not any(prefix in line for prefix in ("EE_", "RC_", "T_", "DOCUMENTATION_", "TRANSLATION_")):
                continue
            for match in KEY_TOKEN.finditer(line[1:]):
                if match.group() in keys:
                    events[(commit, date, match.group())].add(path)
    return events


def historical_sources(repository, environment, events, destination):
    pairs = {(commit, path) for (commit, date, key), paths in events.items() for path in paths}
    for commit, path in sorted(pairs):
        parent = git(repository, "rev-parse", commit + "^", env=environment, allow_missing=True)
        for side, revision in (("before", parent.decode().strip() if parent else None), ("after", commit)):
            if revision is None:
                continue
            content = git(repository, "show", f"{revision}:{path}", env=environment, allow_missing=True)
            if content is None:
                continue
            target = destination / commit / side / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
    return len(pairs)


def codeql_references(codeql, source_root, workdir):
    workdir.mkdir(parents=True, exist_ok=True)
    database = workdir / "db"
    result = workdir / "result.bqrs"
    decoded = workdir / "result.csv"
    command([codeql, "database", "create", str(database), "--language=javascript", f"--source-root={source_root}"])
    command([codeql, "query", "run", str(HERE / "historical-usage.ql"), f"--database={database}", f"--output={result}"])
    command([codeql, "bqrs", "decode", str(result), "--format=csv", f"--output={decoded}"])
    references = defaultdict(list)
    with decoded.open(newline="", encoding="utf-8") as file:
        for key, path, line in list(csv.reader(file))[1:]:
            commit, side, original = path.split("/", 2)
            references[(commit, side, key)].append({"path": original, "line": int(line), "method": "codeql"})
    return references


def threshold_fallback(source_root, keys, references):
    """CodeQL 2.27.1 cannot parse threshold.js; check its direct reader calls."""
    for path in source_root.glob("*/before/threshold.js"):
        commit = path.parts[-3]
        for side in ("before", "after"):
            version = source_root / commit / side / "threshold.js"
            if not version.exists():
                continue
            text = version.read_text(encoding="utf-8", errors="replace")
            for key, position in reader_calls(text):
                if key in keys:
                    references[(commit, side, key)].append({
                        "path": "threshold.js",
                        "line": text.count("\n", 0, position) + 1,
                        "method": "sourceFallback",
                    })


def verified_removals(name, events, references):
    found = {}
    for (commit, date, key), paths in events.items():
        before = [item for item in references.get((commit, "before", key), []) if item["path"] in paths]
        after = [item for item in references.get((commit, "after", key), []) if item["path"] in paths]
        if not before or after:
            continue
        evidence = sorted(before, key=lambda item: (item["path"], item["line"]))
        removal = {
            "repository": name,
            "commit": commit,
            "removedAt": date,
            "date": datetime.fromisoformat(date).date().isoformat(),
            "previousReferences": evidence,
        }
        if key not in found:
            found[key] = removal
    return found


def main():
    current = json.loads((HERE / "report.json").read_text(encoding="utf-8"))
    keys = sorted(current["unused"], key=str.casefold)
    if len(keys) != current["counts"]["unused"] or set(keys) & current["used"].keys():
        raise RuntimeError("Current report has inconsistent unused keys")
    write_key_predicate(keys, "historicalCandidates.qll", "historicalCandidateKey", "report.json's unused keys")
    codeql = os.environ.get("CODEQL_BIN", "codeql")
    url = os.environ.get("CATALOG_USAGE_REPORT_URL")
    secret = os.environ.get("CATALOG_USAGE_REPORT_SECRET")
    if bool(url) != bool(secret):
        raise RuntimeError("Both history checkpoint URL and secret must be configured")
    persistent = bool(url)
    state = history_state.load() if persistent else None
    base_revision = state.get("revision") if state else None
    removals = defaultdict(dict)
    repository_metadata = {}
    with tempfile.TemporaryDirectory(prefix="easyeyes-phrase-history-") as temporary:
        workdir = Path(temporary)
        cache = Path(os.environ.get("HISTORY_REPO_DIR", workdir / "git"))
        cache.mkdir(parents=True, exist_ok=True)
        for name, local, branch, roots in REPOSITORIES:
            head = current["repositories"][name]["commit"]
            checked, old_removals, old_head = reusable_history(state, name, None, head, keys)
            if old_head == head and checked == set(keys):
                for key, removal in old_removals.items():
                    removals[key][name] = removal
                repository_metadata[name] = {
                    "branch": branch, "head": head, "candidateEvents": 0,
                    "completeHistory": True, "reusedKeys": len(checked),
                }
                print(f"{name}: reused history for {len(checked)} keys", flush=True)
                continue
            repository, environment = history_repository(name, local, branch, head, cache)
            checked, old_removals, old_head = reusable_history(state, name, repository, head, keys)
            for key, removal in old_removals.items():
                removals[key][name] = removal
            events = removal_candidates(repository, environment, head, roots, set(keys) - checked)
            if checked and old_head != head:
                events.update(removal_candidates(repository, environment, f"{old_head}..{head}", roots, checked))
            repository_metadata[name] = {
                "branch": branch, "head": head, "candidateEvents": len(events),
                "completeHistory": True, "reusedKeys": len(checked),
            }
            if not events:
                print(f"{name}: no candidate removals", flush=True)
                continue
            source_root = workdir / "sources" / name
            file_pairs = historical_sources(repository, environment, events, source_root)
            references = codeql_references(codeql, source_root, workdir / "codeql" / name)
            if name == "threshold":
                threshold_fallback(source_root, set(keys), references)
            for key, removal in verified_removals(name, events, references).items():
                previous = removals[key].get(name)
                if not previous or datetime.fromisoformat(removal["removedAt"]) > datetime.fromisoformat(previous["removedAt"]):
                    removals[key][name] = removal
            print(f"{name}: {len(events)} candidate events, {file_pairs} file pairs, {sum(name in value for value in removals.values())} keys removed", flush=True)

    entries = {}
    for key in keys:
        by_repository = removals.get(key, {})
        if not by_repository:
            continue
        latest = max(by_repository.values(), key=lambda item: datetime.fromisoformat(item["removedAt"]))
        entries[key] = {
            "status": "unused",
            "lastRemoval": latest,
            "removalsByRepository": by_repository,
        }
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceReport": "report.json",
        "phrasesVersion": current["source"]["version"],
        "method": "Git first-parent default-branch diff search identifies removed lines; CodeQL checks exact phrase references in each candidate file before and after the commit. threshold.js uses the labeled direct-call fallback because CodeQL 2.27.1 does not parse it. Keys without verified removal are omitted here and remain in report.json's unused list.",
        "repositories": repository_metadata,
        "counts": {"candidateKeys": len(keys), "removedKeys": len(entries)},
        "keys": entries,
    }
    destination = HERE / "history-report.json"
    destination.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if persistent:
        history_state.save(history_state.checkpoint(report, keys), base_revision)
    write_key_predicate(entries, "historicalUnusedKeys.qll", "historicalUnusedKey", "history-report.json's keys with lastRemoval")
    print(json.dumps({"report": str(destination), **report["counts"]}))


if __name__ == "__main__":
    main()
