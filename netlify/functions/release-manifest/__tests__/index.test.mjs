import assert from "node:assert/strict";
import test from "node:test";

import { createReleaseManifestHandler, firebaseStorage } from "../index.mjs";

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
  const pins = new Map();
  let latest = null;
  let sequence = 0;
  return {
    releases,
    pins,
    async allocate(date) {
      return `${date}.${++sequence}`;
    },
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
    async list() {
      return [...releases.values()];
    },
    async setLatest(id) {
      latest = id;
    },
    async pin(username, experiment, value) {
      const key = `${username}/${experiment}`;
      const current = pins.get(key);
      if (
        current?.releaseId === value.releaseId &&
        current?.artifactRevision === value.artifactRevision
      )
        return { ok: true, value: current };
      pins.set(key, value);
      return { ok: true, value };
    },
    async getPin(username, experiment) {
      return pins.get(`${username}/${experiment}`) ?? null;
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

test("allocates date sequences for both engine and catalog releases", async () => {
  const storage = store();
  const handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
  });
  const payload = { ...manifest };
  delete payload.releaseId;
  const first = await handler(post(payload));
  const second = await handler(
    post({ ...payload, source: { catalogOnly: true } }),
  );
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  const date = new Date().toISOString().slice(0, 10);
  assert.equal((await first.json()).releaseId, `${date}.1`);
  assert.equal((await second.json()).releaseId, `${date}.2`);
  assert.equal(await storage.latest(), `${date}.2`);
});

test("atomically pins an existing release to an artifact revision", async () => {
  const storage = store();
  await storage.create(manifest.releaseId, manifest);
  const handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
    authorizePin: async (request, username) =>
      request.headers.get("authorization") === "Bearer gitlab-token" &&
      username === "alice",
  });
  const response = await handler(
    request("", {
      method: "PUT",
      headers: { authorization: "Bearer gitlab-token" },
      body: JSON.stringify({
        username: "alice",
        experiment: "study",
        releaseId: manifest.releaseId,
        artifactRevision: "revision-123",
      }),
    }),
  );

  assert.equal(response.status, 200);
  const pin = storage.pins.get("alice/study");
  assert.equal(pin.releaseId, manifest.releaseId);
  assert.equal(pin.artifactRevision, "revision-123");
  assert.match(pin.manifestDigest, /^sha256-/);

  const read = await handler(
    request("?username=alice&experiment=study", {
      headers: { authorization: "Bearer gitlab-token" },
    }),
  );
  assert.equal(read.status, 200);
  assert.deepEqual(await read.json(), pin);
});

test("authorizes experiment pins for only the matching GitLab user", async () => {
  const storage = store();
  await storage.create(manifest.releaseId, manifest);
  const handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
    authorizePin: async (request, username) =>
      request.headers.get("authorization") === "Bearer alice-token" &&
      username === "alice",
  });
  const body = JSON.stringify({
    username: "alice",
    experiment: "study",
    releaseId: manifest.releaseId,
    artifactRevision: "revision-123",
  });
  assert.equal(
    (await handler(request("", { method: "PUT", body }))).status,
    403,
  );
  assert.equal(
    (
      await handler(
        request("", {
          method: "PUT",
          headers: { authorization: "Bearer bob-token" },
          body,
        }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handler(
        request("", {
          method: "PUT",
          headers: { authorization: "Bearer alice-token" },
          body,
        }),
      )
    ).status,
    200,
  );
});

test("rejects malformed and nonexistent release pins", async () => {
  const storage = store();
  const handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
  });
  const put = (body) =>
    handler(
      request("", {
        method: "PUT",
        headers: { authorization: "Bearer secret" },
        body: JSON.stringify(body),
      }),
    );

  assert.equal(
    (
      await put({
        username: "bad/name",
        experiment: "study",
        releaseId: manifest.releaseId,
        artifactRevision: "revision",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await put({
        username: "alice",
        experiment: "study",
        releaseId: "2026-01-01",
        artifactRevision: "revision",
      })
    ).status,
    404,
  );
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
  const stale = { ...manifest };
  delete stale.releaseId;
  assert.equal((await handler(post(stale))).status, 409);
  storage.create = async () => "conflict";
  handler = createReleaseManifestHandler({
    storage,
    secret: "secret",
    verifyRelease: async () => ({ ok: true }),
  });
  const payload = { ...manifest };
  delete payload.releaseId;
  assert.equal((await handler(post(payload))).status, 409);
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
  const list = await handler(request("?list"));
  assert.deepEqual(await list.json(), [
    {
      release: manifest.releaseId,
      changelog: `Published ${manifest.publishedAt}`,
    },
  ]);
});

test("Firebase ETag allocation retries competing writers", async () => {
  const original = globalThis.fetch;
  let value = null;
  let revision = 0;
  let contested = false;
  globalThis.fetch = async (_url, options = {}) => {
    if (options.method === "PUT") {
      if (!contested) {
        contested = true;
        value = 1;
        revision++;
      }
      if (options.headers["if-match"] !== `etag-${revision}`)
        return new Response(null, { status: 412 });
      value = JSON.parse(options.body);
      revision++;
      return Response.json(value);
    }
    return new Response(JSON.stringify(value), {
      headers: { etag: `etag-${revision}` },
    });
  };
  try {
    const storage = firebaseStorage("https://example.firebaseio.com", "test");
    assert.equal(await storage.allocate("2026-09-15"), "2026-09-15.2");
    assert.equal(value, 2);
  } finally {
    globalThis.fetch = original;
  }
});

test("Firebase latest pointer cannot move to an older release", async () => {
  const original = globalThis.fetch;
  let value = "2026-09-15.10";
  globalThis.fetch = async (_url, options = {}) => {
    if (options.method === "PUT") {
      value = JSON.parse(options.body);
      return Response.json(value);
    }
    return new Response(JSON.stringify(value), { headers: { etag: "etag-1" } });
  };
  try {
    const storage = firebaseStorage("https://example.firebaseio.com", "test");
    await storage.setLatest("2026-09-15.9");
    assert.equal(value, "2026-09-15.10");
    await storage.setLatest("2026-09-15.11");
    assert.equal(value, "2026-09-15.11");
  } finally {
    globalThis.fetch = original;
  }
});
