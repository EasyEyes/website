import { randomUUID, timingSafeEqual } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { reviewGlossaryRun } from "./review.mjs";

const MAX_COMPRESSED_BASE64 = 4_000_000;
const MAX_REPORT_BYTES = 12_000_000;
export const MAX_STORED_REPORT_BYTES = 800_000;
const RUN_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (value, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

function equalSecret(provided, expected) {
  if (!expected) return false;
  const a = Buffer.from(provided ?? "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function firestoreValueBytes(value) {
  if (typeof value === "string") return Buffer.byteLength(value) + 1;
  if (value === null || typeof value === "boolean") return 1;
  if (typeof value === "number") return 8;
  if (Array.isArray(value))
    return value.reduce((sum, child) => sum + firestoreValueBytes(child), 0);
  return (
    32 +
    Object.entries(value).reduce(
      (sum, [key, child]) =>
        sum + Buffer.byteLength(key) + 1 + firestoreValueBytes(child),
      0,
    )
  );
}

export function validGlossaryReport(report) {
  if (
    !record(report) ||
    typeof report.generatedAt !== "string" ||
    !record(report.source) ||
    typeof report.source.version !== "string" ||
    !record(report.repositories) ||
    !record(report.counts)
  )
    return false;
  const sections = ["obsoleteUsed", "unused", "used"];
  if (sections.some((name) => !record(report[name]))) return false;
  const keys = sections.flatMap((name) => Object.keys(report[name]));
  if (
    new Set(keys).size !== keys.length ||
    report.counts.total !== keys.length ||
    sections.some(
      (name) => report.counts[name] !== Object.keys(report[name]).length,
    )
  )
    return false;
  for (const section of ["obsoleteUsed", "used"]) {
    for (const repositories of Object.values(report[section])) {
      if (!record(repositories)) return false;
      for (const [repository, paths] of Object.entries(repositories)) {
        if (!record(report.repositories[repository]) || !record(paths))
          return false;
        for (const [path, lines] of Object.entries(paths)) {
          if (
            !path ||
            path.startsWith("/") ||
            path.split("/").includes("..") ||
            !Array.isArray(lines) ||
            lines.some((line) => !Number.isInteger(line) || line <= 0)
          )
            return false;
        }
      }
    }
  }
  return true;
}

export function createGlossaryAuditHandler({
  store,
  dispatch,
  glossarySecret,
  reportSecret,
  now = () => new Date(),
  newId = randomUUID,
}) {
  return async (request) => {
    const action = new URL(request.url).searchParams.get("action");
    if (request.method !== "POST")
      return json({ error: "Method not allowed" }, 405);

    if (action === "start") {
      if (
        !equalSecret(request.headers.get("x-glossary-secret"), glossarySecret)
      )
        return json({ error: "Unauthorized" }, 401);
      const id = newId();
      const active = await store.createQueued(id, now().toISOString());
      if (active)
        return json(
          {
            error: "An audit is still running. Wait for it to finish.",
            code: "audit_in_progress",
            id: active.id,
            status: active.status,
          },
          409,
        );
      try {
        await dispatch(id);
      } catch (error) {
        console.error("[glossary-audit] workflow dispatch failed", error);
        await store.update(id, {
          status: "failed",
          completedAt: now().toISOString(),
          error: "Could not start the audit workflow",
        });
        return json({ error: "Could not start the audit workflow" }, 502);
      }
      return json({ id, status: "queued" }, 202);
    }

    if (action === "review") {
      if (
        !equalSecret(request.headers.get("x-glossary-secret"), glossarySecret)
      )
        return json({ error: "Unauthorized" }, 401);
      let body;
      try {
        body = JSON.parse(await request.text());
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      if (body?.operation === "list")
        return json({ runs: await store.listRecent(20) });
      if (body?.operation !== "get" || !RUN_ID.test(body?.id ?? ""))
        return json({ error: "Invalid review request" }, 400);
      const run = await store.get(body.id);
      if (!run) return json({ error: "Unknown run" }, 404);
      return json(reviewGlossaryRun({ id: body.id, ...run }));
    }

    if (action === "result") {
      if (
        !equalSecret(
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""),
          reportSecret,
        )
      )
        return json({ error: "Unauthorized" }, 401);
      const raw = await request.text();
      if (Buffer.byteLength(raw) > MAX_COMPRESSED_BASE64 + 1000)
        return json({ error: "Result too large" }, 413);
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      if (
        !RUN_ID.test(body?.id ?? "") ||
        !["completed", "failed"].includes(body?.status)
      )
        return json({ error: "Invalid result" }, 400);
      const run = await store.get(body.id);
      if (!run) return json({ error: "Unknown run" }, 404);
      if (run.status === "completed")
        return json({ error: "Run already completed" }, 409);
      if (body.status === "failed") {
        await store.update(body.id, {
          status: "failed",
          completedAt: now().toISOString(),
          error: String(body.error ?? "Audit failed").slice(0, 500),
        });
        return json({ id: body.id, status: "failed" });
      }
      if (
        typeof body.reportGzipBase64 !== "string" ||
        body.reportGzipBase64.length > MAX_COMPRESSED_BASE64 ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(body.reportGzipBase64)
      )
        return json({ error: "Invalid compressed report" }, 400);
      let report;
      let reportSizeBytes;
      try {
        const decoded = gunzipSync(
          Buffer.from(body.reportGzipBase64, "base64"),
          {
            maxOutputLength: MAX_REPORT_BYTES,
          },
        );
        reportSizeBytes = decoded.length;
        report = JSON.parse(decoded.toString("utf8"));
      } catch {
        return json({ error: "Invalid compressed report" }, 400);
      }
      if (!validGlossaryReport(report))
        return json({ error: "Incomplete audit report" }, 400);
      if (firestoreValueBytes(report) > MAX_STORED_REPORT_BYTES) {
        await store.update(body.id, {
          status: "failed",
          completedAt: now().toISOString(),
          error: "Audit report exceeds the readable Firestore document limit",
        });
        return json({ error: "Report exceeds Firestore document limit" }, 413);
      }
      await store.update(body.id, {
        status: "completed",
        completedAt: now().toISOString(),
        reportGeneratedAt: report.generatedAt,
        glossaryVersion: report.source.version,
        reportSizeBytes,
        report,
      });
      return json({ id: body.id, status: "completed" });
    }

    return json({ error: "Unknown action" }, 404);
  };
}
