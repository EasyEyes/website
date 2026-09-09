# Catalog usage audit

The initial enforcement scope covers the repositories marked `included` in
`repositories.json`. A `deferred` repository is accounted for but has not been
classified as a consumer or non-consumer. Deferred repositories are omitted
from scans, remain visible in review, and must not be described as safely
excluded. Registry drift reports newly discovered repositories without editing
the registry.

Run `npm run catalog-audit` from `website/` to scan the fixed commits currently
checked out for every included repository in `repositories.json`. The command
writes `catalog-usage-index.json`; pass `--output=path.json` to choose another
location.

Scheduled and manually dispatched CI runs publish the generated report through
the authenticated catalog usage report function. Pull-request runs only test,
scan, and upload a debugging artifact. Publication metadata supplies the
generation time separately, so it does not affect report identity.

The registry is reviewed source data. Repository discovery may report drift,
but must not edit it automatically. Missing definitions are blocking. Unused
candidates are review hints only and never authorize deletion. Unresolved
dynamic references remain visible warnings.

The report identity excludes `generatedAt`, so identical configuration and
repository commits have the same identity. Any missing repository, parse
failure, or incomplete registry entry makes the command fail without a report.
