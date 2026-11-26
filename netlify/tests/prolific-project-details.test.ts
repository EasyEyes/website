import assert from "node:assert/strict";
import test from "node:test";
import { Response as UpstreamResponse } from "node-fetch";

import { createProjectDetailsHandler } from "../functions/prolific-project-details/index.mts";

const projectId = "62fce6fff0a78eb4f3ebc09c";
const projectUrl = `https://easyeyes.app/.netlify/functions/prolific-project-details?projectId=${projectId}`;
const authorization = "Token test-token";

test("project details require a token and a valid project ID", async () => {
  const handler = createProjectDetailsHandler(async () => {
    assert.fail("Invalid requests must not reach Prolific");
  });

  assert.equal((await handler(new Request(projectUrl))).status, 401);
  const invalidRequest = new Request(
    projectUrl.replace(projectId, "workspace-e2e"),
    {
      headers: { authorization },
    },
  );
  assert.equal((await handler(invalidRequest)).status, 400);
});

test("project details return the title and matched owner email using the caller's token", async () => {
  const handler = createProjectDetailsHandler(async (url, options) => {
    assert.equal(url, `https://api.prolific.com/api/v1/projects/${projectId}/`);
    assert.deepEqual(options?.headers, { authorization });
    return new UpstreamResponse(
      JSON.stringify({
        title: "Vision studies",
        owner: "owner-id",
        users: [
          { id: "collaborator-id", email: "collaborator@example.test" },
          { id: "owner-id", email: "owner@example.test" },
        ],
      }),
    );
  });

  const response = await handler(
    new Request(projectUrl, {
      headers: { authorization, cookie: "ignored=test" },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), {
    title: "Vision studies",
    ownerEmail: "owner@example.test",
  });
});

test("project details preserve 404 and 429 responses without exposing the upstream body", async () => {
  for (const { status, retryAfter } of [
    { status: 404, retryAfter: null },
    { status: 429, retryAfter: "7" },
  ]) {
    const handler = createProjectDetailsHandler(
      async () =>
        new UpstreamResponse(JSON.stringify({ detail: "Provider error" }), {
          status,
          headers: retryAfter ? { "Retry-After": retryAfter } : {},
        }),
    );
    const response = await handler(
      new Request(projectUrl, { headers: { authorization } }),
    );
    assert.equal(response.status, status);
    assert.equal(response.headers.get("Retry-After"), retryAfter);
    assert.deepEqual(await response.json(), {});
  }
});
