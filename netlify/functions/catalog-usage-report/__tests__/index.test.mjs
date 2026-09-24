import assert from "node:assert/strict";
import test from "node:test";

import handler, { createCatalogUsageReportHandler } from "../index.mjs";

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

test("replays a report after Firebase drops empty containers", async (t) => {
  const roundTripReport = structuredClone(report);
  roundTripReport.phrases.referencedKeys.exactKey = [];
  const previousFetch = globalThis.fetch;
  const previousEnvironment = {
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_DB: process.env.FIREBASE_DB,
    CATALOG_USAGE_REPORT_SECRET: process.env.CATALOG_USAGE_REPORT_SECRET,
  };
  t.after(() => {
    globalThis.fetch = previousFetch;
    for (const [name, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  process.env.FIREBASE_DATABASE_URL = "https://firebase.test";
  process.env.FIREBASE_DB = "credential";
  process.env.CATALOG_USAGE_REPORT_SECRET = "secret";

  const records = new Map();
  globalThis.fetch = async (url, init = {}) => {
    const key = new URL(url).pathname.replace(/^\/+|\.json$/g, "");
    if ((init.method ?? "GET") === "PUT") {
      records.set(key, firebaseRoundTrip(JSON.parse(init.body)));
      return new Response(null, { status: 200 });
    }
    return Response.json(records.get(key) ?? null, {
      headers: { etag: '"test-etag"' },
    });
  };

  const publish = (generatedAt) =>
    handler(
      request("", {
        method: "POST",
        headers: { authorization: "Bearer secret" },
        body: JSON.stringify({ report: roundTripReport, generatedAt }),
      }),
    );

  const first = await publish("2026-09-09T12:00:00.000Z");
  assert.equal(first.status, 201);
  const { reportId } = await first.json();
  assert.equal(typeof records.get(`catalogUsageReports/${reportId}`), "string");

  records.set(
    `catalogUsageReports/${reportId}`,
    firebaseRoundTrip(roundTripReport),
  );
  assert.equal((await publish("2026-09-10T12:00:00.000Z")).status, 200);

  const stored = await handler(request(`?id=${reportId}`));
  assert.equal(stored.status, 200);
  const storedReport = await stored.json();
  assert.deepEqual(storedReport.phrases, report.phrases);
  assert.deepEqual(storedReport.parameters, report.parameters);
  assert.equal(storedReport.repositories[0].name, "website");

  const latestBeforeConflict = records.get("catalogUsageReportsLatest");
  const conflictingReport = structuredClone(roundTripReport);
  conflictingReport.repositories[0].commitSha = "different";
  records.set(
    `catalogUsageReports/${reportId}`,
    firebaseRoundTrip(conflictingReport),
  );
  assert.equal((await publish("2026-09-11T12:00:00.000Z")).status, 409);
  assert.deepEqual(
    records.get("catalogUsageReportsLatest"),
    latestBeforeConflict,
  );
});

function firebaseRoundTrip(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    return value.map(firebaseRoundTrip);
  }
  const entries = Object.entries(value)
    .map(([key, child]) => [key, firebaseRoundTrip(child)])
    .filter(([, child]) => child !== undefined);
  return entries.length === 0 ? undefined : Object.fromEntries(entries);
}

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
