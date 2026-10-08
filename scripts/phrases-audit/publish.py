#!/usr/bin/env python3
"""Send a GitHub Actions phrase audit result to the Netlify Firestore writer."""

import base64
import gzip
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


def main():
    run_id = sys.argv[1]
    source = Path(__file__).resolve().parent / "all-reports.json"
    catalog_url = os.environ["CATALOG_USAGE_REPORT_URL"]
    secret = os.environ["CATALOG_USAGE_REPORT_SECRET"]
    parsed = urllib.parse.urlsplit(catalog_url)
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError("CATALOG_USAGE_REPORT_URL must be an HTTPS URL")
    endpoint = urllib.parse.urlunsplit((
        parsed.scheme, parsed.netloc,
        "/.netlify/functions/phrases-audit", "action=result", "",
    ))

    if os.environ.get("AUDIT_OUTCOME") == "success" and source.is_file():
        compressed = gzip.compress(source.read_bytes())
        payload = {
            "id": run_id,
            "status": "completed",
            "reportGzipBase64": base64.b64encode(compressed).decode("ascii"),
        }
    else:
        workflow_url = f"https://github.com/EasyEyes/website/actions/runs/{os.environ['GITHUB_RUN_ID']}"
        payload = {
            "id": run_id,
            "status": "failed",
            "error": f"Audit workflow failed. See {workflow_url}",
        }

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            print(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Report publication failed: HTTP {error.code}") from error


if __name__ == "__main__":
    main()
