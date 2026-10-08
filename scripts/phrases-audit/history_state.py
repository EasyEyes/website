"""Read and write the persistent history checkpoint through the audit function."""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


SCHEMA_VERSION = 1
# Increase this when removal detection or historical CodeQL semantics change.
LOGIC_VERSION = 1


def checkpoint(report, unused_keys, revision=None):
    if set(report["keys"]) - set(unused_keys):
        raise ValueError("History report contains keys outside the unused list")
    return {
        "schemaVersion": SCHEMA_VERSION,
        "logicVersion": LOGIC_VERSION,
        "revision": revision,
        "checkedKeys": sorted(set(unused_keys), key=str.casefold),
        "report": report,
    }


def endpoint():
    url = os.environ["CATALOG_USAGE_REPORT_URL"]
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError("CATALOG_USAGE_REPORT_URL must be an HTTPS URL")
    return urllib.parse.urlunsplit((
        parsed.scheme, parsed.netloc,
        "/.netlify/functions/phrases-audit", "action=history-state", "",
    ))


def exchange(payload):
    request = urllib.request.Request(
        endpoint(),
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {os.environ['CATALOG_USAGE_REPORT_SECRET']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"History checkpoint request failed: HTTP {error.code}") from error


def load():
    return exchange({"operation": "read"}).get("state")


def save(state, base_revision):
    return exchange({"operation": "write", "state": state, "baseRevision": base_revision})


def seed(path):
    combined = json.loads(Path(path).read_text(encoding="utf-8"))
    usage = combined["phraseUsage"]
    report = combined["history"]
    if report["phrasesVersion"] != usage["source"]["version"]:
        raise ValueError("Source and history phrase versions differ")
    if any(report["repositories"][name]["head"] != details["commit"]
           for name, details in usage["repositories"].items()):
        raise ValueError("Source and history commits differ")
    existing = load()
    if existing:
        raise RuntimeError("A history checkpoint already exists; refusing to replace it with a seed")
    state = checkpoint(report, usage["unused"])
    print(json.dumps(save(state, None)))


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] != "seed":
        raise SystemExit("Usage: history_state.py seed all-reports.json")
    seed(sys.argv[2])
