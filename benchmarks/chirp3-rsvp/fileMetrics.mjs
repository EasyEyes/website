import { readReplayEvidence } from "./fileDiagnostics.mjs";

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
    const meta = {};
    for (const key of ["speakerGroup", "session", "list", "referenceStatus"]) {
      if (clip[key] === undefined) continue;
      if (typeof clip[key] !== "string" || !clip[key].trim() || clip[key].length > 100)
        throw new Error(`Clip ${clip.id}: invalid ${key}.`);
      meta[key] = clip[key];
    }
    return { id: clip.id, file: clip.file, reference: clip.reference, targets: clip.targets, ...meta };
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
    const evidence = readReplayEvidence(row.evidence);
    const result = typeof row.transcript === "string"
      ? { clipId: row.clipId, provider: row.provider, transcript: row.transcript }
      : { clipId: row.clipId, provider: row.provider, error: row.error };
    collection.set(row.clipId, evidence ? { ...result, evidence } : result);
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

export function referenceCorrectionImpact(original, adjudicated, reviews) {
  const beforeByProvider = new Map(), summary = new Map();
  for (const row of original.details) {
    if (reviews.get(row.clipId)?.reference === undefined || !row.automaticVector) continue;
    if (!beforeByProvider.has(row.provider)) beforeByProvider.set(row.provider, new Map());
    beforeByProvider.get(row.provider).set(row.clipId, row.expected);
  }
  for (const row of adjudicated.details) {
    const before = beforeByProvider.get(row.provider)?.get(row.clipId);
    if (!before || !row.automaticVector) continue;
    if (!summary.has(row.provider)) summary.set(row.provider, {
      provider: row.provider, clips: 0, bits: 0, before: 0, after: 0, resolved: 0, introduced: 0,
    });
    const entry = summary.get(row.provider);
    entry.clips++;
    entry.bits += row.automaticVector.length;
    for (const [i, bit] of row.automaticVector.entries()) {
      const oldError = bit !== before[i], newError = bit !== row.expected[i];
      entry.before += Number(oldError);
      entry.after += Number(newError);
      entry.resolved += Number(oldError && !newError);
      entry.introduced += Number(!oldError && newError);
    }
  }
  return [...summary.values()];
}

const blankScore = () => ({
  positives: 0, negatives: 0, falsePos: 0, falseNeg: 0, exact: 0,
  truePos: 0, trueNeg: 0, lastErrors: 0, explicitClips: 0, referenceClips: 0,
});

function countVector(totals, clip, actual, diff) {
  totals[clip.targetSource === "explicit" ? "explicitClips" : "referenceClips"]++;
  for (const bit of clip.expected) totals[bit ? "positives" : "negatives"]++;
  totals.falsePos += diff.falsePos.length;
  totals.falseNeg += diff.falseNeg.length;
  totals.truePos += clip.expected.filter((bit) => bit === 1).length - diff.falseNeg.length;
  totals.trueNeg += clip.expected.filter((bit) => bit === 0).length - diff.falsePos.length;
  totals.exact += Number(diff.exact);
  totals.lastErrors += Number(clip.expected.at(-1) !== actual.vector.at(-1));
}

export function summarizeFiles(clips, providers, score, amend = (_clip, _result, actual) => actual) {
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
      const automatic = typeof result.transcript === "string" ? score(clip.targets, result.transcript) : null;
      const actual = automatic && amend(clip, result, automatic);
      const diff = actual && compareVectors(clip.expected, actual.vector);
      const included = paired.has(clip.id);
      details.push({
        clipId: clip.id, provider, targets: clip.targets, targetSource: clip.targetSource, speakerGroup: clip.speakerGroup,
        reference: clip.reference, expected: clip.expected, included,
        transcript: result.transcript ?? null, normalized: actual?.normalized ?? null,
        vector: actual?.vector ?? null, alignment: actual?.alignment ?? null,
        automaticVector: automatic?.vector ?? null, error: result.error ?? null, differences: diff,
      });
      if (actual) countVector(totals.allReturned, clip, actual, diff);
      if (included) countVector(totals, clip, actual, diff);
    }
    return totals;
  });
  return { summary, details };
}

export const scopes = {
  original: "Original",
  adjudicated: "After review",
  unflagged: "After review · difficult audio excluded",
};

export function summarizeReviews(clips, providers, score, reviews, ignoreOrder) {
  const kept = [], clear = [];
  const quality = { unreviewed: 0, clear: 0, difficult: 0, unclear: 0, invalid: 0, corrected: 0 };
  for (const clip of clips) {
    const review = reviews.get(clip.id);
    quality[review?.quality ?? "unreviewed"]++;
    if (review?.reference !== undefined) quality.corrected++;
    if (review?.quality === "unclear" || review?.quality === "invalid") continue;
    const edited = review?.reference !== undefined
      ? { ...clip, reference: review.reference, expected: score(clip.targets, review.reference).vector }
      : clip;
    kept.push(edited);
    if (review?.quality !== "difficult") clear.push(edited);
  }
  const amend = (clip, result, automatic) => {
    const decision = reviews.get(clip.id)?.predictions.find((item) =>
      item.provider === result.provider && item.transcript === result.transcript && item.ignoreOrder === ignoreOrder);
    if (!decision) return automatic;
    const vector = automatic.vector.map((bit, i) => decision.bits[i] ?? bit);
    return {
      ...automatic, vector,
      alignment: automatic.alignment?.map((row, i) =>
        vector[i] === automatic.vector[i] ? row : { ...row, correct: vector[i], outcome: "reviewOverride" }),
    };
  };
  return {
    quality,
    reports: {
      original: { clips, ...summarizeFiles(clips, providers, score) },
      adjudicated: { clips: kept, ...summarizeFiles(kept, providers, score, amend) },
      unflagged: { clips: clear, ...summarizeFiles(clear, providers, score, amend) },
    },
  };
}

export function summarizeSpeakers(clips, details, providers) {
  const groups = new Map();
  for (const clip of clips) {
    if (clip.speakerGroup === undefined) continue;
    if (!groups.has(clip.speakerGroup)) groups.set(clip.speakerGroup, []);
    groups.get(clip.speakerGroup).push(clip);
  }
  const byKey = new Map(details.map((row) => [JSON.stringify([row.provider, row.clipId]), row]));
  const rows = [];
  for (const [speaker, group] of groups) {
    for (const provider of providers) {
      const out = { speaker, provider, clips: group.length, returned: 0, failed: 0, missing: 0, ...blankScore() };
      for (const clip of group) {
        const row = byKey.get(JSON.stringify([provider, clip.id]));
        if (row?.differences) {
          out.returned++;
          countVector(out, clip, row, row.differences);
        } else if (row?.error) out.failed++;
        else out.missing++;
      }
      rows.push(out);
    }
  }
  return rows;
}

export function summarizeKeytermPairs(clips, details, variants) {
  const scores = new Map();
  for (const row of details) {
    if (!row.differences) continue;
    if (!scores.has(row.provider)) scores.set(row.provider, new Map());
    scores.get(row.provider).set(row.clipId, row);
  }
  return variants.flatMap(({ provider, off, on }) => {
    if (!scores.has(off) || !scores.has(on)) return [];
    const without = blankScore(), withTerms = blankScore();
    let paired = 0;
    for (const clip of clips) {
      const a = scores.get(off).get(clip.id);
      const b = scores.get(on).get(clip.id);
      if (!a || !b) continue;
      paired++;
      countVector(without, clip, a, a.differences);
      countVector(withTerms, clip, b, b.differences);
    }
    return [{ provider, paired, without, withTerms }];
  });
}

// Compare only the two selected providers on their common successful clips.
export function summarizeProviderAgreement(clips, details, first, second) {
  const a = new Map(), b = new Map();
  for (const row of details) {
    if (!row.differences) continue;
    if (row.provider === first) a.set(row.clipId, row);
    if (row.provider === second) b.set(row.clipId, row);
  }
  const result = {
    eligible: clips.length, paired: 0, rejected: 0, rejectedTargets: 0,
    first: blankScore(), second: blankScore(), accepted: blankScore(),
  };
  if (first === second) return result;
  for (const clip of clips) {
    const x = a.get(clip.id), y = b.get(clip.id);
    if (!x || !y) continue;
    result.paired++;
    countVector(result.first, clip, x, x.differences);
    countVector(result.second, clip, y, y.differences);
    if (x.vector.some((bit, i) => bit !== y.vector[i])) {
      result.rejected++;
      result.rejectedTargets += clip.expected.length;
    } else {
      countVector(result.accepted, clip, x, x.differences);
    }
  }
  return result;
}
