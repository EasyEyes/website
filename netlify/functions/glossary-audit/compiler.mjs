import { validGlossaryReport } from "./handler.mjs";
import { reviewGlossaryRun } from "./review.mjs";

export function compilerGlossaryAudit(run) {
  if (
    run?.status !== "completed" ||
    typeof run.id !== "string" ||
    !run.id ||
    !validGlossaryReport(run.report)
  )
    throw new Error("No complete glossary audit is available");
  return {
    id: run.id,
    generatedAt: run.report.generatedAt,
    glossaryVersion: run.report.source.version,
    usedKeys: [
      ...Object.keys(run.report.used),
      ...Object.keys(run.report.obsoleteUsed),
    ].sort(),
    unusedKeys: Object.keys(run.report.unused).sort(),
    findings: reviewGlossaryRun(run).findings.unused,
  };
}

// A queued or failed run must never hide an earlier completed audit.
export async function latestCompletedGlossaryAudit(collection) {
  let query = collection.orderBy("requestedAt", "desc").limit(20);
  while (true) {
    const page = await query.get();
    const completed = page.docs.find(
      (doc) => doc.data().status === "completed",
    );
    if (completed) return { ...completed.data(), id: completed.id };
    if (page.size < 20) return null;
    query = collection
      .orderBy("requestedAt", "desc")
      .startAfter(page.docs.at(-1))
      .limit(20);
  }
}

export function createGlossaryCompilerHandler({ latestCompleted }) {
  return async (request) => {
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      });
    if (request.method !== "GET")
      return json({ error: "Method not allowed" }, 405);
    try {
      return json(compilerGlossaryAudit(await latestCompleted()));
    } catch {
      return json({ error: "Glossary audit unavailable" }, 503);
    }
  };
}
