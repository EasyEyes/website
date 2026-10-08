import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import test from "node:test";
import { createPhrasesAuditHandler } from "./handler.mjs";

const id = "123e4567-e89b-42d3-a456-426614174000";

function setup(dispatch = async () => {}) {
  const runs = new Map();
  const chunks = new Map();
  const store = {
    create: async (key, data) => runs.set(key, data),
    update: async (key, data) => runs.set(key, { ...runs.get(key), ...data }),
    get: async (key) => runs.get(key),
    saveChunks: async (key, value) => chunks.set(key, value),
  };
  const handler = createPhrasesAuditHandler({
    store,
    dispatch,
    phrasesSecret: "sheet-secret",
    reportSecret: "report-secret",
    newId: () => id,
    now: () => new Date("2026-10-03T12:00:00Z"),
  });
  return { handler, runs, chunks };
}

const request = (action, body, secret, header = "x-phrases-secret") =>
  new Request(
    `https://easyeyes.app/.netlify/functions/phrases-audit?action=${action}`,
    {
      method: "POST",
      headers: { [header]: secret },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );

test("the Sheet request is authenticated, queued, and dispatched", async () => {
  let dispatched;
  const { handler, runs } = setup(async (runId) => {
    dispatched = runId;
  });
  assert.equal(
    (await handler(request("start", undefined, "wrong"))).status,
    401,
  );
  assert.equal(runs.size, 0);
  const response = await handler(request("start", undefined, "sheet-secret"));
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { id, status: "queued" });
  assert.equal(dispatched, id);
  assert.equal(runs.get(id).status, "queued");
});

test("dispatch failure is recorded and reported to the Sheet", async () => {
  const { handler, runs } = setup(async () => {
    throw new Error("GitHub unavailable");
  });
  const originalError = console.error;
  console.error = () => {};
  try {
    const response = await handler(request("start", undefined, "sheet-secret"));
    assert.equal(response.status, 502);
    assert.equal(runs.get(id).status, "failed");
  } finally {
    console.error = originalError;
  }
});

test("a completed workflow stores a full compressed report in Firestore chunks", async () => {
  const { handler, runs, chunks } = setup();
  await handler(request("start", undefined, "sheet-secret"));
  const report = {
    generatedAt: "2026-10-03T12:05:00Z",
    phraseUsage: { source: { version: "63.21" } },
    history: {},
    missingFromSheet: {},
  };
  const reportGzipBase64 = gzipSync(JSON.stringify(report)).toString("base64");
  assert.equal(
    (
      await handler(
        request(
          "result",
          { id, status: "completed", reportGzipBase64 },
          "wrong",
          "authorization",
        ),
      )
    ).status,
    401,
  );
  const response = await handler(
    request(
      "result",
      { id, status: "completed", reportGzipBase64 },
      "Bearer report-secret",
      "authorization",
    ),
  );
  assert.equal(response.status, 200);
  assert.equal(runs.get(id).status, "completed");
  assert.equal(runs.get(id).phrasesVersion, "63.21");
  assert.equal(
    runs.get(id).reportSizeBytes,
    Buffer.byteLength(JSON.stringify(report)),
  );
  assert.equal(chunks.get(id).join(""), reportGzipBase64);
});

test("a failed workflow records its failure without a report", async () => {
  const { handler, runs, chunks } = setup();
  await handler(request("start", undefined, "sheet-secret"));
  const response = await handler(
    request(
      "result",
      { id, status: "failed", error: "CodeQL failed" },
      "Bearer report-secret",
      "authorization",
    ),
  );
  assert.equal(response.status, 200);
  assert.equal(runs.get(id).status, "failed");
  assert.equal(runs.get(id).error, "CodeQL failed");
  assert.equal(chunks.size, 0);
});
