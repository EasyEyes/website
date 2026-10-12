import { reviewRun } from "./review.mjs";

// Read-only adapter: preserve the stored audit's format and semantics.
export function compilerAudit(run) {
  const used = run?.report?.phraseUsage?.used;
  if (
    run?.status !== "completed" ||
    !used ||
    Array.isArray(used) ||
    typeof used !== "object"
  )
    throw new Error("No complete International Phrases audit is available");
  return {
    id: run.id,
    generatedAt: run.report.generatedAt,
    usedKeys: Object.keys(used),
    findings: reviewRun(run).findings,
  };
}
