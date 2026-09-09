import { createHash, timingSafeEqual } from "node:crypto";
import { validateReleaseManifest } from "../../../scripts/catalog-audit/contracts-v1.mjs";

const respond = (body, status = 200, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": cache },
  });
const auth = (request, secret) => {
  const given = Buffer.from(
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "",
  );
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
};
const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonical(value[key])]),
  );
};
const manifestDigest = (manifest) =>
  `sha256-${createHash("sha256")
    .update(JSON.stringify(canonical(manifest)))
    .digest("base64")}`;
const safeSegment = /^[A-Za-z0-9_-]{1,128}$/;

export function createReleaseManifestHandler({
  storage,
  secret,
  verifyRelease,
  authorizePin = async () => false,
}) {
  return async (request) => {
    const url = new URL(request.url);
    if (request.method === "POST") {
      if (!auth(request, secret)) return respond({ code: "UNAUTHORIZED" }, 403);
      let manifest;
      try {
        manifest = await request.json();
      } catch {
        return respond({ code: "RELEASE_MANIFEST_INVALID" }, 400);
      }
      if (!validateReleaseManifest(manifest))
        return respond({ code: "RELEASE_MANIFEST_INVALID" }, 400);
      const verification = await verifyRelease(manifest);
      if (!verification.ok)
        return respond(
          { code: verification.code ?? "RELEASE_COMPONENT_MISMATCH" },
          409,
        );
      const result = await storage.create(manifest.releaseId, manifest);
      if (result === "conflict")
        return respond({ code: "IMMUTABLE_RELEASE_CONFLICT" }, 409);
      await storage.setLatest(manifest.releaseId);
      return respond(
        { releaseId: manifest.releaseId },
        result === "created" ? 201 : 200,
      );
    }
    if (request.method === "PUT") {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return respond({ code: "RELEASE_PIN_MISMATCH" }, 400);
      }
      if (
        !safeSegment.test(payload?.username ?? "") ||
        !safeSegment.test(payload?.experiment ?? "") ||
        !safeSegment.test(payload?.artifactRevision ?? "") ||
        typeof payload?.releaseId !== "string"
      )
        return respond({ code: "RELEASE_PIN_MISMATCH" }, 400);
      if (
        !auth(request, secret) &&
        !(await authorizePin(request, payload.username))
      )
        return respond({ code: "UNAUTHORIZED" }, 403);
      const manifest = await storage.get(payload.releaseId);
      if (!manifest) return respond({ code: "RELEASE_NOT_FOUND" }, 404);
      const pin = {
        releaseId: payload.releaseId,
        manifestDigest: manifestDigest(manifest),
        artifactRevision: payload.artifactRevision,
        pinnedAt: new Date().toISOString(),
      };
      const result = await storage.pin(
        payload.username,
        payload.experiment,
        pin,
      );
      if (
        !result.ok ||
        result.value?.releaseId !== pin.releaseId ||
        result.value?.manifestDigest !== pin.manifestDigest ||
        result.value?.artifactRevision !== pin.artifactRevision
      )
        return respond({ code: "RELEASE_PIN_MISMATCH" }, 409);
      return respond(result.value);
    }
    if (request.method !== "GET")
      return respond({ code: "METHOD_NOT_ALLOWED" }, 405);
    const username = url.searchParams.get("username");
    const experiment = url.searchParams.get("experiment");
    if (username !== null || experiment !== null) {
      if (
        !safeSegment.test(username ?? "") ||
        !safeSegment.test(experiment ?? "")
      )
        return respond({ code: "RELEASE_PIN_MISMATCH" }, 400);
      if (!auth(request, secret) && !(await authorizePin(request, username)))
        return respond({ code: "UNAUTHORIZED" }, 403);
      const pin = await storage.getPin(username, experiment);
      return pin
        ? respond(pin)
        : respond({ code: "RELEASE_PIN_NOT_FOUND" }, 404);
    }
    if (url.searchParams.has("latest")) {
      const releaseId = await storage.latest();
      if (!releaseId) return respond({ code: "RELEASE_NOT_FOUND" }, 404);
      const manifest = await storage.get(releaseId);
      return manifest
        ? respond(manifest, 200)
        : respond({ code: "RELEASE_INCOMPLETE" }, 503);
    }
    const releaseId = url.searchParams.get("release");
    if (!releaseId) return respond({ code: "RELEASE_MANIFEST_INVALID" }, 400);
    const manifest = await storage.get(releaseId);
    return manifest
      ? respond(manifest, 200, "public, max-age=31536000, immutable")
      : respond({ code: "RELEASE_NOT_FOUND" }, 404);
  };
}

const encode = (value) => value.replace(/\./g, "_dot_");
function firebaseStorage(root, credential) {
  const endpoint = (path) =>
    `${root}/${path}.json?auth=${encodeURIComponent(credential)}`;
  const read = async (path, etag = false) => {
    const response = await fetch(endpoint(path), {
      headers: etag ? { "X-Firebase-ETag": "true" } : {},
    });
    if (!response.ok)
      throw new Error(`Firebase read failed: ${response.status}`);
    return response;
  };
  return {
    async create(id, value) {
      const path = `easyEyesReleases/${encode(id)}`;
      const response = await read(path, true);
      const current = await response.json();
      if (current !== null)
        return JSON.stringify(current) === JSON.stringify(value)
          ? "same"
          : "conflict";
      const write = await fetch(endpoint(path), {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "if-match": response.headers.get("etag") ?? "null_etag",
        },
        body: JSON.stringify(value),
      });
      return write.ok
        ? "created"
        : write.status === 412
        ? "conflict"
        : Promise.reject(new Error(`Firebase write failed: ${write.status}`));
    },
    async get(id) {
      return read(`easyEyesReleases/${encode(id)}`).then((response) =>
        response.json(),
      );
    },
    async latest() {
      return read("easyEyesReleaseLatest").then((response) => response.json());
    },
    async setLatest(id) {
      const response = await fetch(endpoint("easyEyesReleaseLatest"), {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(id),
      });
      if (!response.ok)
        throw new Error(`Firebase latest write failed: ${response.status}`);
    },
    async pin(username, experiment, value) {
      const path = `users/${username}/${experiment}/releasePin`;
      const currentResponse = await read(path, true);
      const previous = await currentResponse.json();
      if (
        previous?.releaseId === value.releaseId &&
        previous?.artifactRevision === value.artifactRevision
      )
        return { ok: true, value: previous };
      const response = await fetch(endpoint(path), {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "if-match": currentResponse.headers.get("etag") ?? "null_etag",
        },
        body: JSON.stringify(value),
      });
      if (!response.ok) return { ok: false, value: previous };
      const stored = await response.json().catch(() => value);
      return { ok: true, value: stored };
    },
    async getPin(username, experiment) {
      return read(`users/${username}/${experiment}/releasePin`).then(
        (response) => response.json(),
      );
    },
  };
}

async function authorizePin(request, username) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+/i.test(authorization)) return false;
  try {
    const response = await fetch("https://gitlab.pavlovia.org/api/v4/user", {
      headers: { authorization },
      cache: "no-store",
    });
    if (!response.ok) return false;
    return (await response.json())?.username === username;
  } catch {
    return false;
  }
}

const canonicalDigest = (value) =>
  `sha256-${createHash("sha256")
    .update(JSON.stringify(value))
    .digest("base64")}`;
async function verifyRelease(manifest) {
  const reportResponse = await fetch(
    `${
      process.env.CATALOG_USAGE_REPORT_URL ??
      "https://easyeyes.app/.netlify/functions/catalog-usage-report"
    }?latest`,
    { cache: "no-store" },
  );
  if (!reportResponse.ok) return { ok: false, code: "CATALOG_AUDIT_FAILED" };
  const report = await reportResponse.json();
  if (
    report.publication?.reportId !== manifest.catalogUsageReportId ||
    report.freshness?.status !== "current"
  )
    return { ok: false, code: "CATALOG_AUDIT_STALE" };
  for (const [name, component, url] of [
    [
      "phrases",
      manifest.phrases,
      `https://easyeyes.app/.netlify/functions/phrases?v=${encodeURIComponent(
        manifest.phrases.version,
      )}`,
    ],
    [
      "glossary",
      manifest.glossary,
      `https://easyeyes.app/.netlify/functions/glossary?v=${encodeURIComponent(
        manifest.glossary.version,
      )}`,
    ],
  ]) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return { ok: false, code: "RELEASE_COMPONENT_MISMATCH" };
    const value = await response.json();
    if (canonicalDigest(value) !== component.digest)
      return { ok: false, code: "RELEASE_COMPONENT_MISMATCH", component: name };
  }
  const engineUrl = `https://cdn.jsdelivr.net/npm/${manifest.engine.package}@${manifest.engine.version}/dist/index.js`;
  const engineResponse = await fetch(engineUrl, { cache: "no-store" });
  if (!engineResponse.ok)
    return { ok: false, code: "RELEASE_COMPONENT_MISMATCH" };
  const engineDigest = `sha256-${createHash("sha256")
    .update(Buffer.from(await engineResponse.arrayBuffer()))
    .digest("base64")}`;
  if (engineDigest !== manifest.engine.integrity)
    return {
      ok: false,
      code: "RELEASE_COMPONENT_MISMATCH",
      component: "engine",
    };
  return { ok: true };
}

export default async function handler(request) {
  const root = process.env.FIREBASE_DATABASE_URL?.replace(/\/+$/, "");
  const credential = process.env.FIREBASE_DB;
  const secret = process.env.RELEASE_MANIFEST_SECRET;
  if (!root || !credential || !secret)
    return respond({ code: "SERVICE_NOT_CONFIGURED" }, 500);
  return createReleaseManifestHandler({
    storage: firebaseStorage(root, credential),
    secret,
    verifyRelease,
    authorizePin,
  })(request);
}
