import test from "node:test";
import assert from "node:assert/strict";
import { readManifest, readResults, compareVectors, summarizeFiles } from "./fileMetrics.mjs";

test("distinguishes missed correct targets from false credit", () => {
  assert.deepEqual(compareVectors([1, 1, 0], [1, 0, 1]),
    { falsePos: [2], falseNeg: [1], exact: false });
  assert.throws(() => compareVectors([1, 1], [1]));
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
});
