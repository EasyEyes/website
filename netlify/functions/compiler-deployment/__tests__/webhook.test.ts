import { createHmac, createHash } from "node:crypto";

import {
  createCompilerDeploymentWebhook,
  createWebhookSignatureVerifier,
} from "../../compiler-deployment-webhook/index";

const productionPayload = {
  id: "deploy-123",
  context: "production",
  published_at: "2026-07-16T15:04:15.435Z",
};

describe("compiler deployment webhook", () => {
  const createLogger = () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });

  it("validates Netlify's HS256 signature and raw-body digest", () => {
    const secret = "test-webhook-signature-secret";
    const rawBody = JSON.stringify(productionPayload);
    const encode = (value: object) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    const signingInput = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
      iss: "netlify",
      sha256: createHash("sha256").update(rawBody).digest("hex"),
    })}`;
    const signature = createHmac("sha256", secret)
      .update(signingInput)
      .digest("base64url");
    const token = `${signingInput}.${signature}`;
    const verify = createWebhookSignatureVerifier(secret);

    expect(verify(token, rawBody)).toBe(true);
    expect(verify(token, `${rawBody} `)).toBe(false);
  });

  it("verifies the raw body and publishes a valid production deploy", async () => {
    const verifySignature = jest.fn().mockReturnValue(true);
    const writeNotification = jest.fn().mockResolvedValue(undefined);
    const logger = createLogger();
    const handler = createCompilerDeploymentWebhook({
      verifySignature,
      writeNotification,
      logger,
    });
    const rawBody = JSON.stringify(productionPayload);

    const response = await handler(
      new Request(
        "https://easyeyes.app/.netlify/functions/compiler-deployment-webhook",
        {
          method: "POST",
          headers: { "X-Webhook-Signature": "signed-token" },
          body: rawBody,
        },
      ),
    );

    expect(response.status).toBe(204);
    expect(verifySignature).toHaveBeenCalledWith("signed-token", rawBody);
    expect(writeNotification).toHaveBeenCalledWith({
      notification: {
        deploymentId: "deploy-123",
        publishedAt: "2026-07-16T15:04:15.435Z",
      },
      firebaseRoot: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
    });
  });

  it("rejects unsigned and invalidly signed requests before writing", async () => {
    const verifySignature = jest.fn().mockReturnValue(false);
    const writeNotification = jest.fn();
    const handler = createCompilerDeploymentWebhook({
      verifySignature,
      writeNotification,
      logger: createLogger(),
    });

    const unsigned = await handler(
      new Request(
        "https://easyeyes.app/.netlify/functions/compiler-deployment-webhook",
        {
          method: "POST",
          body: JSON.stringify(productionPayload),
        },
      ),
    );
    const invalid = await handler(
      new Request(
        "https://easyeyes.app/.netlify/functions/compiler-deployment-webhook",
        {
          method: "POST",
          headers: { "X-Webhook-Signature": "invalid" },
          body: JSON.stringify(productionPayload),
        },
      ),
    );

    expect(unsigned.status).toBe(403);
    expect(invalid.status).toBe(403);
    expect(writeNotification).not.toHaveBeenCalled();
  });

  it("ignores non-production deploys and rejects malformed payloads", async () => {
    const writeNotification = jest.fn();
    const handler = createCompilerDeploymentWebhook({
      verifySignature: () => true,
      writeNotification,
      logger: createLogger(),
    });

    const preview = await handler(
      new Request(
        "https://easyeyes.app/.netlify/functions/compiler-deployment-webhook",
        {
          method: "POST",
          headers: { "X-Webhook-Signature": "valid" },
          body: JSON.stringify({
            ...productionPayload,
            context: "deploy-preview",
          }),
        },
      ),
    );
    const malformed = await handler(
      new Request(
        "https://easyeyes.app/.netlify/functions/compiler-deployment-webhook",
        {
          method: "POST",
          headers: { "X-Webhook-Signature": "valid" },
          body: JSON.stringify({
            ...productionPayload,
            published_at: "invalid",
          }),
        },
      ),
    );

    expect(preview.status).toBe(204);
    expect(malformed.status).toBe(400);
    expect(writeNotification).not.toHaveBeenCalled();
  });
});
