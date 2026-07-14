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

type Dependencies = {
  writeNotification: (
    path: string,
    notification: DeploymentNotification,
  ) => Promise<void>;
};

type FirebaseWriterDependencies = {
  fetchImpl: typeof fetch;
  getCredential: () => string | undefined;
  logger: Pick<Console, "error">;
};

const notificationPath = "deployments/compiler/production";
const firebaseRoot = "https://easyeyes-compiler-default-rtdb.firebaseio.com";

export function createFirebaseNotificationWriter({
  fetchImpl,
  getCredential,
  logger,
}: FirebaseWriterDependencies) {
  return async function writeNotification(
    path: string,
    notification: DeploymentNotification,
  ): Promise<void> {
    const credential = getCredential();
    if (!credential) {
      throw new Error("FIREBASE_DB environment variable is required");
    }

    let response: Response;
    try {
      response = await fetchImpl(
        `${firebaseRoot}/${path}.json?auth=${encodeURIComponent(credential)}`,
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
      deploy?.context !== "production" ||
      typeof deploy.id !== "string" ||
      deploy.id.length === 0 ||
      typeof deploy.publishedAt !== "string" ||
      deploy.publishedAt.length === 0
    ) {
      return;
    }

    await writeNotification(notificationPath, {
      deploymentId: deploy.id,
      publishedAt: deploy.publishedAt,
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
