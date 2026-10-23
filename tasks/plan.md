# Node.js and dependency security update

Use Node.js 24.22.1 LTS, the patched October 21 release, across the website build chain. Preserve the website → authoring → threshold → PsychoJS Git links. Audit every independent npm lockfile, update compatible vulnerable packages first, and review required major upgrades individually. Do not run publication scripts during local verification.

1. Record baseline audits and runtime settings; use fresh remote branches.
2. Pin patched Node.js in package engines, local version files, and deployment configuration.
3. Remediate critical and high build/runtime/test dependencies, regenerate authoritative lockfiles with scripts disabled, then review required install scripts.
4. Run clean installs, existing suites, type checks and production builds; compare failures with baseline when needed.
5. Document a compiler-to-participant smoke scenario and remaining findings. Commit and push child repositories first, update parent Git links, and open linked PRs assigned to khahani.

Acceptance: no critical findings without a documented blocker; report high findings and test limitations explicitly. Verify actual Node version during tests. Never treat an audit count as proof of runtime exploitability.

Security source: https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
