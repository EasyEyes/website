import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import test from "node:test";
import { createPhrasesAuditHandler } from "./handler.mjs";

const id = "123e4567-e89b-42d3-a456-426614174000";

function setup(dispatch = async () => {}) {
  const runs = new Map();
  let historyState = null;
  const store = {
    create: async (key, data) => runs.set(key, data),
    update: async (key, data) => runs.set(key, { ...runs.get(key), ...data }),
    get: async (key) => runs.get(key),
    listRecent: async (limit) =>
      [...runs.entries()]
        .map(([key, value]) => ({
          id: key,
          status: value.status,
          requestedAt: value.requestedAt,
        }))
        .slice(0, limit),
    getHistoryState: async () => historyState,
    saveHistoryState: async (state, baseRevision) => {
      if ((historyState?.revision ?? null) !== baseRevision) return null;
      historyState = { ...state, revision: "new-revision" };
      return historyState.revision;
    },
  };
  const handler = createPhrasesAuditHandler({
    store,
    dispatch,
    phrasesSecret: "sheet-secret",
    reportSecret: "report-secret",
    newId: () => id,
    now: () => new Date("2026-10-03T12:00:00Z"),
  });
  return { handler, runs, getHistoryState: () => historyState };
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

test("a completed workflow stores a readable report on its run document", async () => {
  const { handler, runs } = setup();
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
  assert.deepEqual(runs.get(id).report, report);
  assert.equal("chunkCount" in runs.get(id), false);
});

test("a failed workflow records its failure without a report", async () => {
  const { handler, runs } = setup();
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
  assert.equal("report" in runs.get(id), false);
});

test("an oversized readable report marks the run failed without storing a report", async () => {
  const { handler, runs } = setup();
  await handler(request("start", undefined, "sheet-secret"));
  const report = {
    generatedAt: "2026-10-03T12:05:00Z",
    phraseUsage: { source: { version: "63.21" }, text: "x".repeat(800_000) },
    history: {},
    missingFromSheet: {},
  };
  const response = await handler(
    request(
      "result",
      {
        id,
        status: "completed",
        reportGzipBase64: gzipSync(JSON.stringify(report)).toString("base64"),
      },
      "Bearer report-secret",
      "authorization",
    ),
  );
  assert.equal(response.status, 413);
  assert.equal(runs.get(id).status, "failed");
  assert.match(runs.get(id).error, /document limit/);
  assert.equal("report" in runs.get(id), false);
});

test("history checkpoint reads and writes require the report secret", async () => {
  const { handler, getHistoryState } = setup();
  const read = (secret) =>
    request("history-state", { operation: "read" }, secret, "authorization");
  assert.equal((await handler(read("Bearer wrong"))).status, 401);
  assert.deepEqual(await (await handler(read("Bearer report-secret"))).json(), {
    state: null,
  });
  const state = {
    schemaVersion: 1,
    logicVersion: 1,
    checkedKeys: ["EE_old"],
    report: { repositories: { website: { head: "a".repeat(40) } }, keys: {} },
  };
  const write = (baseRevision) =>
    request(
      "history-state",
      { operation: "write", state, baseRevision },
      "Bearer report-secret",
      "authorization",
    );
  assert.deepEqual(await (await handler(write(null))).json(), {
    revision: "new-revision",
  });
  assert.deepEqual(getHistoryState().checkedKeys, ["EE_old"]);
  assert.equal((await handler(write(null))).status, 409);
  assert.equal((await handler(write("new-revision"))).status, 200);
});

test("the Sheet can list runs and read a report without the publication secret", async () => {
  const { handler, runs } = setup();
  runs.set(id, {
    status: "completed",
    requestedAt: "2026-10-03T12:00:00Z",
    report: {
      generatedAt: "2026-10-03T12:05:00Z",
      phraseUsage: {
        repositories: {},
        unused: [],
        used: {},
        counts: { used: 0 },
      },
      history: { keys: {} },
      missingFromSheet: { missing: {} },
    },
  });
  const review = (body, secret) => request("review", body, secret);
  assert.equal(
    (await handler(review({ operation: "list" }, "wrong"))).status,
    401,
  );
  const list = await handler(review({ operation: "list" }, "sheet-secret"));
  assert.deepEqual(await list.json(), {
    runs: [{ id, status: "completed", requestedAt: "2026-10-03T12:00:00Z" }],
  });
  const detail = await handler(
    review({ operation: "get", id }, "sheet-secret"),
  );
  assert.equal(detail.status, 200);
  assert.deepEqual((await detail.json()).findings.missing, []);
  assert.equal(
    (await handler(review({ operation: "get", id: "bad" }, "sheet-secret")))
      .status,
    400,
  );
});
