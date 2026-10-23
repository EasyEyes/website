# Security update: 2026-10-23

Node.js 24.22.1 is selected in `.nvmrc` and `engines.node`. This includes the October 21 security patches. Application source behavior is unchanged except for required build integration configuration.

Source: [Node.js October security releases](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).

## Verification and limitations

Compiler cache, modern function runtime, catalog audit and catalog report suites pass on Node 24. Function package suites pass except prolific, whose test script is a placeholder. No deployment was requested.

Native npm audit: 0 critical, 12 high, 0 moderate, 0 low findings. Counts represent affected dependency packages, not unique CVEs.

Remaining findings are deferred to a separate compatibility/reachability review by 2026-10-30. High findings are not claimed fixed or harmless. Many are inherited from braces/micromatch, test tooling, development servers, or discontinued packages; runtime exposure must be assessed before release.

| Package                       | Severity | Remediation status                   | Advisory                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | -------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@netlify/build`              | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@netlify/dev`                | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@netlify/functions-dev`      | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@netlify/functions-utils`    | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@netlify/git-utils`          | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@netlify/zip-it-and-ship-it` | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `braces`                      | high     | Requires declared-range/major change | [braces vulnerable to stack-exhaustion denial of service through deeply nested patterns](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)                                                                                                                                                                                                                                                                                                                |
| `fast-glob`                   | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `http-proxy-middleware`       | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `micromatch`                  | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `netlify-cli`                 | high     | Requires declared-range/major change | Inherited from vulnerable dependency                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `toml`                        | high     | Requires declared-range/major change | [toml-node: Quadratic-complexity DoS via many array-of-tables headers in toml.parse()](https://github.com/advisories/GHSA-4qx8-w7c3-pj3p); [toml-node: Quadratic-complexity DoS via long dotted keys or table paths in toml.parse()](https://github.com/advisories/GHSA-9j65-hcg3-gc64); [toml-node: Uncontrolled resource consumption (CPU DoS) via unbounded-length integer literals in toml.parse()](https://github.com/advisories/GHSA-9qmh-m7c6-f92p) |

## Verification scenario

Use the pinned Node version. Install from the authoritative lockfile with dependency scripts disabled first, review native/postinstall scripts, and run only those required by the package. Run the documented test/build commands. Repeat the native audit before release. In a preview, exercise the package's normal entry point and check browser/server errors. A successful build does not prove production integration.

## Website-to-participant regression scenario

1. Use Node 24.22.1 and npm 11.19.1. Clone recursively and verify that each parent gitlink matches its linked security PR. Install every independent function/package lockfile with `npm ci --ignore-scripts`; apply the reviewed PsychoJS Pixi patches with `patch-package`. Native bindings may require separately reviewed setup.
2. Run website `test:compiler-cache`, `test:functions-runtime`, `test:catalog-audit`, and `test:catalog-report`. Run each function package's real test suite; prolific has no real tests. These tests use mocks for external services and do not establish live authentication/provider compatibility.
3. Run authoring `npm test -- --runInBand`, `npm run build` with test Firebase metadata and a local DEPLOY_ID, `node --test server/writeAllFilePaths.test.cjs`, and `npm run test:e2e -- --grep 'warnings|warning'`. The browser check passed on Chromium at desktop and mobile sizes.
4. Run participant `npm test -- --runInBand`, `npm run build`, and PsychoJS `npm test -- --runInBand`. Check both upload manifests include every emitted JavaScript chunk and agree. The generator now excludes Node version files and development-only engine/tool sources. Known baseline failures remain documented in the child reports.
5. In a Deploy Preview, load the compiler, sign in with a test account, compile a known study CSV/source archive with its required fonts and resources, and confirm errors/warnings and generated condition files. Launch the participant preview, complete calibration, render text/image stimuli, play audio, complete trials, and inspect exported results. Check for asset 404s, console exceptions, and changed timing. Test login persistence, upload/download and denied API requests using test resources. This live-service scenario is **planned, not executed**; it requires preview deployment and test-account access.
6. Repeat a clean install/audit in CI for macOS and Linux. Verify native canvas/SWC/WASM tooling and the chosen Node runtime. Runtime settings changed in the repositories; deployed platform runtime and organization/dashboard overrides still need verification after merge.

## Separate repository boundaries

Ten other EasyEyes repositories and WebGazer4RC have independent branches. Node 22.23.4 is selected for legacy projects; website/build-chain and speaker-calibration use Node 24.22.1 because the new Firebase SDK requires it. Library engine ranges also allow the other patched supported majors. Local projects without an EasyEyes origin and the alternate website checkout were excluded. No branches were merged and no production deployment was started.

Bun is authoritative for remote-calibrator and WebGazer4RC: `bun.lockb` is committed; the parent's npm lockfile is ignored and untracked. Both now pin Bun 1.4.4, pass frozen installs, and have zero critical findings. WebGazer4RC has no remaining audit advisories. Parent calibration tests pass all 143 cases; production build passes. The Node-targeted test bundle now uses native Node APIs instead of the unnecessary browser polyfill plugin, fixing its Buffer resolution failure.

The cors-anywhere suite now passes all 113 tests on both Node 22.23.4 and Node 24.22.1, and ESLint passes. Its updated Nock fixture declares an explicit response status; obsolete Node-8 monkey patching is removed; assertions explicitly check http-proxy's forwarded-host header and supported Node parser rejection of malformed responses. No tests were disabled. Its public test certificate uses RSA-2048/SHA-256 while remaining deliberately expired, allowing Node 24 to test certificate rejection. The PR is ready for review.

GitHub rejected pushes to **remote-calibrator-phrases** and **sound-check** because both repositories are archived/read-only (HTTP 403). Their changes are committed locally on `chore/node-security-20261023`; no PR can be created until a maintainer unarchives them. Neither repository was unarchived automatically. High-severity deferrals across other packages are listed in their reports; this update does not eliminate every security finding.

## Independent function audits

| Function                    | Critical | High | Moderate |
| --------------------------- | -------- | ---- | -------- |
| prolific                    | 0        | 0    | 0        |
| email-verification          | 0        | 0    | 0        |
| phrases-audit               | 0        | 0    | 8        |
| translate-phrase-file       | 0        | 28   | 0        |
| phrases                     | 0        | 28   | 0        |
| glossary-audit              | 0        | 0    | 8        |
| phrases-audit-compiler      | 0        | 0    | 8        |
| studio-assistant            | 0        | 29   | 0        |
| glossary                    | 0        | 28   | 0        |
| glossary-audit-compiler     | 0        | 0    | 8        |
| compiler-deployment-webhook | 0        | 0    | 0        |
| box-api                     | 0        | 5    | 3        |

The remote-calibrator commit hook formats the entire repository and stages generated `lib/` output. It was stopped, unrelated changes were restored, and the scoped commit used the already completed 143-test suite and production build instead of that hook. No generated library output is committed.

## Pull requests

| Repository          | Pull request                                                    |
| ------------------- | --------------------------------------------------------------- |
| psychojs            | [19](https://github.com/EasyEyes/psychojs/pull/19)              |
| threshold           | [153](https://github.com/EasyEyes/threshold/pull/153)           |
| experiment          | [256](https://github.com/EasyEyes/threshold-scientist/pull/256) |
| WebGazer4RC         | [11](https://github.com/EasyEyes/WebGazer4RC/pull/11)           |
| ConnectAPeer        | [3](https://github.com/EasyEyes/ConnectAPeer/pull/3)            |
| virtual-keypad      | [8](https://github.com/EasyEyes/virtual-keypad/pull/8)          |
| cors-anywhere       | [2](https://github.com/EasyEyes/cors-anywhere/pull/2)           |
| TestListenerPage    | [4](https://github.com/EasyEyes/TestListenerPage/pull/4)        |
| nodejs-server       | [4](https://github.com/EasyEyes/nodejs-server/pull/4)           |
| speaker-calibration | [64](https://github.com/EasyEyes/speaker-calibration/pull/64)   |
| compatibility-check | [3](https://github.com/EasyEyes/compatibility-check/pull/3)     |
| remote-calibrator   | [168](https://github.com/EasyEyes/remote-calibrator/pull/168)   |

Archived repositories with local commits only:

- `remote-calibrator-phrases`: `fd9888fd98e8ea252ec1b4334941071669634916` on `chore/node-security-20261023`; GitHub archived/read-only.
- `sound-check`: `1a6c0e4414bc4bca300cb91447e0d7cb11357f9a` on `chore/node-security-20261023`; GitHub archived/read-only.
