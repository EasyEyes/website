# Temporary PR 153 phrase-usage test

This test does not write Firestore or change the normal audit workflow.
The isolated workflow runs the existing CodeQL phrase-usage query and runtime
fallbacks against exact checked-out commits from all six repositories. It uploads
`preview-report.json` as a GitHub Actions artifact. Download that artifact here
and commit it to the test branch to include the evidence in the preview build.
Do not manually add used keys to the generated report.

The Netlify build enables this report only when all three build variables match:
`CONTEXT=deploy-preview`, `HEAD=feat/compiler-phrase-audit` (falling back to
`BRANCH` when `HEAD` is absent), and `REVIEW_ID=153`.
It validates the audited source tree hashes against the checkout for the website,
compiler, threshold, and PsychoJS. The other two repositories are pinned in the
workflow and their commits are recorded in the report. Other deployment contexts
generate a disabled adapter and continue reading the normal shared audit.

This exercises real phrase-usage discovery, preview report delivery, compiler
validation, and study compilation. It does not exercise the shared Firestore
publisher, historical-removal audit, or missing-sheet audit. Those stages are not
fabricated in this usage-only report.

Keep the temporary threshold reference, submodule updates, and this test setup
until the user requests cleanup. Never merge the temporary test setup unchanged.
