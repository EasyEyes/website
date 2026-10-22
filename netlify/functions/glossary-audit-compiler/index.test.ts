import test from "node:test";
import assert from "node:assert/strict";
import handler from "./index.mts";

test("native compiler endpoint returns a Response and rejects writes", async () => {
  const response = await handler(
    new Request("https://localhost/compiler", { method: "POST" }),
  );
  assert.ok(response instanceof Response);
  assert.equal(response.status, 405);
});
test("missing credentials fail closed without a Firestore read", async () => {
  const response = await handler(new Request("https://localhost/compiler"));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "Glossary audit unavailable",
  });
});
