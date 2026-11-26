import { isTailLabel } from "./fileDiagnostics.mjs";

export const qualityLabels = {
  unreviewed: "Not reviewed",
  clear: "Clear / intelligible",
  difficult: "Difficult but intelligible",
  unclear: "Unintelligible / cannot judge",
  invalid: "Wrong task or invalid recording",
};

const transcriptWords = (text) => (text.normalize("NFC").toLowerCase()
  .replace(/\u2019/g, "'").match(/[\p{L}\p{M}\p{N}]+(?:'[\p{L}\p{M}\p{N}]+)*/gu) ?? []).join(" ");

export function transcriptDisagreements(clips, results) {
  const providers = [...results].filter(([label]) =>
    !isTailLabel(label) && /^(?:Chirp 3|ElevenLabs)\b/.test(label));
  const ready = providers.some(([label]) => label.startsWith("Chirp 3")) &&
    providers.some(([label]) => label.startsWith("ElevenLabs"));
  const ids = new Set();
  let compared = 0;
  if (ready) for (const clip of clips) {
    const texts = providers.map(([, entries]) => entries.get(clip.id)?.transcript);
    if (texts.some((text) => typeof text !== "string")) continue;
    compared++;
    const reference = transcriptWords(clip.reference);
    if (texts.some((text) => transcriptWords(text) !== reference)) ids.add(clip.id);
  }
  return { ready, compared, ids };
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
        !Array.isArray(row.predictions) || row.predictions.length > 32)
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
    result.set(row.clipId, row);
  }
  return result;
}
