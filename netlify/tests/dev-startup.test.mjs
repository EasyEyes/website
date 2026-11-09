import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("plain start owns the gateway, while netlify dev starts only the compiler", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const toml = readFileSync("netlify.toml", "utf8");

  assert.equal(pkg.scripts.start, "node scripts/start-dev.mjs");
  assert.equal(pkg.scripts["start:compiler"], "cd docs/experiment && npm start");
  assert.match(toml, /\[dev\]\s*command = "npm run start:compiler"/);
});
