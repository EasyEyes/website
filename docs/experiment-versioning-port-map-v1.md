# Experiment versioning prototype port map V1

This record reconciles the prototype with catalog governance before production
code is ported. The source tips are Threshold Scientist
`230854291de7870c03fd458049f8646cbe13a503` and Threshold
`d602eb9048353620acf58d973633c03a4d2c7b61`. The target tips reviewed were
`d399b713d5a690eaa96c4637348e86247d9a6853` and
`8aa059bc1029102669a2cd3d62a864342340ce12` respectively.

| Prototype slice                                                | Decision | Resolution                                                                                                                    |
| -------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `17afcc0`, `7cb9976b`, `3a3816cc` engine boundary and loader   | Port     | Reapply behind the frozen contract; retain current compiler fixes and prove parity with golden studies.                       |
| `b4ef6d8` manifest client and contract guard                   | Replace  | Use the unified manifest schema, digest verification, one fetch per compile, and structured diagnostics.                      |
| `61aa524` project `ReleasePin.txt`                             | Replace  | The authoritative pin is the atomic RTDB `ExperimentReleasePin`; an artifact copy may be emitted only as verified provenance. |
| `5299c8b` release selector                                     | Port     | Keep the selector, but list only verified unified manifests.                                                                  |
| `6200964`, `91595a5`, `4f107fd`, `3d5e089` version-change flow | Port     | Preserve runtime-swap versus recompile behavior after the atomic activation API exists.                                       |
| `f40cf2f` data-mixing warning                                  | Port     | Require explicit confirmation when collected data exists.                                                                     |
| `162b070`, `7f072b79` provenance                               | Replace  | Stamp release id, manifest digest, contract, engine, Phrase, and Glossary versions.                                           |
| `375a108` manifest-selected catalogs                           | Port     | Carry a single resolved manifest through validation and generation; do not consult current pointers afterward.                |
| `67eab0f`, `407afb8f`, `2308542`, `d602eb9` release CI         | Replace  | Publish components only after catalog gates, then create an immutable unified manifest and update `latest` last.              |
| `1ea7dad`, `761a414c` Netlify exclusion                        | Port     | Keep the engine package out of the authoring-site bundle.                                                                     |
| `4ede73c`, `c4adb287` populated-files guard                    | Defer    | This unrelated compiler fix must land independently or be proven necessary by an engine slice.                                |

No prototype commit should be cherry-picked wholesale. The prototype manifest
shape (`engineVersion`, `glossaryVersion`, `phrasesVersion`, `gitSha`) conflicts
with the unified manifest and lacks component integrity, report identity, and
atomic activation data. Current explicit Phrase and Glossary pin APIs remain
legacy-only and must not be called by the new compile path.
