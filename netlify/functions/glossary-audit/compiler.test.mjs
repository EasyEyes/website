import test from "node:test";
import assert from "node:assert/strict";
import {
  compilerGlossaryAudit,
  createGlossaryCompilerHandler,
  latestCompletedGlossaryAudit,
} from "./compiler.mjs";

const report = {
  generatedAt: "2026-10-20",
  source: { version: "1" },
  repositories: { threshold: { commit: "a".repeat(40) } },
  counts: { total: 3, used: 1, obsoleteUsed: 1, unused: 1 },
  used: { font: { threshold: { "components/font.js": [1] } } },
  obsoleteUsed: { oldFont: { threshold: { "components/font.js": [2] } } },
  unused: { removedFont: { commentReferences: {} } },
};
const run = { id: "completed", status: "completed", report };
test("C1/C2 keeps unused separate and preserves referenced obsolete keys", () => {
  const result = compilerGlossaryAudit(run);
  assert.deepEqual(result.usedKeys, ["font", "oldFont"]);
  assert.deepEqual(result.unusedKeys, ["removedFont"]);
  assert.equal(result.glossaryVersion, "1");
});
test("C4 rejects partial or overlapping reports", () => {
  for (const value of [
    { status: "running", report },
    { ...run, report: {} },
    { ...run, report: { ...report, unused: { font: {} } } },
  ])
    assert.throws(() => compilerGlossaryAudit(value));
});
test("C3 scans beyond a full page of pending runs to retain completed results", async () => {
  const calls = [];
  const pages = [
    Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      data: () => ({ status: "running" }),
    })),
    [{ id: run.id, data: () => run }],
  ];
  const query = {
    orderBy() {
      return this;
    },
    limit() {
      return this;
    },
    startAfter(doc) {
      calls.push(doc.id);
      return this;
    },
    async get() {
      const docs = pages.shift();
      return { docs, size: docs.length };
    },
  };
  const found = await latestCompletedGlossaryAudit(query);
  assert.equal(found.id, run.id);
  assert.deepEqual(calls, ["19"]);
});
test("C4/C5 service failure is retryable and never exposes report credentials", async () => {
  let attempts = 0;
  const handler = createGlossaryCompilerHandler({
    latestCompleted: async () => {
      if (!attempts++) throw new Error("private detail");
      return run;
    },
  });
  const request = () => new Request("https://local/compiler");
  const first = await handler(request());
  assert.equal(first.status, 503);
  assert.doesNotMatch(await first.text(), /private detail/);
  const second = await handler(request());
  assert.equal(second.status, 200);
  assert.deepEqual((await second.json()).unusedKeys, ["removedFont"]);
  assert.equal(
    (await handler(new Request("https://local/compiler", { method: "POST" })))
      .status,
    405,
  );
});
