import { createWebhookSignatureVerifier } from "../compiler-deployment-webhook/index.mts";
import { createEngineReleaseWebhook } from "./dispatch.mjs";

export default async function handler(request: Request): Promise<Response> {
  const required = [
    "ENGINE_RELEASE_WEBHOOK_SECRET",
    "ENGINE_RELEASE_GITHUB_TOKEN",
    "ENGINE_RELEASE_NETLIFY_TOKEN",
    "ENGINE_RELEASE_SITE_ID",
  ];
  if (required.some((name) => !process.env[name]))
    return new Response("Engine release webhook is not configured", {
      status: 503,
    });
  return createEngineReleaseWebhook({
    env: process.env,
    verifySignature: createWebhookSignatureVerifier(
      process.env.ENGINE_RELEASE_WEBHOOK_SECRET!,
    ),
  })(request);
}
