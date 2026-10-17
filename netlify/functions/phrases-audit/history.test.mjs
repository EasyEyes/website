import assert from "node:assert/strict";
import test from "node:test";
import { listReviewRuns } from "./history.mjs";

test("keeps recent runs and finds a completed report beyond the first page", async () => {
  const pages = [
    [
      { id: "active", status: "running" },
      { id: "failed", status: "failed" },
    ],
    [{ id: "old", status: "completed" }],
  ];
  const cursors = [];
  const result = await listReviewRuns(async (cursor) => {
    cursors.push(cursor);
    return pages.shift();
  }, 2);
  assert.deepEqual(
    result.map((run) => run.id),
    ["active", "failed", "old"],
  );
  assert.deepEqual(cursors, [null, "failed"]);
});

test("stops at the first page containing a completed report", async () => {
  let calls = 0;
  const runs = [{ id: "done", status: "completed" }];
  assert.deepEqual(
    await listReviewRuns(async () => {
      calls++;
      return runs;
    }),
    runs,
  );
  assert.equal(calls, 1);
});

test("returns recent runs when there is no completed report", async () => {
  assert.deepEqual(await listReviewRuns(async () => []), []);
});
