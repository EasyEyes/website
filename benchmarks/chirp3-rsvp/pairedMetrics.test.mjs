import assert from "node:assert/strict";
import test from "node:test";
import { summarizePairs } from "./pairedMetrics.mjs";

const makeRun = (scenario, google, deepgram, options = {}) => {
  const intended = scenario === "pairedCorrect" ? "coat ducks stone" : "cold ducks stone";
  return {
    scenario,
    intended,
    actuallySaid: intended,
    durationSec: 0.7,
    settings: { keyterms: true, ignoreOrder: true },
    score: google && { vector: google },
    comparison: { score: deepgram && { vector: deepgram }, sameInput: true },
    ...options,
  };
};

test("paired metrics separate false credit from missed spoken targets", () => {
  const [group] = summarizePairs([
    makeRun("pairedCorrect", [1, 1, 1], [0, 1, 1]),
    makeRun("pairedWrongFirst", [0, 0, 1], [1, 1, 1]),
  ]);
  assert.equal(group.correctRuns, 1);
  assert.equal(group.wrongFirstRuns, 1);
  assert.deepEqual(group.chirp3, { correctWords: 3, falseFirstCredit: 0, laterMisses: 1 });
  assert.deepEqual(group.deepgram, { correctWords: 2, falseFirstCredit: 1, laterMisses: 0 });
});

test("requires self-confirmation and matched successful results", () => {
  const groups = summarizePairs([
    makeRun("pairedCorrect", [1, 1, 1], [1, 1, 1], { actuallySaid: null }),
    makeRun("pairedCorrect", [1, 1, 1], [1, 1, 1], { actuallySaid: "coat stone" }),
    makeRun("pairedWrongFirst", [0, 1, 1], null),
    makeRun("pairedWrongFirst", [0, 1, 1], null, { comparison: { score: { vector: [0, 1, 1] }, sameInput: false } }),
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].excluded, 2);
  assert.equal(groups[0].correctRuns + groups[0].wrongFirstRuns, 0);
});
