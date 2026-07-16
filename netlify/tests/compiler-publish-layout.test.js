const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const assert = require("node:assert/strict");

test("production compiler artifacts are promoted to Netlify's published routes", () => {
  const compilerRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "compiler-publish-layout-"),
  );
  const dist = path.join(compilerRoot, "dist");
  fs.mkdirSync(dist);
  fs.writeFileSync(
    path.join(dist, "index.html"),
    '<script src="/compiler/dist/main.abc123.js"></script>',
  );
  fs.writeFileSync(
    path.join(dist, "deployment.json"),
    '{"deploymentId":"deploy-preview-77"}',
  );

  const result = spawnSync(
    process.execPath,
    [
      path.resolve(__dirname, "../../scripts/publish-compiler-build.mjs"),
      compilerRoot,
    ],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    fs.readFileSync(path.join(compilerRoot, "index.html"), "utf8"),
    '<script src="/compiler/dist/main.abc123.js"></script>',
  );
  assert.deepEqual(
    JSON.parse(
      fs.readFileSync(path.join(compilerRoot, "deployment.json"), "utf8"),
    ),
    { deploymentId: "deploy-preview-77" },
  );
});
