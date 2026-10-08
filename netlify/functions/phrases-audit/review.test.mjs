import assert from "node:assert/strict";
import test from "node:test";
import { reviewRun } from "./review.mjs";

const oldCommit = "a".repeat(40);
const currentCommit = "b".repeat(40);

test("review groups actionable keys first and links to exact source revisions", () => {
  const review = reviewRun({
    id: "run-1",
    status: "completed",
    report: {
      generatedAt: "2026-10-08T12:00:00Z",
      phraseUsage: {
        repositories: { threshold: { commit: currentCommit } },
        counts: { used: 664 },
        unused: ["EE_unverified", "EE_removed"],
      },
      missingFromSheet: {
        missing: {
          EE_missing: [
            { repository: "threshold", path: "components/foo.js", line: 12 },
          ],
        },
      },
      history: {
        keys: {
          EE_removed: {
            lastRemoval: { removedAt: "2026-08-27T20:18:36Z" },
            removalsByRepository: {
              threshold: {
                repository: "threshold",
                commit: oldCommit,
                removedAt: "2026-08-27T20:18:36Z",
                previousReferences: [{ path: "components/foo.js", line: 42 }],
              },
            },
          },
        },
      },
    },
  });
  const findings = review.findings;
  assert.deepEqual(
    findings.missing.map(({ key }) => key),
    ["EE_missing"],
  );
  assert.equal(
    findings.missing[0].references[0].url,
    `https://github.com/EasyEyes/threshold/blob/${currentCommit}/components/foo.js#L12`,
  );
  assert.equal(
    findings.removed[0].removals[0].previousReferences[0].url,
    `https://github.com/EasyEyes/threshold/blob/${oldCommit}%5E/components/foo.js#L42`,
  );
  assert.equal(
    findings.removed[0].removals[0].commitUrl,
    `https://github.com/EasyEyes/threshold/commit/${oldCommit}`,
  );
  assert.deepEqual(findings.unverified, [{ key: "EE_unverified" }]);
  assert.equal(findings.usedCount, 664);
});
