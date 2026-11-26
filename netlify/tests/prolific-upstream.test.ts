import assert from "node:assert/strict";
import test, { mock } from "node:test";

import {
  prolificUpstreamFetch,
  responseWrapper,
} from "../functions/prolific/index.mts";

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
