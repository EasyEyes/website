# Glossary audit

This audit scans the same six default-branch source snapshots as the International
Phrases audit. It reuses `scripts/phrases-audit/run.py` for repository snapshots and
CodeQL execution, and `history.py` for Git history access. The glossary-specific
queries and report generator live here.

## Sheet flow

Install the updated `netlify/functions/glossary/apps-script/update-glossary.gs`
in the existing Glossary Apps Script project, then reopen the spreadsheet.

- **Update EasyEyes to use current Glossary** publishes `InputParameters` through
  the existing glossary API. After a successful publication, it calls
  `glossary-audit?action=start` and queues the GitHub workflow.
- **View Glossary audit report** opens a modal with saved runs, key search, and
  expandable evidence. Its groups appear in this order: obsolete keys still
  referenced, keys without detected references, and used keys. Source links open
  the exact scanned GitHub commit. Removal links open the source before deletion.

A failed audit request does not undo or hide a successful glossary publication.
An already active glossary audit is reused rather than dispatched again. Pending
runs are refreshed automatically in the modal, and failed runs show an error.

## Existing configuration

No new secrets or URL properties are required:

| Existing setting                      | Use                                                                  |
| ------------------------------------- | -------------------------------------------------------------------- |
| `GLOSSARY_SECRET`                     | Authenticates Sheet start/review requests using `x-glossary-secret`. |
| `GITHUB_ACTIONS_DISPATCH_TOKEN`       | Dispatches `glossary-audit.yml` in `EasyEyes/website`.               |
| `FIREBASE_SERVICE_ACCOUNT_JSON`       | Uses the existing Firebase project's Firestore.                      |
| `CATALOG_USAGE_REPORT_SECRET`         | Authenticates workflow result publication.                           |
| `CATALOG_USAGE_REPORT_URL`            | Supplies the existing deployment host for the result API.            |
| `NETLIFY_FUNCTION_URL` in Apps Script | Supplies the existing glossary API host for start/review requests.   |

The GitHub Action reuses the two existing `CATALOG_USAGE_REPORT_*` repository
secrets. The result API is derived from their current URL host. The glossary
reader uses the existing public Netlify glossary endpoint.

The new workflow must first reach `main`, and the Netlify function must be
deployed, before the Sheet can dispatch it. GitHub requires dispatchable
workflows to exist on the default branch. No workflow dispatch or production
Firestore write is part of local verification.

## Firestore storage

`glossaryAuditRuns/{runId}` stores status, timestamps, glossary version, and the
readable report object. `glossaryAuditState/active` prevents overlapping glossary
runs using a transaction. The phrase audit's collections are unchanged.

The workflow sends gzip/base64 for transport; the API decompresses the report
before storing it. A conservative 800,000-byte limit calculated from Firestore
field sizes leaves room for run metadata within the 1 MiB document limit.
Results exceeding that budget are rejected and the run is marked failed.

## Report contract

`counts` contains only `total`, `obsoleteUsed`, `unused`, and `used` numbers.
Each referenced key occurs exactly once under `obsoleteUsed` or `used`, based on
whether its published glossary `type` is exactly `obsolete`. Its value maps
repository names to file paths and sorted, unique line arrays. `unused` maps
unreferenced keys directly to repository-grouped comment and removal evidence.
Root repository metadata records GitHub slugs and scanned commits.

References include exact literals, source identifiers, object fields, properties,
named parameter-reader calls, global value-preserving data flow, verified two-digit
`@@` families, and the source-verified `addConditionToData` glossary loop. Runtime
reachability is not required. Comments alone do not count as usage. The loop's
source filters exclude obsolete definitions and its two configured default
exclusions. Its location is included in every applicable referenced key.

History follows first-parent changes through the report's recorded commits.
CodeQL must find a source reference before deletion, and the exact key must be
absent from that file afterward. Glossary catalog deletions and comments alone
are excluded. Evidence proves removal from a file, not global removal. Each
removal stores the deletion commit and its previous commit for source links.

A key without detected references is a review candidate, not proof that deleting
it is safe. Unsupported dynamic constructions and parser failures can limit
coverage. CodeQL currently reports a parse error in `threshold.js`; this existing
limitation remains visible in workflow logs.

## Local verification

Run the scanner from an EasyEyes workspace containing the six repositories:

```sh
CODEQL_BIN=/path/to/codeql python3 website/scripts/glossary-audit/audit.py
```

`HISTORY_REPO_DIR` can point to a reusable directory of bare history clones.
Generated `glossaryKeys.qll` and `glossary-report.json` are ignored by Git.

```sh
python3 -m unittest discover -s website/scripts/glossary-audit -p 'test_*.py'
CODEQL_BIN=/path/to/codeql python3 -m unittest discover -s website/scripts/glossary-audit -p 'test_glossary_codeql.py'
node --test website/netlify/functions/glossary-audit/*.test.mjs
cd website/netlify/functions/glossary && npm test -- --runInBand
```

The real CodeQL test uses an isolated query pack with fixed fixture keys and
runs in the workflow before the live audit. The modal can be tested locally with
mocked `google.script.run` calls; live Apps Script and Firestore verification
requires the deployed integration.
