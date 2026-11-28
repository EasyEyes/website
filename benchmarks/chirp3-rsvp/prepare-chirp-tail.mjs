import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { readManifest, readResults } from "./fileMetrics.mjs";
import { manifestKey, readReviews } from "./fileReview.mjs";
import { wordCount } from "./fileDiagnostics.mjs";

const { values } = parseArgs({ options: {
  manifest: { type: "string" }, results: { type: "string" }, out: { type: "string" },
} });
if (!values.manifest || !values.results || !values.out)
  throw new Error("Provide --manifest, --results and --out.");
const source = resolve(values.manifest);
const out = resolve(values.out);
const manifest = readManifest(JSON.parse(await readFile(source, "utf8")));
const imported = JSON.parse(await readFile(values.results, "utf8"));
if (imported.manifestKey !== manifestKey(manifest.clips))
  throw new Error("The results must match the source manifest.");
const byProvider = readResults(imported, manifest.clips);
const reviews = readReviews(imported, manifest.clips);
const chirp = byProvider.get("Chirp 3 · with keyterms");
if (!chirp) throw new Error("Chirp 3 results with keyterms were not found.");
const selected = manifest.clips.filter((clip) => {
  const row = chirp.get(clip.id);
  return clip.targets?.length === 3 && typeof row?.transcript === "string" && wordCount(row.transcript) < 3;
});
if (!selected.length) throw new Error("No successful Chirp results with fewer than three words.");
await mkdir(out);
for (const clip of selected) {
  const original = resolve(dirname(source), clip.file);
  const copy = resolve(out, clip.file);
  if (dirname(original) !== dirname(source) || dirname(copy) !== out)
    throw new Error("Audio path must remain inside the package.");
  await copyFile(original, copy);
}
const json = (file, data) =>
  writeFile(resolve(out, file), JSON.stringify(data, null, 2) + "\n", { flag: "wx" });
await json("manifest.json", { version: 1, clips: selected });
await json("selection-audit.json", selected.map((clip) => {
  const review = reviews.get(clip.id);
  const transcript = chirp.get(clip.id).transcript;
  return {
    clipId: clip.id, targets: clip.targets, originalReference: clip.reference,
    reviewedReference: review?.reference ?? null, reviewQuality: review?.quality ?? "unreviewed",
    chirpOriginalTranscript: transcript, chirpWordCount: wordCount(transcript),
  };
}));
console.log(`${selected.length} clips selected from ${manifest.clips.length} (all successful Chirp 3 outputs shorter than three words)`);
