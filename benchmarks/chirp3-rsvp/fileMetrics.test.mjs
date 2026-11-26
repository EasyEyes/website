import test from "node:test";
import assert from "node:assert/strict";
import { readManifest, readResults, compareVectors, summarizeFiles, summarizeKeytermPairs, summarizeProviderAgreement, summarizeReviews, summarizeSpeakers } from "./fileMetrics.mjs";
import { buildReviewQueue, manifestKey, readReviews } from "./fileReview.mjs";

test("review filters include every imported model except diagnostic tails", () => {
  const clips = ["repeat", "format", "order", "failed", "empty", "missing", "excluded"].map((id) =>
    ({ id, reference: "boat lake", expected: [1, 1] }));
  const rows = (values) => new Map(clips.flatMap(({ id }, index) =>
    values[index] === undefined ? [] : [[id, typeof values[index] === "string"
      ? { transcript: values[index] } : { error: "unavailable" }]]));
  const standard = rows(clips.map(() => "Boat, lake!"));
  const short = rows(["boat boat lake", "BOAT LAKE", "lake boat", false, "", undefined]);
  const eleven = rows(clips.map(() => "boat  lake"));
  const results = new Map([
    ["Chirp 3 SHORT", short], ["Chirp 3", standard], ["ElevenLabs Scribe v2", eleven],
    ["Chirp 3 · tail 800 ms", rows(clips.map(() => "other"))],
    ["Gemini Live", rows(["boat lake", "boat", "Boat lake", "boat lake", "boat lake", "boat", "boat"])],
  ]);
  const tokenizer = (text) => text.toLowerCase().match(/[a-z]+/g) ?? [];
  const reviews = new Map([["excluded", { quality: "unclear" }], ["format", {
    quality: "clear", providerReviews: [{ provider: "Gemini Live", transcript: "boat", deletion: true, note: "lake" }],
  }]]);
  const d = (clipId, provider, falseNeg, falsePos = []) => ({
    clipId, provider, differences: { exact: falseNeg.length + falsePos.length === 0, falseNeg, falsePos },
  });
  const details = [d("format", "Gemini Live", [1]), d("format", "Chirp 3", []),
    d("format", "Chirp 3 SHORT", []), d("format", "ElevenLabs Scribe v2", []),
    d("missing", "Gemini Live", [1], [0])];
  const get = (q, filter) => q.lists.get(filter).map(({ id }) => id);
  const global = buildReviewQueue(clips, results, details, reviews, "", tokenizer);
  assert.equal(global.compared, 4);
  assert.deepEqual(get(global, "transcript-disagreement"), ["repeat", "format", "order", "empty"]);
  assert.deepEqual(get(global, "model-disagreement"), ["repeat", "format", "order", "empty"]);
  assert.deepEqual(get(global, "short"), ["format", "empty", "missing"]);
  const focus = buildReviewQueue(clips, results, details, reviews, "Gemini Live", tokenizer);
  assert.deepEqual(get(focus, "short"), ["format", "missing"]);
  assert.deepEqual(get(focus, "pending-short"), ["missing"]);
  assert.deepEqual(get(focus, "confirmed"), ["format"]);
  assert.deepEqual(get(focus, "exclusive"), ["format"]);
  assert.deepEqual(get(focus, "missed"), ["format", "missing"]);
  assert.deepEqual(get(focus, "false-credit"), ["missing"]);
  assert.equal(focus.annotations[0].annotation.note, "lake");
  assert.equal(focus.summaries.find((s) => s.provider === "Gemini Live").wordGap, 2);
});

test("annotations round-trip without altering the original score and are tied to the current result", () => {
  const clip = { id: "one", file: "one.wav", reference: "a b", targets: ["a", "b"], expected: [1, 1] };
  const row = { clipId: "one", quality: "clear", predictions: [], note: "clip context",
    providerReviews: [{ provider: "Gemini", transcript: "a", deletion: false, note: "checked" }] };
  const data = JSON.parse(JSON.stringify({ manifestKey: manifestKey([clip]), reviews: [row] }));
  const reviews = readReviews(data, [clip]);
  assert.deepEqual(reviews.get("one"), row);
  const results = new Map([["Gemini", new Map([["one", { transcript: "a b" }]])]]);
  const queue = buildReviewQueue([clip], results, [], reviews, "Gemini", (text) => text.split(" "));
  assert.equal(queue.summaries[0].checked, 0);
  assert.equal(queue.annotations.length, 1);
  assert.equal(queue.annotations[0].annotation.note, "clip context");
  data.reviews[0].providerReviews[0].transcript = null;
  assert.throws(() => readReviews(data, [clip]), /provider annotation/);
});

test("distinguishes missed correct targets from false credit", () => {
  assert.deepEqual(compareVectors([1, 1, 0], [1, 0, 1]),
    { falsePos: [2], falseNeg: [1], exact: false });
  assert.throws(() => compareVectors([1, 1], [1]));
});

test("agreement excludes whole trials on any disagreement, not on provider failure alone", () => {
  const clips = ["agree", "disagree", "failed"].map((id) =>
    ({ id, expected: [1, 0, 1], targetSource: "explicit" }));
  const row = (clip, provider, vector) => ({
    clipId: clip.id, provider, vector, differences: compareVectors(clip.expected, vector),
  });
  const [a, d, f] = clips;
  const details = [row(a, "A", [0, 1, 1]), row(a, "B", [0, 1, 1]),
    row(d, "A", [1, 0, 1]), row(d, "B", [0, 0, 1]), row(f, "A", [1, 0, 1]),
    { clipId: f.id, provider: "B", vector: null, error: "transcriberFailure" },
    { clipId: d.id, provider: "C", vector: null, error: "transcriberFailure" }];
  const result = summarizeProviderAgreement(clips, details, "A", "B");
  assert.deepEqual([result.eligible, result.paired, result.rejected, result.rejectedTargets], [3, 2, 1, 3]);
  assert.deepEqual([result.first.falseNeg, result.second.falseNeg], [1, 2]);
  assert.deepEqual([result.accepted.positives, result.accepted.negatives,
    result.accepted.falseNeg, result.accepted.falsePos], [2, 1, 1, 1]);
  assert.equal(summarizeProviderAgreement(clips, details, "A", "C").paired, 0);
});

test("review preserves raw counts, fixes reference and scoring separately, and excludes by quality", () => {
  const score = (targets, transcript) => ({
    vector: targets.map((target) => Number(transcript.split(" ").includes(target))),
  });
  const clips = [
    { id: "a", reference: "cat", expected: [1, 0], speakerGroup: "p1" },
    { id: "b", reference: "cat", expected: [1, 0], speakerGroup: "p1" },
    { id: "c", reference: "cat", expected: [1, 0], speakerGroup: "p2" },
    { id: "d", reference: "cat", expected: [1, 0], speakerGroup: "p2" },
    { id: "e", reference: "cat", expected: [1, 0], speakerGroup: "p2" },
    { id: "f", reference: "cat", expected: [1, 0] },
  ].map((x) => ({ ...x, file: x.id + ".wav", targets: ["cat", "dog"], targetSource: "explicit" }));
  const p = "Chirp";
  const results = readResults({ version: 1, results: [
    { clipId: "a", provider: p, transcript: "dog" },
    { clipId: "b", provider: p, transcript: "dog" },
    { clipId: "c", provider: p, transcript: "cat dog" },
    { clipId: "d", provider: p, error: "timeout" },
    { clipId: "f", provider: p, transcript: "" },
  ] }, clips);
  const data = { manifestKey: manifestKey(clips), reviews: [
    { clipId: "a", quality: "clear", reference: "dog", predictions: [] },
    { clipId: "b", quality: "difficult", predictions: [{ provider: p, transcript: "dog", ignoreOrder: true, bits: [null, 0] }] },
    { clipId: "c", quality: "unclear", predictions: [] },
    { clipId: "e", quality: "invalid", predictions: [] },
  ] };
  const reviews = readReviews(data, clips);
  const { reports, quality } = summarizeReviews(clips, results, score, reviews, true);
  const view = (report) => {
    const [s] = report.summary;
    return [s.clips, s.returned, s.failed, s.missing, s.truePos, s.trueNeg, s.falseNeg, s.falsePos];
  };
  assert.deepEqual(view(reports.original), [6, 4, 1, 1, 1, 1, 3, 3]);
  assert.deepEqual(view(reports.adjudicated), [4, 3, 1, 0, 1, 3, 2, 0]);
  assert.deepEqual(view(reports.unflagged), [3, 2, 1, 0, 1, 2, 1, 0]);
  assert.deepEqual(quality, { unreviewed: 2, clear: 1, difficult: 1, unclear: 1, invalid: 1, corrected: 1 });
  assert.deepEqual(reports.adjudicated.details.find((r) => r.clipId === "b").automaticVector, [0, 1]);
  assert.equal(summarizeReviews(clips, results, score, reviews, false).reports.adjudicated.summary[0].falsePos, 1);
  const speakers = summarizeSpeakers(reports.adjudicated.clips, reports.adjudicated.details, [p]);
  assert.deepEqual(speakers.map((s) => [s.speaker, s.returned, s.failed, s.falseNeg]), [["p1", 2, 0, 1], ["p2", 0, 1, 0]]);
  assert.throws(() => readReviews(data, clips.map((c) => ({ ...c, reference: "different" }))));
  assert.equal(readReviews({}, clips).size, 0);
});

test("manifest accepts references in bulk without workflow flags and validates optional targets", () => {
  const clip = { id: "a", file: "a.wav", reference: "toy", targets: ["toys"] };
  const manifest = readManifest({ version: 1, clips: [clip], audioPolicy: "local-only" });
  assert.deepEqual(manifest.clips, [clip]);
  assert.throws(() => readManifest({ version: 1, clips: [clip, { ...clip, id: "b" }] }));
  assert.throws(() => readManifest({ version: 1, clips: [{ ...clip, id: 1 }] }));
  assert.throws(() => readManifest({ version: 1, clips: [{ ...clip, targets: [] }] }));
  assert.throws(() => readResults({ version: 1, results: [{ clipId: "unknown", provider: "test", transcript: "" }] }, manifest.clips));
});

test("provider percentages use the same successful clips, excluding errors but counting successful silence", () => {
  const clips = [
    { id: "first", reference: "boat lake money", targets: ["boat", "lake", "morning"], expected: [1, 1, 0], targetSource: "explicit" },
    { id: "second", reference: "cat", targets: ["cat"], expected: [1], targetSource: "reference" },
    { id: "third", reference: "dog", targets: ["dog"], expected: [1], targetSource: "reference" },
  ];
  const providers = readResults({ version: 1, results: [
    { clipId: "first", provider: "A", transcript: "boat lake morning" },
    { clipId: "first", provider: "B", transcript: "boat lake money" },
    { clipId: "second", provider: "A", transcript: "" },
    { clipId: "second", provider: "B", transcript: "cat" },
    { clipId: "third", provider: "A", error: "timeout" },
    { clipId: "third", provider: "B", transcript: "dog" },
  ] }, clips);
  const score = (targets, transcript) => ({
    vector: targets.map((target) => Number(transcript.split(" ").includes(target))),
  });
  const result = summarizeFiles(clips, providers, score);
  assert.deepEqual(result.summary.map((row) => [row.paired, row.positives, row.negatives, row.falseNeg, row.falsePos, row.exact, row.failed]), [
    [2, 3, 1, 1, 1, 0, 1], [2, 3, 1, 0, 0, 2, 0],
  ]);
  assert.equal(result.summary[1].allReturned.exact, 3);
  const [pair] = summarizeKeytermPairs(clips, result.details, [{ provider: "Test", off: "A", on: "B" }]);
  assert.equal(pair.paired, 2);
  assert.equal(pair.without.falseNeg, 1);
  assert.equal(pair.without.falsePos, 1);
  assert.equal(pair.withTerms.exact, 2);
});
