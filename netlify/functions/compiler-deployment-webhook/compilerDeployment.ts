type DeploymentNotification = {
  deploymentId: string;
  publishedAt: string;
};

type NotificationWrite = {
  notification: DeploymentNotification;
  firebaseRoot: string;
};

type DeploymentLogger = Pick<Console, "info" | "warn" | "error">;

export type VerificationFailureContext = DeploymentNotification & {
  reason: "read-failed" | "mismatch";
};

type FirebaseWriterDependencies = {
  fetchImpl: typeof fetch;
  getCredential: () => string | undefined;
  logger: DeploymentLogger;
  reportVerificationFailure: (
    error: unknown,
    context: VerificationFailureContext,
  ) => Promise<void>;
};

const notificationPath = "deployments/compiler/production";
export function createFirebaseNotificationWriter({
  fetchImpl,
  getCredential,
  logger,
  reportVerificationFailure,
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

    const notificationUrl = `${firebaseRoot}/${notificationPath}.json?auth=${encodeURIComponent(
      credential,
    )}`;
    let response: Response;
    try {
      response = await fetchImpl(notificationUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      });
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

    let persistedNotification: unknown;
    try {
      const verificationResponse = await fetchImpl(notificationUrl, {
        headers: { Accept: "application/json" },
      });
      if (!verificationResponse.ok) {
        throw new Error(`status ${verificationResponse.status}`);
      }
      persistedNotification = await verificationResponse.json();
    } catch (error) {
      const message = "Firebase notification verification failed";
      logger.error(`[compiler-deployment] ${message}`);
      await reportVerificationFailure(error, {
        ...notification,
        reason: "read-failed",
      });
      throw new Error(message);
    }

    if (
      typeof persistedNotification !== "object" ||
      persistedNotification === null ||
      (persistedNotification as Partial<DeploymentNotification>)
        .deploymentId !== notification.deploymentId ||
      (persistedNotification as Partial<DeploymentNotification>).publishedAt !==
        notification.publishedAt
    ) {
      const message = "Firebase notification verification mismatch";
      logger.error(`[compiler-deployment] ${message}`);
      const error = new Error(message);
      await reportVerificationFailure(error, {
        ...notification,
        reason: "mismatch",
      });
      throw error;
    }

    logger.info("[compiler-deployment] Firebase notification write succeeded", {
      ...logDetails,
      status: response.status,
    });
  };
}
