export function readManifest(data) {
  if (data?.version !== 1 || !Array.isArray(data.clips) ||
      data.clips.length < 1 || data.clips.length > 10_000)
    throw new Error("Expected a version 1 manifest with 1–10,000 clips.");
  const ids = new Set(), names = new Set();
  const clips = data.clips.map((clip) => {
    if (typeof clip?.id !== "string" || !/^[\w.-]{1,100}$/.test(clip.id) ||
        typeof clip.file !== "string" || !/^[^/\\]+$/.test(clip.file) ||
        typeof clip.reference !== "string" || clip.reference.length > 1500 ||
        (clip.targets !== undefined && (!Array.isArray(clip.targets) ||
          clip.targets.length < 1 || clip.targets.length > 160 ||
          clip.targets.some((word) => typeof word !== "string" || !word.trim() || word.length > 120))) ||
        ids.has(clip.id) || names.has(clip.file))
      throw new Error("Each clip needs a unique id, audio filename, and reference text. Targets are optional.");
    ids.add(clip.id);
    names.add(clip.file);
    return { id: clip.id, file: clip.file, reference: clip.reference, targets: clip.targets };
  });
  return { version: 1, clips };
}

export function readResults(data, clips) {
  if (data?.version !== 1 || !Array.isArray(data.results) || data.results.length > 50_000)
    throw new Error("Expected a version 1 results JSON.");
  const byProvider = new Map();
  const ids = new Set(clips.map((clip) => clip.id));
  for (const row of data.results) {
    if (!ids.has(row?.clipId) || typeof row.provider !== "string" ||
        !row.provider.trim() || row.provider.length > 100 ||
        (typeof row.transcript === "string") === (typeof row.error === "string") ||
        (typeof row.transcript === "string" && row.transcript.length > 3000) ||
        (typeof row.error === "string" && (!row.error.trim() || row.error.length > 200)))
      throw new Error("Each result needs a known clip id, a provider, and either text or an error.");
    const collection = byProvider.get(row.provider) ?? new Map();
    if (collection.has(row.clipId))
      throw new Error("Duplicate clip and provider result.");
    collection.set(row.clipId, typeof row.transcript === "string"
      ? { clipId: row.clipId, provider: row.provider, transcript: row.transcript }
      : { clipId: row.clipId, provider: row.provider, error: row.error });
    byProvider.set(row.provider, collection);
  }
  return byProvider;
}

export function compareVectors(expected, actual) {
  if (expected.length !== actual.length) throw new Error("RSVP score does not match the target count.");
  const falsePos = [], falseNeg = [];
  for (const [i, bit] of expected.entries()) {
    if (bit === actual[i]) continue;
    (bit === 1 ? falseNeg : falsePos).push(i);
  }
  return { falsePos, falseNeg, exact: !falsePos.length && !falseNeg.length };
}

const blankScore = () => ({
  positives: 0, negatives: 0, falsePos: 0, falseNeg: 0, exact: 0,
  lastErrors: 0, explicitClips: 0, referenceClips: 0,
});

function countVector(totals, clip, actual, diff) {
  totals[clip.targetSource === "explicit" ? "explicitClips" : "referenceClips"]++;
  for (const bit of clip.expected) totals[bit ? "positives" : "negatives"]++;
  totals.falsePos += diff.falsePos.length;
  totals.falseNeg += diff.falseNeg.length;
  totals.exact += Number(diff.exact);
  totals.lastErrors += Number(clip.expected.at(-1) !== actual.vector.at(-1));
}

export function summarizeFiles(clips, providers, score) {
  const paired = new Set(providers.size
    ? clips.filter(({ id }) => [...providers.values()].every((rows) =>
        typeof rows.get(id)?.transcript === "string")).map(({ id }) => id)
    : []);
  const details = [];
  const summary = [...providers].map(([provider, results]) => {
    const totals = {
      provider, clips: clips.length, returned: 0, failed: 0, missing: 0,
      paired: paired.size, ...blankScore(), allReturned: blankScore(),
    };
    for (const clip of clips) {
      const result = results.get(clip.id);
      if (result?.error) totals.failed++;
      else if (!result) totals.missing++;
      else totals.returned++;
      if (!result) continue;
      const actual = typeof result.transcript === "string" ? score(clip.targets, result.transcript) : null;
      const diff = actual && compareVectors(clip.expected, actual.vector);
      const included = paired.has(clip.id);
      details.push({
        clipId: clip.id, provider, targets: clip.targets, targetSource: clip.targetSource,
        reference: clip.reference, expected: clip.expected, included,
        transcript: result.transcript ?? null, normalized: actual?.normalized ?? null,
        vector: actual?.vector ?? null, alignment: actual?.alignment ?? null,
        error: result.error ?? null, differences: diff,
      });
      if (actual) countVector(totals.allReturned, clip, actual, diff);
      if (included) countVector(totals, clip, actual, diff);
    }
    return totals;
  });
  return { summary, details };
}
