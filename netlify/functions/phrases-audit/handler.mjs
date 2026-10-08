import { randomUUID, timingSafeEqual } from "node:crypto";
import { gunzipSync } from "node:zlib";

const MAX_COMPRESSED_BASE64 = 4_000_000;
const MAX_REPORT_BYTES = 12_000_000;
export const MAX_STORED_REPORT_BYTES = 800_000;
const MAX_HISTORY_BYTES = 900_000;
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

export function createPhrasesAuditHandler({
  store,
  dispatch,
  phrasesSecret,
  reportSecret,
  now = () => new Date(),
  newId = randomUUID,
}) {
  return async (request) => {
    const action = new URL(request.url).searchParams.get("action");
    if (request.method !== "POST")
      return json({ error: "Method not allowed" }, 405);

    if (action === "start") {
      if (!equalSecret(request.headers.get("x-phrases-secret"), phrasesSecret))
        return json({ error: "Unauthorized" }, 401);
      const id = newId();
      await store.create(id, {
        status: "queued",
        requestedAt: now().toISOString(),
      });
      try {
        await dispatch(id);
      } catch (error) {
        console.error("[phrases-audit] workflow dispatch failed", error);
        await store.update(id, {
          status: "failed",
          completedAt: now().toISOString(),
          error: "Could not start the audit workflow",
        });
        return json({ error: "Could not start the audit workflow" }, 502);
      }
      return json({ id, status: "queued" }, 202);
    }

    if (action === "history-state") {
      if (
        !equalSecret(
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""),
          reportSecret,
        )
      )
        return json({ error: "Unauthorized" }, 401);
      const raw = await request.text();
      if (Buffer.byteLength(raw) > MAX_HISTORY_BYTES)
        return json({ error: "History state too large" }, 413);
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      if (body?.operation === "read")
        return json({ state: await store.getHistoryState() });
      if (
        body?.operation !== "write" ||
        !body.state ||
        body.state.schemaVersion !== 1 ||
        body.state.logicVersion !== 1 ||
        !Array.isArray(body.state.checkedKeys) ||
        !body.state.report?.repositories ||
        !body.state.report?.keys ||
        (body.baseRevision !== null && typeof body.baseRevision !== "string")
      )
        return json({ error: "Invalid history state" }, 400);
      const saved = await store.saveHistoryState(body.state, body.baseRevision);
      if (!saved) return json({ error: "History state changed" }, 409);
      return json({ revision: saved });
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
      if (
        !report.generatedAt ||
        !report.phraseUsage ||
        !report.history ||
        !report.missingFromSheet
      )
        return json({ error: "Incomplete audit report" }, 400);
      if (Buffer.byteLength(JSON.stringify(report)) > MAX_STORED_REPORT_BYTES) {
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
        phrasesVersion: report.phraseUsage.source?.version ?? null,
        reportSizeBytes,
        report,
      });
      return json({ id: body.id, status: "completed" });
    }

    return json({ error: "Unknown action" }, 404);
  };
}
