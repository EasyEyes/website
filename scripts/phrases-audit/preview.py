import io
import json
import os
import tarfile
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from run import (
    ENDPOINT, EXCLUDED_NAMES, EXCLUDED_PARTS, HERE, REPOSITORIES, ROOT,
    SUFFIXES, add_match_evidence, add_runtime_references, analyze, run,
    write_key_input,
)


def snapshot_commit(repository, roots, destination):
    commit = run("git", "-C", str(repository), "rev-parse", "HEAD", capture=True).decode().strip()
    trees = {
        root: run("git", "-C", str(repository), "rev-parse", f"{commit}:{root}", capture=True).decode().strip()
        for root in roots
    }
    archive = run("git", "-C", str(repository), "archive", commit, *roots, capture=True)
    count = 0
    with tarfile.open(fileobj=io.BytesIO(archive)) as members:
        for member in members:
            path = Path(member.name)
            if path.is_absolute() or ".." in path.parts:
                raise RuntimeError("Unsafe archive path")
            if not member.isfile() or path.suffix not in SUFFIXES or path.name.endswith(".d.ts"):
                continue
            if set(path.parts) & EXCLUDED_PARTS or path.name in EXCLUDED_NAMES:
                continue
            if path.name.endswith((".test.js", ".test.ts", ".spec.js", ".spec.ts")):
                continue
            target = destination / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(members.extractfile(member).read())
            count += 1
    if not count:
        raise RuntimeError(f"Empty snapshot: {repository}")
    return {"commit": commit, "roots": trees, "sourceFiles": count}


def main():
    codeql = os.environ.get("CODEQL_BIN", "codeql")
    metadata = json.loads(run("curl", "--compressed", "-fLsS", "--retry", "3", ENDPOINT + "?versionOnly=1", capture=True))
    payload = json.loads(run("curl", "--compressed", "-fLsS", "--retry", "3", ENDPOINT + "?v=" + metadata["version"], capture=True))
    if payload["version"] != metadata["version"]:
        raise RuntimeError("Phrase version changed")
    keys = sorted(payload["phrases"])
    write_key_input(keys)
    run(codeql, "pack", "install", str(HERE))
    matches = defaultdict(list)
    repositories = {}
    source_roots = {}
    with tempfile.TemporaryDirectory(prefix="preview-phrases-") as directory:
        workdir = Path(directory)
        for name, relative, _, roots in REPOSITORIES:
            source = workdir / "sources" / name
            repositories[name] = snapshot_commit(ROOT / relative, roots, source)
            source_roots[name] = source
            rows = analyze(codeql, source, workdir / name)
            for key, path, line, match_kind in rows[1:]:
                matches[key].append({"repository": name, "path": path, "line": int(line), "method": "codeql", "matchKind": match_kind})
            print(f"Audited {name}: {repositories[name]['commit']}", flush=True)
        add_runtime_references(set(keys), source_roots, matches)
        add_match_evidence(matches, source_roots)
    used = sorted(set(keys) & matches.keys())
    generated = datetime.now(timezone.utc).isoformat()
    report = {
        "id": "preview-153-" + os.environ["GITHUB_RUN_ID"],
        "status": "completed",
        "report": {
            "generatedAt": generated,
            "scope": "Exact-commit phrase usage only; historical removals and missing-sheet audit not run",
            "phraseUsage": {
                "source": {"endpoint": ENDPOINT, "version": metadata["version"]},
                "repositories": repositories,
                "used": {key: matches[key] for key in used},
                "unused": sorted(set(keys) - matches.keys()),
                "counts": {"used": len(used), "total": len(keys)},
            },
        },
    }
    (HERE / "preview-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"id": report["id"], "used": len(used)}))


if __name__ == "__main__":
    main()
