import { createHash, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";

import { createFirebaseNotificationWriter } from "./compilerDeployment";

type DeploymentNotification = {
  deploymentId: string;
  publishedAt: string;
};

type NotificationWrite = {
  notification: DeploymentNotification;
  firebaseRoot: string;
};

type WebhookDependencies = {
  verifySignature: (signature: string, rawBody: string) => boolean;
  writeNotification: (write: NotificationWrite) => Promise<void>;
  logger: Pick<Console, "info" | "warn" | "error">;
};

type WebhookPayload = {
  id: string;
  context: string;
  published_at: string;
};

const productionFirebaseRoot =
  "https://easyeyes-compiler-default-rtdb.firebaseio.com";
const deploymentIdPattern = /^[A-Za-z0-9_-]{1,128}$/;
const publishedAtPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/;
const maximumBodyLength = 64 * 1024;

function isValidPublishedAt(value: string): boolean {
  const parts = publishedAtPattern.exec(value);
  if (!parts) return false;

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;

  const parsed = new Date(timestamp);
  return (
    parsed.getUTCFullYear() === Number(parts[1]) &&
    parsed.getUTCMonth() + 1 === Number(parts[2]) &&
    parsed.getUTCDate() === Number(parts[3]) &&
    parsed.getUTCHours() === Number(parts[4]) &&
    parsed.getUTCMinutes() === Number(parts[5]) &&
    parsed.getUTCSeconds() === Number(parts[6])
  );
}

function parsePayload(rawBody: string): WebhookPayload | undefined {
  let value: unknown;
  try {
    value = JSON.parse(rawBody);
  } catch {
    return undefined;
  }

  if (!value || typeof value !== "object") return undefined;
  const payload = value as Record<string, unknown>;
  if (
    typeof payload.id !== "string" ||
    !deploymentIdPattern.test(payload.id) ||
    typeof payload.context !== "string" ||
    typeof payload.published_at !== "string" ||
    !isValidPublishedAt(payload.published_at)
  ) {
    return undefined;
  }

  return {
    id: payload.id,
    context: payload.context,
    published_at: payload.published_at,
  };
}

export function createWebhookSignatureVerifier(secret: string) {
  return (signature: string, rawBody: string): boolean => {
    try {
      const decoded = jwt.verify(signature, secret, {
        algorithms: ["HS256"],
        issuer: "netlify",
      });
      if (
        typeof decoded === "string" ||
        typeof decoded.sha256 !== "string" ||
        !/^[a-f0-9]{64}$/.test(decoded.sha256)
      ) {
        return false;
      }

      const expectedHash = Buffer.from(decoded.sha256, "hex");
      const actualHash = createHash("sha256").update(rawBody).digest();
      return timingSafeEqual(expectedHash, actualHash);
    } catch {
      return false;
    }
  };
}

export function createCompilerDeploymentWebhook({
  verifySignature,
  writeNotification,
  logger,
}: WebhookDependencies) {
  return async function compilerDeploymentWebhook(
    request: Request,
  ): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const rawBody = await request.text();
    if (rawBody.length > maximumBodyLength) {
      logger.warn("[compiler-deployment-webhook] request rejected", {
        reason: "payload-too-large",
      });
      return new Response("Payload too large", { status: 413 });
    }

    const signature = request.headers.get("X-Webhook-Signature");
    if (!signature || !verifySignature(signature, rawBody)) {
      logger.warn("[compiler-deployment-webhook] request rejected", {
        reason: "invalid-signature",
      });
      return new Response("Forbidden", { status: 403 });
    }

    const payload = parsePayload(rawBody);
    if (!payload) {
      logger.warn("[compiler-deployment-webhook] request rejected", {
        reason: "invalid-payload",
      });
      return new Response("Invalid payload", { status: 400 });
    }

    if (payload.context !== "production") {
      logger.info("[compiler-deployment-webhook] deploy ignored", {
        context: payload.context,
      });
      return new Response(null, { status: 204 });
    }

    logger.info("[compiler-deployment-webhook] production deploy accepted", {
      deploymentId: payload.id,
      publishedAt: payload.published_at,
    });
    await writeNotification({
      notification: {
        deploymentId: payload.id,
        publishedAt: payload.published_at,
      },
      firebaseRoot: productionFirebaseRoot,
    });

    return new Response(null, { status: 204 });
  };
}

export default async function compilerDeploymentWebhook(request: Request) {
  const signatureSecret = process.env.COMPILER_DEPLOYMENT_WEBHOOK_SECRET;
  if (!signatureSecret) {
    console.error(
      "[compiler-deployment-webhook] COMPILER_DEPLOYMENT_WEBHOOK_SECRET is required",
    );
    return new Response("Webhook is not configured", { status: 500 });
  }

  return createCompilerDeploymentWebhook({
    verifySignature: createWebhookSignatureVerifier(signatureSecret),
    writeNotification: createFirebaseNotificationWriter({
      fetchImpl: fetch,
      getCredential: () => process.env.FIREBASE_DB,
      logger: console,
    }),
    logger: console,
  })(request);
}
