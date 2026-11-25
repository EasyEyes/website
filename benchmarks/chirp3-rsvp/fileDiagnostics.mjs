export const tailVariants = [0, 800];
export const tailLabel = (provider, tailMs) => `${provider} · tail ${tailMs} ms`;
export const isTailLabel = (label) => / · tail (0|800) ms$/.test(label);
export const wordCount = (text) => (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;

const number = (value) => Number.isFinite(value) && value >= 0 ? value : null;
const text = (value, limit = 300) => typeof value === "string" ? value.slice(0, limit) : null;
const fields = (source, names) =>
  Object.fromEntries(names.map((name) => [name, number(source[name])]));

export function readReplayEvidence(source) {
  if (source == null) return undefined;
  if (typeof source !== "object" || Array.isArray(source))
    throw new Error("Invalid replay diagnostics.");
  const result = fields(source, [
    "originalPcmBytes", "expectedPcmBytes", "browserSentBytes",
    "tailMs", "firstAudioMs", "lastAudioMs", "finishMs", "elapsedMs", "closeCode", "closedAtMs",
  ]);
  result.relayError = text(source.relayError, 100);
  result.originalPcmSha256 = /^[a-f0-9]{64}$/.test(source.originalPcmSha256 ?? "") ? source.originalPcmSha256 : null;
  const relay = source.relay;
  if (relay && typeof relay === "object") {
    result.relay = {
      ...fields(relay, ["receivedBytes", "writtenBytes", "firstAudioMs", "lastAudioMs",
        "finishMs", "pendingWritesAtFinish", "grpcStatus", "finalCount", "interimCount"]),
      results: Array.isArray(relay.results) ? relay.results.slice(0, 64).filter((item) =>
        item && typeof item === "object").map((item) => ({
        ...fields(item, ["atMs", "endOffsetMs"]), isFinal: item.isFinal === true,
        text: typeof item.text === "string" ? text(item.text) : undefined,
      })) : [],
    };
  }
  result.segments = Array.isArray(source.segments) ? source.segments.slice(0, 64)
    .filter((item) => typeof item === "string").map((item) => text(item)) : [];
  result.lastInterim = text(source.lastInterim);
  result.interim = Array.isArray(source.interim) ? source.interim.slice(-32)
    .filter((item) => typeof item?.text === "string")
    .map((item) => ({ atMs: number(item.atMs), text: text(item.text) })) : [];
  return result;
}

export function byteAgreement(evidence) {
  if (evidence?.relay?.receivedBytes == null || evidence.relay.writtenBytes == null ||
      evidence.expectedPcmBytes == null || evidence.browserSentBytes == null) return "unavailable";
  return [evidence.browserSentBytes, evidence.relay.receivedBytes, evidence.relay.writtenBytes]
    .every((bytes) => bytes === evidence.expectedPcmBytes) ? "matched" : "mismatch";
}

export function summarizeTailPairs(rows, targets, baseline, padded) {
  const byClip = new Map();
  for (const row of rows) {
    if (row.provider !== baseline && row.provider !== padded) continue;
    if (!byClip.has(row.clipId)) byClip.set(row.clipId, {});
    byClip.get(row.clipId)[row.provider === baseline ? "before" : "after"] = row;
  }
  const report = { attempted: byClip.size, paired: 0, recovered: 0, regressed: 0,
    beforeShort: 0, afterShort: 0, byteMatches: 0, byteMismatches: 0, byteUnavailable: 0, details: [] };
  for (const [id, { before, after }] of byClip) {
    const targetCount = targets.get(id);
    if (!targetCount) continue;
    const count = (row) => typeof row?.transcript === "string" ? wordCount(row.transcript) : null;
    const a = count(before), b = count(after);
    for (const row of [before, after].filter(Boolean)) {
      const match = byteAgreement(row.evidence);
      report[match === "matched" ? "byteMatches" : match === "mismatch" ? "byteMismatches" : "byteUnavailable"]++;
    }
    report.details.push({ id, before, after, a, b, targetCount });
    if (a == null || b == null) continue;
    report.paired++;
    report.beforeShort += Number(a < targetCount);
    report.afterShort += Number(b < targetCount);
    report.recovered += Number(a < targetCount && b >= targetCount);
    report.regressed += Number(a >= targetCount && b < targetCount);
  }
  return report;
}
