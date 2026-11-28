import { isTailLabel } from "./fileDiagnostics.mjs";

export const qualityLabels = {
  unreviewed: "Not reviewed",
  clear: "Clear / intelligible",
  difficult: "Difficult but intelligible",
  unclear: "Unintelligible / cannot judge",
  invalid: "Wrong task or invalid recording",
};

export const reviewFilters = {
  all: "All clips",
  "transcript-disagreement": "Transcript differs from the human review",
  "model-disagreement": "Model transcripts disagree with each other",
  "pending-disagreement": "Transcript differs · deletion not reviewed",
  short: "Fewer words than the human transcript",
  "pending-short": "Shorter output · deletion not reviewed",
  error: "Any scoring error",
  missed: "Missed correct target (1 → 0)",
  "false-credit": "False credit (0 → 1)",
  exclusive: "Only the selected model has a scoring error",
  confirmed: "Human-confirmed word deletion",
  flagged: "Difficult, unclear or invalid audio",
  diff: "Reference or target needs review",
  "reference-corrected": "Corrected human transcript",
  failed: "Missing or failed STT result",
  notes: "Saved notes",
};

export const providerReviewFor = (review, provider, transcript) =>
  review?.providerReviews?.find((entry) => entry.provider === provider && entry.transcript === transcript);

export function buildReviewQueue(clips, results, details, reviews, selected, tokenize, reviewStatus = "pending") {
  const providerRows = [...results].filter(([label]) => !isTailLabel(label));
  const summaries = providerRows.map(([provider]) => ({
    provider, returned: 0, shorter: 0, referenceWords: 0, wordGap: 0, checked: 0, confirmed: 0, noted: 0,
  }));
  const scored = new Map();
  for (const row of details)
    if (row.differences) {
      if (!scored.has(row.provider)) scored.set(row.provider, new Map());
      scored.get(row.provider).set(row.clipId, row.differences);
    }
  const lists = new Map(Object.keys(reviewFilters).map((filter) => [filter, []]));
  const annotations = [];
  let compared = 0, reviewedClips = 0;
  for (const clip of clips) {
    const review = reviews.get(clip.id);
    const reviewed = review?.reviewed === true;
    if (reviewed) reviewedClips++;
    const reference = review?.reference ?? clip.reference;
    const words = tokenize(reference), text = words.join(" ");
    const quality = review?.quality ?? "unreviewed";
    const excluded = quality === "invalid" || quality === "unclear";
    const rows = providerRows.map(([provider, entries], i) => {
      const row = entries.get(clip.id), returned = typeof row?.transcript === "string";
      const transcript = returned ? row.transcript : null;
      const actual = returned ? tokenize(transcript) : null;
      const normalized = actual?.join(" ");
      const annotation = row && providerReviewFor(review, provider, transcript);
      const shorter = !excluded && returned && actual.length < words.length;
      const summary = summaries[i];
      if (!excluded && returned) {
        summary.returned++;
        summary.referenceWords += words.length;
        if (shorter) summary.shorter++;
        if (shorter) summary.wordGap += words.length - actual.length;
        if (typeof annotation?.deletion === "boolean") summary.checked++;
        if (annotation?.deletion === true) summary.confirmed++;
      }
      if (annotation?.note) summary.noted++;
      if (annotation) annotations.push({
        clip, quality, reference, provider, transcript, annotation, reviewed,
        referenceCorrected: review?.reference !== undefined,
        referenceWords: words.length, outputWords: actual?.length ?? null,
        outcome: returned ? "returned" : "failed", included: !excluded,
      });
      return { provider, returned, shorter, differs: returned && normalized !== text, normalized,
        diff: scored.get(provider)?.get(clip.id), annotation };
    });
    if (review?.note || reviewed || review?.reference !== undefined) annotations.push({
      clip, quality, reference, annotation: { note: review?.note }, reviewed, referenceWords: words.length,
      referenceCorrected: review?.reference !== undefined, included: !excluded,
    });
    if (reviewStatus !== "all" && reviewed !== (reviewStatus === "reviewed")) continue;
    const active = selected ? rows.filter(({ provider }) => provider === selected) : rows;
    const comparable = !excluded && active.length > 0 && active.every(({ returned }) => returned);
    const modelsComparable = !excluded && rows.length > 1 && rows.every(({ returned }) => returned);
    if (comparable) compared++;
    const unique = selected && rows.length > 1 && active[0]?.diff?.exact === false &&
      rows.filter(({ provider }) => provider !== selected).every(({ diff }) => diff?.exact === true);
    const matches = {
      all: true,
      "transcript-disagreement": comparable && active.some(({ differs }) => differs),
      "model-disagreement": modelsComparable && active.length > 0 &&
        rows.some(({ normalized }) => normalized !== active[0].normalized),
      "pending-disagreement": comparable && active.some(({ differs, annotation }) =>
        differs && typeof annotation?.deletion !== "boolean"),
      short: active.some(({ shorter }) => shorter),
      "pending-short": active.some(({ shorter, annotation }) => shorter && typeof annotation?.deletion !== "boolean"),
      error: active.some(({ diff }) => diff?.exact === false),
      missed: active.some(({ diff }) => diff?.falseNeg.length),
      "false-credit": active.some(({ diff }) => diff?.falsePos.length),
      exclusive: unique,
      confirmed: !excluded && active.some(({ annotation }) => annotation?.deletion === true),
      flagged: ["difficult", "unclear", "invalid"].includes(quality),
      diff: quality === "unreviewed" && (clip.referenceStatus === "needsReview" || clip.expected.includes(0)),
      "reference-corrected": review?.reference !== undefined,
      failed: active.some(({ returned }) => !returned),
      notes: active.some(({ annotation }) => annotation?.note) || (!selected && review?.note),
    };
    for (const [filter, match] of Object.entries(matches))
      if (match) lists.get(filter).push(clip);
  }
  return { lists, summaries, annotations, compared, reviewedClips, providers: providerRows.map(([label]) => label) };
}

export const manifestKey = (clips) => JSON.stringify(clips.map((c) =>
  [c.id, c.file, c.reference, c.targets ?? null, c.speakerGroup ?? null])
  .sort(([a], [b]) => a.localeCompare(b)));

export function readReviews(data, clips) {
  const result = new Map();
  if (data.reviews === undefined) return result;
  if (data.manifestKey !== manifestKey(clips) || !Array.isArray(data.reviews) || data.reviews.length > clips.length)
    throw new Error("These reviews do not match the loaded reference manifest.");
  const byId = new Map(clips.map((c) => [c.id, c]));
  for (const row of data.reviews) {
    const clip = byId.get(row?.clipId);
    if (!clip || result.has(row.clipId) || !Object.hasOwn(qualityLabels, row.quality) ||
        (row.reference !== undefined && (!clip.targets || typeof row.reference !== "string" || row.reference.length > 1500)) ||
        !Array.isArray(row.predictions) || row.predictions.length > 32 ||
        (row.reviewed !== undefined && typeof row.reviewed !== "boolean") ||
        (row.note !== undefined && !validNote(row.note)) ||
        (row.providerReviews !== undefined &&
          (!Array.isArray(row.providerReviews) || row.providerReviews.length > 100)))
      throw new Error("Invalid or duplicated clip review.");
    const seen = new Set();
    for (const item of row.predictions) {
      const key = JSON.stringify([item?.provider, item?.transcript, item?.ignoreOrder]);
      if (!clip.targets || typeof item?.provider !== "string" || !item.provider || item.provider.length > 100 ||
          typeof item.transcript !== "string" || item.transcript.length > 3000 ||
          typeof item.ignoreOrder !== "boolean" || !Array.isArray(item.bits) ||
          item.bits.length !== clip.targets.length || item.bits.some((bit) => ![null, 0, 1].includes(bit)) ||
          seen.has(key))
        throw new Error("Invalid target decision in a clip review.");
      seen.add(key);
    }
    const annotated = new Set();
    for (const item of row.providerReviews ?? []) {
      if (typeof item?.provider !== "string" || !item.provider.trim() || item.provider.length > 100 ||
          (item.transcript !== null && (typeof item.transcript !== "string" || item.transcript.length > 3000)) ||
          ![null, false, true].includes(item.deletion) || (item.transcript === null && item.deletion !== null) ||
          (item.note !== undefined && !validNote(item.note)) || annotated.has(item.provider))
        throw new Error("Invalid or duplicated provider annotation.");
      annotated.add(item.provider);
    }
    result.set(row.clipId, row);
  }
  return result;
}

const validNote = (note) => typeof note === "string" && note.length <= 2000;
