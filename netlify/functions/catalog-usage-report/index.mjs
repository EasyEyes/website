import { createHash, timingSafeEqual } from "node:crypto";

const MAXIMUM_BODY_BYTES = 1024 * 1024;
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

const stable = (value) => {
  if (Array.isArray(value))
    return value
      .map(stable)
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stable(value[key])]),
  );
};
const json = (value, status = 200, headers = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
const validCollection = (value) =>
  value &&
  typeof value === "object" &&
  value.referencedKeys &&
  value.registeredDynamicKeys &&
  Array.isArray(value.uncertainReferences);
const validReport = (value) =>
  value &&
  value.schemaVersion === 1 &&
  value.scanner?.version &&
  value.scanner?.configurationDigest &&
  Array.isArray(value.repositories) &&
  value.repositories.every(
    (repository) =>
      repository.name && repository.commitSha && repository.defaultBranch,
  ) &&
  validCollection(value.phrases) &&
  validCollection(value.parameters) &&
  !("generatedAt" in value);
const authorized = (request, secret) => {
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
};

export function createCatalogUsageReportHandler({
  store,
  secret,
  getCurrentHeads = async () => null,
}) {
  return async (request) => {
    const url = new URL(request.url);
    if (request.method === "POST") {
      if (!authorized(request, secret))
        return json({ code: "UNAUTHORIZED" }, 403);
      const declaredLength = Number(request.headers.get("content-length") ?? 0);
      if (declaredLength > MAXIMUM_BODY_BYTES)
        return json({ code: "PAYLOAD_TOO_LARGE" }, 413);
      const raw = await request.text();
      if (Buffer.byteLength(raw) > MAXIMUM_BODY_BYTES)
        return json({ code: "PAYLOAD_TOO_LARGE" }, 413);
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return json({ code: "INVALID_REPORT" }, 400);
      }
      if (
        !validReport(payload.report) ||
        typeof payload.generatedAt !== "string" ||
        Number.isNaN(Date.parse(payload.generatedAt))
      )
        return json({ code: "INVALID_REPORT" }, 400);
      const report = stable(payload.report);
      const reportId = createHash("sha256")
        .update(JSON.stringify(report))
        .digest("hex");
      const outcome = await store.create(reportId, report);
      if (outcome === "conflict")
        return json({ code: "IMMUTABLE_REPORT_CONFLICT" }, 409);
      await store.setLatest({ reportId, generatedAt: payload.generatedAt });
      return json({ reportId }, outcome === "created" ? 201 : 200);
    }
    if (request.method !== "GET")
      return json({ code: "METHOD_NOT_ALLOWED" }, 405);
    if (url.searchParams.has("latest")) {
      const pointer = await store.getLatest();
      if (!pointer)
        return json({ code: "REPORT_NOT_FOUND" }, 404, {
          "cache-control": "no-store",
        });
      const report = await store.get(pointer.reportId);
      if (!report)
        return json({ code: "REPORT_INCOMPLETE" }, 503, {
          "cache-control": "no-store",
        });
      let heads = null;
      try {
        heads = await getCurrentHeads(report.repositories);
      } catch {
        heads = null;
      }
      const mismatches = heads
        ? report.repositories
            .filter(
              (repository) => heads[repository.name] !== repository.commitSha,
            )
            .map((repository) => repository.name)
        : [];
      const status = !heads
        ? "unknown"
        : mismatches.length
        ? "stale"
        : "current";
      return json(
        { report, publication: pointer, freshness: { status, mismatches } },
        200,
        { "cache-control": "no-store" },
      );
    }
    const reportId = url.searchParams.get("id");
    if (!/^[a-f0-9]{64}$/.test(reportId ?? ""))
      return json({ code: "INVALID_REPORT_ID" }, 400);
    const report = await store.get(reportId);
    return report
      ? json(report, 200, {
          "cache-control": "public, max-age=31536000, immutable",
        })
      : json({ code: "REPORT_NOT_FOUND" }, 404);
  };
}

function firebaseStore(root, credential) {
  const url = (path) =>
    `${root}/${path}.json?auth=${encodeURIComponent(credential)}`;
  const get = async (path, headers = {}) => {
    const response = await fetch(url(path), { headers });
    if (!response.ok)
      throw new Error(`Firebase GET failed: ${response.status}`);
    return response;
  };
  return {
    async create(id, value) {
      const existing = await get(`catalogUsageReports/${id}`, {
        "X-Firebase-ETag": "true",
      });
      const current = await existing.json();
      if (current !== null)
        return JSON.stringify(current) === JSON.stringify(value)
          ? "same"
          : "conflict";
      const response = await fetch(url(`catalogUsageReports/${id}`), {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "if-match": existing.headers.get("etag") ?? "null_etag",
        },
        body: JSON.stringify(value),
      });
      return response.ok
        ? "created"
        : response.status === 412
        ? "conflict"
        : Promise.reject(new Error(`Firebase PUT failed: ${response.status}`));
    },
    async get(id) {
      return get(`catalogUsageReports/${id}`).then((response) =>
        response.json(),
      );
    },
    async getLatest() {
      return get("catalogUsageReportsLatest").then((response) =>
        response.json(),
      );
    },
    async setLatest(value) {
      const response = await fetch(url("catalogUsageReportsLatest"), {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(value),
      });
      if (!response.ok)
        throw new Error(`Firebase latest PUT failed: ${response.status}`);
    },
  };
}

async function githubHeads(repositories) {
  const entries = await Promise.all(
    repositories.map(async (repository) => {
      const response = await fetch(
        `https://api.github.com/repos/EasyEyes/${encodeURIComponent(
          repository.name,
        )}/commits/${encodeURIComponent(repository.defaultBranch)}`,
        {
          headers: {
            accept: "application/vnd.github+json",
            "user-agent": "easyeyes-catalog-audit",
          },
        },
      );
      if (!response.ok) throw new Error("GitHub freshness lookup failed");
      return [repository.name, (await response.json()).sha];
    }),
  );
  return Object.fromEntries(entries);
}

export default async function handler(request) {
  const root = process.env.FIREBASE_DATABASE_URL?.replace(/\/+$/, "");
  const credential = process.env.FIREBASE_DB;
  const secret = process.env.CATALOG_USAGE_REPORT_SECRET;
  if (!root || !credential || !secret)
    return json({ code: "SERVICE_NOT_CONFIGURED" }, 500);
  return createCatalogUsageReportHandler({
    store: firebaseStore(root, credential),
    secret,
    getCurrentHeads: githubHeads,
  })(request);
}
