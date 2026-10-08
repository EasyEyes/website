import assert from "node:assert/strict";
import test from "node:test";

import boxApi from "../functions/box-api/index.mts";
import compilerDeploymentWebhook from "../functions/compiler-deployment-webhook/index.mts";
import emailVerification from "../functions/email-verification/index.mts";
import formspreeQuota from "../functions/formspree-quota/index.mjs";
import githubStats from "../functions/github-stats/index.mts";
import glossary from "../functions/glossary/index.mts";
import mediaAuth from "../functions/media-auth/index.ts";
import phrases from "../functions/phrases/index.mts";
import prolific from "../functions/prolific/index.mts";
import speechToken from "../functions/speech-token/index.ts";
import studioAssistant from "../functions/studio-assistant/index.ts";
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
    ["formspree-quota", formspreeQuota, 200],
    ["github-stats", githubStats, 200],
    ["glossary", glossary, 204],
    ["media-auth", mediaAuth, 204],
    ["phrases", phrases, 204],
    ["prolific", prolific, 200],
    ["speech-token", speechToken, 204],
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

test("Formspree quota keeps its available and unavailable response shapes", async () => {
  const originalKey = process.env.FORMSPREE_API_KEY;
  const originalFormId = process.env.FORMSPREE_FORM_ID;
  const originalQuota = process.env.FORMSPREE_MONTHLY_QUOTA;
  const originalFetch = globalThis.fetch;
  const request = new Request(
    "https://easyeyes.app/.netlify/functions/formspree-quota",
  );

  try {
    delete process.env.FORMSPREE_FORM_ID;
    delete process.env.FORMSPREE_MONTHLY_QUOTA;
    delete process.env.FORMSPREE_API_KEY;
    const unavailable = await formspreeQuota(request);
    assert.equal(unavailable.status, 200);
    assert.deepEqual(await unavailable.json(), {
      available: false,
      reason: "FORMSPREE_API_KEY not configured",
    });

    process.env.FORMSPREE_API_KEY = "test-key";
    globalThis.fetch = (async () =>
      Response.json([{ id: "submission-1" }])) as typeof fetch;
    const available = await formspreeQuota(request);
    assert.equal(available.status, 200);
    assert.deepEqual(await available.json(), {
      available: true,
      used: 1,
      limit: 20000,
      month: new Date().toISOString().slice(0, 7),
    });
  } finally {
    if (originalKey === undefined) delete process.env.FORMSPREE_API_KEY;
    else process.env.FORMSPREE_API_KEY = originalKey;
    if (originalFormId === undefined) delete process.env.FORMSPREE_FORM_ID;
    else process.env.FORMSPREE_FORM_ID = originalFormId;
    if (originalQuota === undefined) delete process.env.FORMSPREE_MONTHLY_QUOTA;
    else process.env.FORMSPREE_MONTHLY_QUOTA = originalQuota;
    globalThis.fetch = originalFetch;
  }
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
        mediaAuth,
        new Request("https://easyeyes.app/.netlify/functions/media-auth", {
          method: "POST",
        }),
        401,
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
        speechToken,
        new Request("https://easyeyes.app/.netlify/functions/speech-token", {
          method: "POST",
          headers: { Origin: "https://run.pavlovia.org" },
          body: "{}",
        }),
        400,
      ],
      [
        studioAssistant,
        new Request(
          "https://easyeyes.app/.netlify/functions/studio-assistant",
          {
            method: "POST",
            headers: { Origin: "https://easyeyes.app" },
            body: "{}",
          },
        ),
        400,
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
