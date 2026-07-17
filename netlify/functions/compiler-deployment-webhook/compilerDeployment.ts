type DeploymentNotification = {
  deploymentId: string;
  publishedAt: string;
};

type NotificationWrite = {
  notification: DeploymentNotification;
  firebaseRoot: string;
};

type DeploymentLogger = Pick<Console, "info" | "warn" | "error">;

type FirebaseWriterDependencies = {
  fetchImpl: typeof fetch;
  getCredential: () => string | undefined;
  logger: DeploymentLogger;
};

const notificationPath = "deployments/compiler/production";
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
