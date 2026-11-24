import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { Response as UpstreamResponse } from "node-fetch";

import prolific, {
  createProlificHandler,
  prolificUpstreamFetch,
  responseWrapper,
} from "../functions/prolific/index.mts";

const projectUrl =
  "https://easyeyes.app/.netlify/functions/prolific/projects/62fce6fff0a78eb4f3ebc09c/";

test("Prolific project details require the connected account's token", async () => {
  const response = await prolific(new Request(projectUrl));
  assert.equal(response.status, 401);
});

test("Prolific project details expose just the title and matching owner's email", async () => {
  const handler = createProlificHandler(async (url, options) => {
    assert.equal(
      url,
      "https://api.prolific.com/api/v1/projects/62fce6fff0a78eb4f3ebc09c/",
    );
    assert.deepEqual(options?.headers, { authorization: "Token test-token" });
    return new UpstreamResponse(
      JSON.stringify({
        title: "Vision studies",
        owner: "creator",
        users: [
          { id: "other", email: "collaborator@example.test" },
          { id: "creator", email: "owner@example.test" },
        ],
      }),
    );
  });
  const response = await handler(
    new Request(projectUrl, {
      headers: { Authorization: "Token test-token", Cookie: "ignored=test" },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), {
    title: "Vision studies",
    ownerEmail: "owner@example.test",
  });
});

test("Prolific project details stay hidden when Prolific denies access", async () => {
  const handler = createProlificHandler(
    async () =>
      new UpstreamResponse(JSON.stringify({ detail: "Project not found" }), {
        status: 404,
      }),
  );
  const response = await handler(
    new Request(projectUrl, {
      headers: { Authorization: "Token test-token" },
    }),
  );
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {});
});

test("Prolific proxy exposes Retry-After to the browser", () => {
  const headers = new Headers({ "Retry-After": "7" });
  const result = responseWrapper(429, { error: "slow down" }, headers);
  assert.equal(result.statusCode, 429);
  assert.equal(result.headers["Retry-After"], "7");
  assert.equal(result.headers["Access-Control-Expose-Headers"], "Retry-After");
  assert.deepEqual(JSON.parse(result.body), { error: "slow down" });
});

test("Prolific upstream requests abort after 15 seconds", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const stalled = (_url: string, options: any) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () =>
        reject(new DOMException("The operation was aborted", "AbortError")),
      );
    });

  try {
    const promise = prolificUpstreamFetch(
      "https://api.prolific.com/api/v1/users/me/",
      {},
      stalled as any,
    );
    const rejection = assert.rejects(promise, /aborted/i);
    mock.timers.tick(15_000);
    await rejection;
  } finally {
    mock.timers.reset();
  }
});
