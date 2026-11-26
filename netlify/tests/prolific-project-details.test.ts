import assert from "node:assert/strict";
import test from "node:test";
import { Response as UpstreamResponse } from "node-fetch";

import { createProjectDetailsHandler } from "../functions/prolific-project-details/index.mts";

const projectId = "62fce6fff0a78eb4f3ebc09c";
const projectUrl = `https://easyeyes.app/.netlify/functions/prolific-project-details?projectId=${projectId}`;
const authorization = "Token test-token";

test("project details require a token and a usable project ID", async () => {
  const handler = createProjectDetailsHandler(async () => {
    assert.fail("Invalid requests must not reach Prolific");
  });

  assert.equal((await handler(new Request(projectUrl))).status, 401);
  for (const id of ["", " ", ".", ".."]) {
    const url = new URL(projectUrl);
    url.searchParams.set("projectId", id);
    const response = await handler(
      new Request(url, { headers: { authorization } }),
    );
    assert.equal(response.status, 400);
  }
  const url = new URL(projectUrl);
  url.searchParams.delete("projectId");
  const response = await handler(new Request(url, { headers: { authorization } }));
  assert.equal(response.status, 400);
});

test("project details encode an opaque project ID as one URL segment", async () => {
  const url = new URL(projectUrl);
  url.searchParams.set("projectId", "project-v2?#%");
  const handler = createProjectDetailsHandler(async (upstreamUrl) => {
    assert.equal(
      upstreamUrl,
      "https://api.prolific.com/api/v1/projects/project-v2%3F%23%25/",
    );
    return new UpstreamResponse(JSON.stringify({ title: "Vision studies" }));
  });

  const response = await handler(new Request(url, { headers: { authorization } }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { title: "Vision studies" });
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
