type DeploySucceededEvent = {
  deploy: {
    id: string;
    context: string;
    publishedAt: string | null;
  };
};

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
};

type FirebaseWriterDependencies = {
  fetchImpl: typeof fetch;
  getCredential: () => string | undefined;
  logger: Pick<Console, "error">;
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
      throw new Error("FIREBASE_DB environment variable is required");
    }

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
      logger.error(message);
      throw new Error(message);
    }

    if (!response.ok) {
      const message = `Firebase notification write failed with status ${response.status}`;
      logger.error(message);
      throw new Error(message);
    }
  };
}

export function createDeploySucceededHandler({
  writeNotification,
}: Dependencies) {
  return async function deploySucceeded(event: DeploySucceededEvent) {
    const deploy = event?.deploy;
    if (
      typeof deploy?.context !== "string" ||
      !Object.prototype.hasOwnProperty.call(
        firebaseRootsByDeployContext,
        deploy.context,
      ) ||
      typeof deploy.id !== "string" ||
      !deploymentIdPattern.test(deploy.id) ||
      typeof deploy.publishedAt !== "string" ||
      !isValidPublishedAt(deploy.publishedAt)
    ) {
      return;
    }

    await writeNotification({
      notification: {
        deploymentId: deploy.id,
        publishedAt: deploy.publishedAt,
      },
      firebaseRoot: firebaseRootsByDeployContext[deploy.context],
    });
  };
}

const deploySucceeded = createDeploySucceededHandler({
  writeNotification: createFirebaseNotificationWriter({
    fetchImpl: fetch,
    getCredential: () => process.env.FIREBASE_DB,
    logger: console,
  }),
});

export default { deploySucceeded };
