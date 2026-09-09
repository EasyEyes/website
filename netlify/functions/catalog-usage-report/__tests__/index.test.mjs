import assert from "node:assert/strict";
import test from "node:test";

import { createCatalogUsageReportHandler } from "../index.mjs";

const report = {
  schemaVersion: 1,
  scanner: { version: "1.0.0", configurationDigest: "config" },
  repositories: [
    {
      name: "website",
      url: "https://github.com/EasyEyes/website",
      defaultBranch: "main",
      commitSha: "abc123",
      catalogKinds: ["phrases", "parameters"],
    },
  ],
  phrases: {
    referencedKeys: {},
    registeredDynamicKeys: {},
    uncertainReferences: [],
  },
  parameters: {
    referencedKeys: {},
    registeredDynamicKeys: {},
    uncertainReferences: [],
  },
};

function memoryStore() {
  const reports = new Map();
  let latest = null;
  return {
    reports,
    async create(id, value) {
      if (reports.has(id))
        return JSON.stringify(reports.get(id)) === JSON.stringify(value)
          ? "same"
          : "conflict";
      reports.set(id, value);
      return "created";
    },
    async get(id) {
      return reports.get(id) ?? null;
    },
    async getLatest() {
      return latest;
    },
    async setLatest(value) {
      latest = value;
    },
  };
}

const request = (path, init = {}) =>
  new Request(
    `https://easyeyes.app/.netlify/functions/catalog-usage-report${path}`,
    init,
  );

test("rejects unauthorized, malformed, and oversized publications", async () => {
  const handler = createCatalogUsageReportHandler({
    store: memoryStore(),
    secret: "secret",
  });
  assert.equal(
    (await handler(request("", { method: "POST", body: "{}" }))).status,
    403,
  );
  assert.equal(
    (
      await handler(
        request("", {
          method: "POST",
          headers: { authorization: "Bearer secret" },
          body: "{}",
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handler(
        request("", {
          method: "POST",
          headers: {
            authorization: "Bearer secret",
            "content-length": "2000000",
          },
          body: "{}",
        }),
      )
    ).status,
    413,
  );
});

test("publishes immutable content and updates latest metadata separately", async () => {
  const store = memoryStore();
  const handler = createCatalogUsageReportHandler({ store, secret: "secret" });
  const response = await handler(
    request("", {
      method: "POST",
      headers: {
        authorization: "Bearer secret",
        "content-type": "application/json",
      },
      body: JSON.stringify({ report, generatedAt: "2026-09-09T12:00:00.000Z" }),
    }),
  );
  assert.equal(response.status, 201);
  const published = await response.json();
  assert.ok(store.reports.has(published.reportId));
  assert.ok(
    !JSON.stringify(store.reports.get(published.reportId)).includes(
      "generatedAt",
    ),
  );

  const replay = await handler(
    request("", {
      method: "POST",
      headers: { authorization: "Bearer secret" },
      body: JSON.stringify({ report, generatedAt: "2026-09-10T12:00:00.000Z" }),
    }),
  );
  assert.equal(replay.status, 200);
});

test("rejects an immutable storage conflict without advancing latest", async () => {
  const store = memoryStore();
  store.create = async () => "conflict";
  const handler = createCatalogUsageReportHandler({ store, secret: "secret" });
  const response = await handler(
    request("", {
      method: "POST",
      headers: { authorization: "Bearer secret" },
      body: JSON.stringify({ report, generatedAt: "2026-09-09T12:00:00.000Z" }),
    }),
  );

  assert.equal(response.status, 409);
  assert.equal(await store.getLatest(), null);
});

test("does not describe a dangling latest pointer as a valid report", async () => {
  const store = memoryStore();
  await store.setLatest({
    reportId: "a".repeat(64),
    generatedAt: "2026-09-09T12:00:00.000Z",
  });
  const handler = createCatalogUsageReportHandler({ store, secret: "secret" });

  assert.equal((await handler(request("?latest"))).status, 503);
});

test("latest is current only when every repository SHA can be verified", async () => {
  const store = memoryStore();
  const publish = createCatalogUsageReportHandler({ store, secret: "secret" });
  await publish(
    request("", {
      method: "POST",
      headers: { authorization: "Bearer secret" },
      body: JSON.stringify({ report, generatedAt: "2026-09-09T12:00:00.000Z" }),
    }),
  );

  for (const [heads, expected] of [
    [{ website: "abc123" }, "current"],
    [{ website: "new456" }, "stale"],
    [null, "unknown"],
  ]) {
    const handler = createCatalogUsageReportHandler({
      store,
      secret: "secret",
      getCurrentHeads: async () => heads,
    });
    const response = await handler(request("?latest"));
    assert.equal((await response.json()).freshness.status, expected);
  }
});
