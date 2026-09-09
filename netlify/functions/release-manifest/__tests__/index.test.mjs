import assert from "node:assert/strict";
import test from "node:test";

import { createReleaseManifestHandler } from "../index.mjs";

const manifest = {
  schemaVersion: 1,
  releaseId: "2026-09-09.1",
  contractVersion: 1,
  engine: {
    package: "@easyeyes/threshold-engine",
    version: "1.0.0",
    integrity: "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  },
  phrases: {
    version: "3.2",
    digest: "sha256-BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=",
  },
  glossary: {
    version: "31.2",
    digest: "sha256-CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=",
  },
  catalogUsageReportId: "report-id",
  publishedAt: "2026-09-09T12:00:00.000Z",
};

function store() {
  const releases = new Map();
  let latest = null;
  return {
    releases,
    async create(id, value) {
      if (releases.has(id))
        return JSON.stringify(releases.get(id)) === JSON.stringify(value)
          ? "same"
          : "conflict";
      releases.set(id, value);
      return "created";
    },
    async get(id) {
      return releases.get(id) ?? null;
    },
    async latest() {
      return latest;
    },
    async setLatest(id) {
      latest = id;
    },
  };
}
const request = (path, init = {}) =>
  new Request(`https://easyeyes.app/release-manifest${path}`, init);
const post = (value = manifest) =>
  request("", {
    method: "POST",
    headers: { authorization: "Bearer secret" },
    body: JSON.stringify(value),
  });

test("publishes a verified immutable manifest and latest pointer", async () => {
  const storage = store();
  const handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
  });
  assert.equal((await handler(post())).status, 201);
  assert.equal(await storage.latest(), manifest.releaseId);
  assert.deepEqual(await storage.get(manifest.releaseId), manifest);
  assert.equal((await handler(post())).status, 200);
});

test("rejects unauthorized, invalid, stale, and conflicting publication", async () => {
  const storage = store();
  let handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
  });
  assert.equal(
    (
      await handler(
        request("", { method: "POST", body: JSON.stringify(manifest) }),
      )
    ).status,
    403,
  );
  assert.equal(
    (await handler(post({ ...manifest, releaseId: "latest" }))).status,
    400,
  );
  handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: false, code: "CATALOG_AUDIT_STALE" }),
  });
  assert.equal((await handler(post())).status, 409);
  storage.create = async () => "conflict";
  handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
  });
  assert.equal((await handler(post())).status, 409);
});

test("serves immutable releases and an uncached latest pointer", async () => {
  const storage = store();
  await storage.create(manifest.releaseId, manifest);
  await storage.setLatest(manifest.releaseId);
  const handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
  });
  const exact = await handler(request(`?release=${manifest.releaseId}`));
  assert.match(exact.headers.get("cache-control"), /immutable/);
  const latest = await handler(request("?latest"));
  assert.equal(latest.headers.get("cache-control"), "no-store");
  assert.equal((await latest.json()).releaseId, manifest.releaseId);
});
