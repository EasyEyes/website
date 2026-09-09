# Catalog and EasyEyes release operations

The immutable release manifest is the source of truth for new experiments.
It binds one engine package and exact Phrase and Glossary versions to a
content digest. Separate catalog pins are supported only for legacy studies.

## Release procedure

1. Run the catalog audit at fixed repository SHAs and publish its immutable
   report. Confirm that freshness is `current` and no required definition is
   missing.
2. Publish immutable engine, Phrase, and Glossary artifacts. Record their
   versions and SHA-256 digests in a schema-version 1 release manifest.
3. Validate locally with
   `npm run release:publish -- --dry-run path/to/manifest.json`.
4. Publish with `RELEASE_MANIFEST_SECRET` set and rerun the same command
   without `--dry-run`. Publication verifies every component and advances
   `latest` only after the immutable manifest is stored.
5. Compile representative new, legacy, and multilingual studies. Confirm the
   generated `.easyeyes/release.json`, RTDB `releasePin`, uploaded GitLab
   revision, participant entry point, and result columns all name the same
   release.

## Authentication and input boundaries

Manifest publication uses a server-only shared secret. Experiment pin writes
and reads accept the scientist's Pavlovia GitLab bearer token only when the
authenticated GitLab username matches the requested RTDB user path. Identifiers
are restricted to short safe path segments. Manifests and reports have schema
and size validation; dialogs escape untrusted catalog text and never write to
Sheets.

Do not place secrets in manifests, reports, compiled repositories, CI
artifacts, browser logs, or result files. Rotate a leaked publication secret
before retrying a release.

## Failure and rollback

Compilation and upload failures do not write a pin. A pin is written with an
RTDB compare-and-set only after GitLab returns the artifact commit revision;
the client then checks the returned release, digest, and revision. Identical
retries preserve the original `pinnedAt` value. A mismatch is a failed
activation and the previous runnable pin remains authoritative.

Rollback never deletes or rewrites an immutable manifest. Recompile or perform
an approved runtime-compatible change to a previous release, verify the new
artifact revision and pin, and only then reactivate the study. The mutable
`latest` pointer may be moved for future compilations after the same release
checks; existing pins are unchanged.

## Required rollout evidence

Before deployment, attach CI output, a non-production endpoint round trip, the
Phrase and Glossary test-Sheet screenshots, representative result CSV headers,
and the rollback rehearsal record to the pull request. Maintainer approval is
required before changing production pointers. The 12 repositories outside the
website/submodule and remote-calibrator priority scope remain a documented
registry follow-up and are not deletion evidence.
