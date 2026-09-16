import assert from "node:assert/strict";
import test from "node:test";

import boxApi from "../functions/box-api/index.mts";
import compilerDeploymentWebhook from "../functions/compiler-deployment-webhook/index.mts";
import emailVerification from "../functions/email-verification/index.mts";
import githubStats from "../functions/github-stats/index.mts";
import glossary from "../functions/glossary/index.mts";
import phrases from "../functions/phrases/index.mts";
import prolific from "../functions/prolific/index.mts";
import studioAssistant from "../functions/studio-assistant/index.mts";
import translatePhraseFile from "../functions/translate-phrase-file/index.mts";

const context = {} as never;

const preflight = (name: string) =>
  new Request(`https://easyeyes.app/.netlify/functions/${name}`, {
    method: "OPTIONS",
    headers: { Origin: "https://easyeyes.app" },
  });

test("compatibility wrappers return web-standard preflight responses", async () => {
  const cases = [
    ["box-api", boxApi, 200],
    ["email-verification/send", emailVerification, 200],
    ["github-stats", githubStats, 200],
    ["glossary", glossary, 204],
    ["phrases", phrases, 204],
    ["prolific", prolific, 200],
    ["studio-assistant", studioAssistant, 204],
    ["translate-phrase-file", translatePhraseFile, 204],
  ] as const;

  for (const [name, handler, expectedStatus] of cases) {
    const response = await handler(preflight(name), context);
    assert.equal(response.status, expectedStatus, name);
    if (expectedStatus === 204) {
      assert.equal(await response.text(), "", name);
    }
  }
});

test("native modern handler returns a Response", async () => {
  const response = await compilerDeploymentWebhook(
    preflight("compiler-deployment-webhook"),
  );
  assert.ok(response instanceof Response);
});
