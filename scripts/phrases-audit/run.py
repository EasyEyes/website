#!/usr/bin/env python3
"""Audit published phrase keys against six default-branch source snapshots."""

import csv
import io
import json
import os
import re
import subprocess
import tarfile
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from itertools import product
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ENDPOINT = "https://easyeyes.netlify.app/.netlify/functions/phrases"
REPOSITORIES = [
    ("website", "website", "main", ("netlify/functions",)),
    ("threshold-scientists", "website/docs/experiment", "new-main", ("source",)),
    ("threshold", "website/docs/experiment/threshold", "main", ("components", "preprocess", "examples", "parameters", "threshold.js", "first.js")),
    ("psychojs", "website/docs/experiment/threshold/psychojs", "threshold-prod", ("src",)),
    ("remote-calibrator", "remote-calibrator", "main", ("src", "homepage")),
    ("speaker-calibrator", "speaker-calibration", "main", ("src",)),
]
SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}
EXCLUDED_PARTS = {"test", "tests", "__tests__", "__mocks__", "fixtures", "dist", "build", "coverage", "node_modules"}
EXCLUDED_NAMES = {"phrases.js", "i18n_local.js", "glossarySnapshot.js", "simulateRuntimeError.js"}
READER_CALL = re.compile(r"\breadi18nPhrases\s*\(\s*$")


def reader_calls(source):
    """Yield literal reader keys in executable JavaScript, with source offsets."""
    code = list(source)
    literals = []
    length = len(source)

    def mask(start, end):
        for position in range(start, end):
            if code[position] != "\n":
                code[position] = " "

    def quoted(start):
        quote = source[start]
        position = start + 1
        while position < length:
            if source[position] == "\\":
                position += 2
            elif source[position] == quote:
                literals.append((source[start + 1:position], start))
                position += 1
                break
            else:
                position += 1
        mask(start, min(position, length))
        return position

    def template(start):
        position = start + 1
        segment = start
        while position < length:
            if source[position] == "\\":
                position += 2
            elif source[position:position + 2] == "${":
                mask(segment, position + 2)
                position = scan(position + 2, in_template=True)
                segment = position
            elif source[position] == "`":
                mask(segment, position + 1)
                return position + 1
            else:
                position += 1
        mask(segment, length)
        return length

    def scan(start, in_template=False):
        position = start
        depth = 0
        while position < length:
            pair = source[position:position + 2]
            if pair == "//":
                end = source.find("\n", position + 2)
                end = length if end < 0 else end
                mask(position, end)
                position = end
            elif pair == "/*":
                end = source.find("*/", position + 2)
                end = length if end < 0 else end + 2
                mask(position, end)
                position = end
            elif source[position] in "'\"":
                position = quoted(position)
            elif source[position] == "`":
                position = template(position)
            elif in_template and source[position] == "{":
                depth += 1
                position += 1
            elif in_template and source[position] == "}":
                if depth == 0:
                    mask(position, position + 1)
                    return position + 1
                depth -= 1
                position += 1
            else:
                position += 1
        return length

    scan(0)
    executable = "".join(code)
    for key, start in literals:
        match = READER_CALL.search(executable[max(0, start - 200):start])
        if match:
            yield key, start


def run(*args, cwd=None, capture=False):
    result = subprocess.run(args, cwd=cwd, check=True, stdout=subprocess.PIPE if capture else None)
    return result.stdout if capture else None


def snapshot(name, repo, branch, roots, destination):
    repository = ROOT / repo
    head = run("git", "-C", str(repository), "ls-remote", "--symref", "origin", "HEAD", capture=True).decode()
    default_branch = head.splitlines()[0].split("refs/heads/", 1)[-1].split("\t", 1)[0]
    if default_branch != branch:
        raise RuntimeError(f"Default branch changed for {name}: expected {branch}, found {default_branch}")
    run("git", "-C", str(repository), "fetch", "--quiet", "--depth=1", "origin", branch)
    commit = run("git", "-C", str(repository), "rev-parse", "FETCH_HEAD", capture=True).decode().strip()
    archive = run("git", "-C", str(repository), "archive", commit, *roots, capture=True)
    source_root = destination / name
    count = 0
    with tarfile.open(fileobj=io.BytesIO(archive)) as members:
        for member in members:
            path = Path(member.name)
            if not member.isfile() or path.suffix not in SUFFIXES or path.name.endswith(".d.ts"):
                continue
            if set(path.parts) & EXCLUDED_PARTS or path.name in EXCLUDED_NAMES:
                continue
            if path.name.endswith((".test.js", ".test.ts", ".spec.js", ".spec.ts")):
                continue
            data = members.extractfile(member)
            if data is None:
                continue
            target = source_root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data.read())
            count += 1
    if not count:
        raise RuntimeError(f"No source files found in {name} at {commit}")
    return {"branch": branch, "commit": commit, "sourceFiles": count}, source_root


def write_key_input(keys):
    terms = [f"key = {json.dumps(key, ensure_ascii=True)}" for key in keys]
    (HERE / "phraseKeys.qll").write_text(
        "/** Generated from the published phrases endpoint by run.py. */\n"
        "predicate phraseKey(string key) {\n  " + "\n  or ".join(terms) + "\n}\n",
        encoding="utf-8",
    )


def analyze(codeql, source_root, workdir, query=None):
    workdir.mkdir(parents=True, exist_ok=True)
    database = workdir / "db"
    results = workdir / "results.bqrs"
    decoded = workdir / "results.csv"
    run(codeql, "database", "create", str(database), "--language=javascript", f"--source-root={source_root}")
    run(codeql, "query", "run", str(query or HERE / "phrase-usage.ql"), f"--database={database}", f"--output={results}")
    run(codeql, "bqrs", "decode", str(results), "--format=csv", f"--output={decoded}")
    with decoded.open(newline="", encoding="utf-8") as file:
        return list(csv.reader(file))


def add_runtime_references(keys, source_roots, matches):
    """Cover one unparsed entrypoint and finite rewrites; None keeps all keys."""
    threshold = source_roots["threshold"]
    entrypoint = threshold / "threshold.js"
    source = entrypoint.read_text(encoding="utf-8")
    for key, position in reader_calls(source):
        if keys is None or key in keys:
            matches[key].append({"repository": "threshold", "path": "threshold.js", "line": source.count("\n", 0, position) + 1, "method": "sourceFallback", "matchKind": "readerCall"})

    reader = (threshold / "components/readPhrases.js").read_text(encoding="utf-8")
    expected = (
        'phraseName.toLowerCase().includes("letter") && useWordDigitBool.current',
        'phraseName.replace("letter", "digit")',
        'phraseName.replace("Letter", "Digit")',
    )
    if not all(part in reader for part in expected):
        raise RuntimeError("Digit key rewrite changed; review components/readPhrases.js")
    for path in threshold.rglob("*"):
        if path.suffix not in SUFFIXES or not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for base, position in reader_calls(text):
            if "letter" not in base.lower():
                continue
            variant = base.replace("letter", "digit", 1).replace("Letter", "Digit", 1)
            if (keys is None or variant in keys) and variant != base:
                matches[variant].append({"repository": "threshold", "path": str(path.relative_to(threshold)), "line": text.count("\n", 0, position) + 1, "method": "derivedDigitKey", "matchKind": "derivedKey", "fromKey": base})

    movie_path = source_roots["remote-calibrator"] / "src/distance/object/locationUtils.js"
    movie = movie_path.read_text(encoding="utf-8")
    expected = (
        "const objectKey = 'Tube'",
        "const locationKey = location === 'center' ? 'Center' : 'Camera'",
        "const eyeKey = preferRightHandBool ? 'RightEye' : 'LeftEye'",
        "`RC_MovieAlign${objectKey}${locationKey}${eyeKey}`",
        "`RC_MovieGlance${objectKey}${eyeKey}`",
        "`RC_MovieSnapshot${objectKey}${locationKey}${eyeKey}`",
        "`RC_MovieDistance${objectKey}${locationKey}${eyeKey}`",
    )
    if not all(part in movie for part in expected):
        raise RuntimeError("Movie key construction changed; review src/distance/object/locationUtils.js")
    for family in ("Align", "Glance", "Snapshot", "Distance"):
        locations = ("",) if family == "Glance" else ("Center", "Camera")
        token = f"`RC_Movie{family}${{objectKey}}"
        line = movie.count("\n", 0, movie.index(token)) + 1
        for location, eye in product(locations, ("RightEye", "LeftEye")):
            key = f"RC_Movie{family}Tube{location}{eye}"
            if keys is None or key in keys:
                matches[key].append({"repository": "remote-calibrator", "path": "src/distance/object/locationUtils.js", "line": line, "method": "derivedMovieKey", "matchKind": "derivedKey"})


def describe_match(key, match):
    if match["method"] == "derivedDigitKey":
        return f"The reader can rewrite {match['fromKey']} to this digit key when the word-digit setting is enabled."
    if match["method"] == "derivedMovieKey":
        return "The movie-key template can construct this key from its fixed object, location, and eye values."
    if match["method"] == "sourceFallback":
        return "A direct readi18nPhrases call supplies this key; this file required the source fallback."
    if match["matchKind"] == "readerCall":
        return "CodeQL found a direct readi18nPhrases call with this literal key."
    if match["matchKind"] == "propertyAccess":
        return "CodeQL found a direct phrases property access for this key."
    if match["matchKind"] == "stringLiteral":
        return "CodeQL found an exact string literal matching this key; inspect its context to confirm runtime use."
    raise RuntimeError(f"Unknown match kind for {key}: {match['matchKind']}")


def add_match_evidence(matches, source_roots):
    lines_by_file = {}
    for key, references in matches.items():
        for reference in references:
            repository = reference["repository"]
            relative = Path(reference["path"])
            if relative.is_absolute() or ".." in relative.parts:
                raise RuntimeError(f"Unsafe source path in {repository}: {relative}")
            source = source_roots[repository] / relative
            if source not in lines_by_file:
                lines_by_file[source] = source.read_text(encoding="utf-8", errors="replace").splitlines()
            line_number = reference["line"]
            lines = lines_by_file[source]
            if line_number < 1 or line_number > len(lines):
                raise RuntimeError(f"Invalid source line in {repository}/{relative}: {line_number}")
            excerpt = lines[line_number - 1].strip()
            if key not in excerpt and reference["matchKind"] == "propertyAccess":
                for following in lines[line_number:line_number + 2]:
                    excerpt += "\n" + following.strip()
                    if key in excerpt:
                        break
            if len(excerpt) > 320:
                anchor = excerpt.find(key)
                if anchor < 0:
                    anchor = excerpt.find(reference.get("fromKey", "RC_Movie"))
                start = max(0, anchor - 120) if anchor >= 0 else 0
                end = min(len(excerpt), start + 320)
                excerpt = ("…" if start else "") + excerpt[start:end] + ("…" if end < len(excerpt) else "")
            reference["sourceLine"] = excerpt
            reference["description"] = describe_match(key, reference)


def main():
    codeql = os.environ.get("CODEQL_BIN", "codeql")
    metadata = json.loads(run("curl", "-fLsS", "--retry", "3", ENDPOINT + "?versionOnly=1", capture=True))
    version = metadata["version"]
    payload = json.loads(run("curl", "-fLsS", "--retry", "3", ENDPOINT + "?v=" + version, capture=True))
    if payload.get("version") != version:
        raise RuntimeError("Phrases version changed between metadata and payload requests")
    keys = sorted(payload["phrases"], key=str.casefold)
    if not keys or any(not isinstance(key, str) or not key for key in keys):
        raise RuntimeError("Unexpected phrase key in published payload")
    write_key_input(keys)

    repositories = {}
    matches = defaultdict(list)
    source_roots = {}
    with tempfile.TemporaryDirectory(prefix="easyeyes-phrases-codeql-") as temporary:
        workdir = Path(temporary)
        for name, repo, branch, roots in REPOSITORIES:
            info, source_root = snapshot(name, repo, branch, roots, workdir / "sources")
            repositories[name] = info
            source_roots[name] = source_root
            rows = analyze(codeql, source_root, workdir / name)
            for row in rows[1:]:
                key, path, line, match_kind = row
                matches[key].append({"repository": name, "path": path, "line": int(line), "method": "codeql", "matchKind": match_kind})
            print(f"{name}: {info['sourceFiles']} source files, {len(rows) - 1} references", flush=True)

        add_runtime_references(set(keys), source_roots, matches)
        add_match_evidence(matches, source_roots)

    used = sorted(set(keys) & matches.keys(), key=str.casefold)
    unused = sorted(set(keys) - matches.keys(), key=str.casefold)
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": {"endpoint": ENDPOINT, "version": version, "publishedAt": metadata.get("publishedAt")},
        "method": "CodeQL JavaScript/TypeScript AST finds exact string literals and direct phrases.<key> property accesses. A source scan covers threshold.js, which CodeQL 2.27.1 did not parse. Source-verified finite digit and movie key rewrites are included. Other variable lookups remain unresolved. Tests, generated files, and phrase catalogs are excluded.",
        "repositories": repositories,
        "counts": {"total": len(keys), "used": len(used), "unused": len(unused)},
        "used": {key: sorted(matches[key], key=lambda item: (item["repository"], item["path"], item["line"])) for key in used},
        "unused": unused,
    }
    output = HERE / "report.json"
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(output), **report["counts"]}))


if __name__ == "__main__":
    main()
