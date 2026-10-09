import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import test from "node:test";
import {
  createGlossaryAuditHandler,
  validGlossaryReport,
  firestoreValueBytes,
} from "./handler.mjs";
import { reviewGlossaryRun, sourceUrl } from "./review.mjs";

const id = "123e4567-e89b-42d3-a456-426614174000";
const commit = "a".repeat(40);
const parent = "b".repeat(40);
const report = {
  generatedAt: "2026-10-10T00:00:00Z",
  source: { version: "35.6" },
  repositories: { threshold: { commit } },
  counts: { total: 3, obsoleteUsed: 1, unused: 1, used: 1 },
  obsoleteUsed: { old: { threshold: { "components/old.js": [4] } } },
  unused: {
    missing: {
      commentReferences: {},
      removalEvidence: {
        threshold: [
          {
            commit,
            previousCommit: parent,
            path: "components/deleted.js",
            removedAt: "2026-01-01",
            previousReferences: [{ line: [8, 9] }],
          },
        ],
      },
    },
  },
  used: { font: { threshold: { "components/fonts.js": [10, 20] } } },
};
function setup(dispatch = async () => {}) {
  const runs = new Map();
  const store = {
    createQueued: async (key, requestedAt) => {
      const active = [...runs.entries()].find(
        ([, run]) => run.status === "queued",
      );
      if (active) return { id: active[0], status: active[1].status };
      runs.set(key, { status: "queued", requestedAt });
      return null;
    },
    update: async (key, data) => runs.set(key, { ...runs.get(key), ...data }),
    get: async (key) => runs.get(key),
    listRecent: async () =>
      [...runs.entries()].map(([key, value]) => ({ id: key, ...value })),
  };
  return {
    runs,
    handler: createGlossaryAuditHandler({
      store,
      dispatch,
      glossarySecret: "sheet-secret",
      reportSecret: "report-secret",
      newId: () => id,
    }),
  };
}
const request = (
  action,
  body,
  secret = "sheet-secret",
  header = "x-glossary-secret",
) =>
  new Request(
    `https://example.test/.netlify/functions/glossary-audit?action=${action}`,
    {
      method: "POST",
      headers: { [header]: secret },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );
const result = (value) => ({
  id,
  status: "completed",
  reportGzipBase64: gzipSync(JSON.stringify(value)).toString("base64"),
});

test("authenticates sheet requests and prevents duplicate dispatch", async () => {
  let dispatches = 0;
  const { handler, runs } = setup(async () => {
    dispatches += 1;
  });
  assert.equal(
    (await handler(request("start", undefined, "wrong"))).status,
    401,
  );
  assert.equal(runs.size, 0);
  assert.equal((await handler(request("start"))).status, 202);
  assert.equal((await handler(request("start"))).status, 409);
  assert.equal(dispatches, 1);
});

test("dispatch failure is saved and reported", async () => {
  const { handler, runs } = setup(async () => {
    throw new Error("dispatch unavailable");
  });
  assert.equal((await handler(request("start"))).status, 502);
  assert.equal(runs.get(id).status, "failed");
});

test("stores the readable report, and reviews exact source and removal links", async () => {
  const { handler, runs } = setup();
  await handler(request("start"));
  assert.equal(
    (await handler(request("result", result(report), "wrong", "authorization")))
      .status,
    401,
  );
  assert.equal(
    (
      await handler(
        request(
          "result",
          result(report),
          "Bearer report-secret",
          "authorization",
        ),
      )
    ).status,
    200,
  );
  assert.deepEqual(runs.get(id).report, report);
  assert.equal(runs.get(id).glossaryVersion, "35.6");
  const response = await handler(request("review", { operation: "get", id }));
  const view = await response.json();
  assert.match(
    view.findings.used[0].references[0].lines[0].url,
    new RegExp(`/blob/${commit}/components/fonts.js#L10$`),
  );
  assert.match(
    view.findings.unused[0].removals[0].lines[0].url,
    new RegExp(`/blob/${parent}/components/deleted.js#L8$`),
  );
  assert.equal(view.findings.obsoleteUsed[0].key, "old");
  assert.equal(
    (
      await handler(
        request(
          "result",
          result(report),
          "Bearer report-secret",
          "authorization",
        ),
      )
    ).status,
    409,
  );
});

test("rejects corrupt reports, overlapping keys, and oversized Firestore values", async () => {
  const { handler, runs } = setup();
  await handler(request("start"));
  const bad = structuredClone(report);
  bad.used.old = bad.obsoleteUsed.old;
  assert.equal(validGlossaryReport(bad), false);
  assert.equal(
    (
      await handler(
        request("result", result(bad), "Bearer report-secret", "authorization"),
      )
    ).status,
    400,
  );
  const large = { ...report, padding: "x".repeat(800_000) };
  assert.ok(firestoreValueBytes(large) > 800_000);
  assert.equal(
    (
      await handler(
        request(
          "result",
          result(large),
          "Bearer report-secret",
          "authorization",
        ),
      )
    ).status,
    413,
  );
  assert.equal(runs.get(id).status, "failed");
});

test("reviews queued/failed runs and rejects unsafe links", async () => {
  assert.equal(reviewGlossaryRun({ id, status: "queued" }).findings, null);
  assert.equal(sourceUrl("threshold", commit, "../secret", 1), null);
  assert.equal(sourceUrl("unknown", commit, "a.js", 1), null);
  const { handler } = setup();
  assert.equal(
    (await handler(request("review", { operation: "get", id: "invalid" })))
      .status,
    400,
  );
  assert.equal(
    (await handler(request("review", { operation: "list" }, "wrong"))).status,
    401,
  );
});
