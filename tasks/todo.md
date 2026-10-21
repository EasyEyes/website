# Compiler glossary tasks

- [x] Adapter/endpoint: C1–C5; node tests with injected completed-run store.
- [x] Compiler integration and links: C1/C2/C4–C7; Jest and exact row-link assertions.
- [x] Source paths and deployment pinning: C8/C9; shared API and compiler tests.
- [x] Package tests/builds, real study compilation, documentation, Git review.

## Verification

- Glossary audit function tests: 10 passed.
- Native endpoint and study path API tests: 9 passed.
- Compiler focused tests: 26 passed across glossary audit, glossary paths,
  international phrase audit, and phrase paths.
- Participant/compiler integration: 39 passed across glossary links, local
  compiler fidelity, and source archive round trip.
- Full authoring suite: 529 passed, 9 failed across three suites. All three failing
  suites reproduce on a clean origin/new-main worktree: studioSkills,
  fastCompileProgress, and freshnessStatus.
- Full threshold suite: 3812 passed, 103 skipped, 10 failed across nine suites.
  All nine failures reproduce on clean origin/main. These concern missing fixture
  tables/font assets, parameter-mention expectations, Compare3Languages archive
  fixtures, and the fuzz driver. No tests were removed or skipped by this change.
- Authoring TypeScript passes. Production webpack build passes with the existing
  bundle-size warnings, using local DEPLOY_ID and demo Firebase database metadata.
- Threshold build passes Rust and TypeScript checks, Vite, and manifest validation.
- Shared source index build succeeds and a second build reuses the same index.
- Git whitespace checks pass in all three modified repositories.

## Real archive evidence

Used `Compare3Languages175-reachability-test.source.zip`, the saved completed
35.6 glossary audit, and the published 35.6 glossary snapshot. Original archive
compilation blocks `_online2PayCurrency` as unused and generates no condition files.
Its error links to `range=A168:J168` in the actual published Google Sheets glossary.
A temporary in-memory verification copy with that obsolete row removed compiles
without blocking errors, generates two files, and includes 935 glossary reader
sites. The original archive is unchanged.

Results: `/tmp/easyeyes-glossary-real-study/compile-result.json` and
`/tmp/easyeyes-glossary-real-study/corrected-compile-result.json`.

The live sheet publishes `_s` as its name header. A failing regression test
confirmed the previous loader rejected that CSV. The loader now accepts both
`_s` and `INPUT PARAMETER`, preserving exact row positions and prior behavior.

## Boundaries and rollout

Unit tests inject the external completed-audit store. Real archive verification
uses a saved audit, not live Firestore credentials. No audit was started and no
study data was written remotely. Browser-specific deployment integration and a
live Firestore read for the new endpoint remain unverified until deployment.
The endpoint must be deployed with these compiler changes, and a completed audit
matching the loaded glossary version is required.

On 2026-10-21, the website and all three submodules moved to
`feat/glossary-compiler-preview-20261021` for review. The existing glossary work
is committed from the deepest modified submodule upward. PsychoJS has no source
changes. Fresh focused verification passed 81 tests, the authoring TypeScript
check, and shared source-index generation. Live preview verification follows
deployment. The invalid-parameter and old-glossary scenario is deferred at the
user's request.
