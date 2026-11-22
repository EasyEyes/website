import test from "node:test";
import assert from "node:assert/strict";
import { readManifest, readResults, compareWords, summarizeFiles } from "./fileMetrics.mjs";

test("compares what was said, reporting the final missing word and extra speech", () => {
  const score = compareWords("Boat, lake morning.", "boat lake");
  assert.equal(score.match, 2);
  assert.equal(score.delete, 1);
  assert.deepEqual(score.alignment.at(-1), { op: "delete", index: 2, expected: "morning", heard: null });
  assert.equal(compareWords("boat lake", "boat lake morning").insert, 1);
  assert.equal(compareWords("boat lake money", "boat lake morning").substitute, 1);
  assert.equal(compareWords("I don’t know", "i don't know").match, 3);
});

test("manifest defaults to local-only and protects joins from duplicate ids or filenames", () => {
  const clip = { id: "a", file: "a.wav", reference: "toy" };
  const manifest = readManifest({ version: 1, clips: [clip] });
  assert.equal(manifest.audioPolicy, "local-only");
  assert.equal(manifest.clips[0].referenceStatus, "candidate");
  assert.throws(() => readManifest({ version: 1, clips: [clip, { ...clip, id: "b" }] }));
  assert.throws(() => readManifest({ version: 1, clips: [{ ...clip, id: 1 }] }));
  assert.throws(() => readResults({ version: 1, results: [{ clipId: "unknown", provider: "test", transcript: "" }] }, manifest.clips));
});

test("provider percentages use the same reviewed clips, excluding errors but counting successful silence", () => {
  const clips = [
    { id: "first", reference: "boat lake morning", referenceStatus: "reviewed" },
    { id: "second", reference: "cat", referenceStatus: "reviewed" },
    { id: "third", reference: "dog", referenceStatus: "reviewed" },
    { id: "unreviewed", reference: "rose", referenceStatus: "candidate" },
  ];
  const providers = readResults({ version: 1, results: [
    { clipId: "first", provider: "A", transcript: "boat lake" },
    { clipId: "first", provider: "B", transcript: "boat lake morning" },
    { clipId: "second", provider: "A", transcript: "" },
    { clipId: "second", provider: "B", transcript: "cat" },
    { clipId: "third", provider: "A", error: "timeout" },
    { clipId: "third", provider: "B", transcript: "dog" },
    { clipId: "unreviewed", provider: "B", transcript: "rose" },
  ] }, clips);
  const result = summarizeFiles(clips, providers);
  assert.deepEqual(result.summary.map((row) => [row.paired, row.words, row.match, row.delete, row.exact, row.failed]), [
    [2, 4, 2, 2, 0, 1], [2, 4, 4, 0, 2, 0],
  ]);
  assert.deepEqual(result.summary[0].byPosition.last, { count: 2, omitted: 2, errors: 2 });
});
