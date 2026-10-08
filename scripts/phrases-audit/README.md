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

## Start an audit and find its run ID

For a normal audit, choose **Run International Phrases audit** in the Google Sheet. The Netlify function creates a new document in Firestore's `internationalPhraseAuditRuns` collection, gives it a UUID as its document ID, and passes that ID to GitHub Actions as `run_id`. You do not need to enter an ID in GitHub. The ID connects the asynchronous workflow result to the correct Firestore document.

To start the workflow manually from GitHub Actions:

1. Generate a new UUID, for example with `python3 -c 'import uuid; print(uuid.uuid4())'`. Do not reuse an ID from a completed run.
2. In the Firebase console, open the default Firestore database and create a document in `internationalPhraseAuditRuns` using that UUID as the **document ID**. Set `status` to the string `queued` and `requestedAt` to the current UTC time as an ISO 8601 string, such as `2026-10-09T12:00:00Z`.
3. In GitHub, open **Actions → International phrases audit → Run workflow**. Select `main` and paste the same UUID into **Firestore run ID**.

An arbitrary ID without a corresponding Firestore document will make result publication fail with `Unknown run`. The Sheet menu is simpler because it creates the document and starts the workflow together.

## Reuse historical scan results

The history stage stores a checkpoint in Firestore at `internationalPhraseAuditHistory/current`. It contains the checked unused keys, verified removal evidence, source commits, and a logic version. When a source head is unchanged, the stage reuses that repository's result without cloning its history. When the head advances, it scans only new commits for previously checked keys. A newly unused key still needs one complete history scan. A rewritten branch or changed audit logic causes a full scan for that repository. The checkpoint is separate from the per-run report.

The production checkpoint was seeded from the successful October 8 [workflow run 37824874658](https://github.com/EasyEyes/website/actions/runs/37824874658) and verified by reading the Firestore document back. It covers all 251 unused keys across six repositories. If the checkpoint is ever removed, deploy the updated Netlify function, download that run's artifact while it is available, and seed it again:

```sh
gh run download 37824874658 -n international-phrases-report-1d0d576a-24e3-4e7a-8561-08572fcb95f0 -D /tmp/easyeyes-phrase-history-seed
python3 website/scripts/phrases-audit/history_state.py seed /tmp/easyeyes-phrase-history-seed/all-reports.json
```

Set `CATALOG_USAGE_REPORT_URL` and `CATALOG_USAGE_REPORT_SECRET` in the local environment before the seed command. Use the same values configured for GitHub Actions. The seed command checks that the history report and source report used matching phrase versions and repository commits. It refuses to overwrite an existing checkpoint.

## Report contents

`phraseUsage` lists published keys seen in source and keys with no detected use. `history` records verified removal evidence for some unused keys. `missingFromSheet` lists source references absent from the live sheet. `mismatches` flags scan stages that used different commits or phrase versions. The scan includes broader literal matches and supplemental derived-key checks, so review a finding's source evidence before changing a phrase.
