import test from "node:test";
import assert from "node:assert/strict";
import { compilerAudit } from "./compiler.mjs";

test("adapts existing report without treating missing sheet keys as used", () => {
  const run = {
    id: "run",
    status: "completed",
    report: {
      generatedAt: "2026-10-12",
      phraseUsage: { used: { EE_yes: [] }, unused: ["EE_old"] },
      missingFromSheet: { missing: { EE_absent: [] } },
      history: { keys: {} },
    },
  };
  assert.deepEqual(compilerAudit(run).usedKeys, ["EE_yes"]);
  assert.equal(compilerAudit(run).id, "run");
});

test("rejects incomplete reports", () => {
  assert.throws(() => compilerAudit({ status: "completed", report: {} }));
});
