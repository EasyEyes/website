# EasyEyes release automation

Each successful website deploy dispatches the Threshold workflow with its
immutable deploy URL and exact nested Threshold revision. There is no fixed
staging deployment and no manually configured per-branch base URL. Netlify's
`production` context selects production; `branch-deploy` and `deploy-preview`
select staging. Keep Netlify's production branch aligned with the website
repository's default branch.

## GitHub

Deploy `.github/workflows/release-engine.yml`, `.github/workflows/release-catalog.yml`, and `threshold-engine/release/` to
**EasyEyes/threshold's default branch**. The workflow loads trusted orchestration
scripts from that branch and checks out the pinned Threshold source separately.

GitHub environments `production` and `staging` each need the corresponding
`RELEASE_MANIFEST_SECRET`. Existing secrets can be reused. `EASYEYES_BASE_URL`
is no longer configured in GitHub; the webhook supplies it dynamically.

Configure npm trusted publishing for the unscoped `threshold-engine` package,
GitHub owner
`EasyEyes`, repository `threshold`, workflow `release-engine.yml`. The workflow
uses Node 24 and GitHub-hosted runners. If the package does not exist, a maintainer
must publish it initially and configure its publisher. See
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Create a fine-grained GitHub token granting:

- `EasyEyes/website`: Contents read.
- `EasyEyes/threshold-scientist`: Contents read.
- `EasyEyes/threshold`: Contents read and Actions read/write.

Store it as `ENGINE_RELEASE_GITHUB_TOKEN` in the Netlify receiver's production
context. It is not passed to the engine workflow.

## Netlify variables

Deploy the new website `engine-release-webhook` and updated `release-manifest`
functions. The production hostname hosts the shared dispatch receiver; the
receiver itself does not write manifests to Firebase.

Set these variables with **Functions scope, Production context only**:

| Variable                        | Value                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `ENGINE_RELEASE_WEBHOOK_SECRET` | Separate random secret matching the notification JWS secret                         |
| `ENGINE_RELEASE_GITHUB_TOKEN`   | GitHub token described above                                                        |
| `ENGINE_RELEASE_NETLIFY_TOKEN`  | Netlify API token authorized to read EasyEyes deployment metadata                   |
| `ENGINE_RELEASE_SITE_ID`        | EasyEyes site ID; verify `7ef5bb5a-2b97-4af2-9868-d3e9c7ca2287` in project settings |

Do not expose these receiver credentials to preview builds. Configure secrets
through Netlify, never in source control.

Set release-function values **once per deployment context**:

| Variable                  | Production                             | Branch deploys and Deploy Previews                               |
| ------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `FIREBASE_DATABASE_URL`   | Production RTDB root                   | Exact root URL from `easyeyes-compiler-staging` Firebase Console |
| `FIREBASE_DB`             | Production database credential         | Staging database credential                                      |
| `RELEASE_MANIFEST_SECRET` | GitHub production environment's secret | GitHub staging environment's secret                              |

Credentials and secrets need Functions scope; `FIREBASE_DATABASE_URL` also needs
Builds scope for the compiler. Check for obsolete individual branch overrides.
Database isolation comes from these values, not from the hostname.

### Keep the Lambda environment below 4 KB

The site still contains legacy Lambda-compatible functions. AWS limits the
combined size of the environment passed to each such function to 4 KB. Scope
variables in **Project configuration → Environment variables** so that only
values read at function runtime include **Functions**. Values used only while
building the site or compiling the function bundles should use **Builds** only.

The following values are build-only for this repository and should not include
the Functions scope:

```
ANTHROPIC_API_KEY
EASYEYES_RUNTIME_NPM_TOKEN
EASYEYES_RUNTIME_PACKAGE
FIREBASE_API_KEY
FIREBASE_API_KEY_SOUND
FIREBASE_MEDIA_CLIENT_EMAIL
NODE_OPTIONS
SECRETS_SCAN_OMIT_PATHS
SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES
SENTRY_AUTH_TOKEN
SENTRY_ENVIRONMENT
STATIC_MODE
```

Keep `BOX_CONFIG` in Functions scope because `box-api` reads it at runtime,
but do not add other build credentials to that scope. The runtime values are
the Firebase URL and credential, catalog/function secrets, mail and translation
credentials, `MEDIA_ROLES`, the Phrase Sentry DSN, and the four
`ENGINE_RELEASE_*` receiver values in the production context. The release
receiver values remain production-only; they must not be copied to previews.

After changing scopes, trigger a new deploy (environment changes apply only to
new deploys) and verify the effective set without printing secret values:

```bash
netlify env:list --json --context production --scope functions \
  | jq -r 'keys[]' | sort
```

If the deploy still reports the 4 KB error, inspect the Functions-scoped list
for a large build credential such as `BOX_CONFIG` being duplicated under a
second key. Netlify documents both the scope behavior and the Lambda limit in
[environment variables for Functions](https://docs.netlify.com/build/functions/environment-variables/).

The release verifier derives catalog and report URLs from the request origin.
`EASYEYES_BASE_URL` is no longer needed for this function. Leave
`CATALOG_USAGE_REPORT_URL` unset unless an explicit matching report service is
intended; remove inherited production overrides from previews.

Both databases need published Phrase and Glossary versions and a current usage
report. Engine artifacts continue to use npm/jsDelivr.

## Deploy notification

After deploying the receiver, open **Project configuration → Notifications →
Deploy notifications** and add an **HTTP Post Request** notification:

- Event: **Deploy succeeded**.
- URL: `https://easyeyes.app/.netlify/functions/engine-release-webhook`.
- JWS secret: the value of `ENGINE_RELEASE_WEBHOOK_SECRET`.
- Include production, branch deploys, and Deploy Previews if filters are available.

One notification serves all branches. Netlify signs the raw body in
`X-Webhook-Signature`; the receiver verifies it and looks up authoritative deploy
metadata before dispatching. See
[Netlify deploy notifications](https://docs.netlify.com/deploy/deploy-notifications/).

## Testing and retries

Start with a feature branch deployment. Check webhook function logs, then
**EasyEyes/threshold → Actions → Release Threshold engine**. Successful runs
contain clickable compiler, manifest, engine, runtime, and release-list links.
Release labels include the website branch. Verify records are written to staging
RTDB, leaving production unchanged.

Completed deploy releases return `already-published` by looking up the Netlify
deployment ID in manifest provenance. Concurrent deliveries before publication can
queue another workflow. The workflow checks again before building, but a concurrent
run that passes this check can still publish another release. Serialize or investigate
duplicate workflow runs during rollout.

If dispatch fails, inspect logs and resend the notification. If the workflow
fails, rerun with the same inputs. An existing npm package is reused only if its
engine bytes match the expected digest before manifest publication. A retry after
manifest publication is skipped; a retry before publication allocates a number only
when verification succeeds.

Local checks:

```bash
npm run test:engine-release-webhook
npm run test:release-manifest
cd docs/experiment/threshold
node --test threshold-engine/release/*.test.mjs
```

Actual webhook delivery and GitHub/npm publication require external configuration
and are not exercised by mocked local tests.

## Release IDs and catalog-only publication

The release-manifest function allocates `<UTC publication date>.<number>` in the
selected Firebase RTDB. It uses a conditional write with Firebase ETags at
`easyEyesReleaseSequences/<date>`; production and staging sequences are independent.
For example, two publications on 2026-09-15 in staging become `2026-09-15.1` and
`2026-09-15.2`. Netlify deploy IDs remain in `source.deploymentId` and determine
the immutable deployment origin and npm package version. They are never selector
release IDs. The release service validates catalogs, current usage report, and
engine integrity before allocating the next ID. Failed verification uses no number.
An allocated number may be skipped if the subsequent Firebase manifest write fails.
The latest pointer uses a conditional write and never moves to a lower sequence
when publications finish out of order.

To publish a Phrase or Glossary change without a Netlify build, use
**EasyEyes/threshold → Actions → Release Phrase or Glossary catalog → Run workflow**.
Choose `production` with `https://easyeyes.app/`, or `staging` with the immutable
URL of the target branch or PR preview (`https://<deploy-id>--easyeyes.netlify.app/`).
The workflow uses the matching GitHub environment's manifest secret and the
selected origin's Firebase settings. It reads that database's latest manifest,
reuses its immutable `threshold-engine` version and digest, reads the published
Phrase and Glossary versions, checks the current usage report, and submits the
new manifest to the same allocator. At least one catalog version must have changed.
There is no npm publish or Netlify build in this workflow. Make sure catalog
updates and their usage report have been published in the target database first.
Check the workflow summary and `?list` endpoint for the new release ID.

The catalog workflow accepts only the production hostname or an immutable EasyEyes
Netlify deployment hostname. Use the matching environment for the URL: production
for `easyeyes.app`, staging for a preview. Restrict who can run the GitHub
environments and review release records during initial rollout.
