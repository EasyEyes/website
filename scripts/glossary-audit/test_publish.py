import base64
import gzip
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import publish


class PublicationTests(unittest.TestCase):
    def test_reuses_existing_host_and_secret_to_publish_readable_report(self):
        with tempfile.TemporaryDirectory() as directory:
            script = Path(directory) / "publish.py"
            report = {"counts": {"total": 608}}
            (script.parent / "glossary-report.json").write_text(json.dumps(report))
            requests = []

            def open_request(request, timeout):
                requests.append(request)
                return io.BytesIO(b'{"status":"completed"}')

            with patch.object(publish, "__file__", str(script)), \
                 patch.object(publish.sys, "argv", [str(script), "run-id"]), \
                 patch.dict(publish.os.environ, {
                     "AUDIT_OUTCOME": "success", "CATALOG_USAGE_REPORT_URL": "https://existing.example/.netlify/functions/catalog-usage-report",
                     "CATALOG_USAGE_REPORT_SECRET": "existing-secret",
                 }), patch.object(publish.urllib.request, "urlopen", open_request):
                publish.main()
            request = requests[0]
            self.assertEqual(request.full_url, "https://existing.example/.netlify/functions/glossary-audit?action=result")
            self.assertEqual(request.get_header("Authorization"), "Bearer existing-secret")
            payload = json.loads(request.data)
            self.assertEqual(json.loads(gzip.decompress(base64.b64decode(payload["reportGzipBase64"]))), report)

    def test_reports_failure_instead_of_publishing_partial_output(self):
        with patch.object(publish.sys, "argv", ["publish.py", "run-id"]), \
             patch.dict(publish.os.environ, {
                 "AUDIT_OUTCOME": "failure", "GITHUB_RUN_ID": "123", "CATALOG_USAGE_REPORT_URL": "https://existing.example/api",
                 "CATALOG_USAGE_REPORT_SECRET": "existing-secret",
             }), patch.object(publish.urllib.request, "urlopen", return_value=io.BytesIO(b'{}')) as request:
            publish.main()
        payload = json.loads(request.call_args.args[0].data)
        self.assertEqual(payload["status"], "failed")
        self.assertNotIn("reportGzipBase64", payload)
        self.assertIn("/actions/runs/123", payload["error"])
