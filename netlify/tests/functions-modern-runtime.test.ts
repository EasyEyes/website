import assert from "node:assert/strict";
import test from "node:test";

import boxApi from "../functions/box-api/index.mts";
import compilerDeploymentWebhook from "../functions/compiler-deployment-webhook/index.mts";
import emailVerification from "../functions/email-verification/index.mts";
import githubStats from "../functions/github-stats/index.mts";
import glossary from "../functions/glossary/index.mts";
import phrases from "../functions/phrases/index.mts";
import prolific from "../functions/prolific/index.mts";
import translatePhraseFile from "../functions/translate-phrase-file/index.mts";

const context = {} as never;

const preflight = (name: string) =>
  new Request(`https://easyeyes.app/.netlify/functions/${name}`, {
    method: "OPTIONS",
    headers: { Origin: "https://easyeyes.app" },
  });

test("native handlers return web-standard preflight responses", async () => {
  const cases = [
    ["box-api", boxApi, 200],
    ["email-verification/send", emailVerification, 200],
    ["github-stats", githubStats, 200],
    ["glossary", glossary, 204],
    ["phrases", phrases, 204],
    ["prolific", prolific, 200],
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

test("native handlers preserve representative request and response behavior", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("/repos/EasyEyes/threshold")) {
      return Response.json({
        stargazers_count: 123,
        license: { spdx_id: "MIT" },
      });
    }
    if (url.includes("/repos/EasyEyes/website/commits")) {
      return Response.json([{ html_url: "https://example.test/commit" }]);
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    const githubResponse = await githubStats(
      new Request("https://easyeyes.app/.netlify/functions/github-stats"),
      context,
    );
    assert.equal(githubResponse.status, 200);
    assert.deepEqual(await githubResponse.json(), {
      available: true,
      stars: 123,
      license: "MIT",
      lastCommitUrl: "https://example.test/commit",
    });

    const cases = [
      [
        boxApi,
        new Request("https://easyeyes.app/.netlify/functions/box-api", {
          method: "POST",
          body: JSON.stringify({}),
        }),
        400,
      ],
      [
        emailVerification,
        new Request(
          "https://easyeyes.app/.netlify/functions/email-verification/unknown",
          { method: "POST", body: "{}" },
        ),
        404,
      ],
      [
        glossary,
        new Request("https://easyeyes.app/.netlify/functions/glossary", {
          method: "PUT",
          body: "not-json",
        }),
        400,
      ],
      [
        phrases,
        new Request("https://easyeyes.app/.netlify/functions/phrases", {
          method: "DELETE",
        }),
        405,
      ],
      [
        prolific,
        new Request("https://easyeyes.app/.netlify/functions/prolific/unknown"),
        404,
      ],
      [
        translatePhraseFile,
        new Request(
          "https://easyeyes.app/.netlify/functions/translate-phrase-file",
        ),
        405,
      ],
    ] as const;

    for (const [handler, request, expectedStatus] of cases) {
      const response = await handler(request, context);
      assert.equal(response.status, expectedStatus, request.url);
      await assert.doesNotReject(() => response.json());
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
