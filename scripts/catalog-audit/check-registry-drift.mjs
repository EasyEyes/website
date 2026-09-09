#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { compareRegistryInventory } from "./index.mjs";

const registry = JSON.parse(
  readFileSync(new URL("./repositories.json", import.meta.url)),
);
const response = execFileSync(
  "gh",
  ["api", "--paginate", "orgs/EasyEyes/repos?per_page=100&type=all"],
  { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
);
const repositories = JSON.parse(response).map((repository) => ({
  name: repository.name,
  defaultBranch: repository.default_branch,
}));
const drift = compareRegistryInventory(registry, repositories);

process.stdout.write(`${JSON.stringify(drift, null, 2)}\n`);
if (
  drift.unaccounted.length ||
  drift.removed.length ||
  drift.defaultBranchChanges.length
)
  process.exitCode = 1;
