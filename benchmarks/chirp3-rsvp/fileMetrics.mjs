export const tokenize = (text) =>
  text.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'")
    .match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*(?:'[\p{L}\p{N}\p{M}]+)*/gu) ?? [];

export function readManifest(data) {
  if (data?.version !== 1 || !Array.isArray(data.clips) ||
      data.clips.length < 1 || data.clips.length > 500)
    throw new Error("Expected a version 1 manifest with 1–500 clips.");
  const ids = new Set();
  const names = new Set();
  const clips = data.clips.map((clip) => {
    if (typeof clip?.id !== "string" || !/^[\w.-]{1,100}$/.test(clip.id) ||
        typeof clip.file !== "string" || !/^[^/\\]+$/.test(clip.file) ||
        typeof clip.reference !== "string" || clip.reference.length > 1500 ||
        tokenize(clip.reference).length > 160 ||
        !["candidate", "reviewed"].includes(clip.referenceStatus ?? "candidate") ||
        ids.has(clip.id) || names.has(clip.file))
      throw new Error("Each clip needs a unique id, audio filename, and reference text.");
    ids.add(clip.id);
    names.add(clip.file);
    return { ...clip, referenceStatus: clip.referenceStatus ?? "candidate" };
  });
  return {
    version: 1,
    audioPolicy: data.audioPolicy === "team-test" ? "team-test" : "local-only",
    source: typeof data.source === "string" ? data.source.slice(0, 300) : "",
    clips,
  };
}

export function readResults(data, clips) {
  if (data?.version !== 1 || !Array.isArray(data.results) ||
      data.results.length > 5000)
    throw new Error("Expected a version 1 results JSON.");
  const byProvider = new Map();
  const ids = new Set(clips.map((clip) => clip.id));
  for (const row of data.results) {
    if (!ids.has(row?.clipId) || typeof row.provider !== "string" ||
        !row.provider.trim() || row.provider.length > 100 ||
        (typeof row.transcript === "string") === (typeof row.error === "string") ||
        (typeof row.transcript === "string" &&
          (row.transcript.length > 1500 || tokenize(row.transcript).length > 160)) ||
        (typeof row.error === "string" && (!row.error.trim() || row.error.length > 200)))
      throw new Error("Each result needs a known clip id, a provider, and either text or an error.");
    const collection = byProvider.get(row.provider) ?? new Map();
    if (collection.has(row.clipId))
      throw new Error("Duplicate clip and provider result. Give distinct configurations distinct provider labels.");
    collection.set(row.clipId, typeof row.transcript === "string"
      ? { clipId: row.clipId, provider: row.provider, transcript: row.transcript }
      : { clipId: row.clipId, provider: row.provider, error: row.error });
    byProvider.set(row.provider, collection);
  }
  return byProvider;
}

export function compareWords(reference, transcript) {
  const a = tokenize(reference);
  const b = tokenize(transcript);
  const n = a.length, m = b.length;
  const unit = n + 1; // First minimize edits, then maximize exact matches.
  const table = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n; i >= 0; i--)
    for (let j = m; j >= 0; j--) {
      if (i === n) table[i][j] = (m - j) * unit;
      else if (j === m) table[i][j] = (n - i) * unit;
      else table[i][j] = Math.min(
        table[i + 1][j + 1] + (a[i] === b[j] ? -1 : unit),
        table[i + 1][j] + unit,
        table[i][j + 1] + unit,
      );
    }
  const counts = { match: 0, substitute: 0, delete: 0, insert: 0 };
  const alignment = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    let op;
    if (i < n && j < m &&
        table[i][j] === table[i + 1][j + 1] + (a[i] === b[j] ? -1 : unit))
      op = a[i] === b[j] ? "match" : "substitute";
    else if (i < n && table[i][j] === table[i + 1][j] + unit)
      op = "delete";
    else op = "insert";
    counts[op]++;
    alignment.push({
      op,
      index: op === "insert" ? null : i,
      expected: op === "insert" ? null : a[i++],
      heard: op === "delete" ? null : b[j++],
    });
  }
  return { words: n, ...counts, alignment };
}

export function summarizeFiles(clips, providers) {
  const reviewed = clips.filter((clip) => clip.referenceStatus === "reviewed");
  const paired = providers.size
    ? reviewed.filter((clip) => [...providers.values()].every((results) =>
        typeof results.get(clip.id)?.transcript === "string"))
    : [];
  const details = [];
  const summary = [...providers].map(([provider, results]) => {
    const totals = {
      provider, reviewed: reviewed.length, returned: 0, failed: 0, missing: 0,
      paired: paired.length, words: 0, match: 0, substitute: 0, delete: 0, insert: 0,
      exact: 0, byPosition: {
        first: { count: 0, errors: 0, omitted: 0 },
        middle: { count: 0, errors: 0, omitted: 0 },
        last: { count: 0, errors: 0, omitted: 0 },
      },
    };
    const common = new Set(paired.map(({ id }) => id));
    for (const clip of reviewed) {
      const result = results.get(clip.id);
      if (result?.error) totals.failed++;
      else if (!result) totals.missing++;
      else totals.returned++;
      const score = result && !result.error
        ? compareWords(clip.reference, result.transcript)
        : null;
      const included = common.has(clip.id);
      details.push({ clipId: clip.id, provider, reference: clip.reference,
        transcript: result?.transcript ?? null, error: result?.error ?? null,
        included, score });
      if (!included) continue;
      for (const name of ["words", "match", "substitute", "delete", "insert"])
        totals[name] += score[name];
      totals.exact += Number(!score.substitute && !score.delete && !score.insert);
      for (const word of score.alignment) {
        if (word.index === null) continue;
        const positions = word.index === 0 ? ["first"] : [];
        if (word.index === score.words - 1) positions.push("last");
        if (!positions.length) positions.push("middle");
        for (const position of positions) {
          const part = totals.byPosition[position];
          part.count++;
          part.errors += Number(word.op !== "match");
          part.omitted += Number(word.op === "delete");
        }
      }
    }
    return totals;
  });
  return { summary, details };
}
