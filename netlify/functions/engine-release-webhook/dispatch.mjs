export function deploymentIdentity(deploy, siteId) {
  if (
    deploy.site_id !== siteId ||
    deploy.state !== "ready" ||
    !/^[a-f0-9]{24}$/.test(deploy.id ?? "") ||
    !/^[a-f0-9]{40}$/.test(deploy.commit_ref ?? "")
  )
    throw new Error("Invalid successful deployment");
  if (
    !["production", "branch-deploy", "deploy-preview"].includes(deploy.context)
  )
    throw new Error("Unsupported deployment context");
  const base = new URL(deploy.deploy_ssl_url);
  if (
    base.origin !== `https://${deploy.id}--easyeyes.netlify.app` ||
    base.pathname !== "/" ||
    base.search ||
    base.hash ||
    base.username ||
    base.password
  )
    throw new Error("Invalid immutable deployment URL");
  return {
    base: base.origin,
    production: deploy.context === "production",
  };
}

export function createEngineReleaseWebhook({
  env,
  verifySignature,
  fetchImpl = fetch,
}) {
  const github = async (path, options = {}) => {
    const response = await fetchImpl(`https://api.github.com${path}`, {
      ...options,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${env.ENGINE_RELEASE_GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok)
      throw new Error(`GitHub release request failed: ${response.status}`);
    return response.status === 204 ? null : response.json();
  };
  return async (request) => {
    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405 });
    const raw = await request.text();
    if (raw.length > 65536)
      return new Response("Payload too large", { status: 413 });
    if (!verifySignature(request.headers.get("x-webhook-signature") ?? "", raw))
      return new Response("Forbidden", { status: 403 });
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return new Response("Invalid payload", { status: 400 });
    }
    if (!/^[a-f0-9]{24}$/.test(payload.id ?? ""))
      return new Response("Invalid deployment ID", { status: 400 });
    try {
      const response = await fetchImpl(
        `https://api.netlify.com/api/v1/deploys/${payload.id}`,
        {
          headers: {
            authorization: `Bearer ${env.ENGINE_RELEASE_NETLIFY_TOKEN}`,
          },
          signal: AbortSignal.timeout(20000),
        },
      );
      if (!response.ok)
        throw new Error(`Netlify deployment lookup failed: ${response.status}`);
      const deploy = await response.json();
      const identity = deploymentIdentity(deploy, env.ENGINE_RELEASE_SITE_ID);
      const published = await fetchImpl(
        `${identity.base}/.netlify/functions/release-manifest?deploymentId=${deploy.id}`,
        { signal: AbortSignal.timeout(20000) },
      );
      if (published.ok) {
        const manifest = await published.json();
        return Response.json({
          status: "already-published",
          releaseId: manifest.releaseId,
        });
      }
      if (published.status !== 404)
        throw new Error(`Release service unavailable: ${published.status}`);
      // Gitlinks are authoritative; website and engine branch names need not match.
      const scientist = await github(
        `/repos/EasyEyes/website/contents/docs/experiment?ref=${deploy.commit_ref}`,
      );
      if (
        !["file", "submodule"].includes(scientist.type) ||
        scientist.submodule_git_url !==
          "https://github.com/EasyEyes/threshold-scientist.git" ||
        !/^[a-f0-9]{40}$/.test(scientist.sha)
      )
        throw new Error("Unexpected scientist submodule");
      const threshold = await github(
        `/repos/EasyEyes/threshold-scientist/contents/threshold?ref=${scientist.sha}`,
      );
      if (
        !["file", "submodule"].includes(threshold.type) ||
        threshold.submodule_git_url !==
          "https://github.com/EasyEyes/threshold.git" ||
        !/^[a-f0-9]{40}$/.test(threshold.sha)
      )
        throw new Error("Unexpected Threshold submodule");
      const repo = await github("/repos/EasyEyes/threshold");
      await github(
        "/repos/EasyEyes/threshold/actions/workflows/release-engine.yml/dispatches",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ref: repo.default_branch,
            inputs: {
              deployment_url: identity.base,
              deployment_id: deploy.id,
              deploy_context: deploy.context,
              source_sha: threshold.sha,
              website_branch: deploy.branch ?? "unknown",
            },
          }),
        },
      );
      return Response.json({
        status: "dispatched",
      });
    } catch (error) {
      // Do not log payloads, authentication headers, or tokens.
      console.error("[engine-release-webhook]", error.message);
      return new Response(
        "Engine release dispatch failed; check function logs",
        { status: 502 },
      );
    }
  };
}
