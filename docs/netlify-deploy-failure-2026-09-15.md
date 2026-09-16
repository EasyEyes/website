# Netlify production deploy failure — 2026-09-15

## Summary

The EasyEyes production deploy failed during Netlify function upload. The
static site build completed, but Netlify could not create the Lambda-compatible
functions because their combined environment variables exceeded AWS Lambda's
4 KB limit.

The failure was unrelated to application code execution. No function was
successfully published by the failed deploy.

## Evidence

The deploy log reported:

```text
Failed to create function: invalid parameter for function creation:
Your environment variables exceed the 4KB limit imposed by AWS Lambda.
```

The failure occurred during the `deploying` stage while uploading functions,
after the build reported success. The affected deploys included functions such
as `box-api`, `phrases`, `glossary`, `media-auth`, and `email-verification`.

The resolved production configuration showed the full environment-variable
set under the build configuration. The Functions-scoped environment contained
27 variables with an aggregate key/value size of approximately 4,013
characters before AWS serialization overhead. `BOX_CONFIG` was the largest
value at approximately 2.1 KB.

## Root cause

The site uses legacy Lambda-compatible Netlify Functions. Every function in
that runtime receives the complete Functions-scoped environment. Several
build-only variables and release orchestration credentials were also available
to Functions, pushing the serialized environment over AWS's 4 KB limit.

Netlify documents two remedies:

1. Limit each variable to the scopes that need it, especially **Builds** or
   **Functions**.
2. Migrate the functions from Lambda compatibility mode to modern Netlify
   Functions, which removes the AWS environment-property limit.

## Immediate recovery

The release-automation changes were reverted on the production branches:

| Repository                     | Branch     | Restore commit |
| ------------------------------ | ---------- | -------------- |
| `EasyEyes/website`             | `main`     | `10bbd800`     |
| `EasyEyes/threshold-scientist` | `new-main` | `d23f05a`      |
| `EasyEyes/threshold`           | `main`     | `c382d63b`     |

These are new revert commits; branch history was preserved. The existing
`threshold/psychojs` working-tree change was not reset or modified.

The rollback does not change Netlify's stored environment variables. The
release variables therefore remain present until they are removed or scoped in
the Netlify dashboard.

## Required Netlify action

In **Project configuration → Environment variables**, remove **Functions**
scope from build-only values and retain **Builds** scope:

```text
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

For the rollback state, remove the four release-orchestration variables from
Netlify, or at minimum remove them from **Functions** scope:

```text
ENGINE_RELEASE_GITHUB_TOKEN
ENGINE_RELEASE_NETLIFY_TOKEN
ENGINE_RELEASE_SITE_ID
ENGINE_RELEASE_WEBHOOK_SECRET
```

Keep runtime credentials such as `BOX_CONFIG`, `FIREBASE_DB`,
`FIREBASE_DATABASE_URL`, catalog secrets, and function-specific API
credentials in **Functions** scope. `FIREBASE_DATABASE_URL` also needs
**Builds** scope where the compiler build reads it.

After changing scopes, start a new production deploy. Environment changes only
apply to new deploys.

## Verification

The release automation tests passed before rollback:

```text
engine-release-webhook: 6 passed
release-manifest: 8 passed
```

The failed production deploy itself did not reach a publishable state. A
successful recovery deploy must be confirmed in Netlify by checking that the
function-upload stage completes and that the production URL serves the new
deploy.

## References

- [Netlify Functions environment variables](https://docs.netlify.com/build/functions/environment-variables/)
- [Netlify Lambda compatibility](https://docs.netlify.com/build/functions/lambda-compatibility/)

## Follow-up failure at 14:41

A deployment after the Git rollback failed with the identical HTTP 400 during
function upload. The build still attempted to upload 11 functions and the
resolved configuration still listed all four `ENGINE_RELEASE_*` variables.
This confirms that reverting Git commits does not remove Netlify environment
variables; the release credentials remain part of the Lambda environment until
their Netlify scopes or values are changed.

## Migration decision

The long-term direction should be to migrate all APIs to the modern Netlify
Functions API. It uses standard `Request`/`Response` handlers and typed
context. Existing Lambda-style handlers can migrate incrementally with
`@netlify/aws-lambda-compat` and `withLambda()`, preserving their current event
and response contract during the first step. See the [Netlify Functions API
reference](https://docs.netlify.com/build/functions/api/).

Use this staged approach:

1. Scope existing Netlify variables so the current deployment succeeds.
2. Convert one low-risk API to the modern handler, or wrap it with
   `withLambda()`, and validate it in a deploy preview.
3. Repeat API by API, preserving endpoint behavior and adding request/response
   integration coverage.
4. Remove Lambda compatibility when all functions are
   modern.

## Function migration inventory

This table records the planning inventory captured during the incident. The
release-related functions were later removed by the rollback, and the migration
status in the next section is authoritative. “Modern” meant the entry point
already received a `Request` and returned a `Response`; it still required review
and tests before being treated as complete.

| Priority       | Function                      | Current entry point                        | Migration assessment                                                  |
| -------------- | ----------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Already modern | `catalog-usage-report`        | `index.mjs` default `Request` handler      | Verify tests and add explicit `Config` if needed                      |
| Already modern | `compiler-deployment-webhook` | `index.ts` default `Request` handler       | Verify webhook regression tests                                       |
| Already modern | `engine-release-webhook`      | `index.ts` default `Request` handler       | Migrate with the release workflow when reintroduced                   |
| Already modern | `release-manifest`            | `index.mjs` default `Request` handler      | Verify Firebase and pinning tests                                     |
| 1              | `github-stats`                | CommonJS `exports.handler(event)`          | Small, read-only upstream request; lowest risk                        |
| 2              | `formspree-quota`             | CommonJS `exports.handler(event)`          | Small, isolated API and simple response mapping                       |
| 3              | `speech-token`                | Named Lambda-style `handler(event)`        | Security-sensitive token minting; migrate early with rate-limit tests |
| 4              | `translate-phrase-file`       | Named Lambda-style `handler(event)`        | Moderate translation and upload error handling                        |
| 5              | `email-verification`          | CommonJS `exports.handler(event)`          | External mail side effects require integration coverage               |
| 6              | `prolific`                    | CommonJS `exports.handler(event, context)` | Authentication and participant workflow need careful parity tests     |
| 7              | `box-api`                     | CommonJS `exports.handler(event)`          | Box SDK and JWT configuration make this higher risk                   |
| 8              | `media-auth`                  | Named Lambda-style `handler(event)`        | Authorization and CORS behavior require security regression tests     |
| 9              | `glossary`                    | Named Lambda-style `handler(event)`        | Larger Firebase CRUD surface and publication gates                    |
| 10             | `phrases`                     | Named Lambda-style `handler(event)`        | Largest and most coupled API; migrate after shared patterns stabilize |

The recommended implementation order starts with the smallest isolated
handlers, establishes a shared request/response adapter and test pattern, then
moves to authentication, Firebase CRUD, and the large Phrase workflow.

## Migration implementation

The migration is implemented on `feature/netlify-functions-migration`. It uses
Netlify's official `@netlify/aws-lambda-compat` adapter so the existing Lambda
request and response contracts remain stable while the functions run on the
modern Netlify Functions runtime. The entry modules use `.mts` so Netlify
loads them as ES modules.

The migrated functions are:

```text
box-api
compiler-deployment-webhook
email-verification
github-stats
glossary
phrases
prolific
studio-assistant
translate-phrase-file
```

The following functions remain in Lambda compatibility mode by explicit
project decision:

```text
formspree-quota
media-auth
speech-token
```

Because those three functions remain on the legacy runtime, their combined
Functions-scoped environment must still fit within AWS Lambda's 4 KB serialized
environment limit. The migration reduces the number of affected functions, but
environment-variable cleanup is still required before production deployment.

The migration also updates the Netlify build runtime to Node.js 22.12.0 and
npm 10.9.0. This satisfies the minimum Node.js version required by
`@netlify/aws-lambda-compat` 2.x.

## How to test the migrated functions

Run these commands from the `website` repository root.

### Automated request and response tests

Install the root dependencies and run the modern-runtime integration suite:

```bash
npm install
npm run test:functions-runtime
```

The suite imports every migrated entry point, sends standard Web API `Request`
objects, and verifies the returned `Response` objects. It covers CORS
preflights, request-body conversion, representative error responses, and a
mocked successful GitHub response without making external requests.

Run the existing function tests as well:

```bash
cd netlify/functions/translate-phrase-file && npm test -- --runInBand
cd ../glossary && npm test -- --runInBand
cd ../phrases && npm test -- --runInBand
cd ../studio-assistant && npm test -- --runInBand
cd ../compiler-deployment-webhook && npm test -- --runInBand
```

### Bundle the functions locally

Build into a temporary directory so generated ZIP files do not appear beside
the source files:

```bash
npx netlify functions:build \
  --src netlify/functions \
  --functions /tmp/easyeyes-netlify-functions
```

The command must finish without a legacy-runtime warning for any migrated
function. Warnings for `formspree-quota`, `media-auth`, or `speech-token` are
expected until those functions are migrated.

### Exercise the local Netlify runtime

Start the standalone function server:

```bash
npx netlify functions:serve --functions netlify/functions --port 9999
```

In another terminal, verify representative preflight requests:

```bash
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/box-api
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/email-verification/send
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/github-stats
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/glossary
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/phrases
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/prolific
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/studio-assistant
curl -i -X OPTIONS http://localhost:9999/.netlify/functions/translate-phrase-file
```

The endpoints should return 200 or 204 according to their existing contracts,
with no 500 response from request or response conversion.

### Verify a deploy preview

The local checkout is not linked to the production Netlify project. Link it
interactively, or pass the project ID to each CLI command:

```bash
npx netlify link
npx netlify status
```

Prefer a Git-based deploy preview from a pull request. If a manual draft deploy
is needed, use:

```bash
npx netlify deploy --build
```

Do not add `--prod` until the draft deploy succeeds. In the deploy log, confirm:

1. The build uses Node.js 22.12.0.
2. All migrated functions bundle successfully.
3. Function upload completes without the HTTP 400 environment-size error.
4. The migrated functions appear in the deploy's Functions list.
5. The deploy-preview URL returns the expected status and CORS headers for the
   requests above.
6. A normal application flow that uses `glossary`, `phrases`, and
   `studio-assistant` succeeds with preview-safe credentials.

## Environment-variable remediation runbook

Manage secrets in **Project configuration → Environment variables**. Do not put
secret values in `netlify.toml`. Scope changes made in Netlify apply only after
a new build and deploy.

### Remove Functions scope from build-only variables

Keep these variables in **Builds** scope where they are still required, and
remove **Functions** scope:

```text
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

### Remove obsolete release-orchestration variables

The rollback removed the release automation that consumed these values. Delete
them from the Netlify project:

```text
ENGINE_RELEASE_GITHUB_TOKEN
ENGINE_RELEASE_NETLIFY_TOKEN
ENGINE_RELEASE_SITE_ID
ENGINE_RELEASE_WEBHOOK_SECRET
```

If release automation is reintroduced later, recreate only the variables that
the new workflow consumes and use **Builds** scope unless a deployed function
reads the value at runtime.

### Keep runtime variables in Functions scope

The source currently reads these variables in deployed functions:

| Variable                             | Consumer                                             | Action                                                  |
| ------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------- |
| `ANTHROPIC_API_KEY`                  | `studio-assistant`                                   | Functions; required when the assistant is enabled       |
| `BOX_CONFIG`                         | `box-api`                                            | Functions; required unless the Box setup is redesigned  |
| `BOX_DEVELOPER_TOKEN`                | `box-api`                                            | Functions; optional alternative authentication          |
| `BOX_USER_ID`                        | `box-api`                                            | Functions; optional user-scoped Box authentication      |
| `COMPILER_DEPLOYMENT_WEBHOOK_SECRET` | `compiler-deployment-webhook`                        | Functions; required for webhook verification            |
| `DEEPGRAM_API_KEY`                   | excluded `speech-token`                              | Functions; required when Deepgram tokens are enabled    |
| `DEEPL_API_KEY`                      | `phrases`, `translate-phrase-file`                   | Functions; required for DeepL translation               |
| `ELEVENLABS_API_KEY`                 | excluded `speech-token`                              | Functions; required when ElevenLabs tokens are enabled  |
| `EMAIL_FROM`                         | `email-verification`                                 | Functions; optional sender override                     |
| `FIREBASE_DATABASE_URL`              | `glossary`, `phrases`, compiler build                | Builds and Functions                                    |
| `FIREBASE_DB`                        | `compiler-deployment-webhook`, `glossary`, `phrases` | Functions; required Firebase credential                 |
| `FORMSPREE_API_KEY`                  | excluded `formspree-quota`                           | Functions; required for quota lookup                    |
| `FORMSPREE_FORM_ID`                  | excluded `formspree-quota`                           | Functions; optional form override                       |
| `FORMSPREE_MONTHLY_QUOTA`            | excluded `formspree-quota`                           | Functions; optional quota override                      |
| `GITHUB_PAT` or `GITHUB_TOKEN`       | `github-stats`                                       | Functions; optional but recommended for API rate limits |
| `GLOSSARY_SECRET`                    | `glossary`                                           | Functions; required for protected writes                |
| `GOOGLE_API_KEY`                     | `phrases`, `translate-phrase-file`                   | Functions; required for Google-supported languages      |
| `MAILTRAP_TOKEN`                     | `email-verification`                                 | Functions; required to send verification email          |
| `PHRASES_SECRET`                     | `phrases`                                            | Functions; required for protected writes                |
| `SENTRY_DSN`                         | `phrases`                                            | Functions; optional telemetry                           |
| `STUDIO_ASSISTANT_EFFORT`            | `studio-assistant`                                   | Functions; optional model setting                       |
| `STUDIO_ASSISTANT_MODEL`             | `studio-assistant`                                   | Functions; optional model setting                       |
| `STUDIO_ASSISTANT_THINKING`          | `studio-assistant`                                   | Functions; optional thinking setting                    |

`PORT` and `UPSTREAM` are used only by the local `studio-assistant` development
server and do not need to be stored in the production Netlify project.

### Apply and verify scopes

For each variable in the Netlify UI:

1. Open the variable and inspect every contextual value.
2. Set only the scopes listed above.
3. Keep production, deploy-preview, and branch values separate when they use
   different services or credentials.
4. Mark secret credentials as secret values.
5. Save the change and trigger a new deploy.

The CLI can audit keys by scope after the site is linked:

```bash
npx netlify env:list --scope builds --context production
npx netlify env:list --scope functions --context production
```

Avoid `--plain` in shared terminals because it prints values. To update a value
and its scopes through the CLI, provide the value explicitly and list the
scopes, for example:

```bash
npx netlify env:set FIREBASE_DATABASE_URL "$FIREBASE_DATABASE_URL" \
  --scope builds functions \
  --context production deploy-preview branch-deploy
```

After the next deploy, confirm that the Functions-scoped list contains only
runtime variables and that the three excluded Lambda-compatible functions no
longer exceed the 4 KB serialized environment limit.
