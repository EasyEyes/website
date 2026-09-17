import test from "node:test";
import assert from "node:assert/strict";
import {
  createEngineReleaseWebhook,
  deploymentIdentity,
} from "../dispatch.mjs";
const id = "a".repeat(24);
const website = "b".repeat(40);
const scientist = "c".repeat(40);
const threshold = "d".repeat(40);
const deploy = {
  id,
  site_id: "site",
  state: "ready",
  commit_ref: website,
  context: "branch-deploy",
  deploy_ssl_url: `https://${id}--easyeyes.netlify.app`,
  created_at: "2026-09-14T10:00:00Z",
  branch: "feature/example",
};
const env = {
  ENGINE_RELEASE_SITE_ID: "site",
  ENGINE_RELEASE_GITHUB_TOKEN: "github-secret",
  ENGINE_RELEASE_NETLIFY_TOKEN: "netlify-secret",
};
const request = () =>
  new Request("https://easyeyes.app/hook", {
    method: "POST",
    body: JSON.stringify({ id, context: "production", branch: "forged" }),
  });
function harness({
  deployment = deploy,
  published = false,
  signature = true,
  gitlink = threshold,
} = {}) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.startsWith("https://api.netlify.com/"))
      return Response.json(deployment);
    if (url.includes("/.netlify/functions/release-manifest"))
      return published
        ? Response.json({})
        : new Response(null, { status: 404 });
    if (url.includes("/website/contents/"))
      return Response.json({
        type: "file",
        sha: scientist,
        submodule_git_url:
          "https://github.com/EasyEyes/threshold-scientist.git",
      });
    if (url.includes("/threshold-scientist/contents/"))
      return Response.json({
        type: "submodule",
        sha: gitlink,
        submodule_git_url: "https://github.com/EasyEyes/threshold.git",
      });
    if (url.endsWith("/repos/EasyEyes/threshold"))
      return Response.json({ default_branch: "main" });
    if (url.endsWith("/dispatches")) return new Response(null, { status: 204 });
    throw new Error(`Unexpected URL: ${url}`);
  };
  return {
    calls,
    handler: createEngineReleaseWebhook({
      env,
      fetchImpl,
      verifySignature: () => signature,
    }),
  };
}
test("dispatches exact nested gitlink and immutable preview URL using authoritative metadata", async () => {
  const { handler, calls } = harness();
  assert.equal((await handler(request())).status, 200);
  const dispatch = calls.find(({ url }) => url.endsWith("/dispatches"));
  const body = JSON.parse(dispatch.options.body);
  assert.equal(body.ref, "main");
  assert.equal(body.inputs.source_sha, threshold);
  assert.equal(body.inputs.deployment_url, deploy.deploy_ssl_url);
  assert.equal(body.inputs.deploy_context, "branch-deploy");
  assert.equal(body.inputs.website_branch, "feature/example");
  assert.ok(calls.some(({ url }) => url.includes(`ref=${website}`)));
  assert.ok(calls.some(({ url }) => url.includes(`ref=${scientist}`)));
});
test("production and PR contexts are classified independently of engine branch", () => {
  assert.equal(
    deploymentIdentity({ ...deploy, context: "production" }, "site").production,
    true,
  );
  assert.equal(
    deploymentIdentity({ ...deploy, context: "deploy-preview" }, "site")
      .production,
    false,
  );
});
test("duplicate successful publication does not dispatch again", async () => {
  const { handler, calls } = harness({ published: true });
  assert.equal((await handler(request())).status, 200);
  assert.equal(calls.length, 2);
});
test("unsigned notifications cannot make network calls", async () => {
  const { handler, calls } = harness({ signature: false });
  assert.equal((await handler(request())).status, 403);
  assert.equal(calls.length, 0);
});
test("rejects other sites, unfinished deploys, mutable URLs, and unexpected gitlinks", async () => {
  for (const override of [
    { site_id: "other" },
    { state: "building" },
    { deploy_ssl_url: "https://easyeyes.app" },
  ]) {
    const { handler, calls } = harness({
      deployment: { ...deploy, ...override },
    });
    assert.equal((await handler(request())).status, 502);
    assert.ok(!calls.some(({ url }) => url.endsWith("/dispatches")));
  }
  const { handler, calls } = harness({ gitlink: "invalid" });
  assert.equal((await handler(request())).status, 502);
  assert.ok(!calls.some(({ url }) => url.endsWith("/dispatches")));
});
test("rejects invalid methods, malformed JSON and oversized requests", async () => {
  const { handler, calls } = harness();
  assert.equal(
    (await handler(new Request("https://easyeyes.app/hook"))).status,
    405,
  );
  assert.equal(
    (
      await handler(
        new Request("https://easyeyes.app/hook", { method: "POST", body: "{" }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handler(
        new Request("https://easyeyes.app/hook", {
          method: "POST",
          body: "x".repeat(65537),
        }),
      )
    ).status,
    413,
  );
  assert.equal(calls.length, 0);
});
