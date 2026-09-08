# Catalog usage audit

Run `npm run catalog-audit` from `website/` to scan the fixed commits currently
checked out for every included repository in `repositories.json`. The command
writes `catalog-usage-index.json`; pass `--output=path.json` to choose another
location.

The registry is reviewed source data. Repository discovery may report drift,
but must not edit it automatically. Missing definitions are blocking. Unused
candidates are review hints only and never authorize deletion. Unresolved
dynamic references remain visible warnings.

The report identity excludes `generatedAt`, so identical configuration and
repository commits have the same identity. Any missing repository, parse
failure, or incomplete registry entry makes the command fail without a report.
