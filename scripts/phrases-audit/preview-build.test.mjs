import test from "node:test";
import assert from "node:assert/strict";
import { selectPreviewAudit } from "./preview-build.mjs";

const report = {
  id: "preview-test",
  status: "completed",
  report: {
    generatedAt: "2026-10-15",
    phraseUsage: {
      used: { EE_example: [{ repository: "threshold" }] },
      repositories: {
        threshold: { roots: { components: "tree-sha" } },
      },
    },
  },
};
const environment = {
  CONTEXT: "deploy-preview",
  BRANCH: "feat/compiler-phrase-audit",
  REVIEW_ID: "153",
};
test("production and other previews never use the isolated audit", () => {
  for (const env of [
    { ...environment, CONTEXT: "production" },
    { ...environment, BRANCH: "main" },
    { ...environment, REVIEW_ID: "154" },
  ])
    assert.equal(
      selectPreviewAudit(env, report, () => "tree-sha"),
      null,
    );
});
test("matching preview sources enable the isolated audit", () => {
  assert.equal(
    selectPreviewAudit(environment, report, () => "tree-sha"),
    report,
  );
});
test("Netlify pull request checkout refs use the HEAD branch name", () => {
  assert.equal(
    selectPreviewAudit(
      { ...environment, BRANCH: "pull/153/head", HEAD: environment.BRANCH },
      report,
      () => "tree-sha",
    ),
    report,
  );
});
test("changed sources fail closed", () => {
  assert.throws(() => selectPreviewAudit(environment, report, () => "changed"));
});
test("absent report keeps the normal endpoint available", () => {
  assert.equal(
    selectPreviewAudit(environment, null, () => "tree-sha"),
    null,
  );
});
test("incomplete audit is rejected", () => {
  assert.throws(() =>
    selectPreviewAudit(
      environment,
      { ...report, status: "failed" },
      () => "tree-sha",
    ),
  );
});
