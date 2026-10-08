# International Phrases audit

Run the complete audit from the EasyEyes workspace root:

```sh
python3 website/scripts/phrases-audit/audit.py
```

Install the CodeQL CLI first, or set `CODEQL_BIN` to its executable path. The runner also uses `git` and `curl`. It reads the published phrases and the live International Phrases sheet, scans six source repositories, and writes `all-reports.json` after all three stages succeed. Generated JSON and CodeQL key files are ignored by Git; the CodeQL pack lock is kept with the source. This directory is the workflow's source of truth. The older workspace copy outside `website/` is not used by GitHub Actions.

The Google Sheet's **Run International Phrases audit** menu item sends an authenticated request to `/.netlify/functions/phrases-audit?action=start`. The Netlify function creates a queued run in the Firestore `internationalPhraseAuditRuns` collection and dispatches `.github/workflows/phrases-audit.yml`. GitHub Actions runs `audit.py` and calls the same function with the completed or failed result. The full compressed report is stored in `reportChunks` documents below the run document, keeping each document below Firestore's size limit. There is no Sheet history menu.

## Required configuration

- Keep `PHRASES_SECRET` in the Apps Script properties and Netlify environment; it authenticates the menu request.
- Set `GITHUB_ACTIONS_DISPATCH_TOKEN` in Netlify with permission to dispatch the `EasyEyes/website` Actions workflow.
- Set `FIREBASE_SERVICE_ACCOUNT_JSON` in Netlify to a service account JSON credential with read and write access to the target Firestore database. The existing `FIREBASE_DB` credential is for Realtime Database and cannot write Firestore.
- Set `CATALOG_USAGE_REPORT_URL` to `https://easyeyes.netlify.app/.netlify/functions/catalog-usage-report` and set `CATALOG_USAGE_REPORT_SECRET` as GitHub Actions secrets. `publish.py` takes the origin from the URL and posts to the phrases audit function. The same `CATALOG_USAGE_REPORT_SECRET` value must be available in Netlify. The audit reads phrases from the direct Netlify host as well because Cloudflare challenges GitHub Actions requests to `easyeyes.app`.

The workflow file must be on the GitHub default branch before the menu can dispatch it. The Apps Script source must also be deployed to the sheet, and the Netlify function must be deployed.

## Report contents

`phraseUsage` lists published keys seen in source and keys with no detected use. `history` records verified removal evidence for some unused keys. `missingFromSheet` lists source references absent from the live sheet. `mismatches` flags scan stages that used different commits or phrase versions. The scan includes broader literal matches and supplemental derived-key checks, so review a finding's source evidence before changing a phrase.
