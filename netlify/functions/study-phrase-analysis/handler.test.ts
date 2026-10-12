import test from "node:test";
import assert from "node:assert/strict";
import { createStudyPhraseAnalysisHandler } from "./handler";

const fingerprint = "b".repeat(64);
const index = {
  schemaVersion: 2,
  fingerprint,
  parseFailures: [],
  coverage: { limitations: ["Caller entry unresolved"] },
  sites: [
    {
      id: "s:1",
      file: "source.js",
      line: 1,
      keys: ["EE_test"],
      guards: [
        {
          truth: true,
          text: "enabled",
          expression: { kind: "parameter", name: "enabled" },
        },
      ],
    },
  ],
};
const handler = createStudyPhraseAnalysisHandler(index);
const request = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const input = {
  schemaVersion: 1,
  fingerprint,
  conditions: [{ name: "test", parameters: { enabled: true } }],
};
test("analyses configuration without executing source or claiming runtime entry", async () => {
  const response = await handler(request(input));
  assert.equal(response.status, 200);
  const report = await response.json();
  assert.deepEqual(report.candidateKeys, ["EE_test"]);
  assert.equal(report.sites[0].runtimeReachability, "unresolved");
  assert.equal(report.fullRuntimeAnswerAvailable, false);
});
test("excludes a locally disabled path without claiming whole-program exclusion", async () => {
  const report = await (
    await handler(
      request({
        ...input,
        conditions: [{ name: "test", parameters: { enabled: false } }],
      }),
    )
  ).json();
  assert.deepEqual(report.candidateKeys, []);
  assert.equal(report.sites[0].runtimeReachability, "unresolved");
});
test("rejects compiler and index version mismatch", async () => {
  assert.equal(
    (await handler(request({ ...input, fingerprint: "c".repeat(64) }))).status,
    409,
  );
});
test("rejects malformed inputs and excessive conditions", async () => {
  for (const conditions of [
    [],
    Array(257).fill(input.conditions[0]),
    [{ name: "x", parameters: { enabled: { execute: "code" } } }],
    null,
  ])
    assert.equal(
      (await handler(request({ ...input, conditions }))).status,
      400,
    );
});
test("rejects unsupported methods and malformed JSON", async () => {
  assert.equal(
    (await handler(new Request("http://localhost/api"))).status,
    405,
  );
  assert.equal(
    (
      await handler(
        new Request("http://localhost/api", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        }),
      )
    ).status,
    400,
  );
});
test("does not use an incomplete index", async () => {
  const unavailable = createStudyPhraseAnalysisHandler({
    ...index,
    parseFailures: [{ file: "bad.js" }],
  });
  assert.equal((await unavailable(request(input))).status, 503);
});
