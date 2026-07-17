import type { DeploySucceededEvent, NetlifyFunction } from "@netlify/functions";

type DeploymentNotification = {
  deploymentId: string;
  publishedAt: string;
};

type NotificationWrite = {
  notification: DeploymentNotification;
  firebaseRoot: string;
};

type Dependencies = {
  writeNotification: (write: NotificationWrite) => Promise<void>;
  logger?: DeploymentLogger;
};

type LegacyHandlerDependencies = {
  handleDeploySucceeded: (event: DeploySucceededEvent) => Promise<void>;
  logger?: DeploymentLogger;
};

type DeploymentLogger = Pick<Console, "info" | "warn" | "error">;

type FirebaseWriterDependencies = {
  fetchImpl: typeof fetch;
  getCredential: () => string | undefined;
  logger: DeploymentLogger;
};

const notificationPath = "deployments/compiler/production";
const firebaseRootsByDeployContext: Record<string, string> = {
  production: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
  "deploy-preview": "https://easyeyes-compiler-ode01.firebaseio.com",
};
const deploymentIdPattern = /^[A-Za-z0-9_-]{1,128}$/;
const publishedAtPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/;

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

export function createFirebaseNotificationWriter({
  fetchImpl,
  getCredential,
  logger,
}: FirebaseWriterDependencies) {
  return async function writeNotification({
    notification,
    firebaseRoot,
  }: NotificationWrite): Promise<void> {
    const credential = getCredential();
    if (!credential) {
      const message = "FIREBASE_DB environment variable is required";
      logger.error(`[compiler-deployment] ${message}`);
      throw new Error(message);
    }

    const logDetails = {
      deploymentId: notification.deploymentId,
      publishedAt: notification.publishedAt,
      firebaseRoot,
    };
    logger.info(
      "[compiler-deployment] Firebase notification write started",
      logDetails,
    );

    let response: Response;
    try {
      response = await fetchImpl(
        `${firebaseRoot}/${notificationPath}.json?auth=${encodeURIComponent(
          credential,
        )}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        },
      );
    } catch {
      const message = "Firebase notification write failed";
      logger.error(`[compiler-deployment] ${message}`);
      throw new Error(message);
    }

    if (!response.ok) {
      const message = `Firebase notification write failed with status ${response.status}`;
      logger.error(`[compiler-deployment] ${message}`);
      throw new Error(message);
    }

    logger.info("[compiler-deployment] Firebase notification write succeeded", {
      ...logDetails,
      status: response.status,
    });
  };
}

export function createDeploySucceededHandler({
  writeNotification,
  logger,
}: Dependencies) {
  return async function deploySucceeded(event: DeploySucceededEvent) {
    const deploy = event?.deploy;
    const notificationTimestamp =
      deploy?.context === "production" ? deploy.publishedAt : deploy?.createdAt;
    const context = deploy?.context;
    const safeContext =
      typeof context === "string" && /^[a-z-]{1,32}$/.test(context)
        ? context
        : "invalid";
    let rejectionReason: string | undefined;

    if (typeof context !== "string") {
      rejectionReason = "malformed-event";
    } else if (
      !Object.prototype.hasOwnProperty.call(
        firebaseRootsByDeployContext,
        context,
      )
    ) {
      rejectionReason = "unsupported-context";
    } else if (
      typeof deploy?.id !== "string" ||
      !deploymentIdPattern.test(deploy.id)
    ) {
      rejectionReason = "invalid-deployment-id";
    } else if (
      typeof notificationTimestamp !== "string" ||
      !isValidPublishedAt(notificationTimestamp)
    ) {
      rejectionReason = "invalid-timestamp";
    }

    if (rejectionReason) {
      logger?.warn("[compiler-deployment] deploySucceeded event ignored", {
        reason: rejectionReason,
        context: safeContext,
      });
      return;
    }

    // The rejection checks above establish these values before any write.
    const deploymentId = deploy!.id as string;
    const publishedAt = notificationTimestamp as string;
    logger?.info("[compiler-deployment] deploySucceeded event accepted", {
      deploymentId,
      context,
      publishedAt,
    });

    await writeNotification({
      notification: {
        deploymentId,
        publishedAt,
      },
      firebaseRoot: firebaseRootsByDeployContext[deploy.context],
    });
  };
}

export function createLegacyDeploySucceededHandler({
  handleDeploySucceeded,
  logger,
}: LegacyHandlerDependencies) {
  return async function legacyDeploySucceeded(request: Request): Promise<void> {
    logger?.info("[deploy-succeeded] legacy event received");

    const body = (await request.json()) as {
      payload?: {
        id?: unknown;
        context?: unknown;
        published_at?: unknown;
        created_at?: unknown;
      };
    };
    const payload = body?.payload;

    await handleDeploySucceeded({
      deploy: {
        id: payload?.id,
        context: payload?.context,
        publishedAt: payload?.published_at,
        createdAt: payload?.created_at,
      },
    } as DeploySucceededEvent);
  };
}

export const deploySucceeded = createDeploySucceededHandler({
  writeNotification: createFirebaseNotificationWriter({
    fetchImpl: fetch,
    getCredential: () => process.env.FIREBASE_DB,
    logger: console,
  }),
  logger: console,
});

export default { deploySucceeded } satisfies NetlifyFunction;
