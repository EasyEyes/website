import { createFirebaseNotificationWriter } from "../compilerDeployment";

describe("Firebase deployment notification writer", () => {
  const notification = {
    deploymentId: "deploy-123",
    publishedAt: "2026-07-17T10:00:00.000Z",
  };
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("writes the deployment notification using the server credential", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const writeNotification = createFirebaseNotificationWriter({
      fetchImpl: fetchImpl as never,
      getCredential: () => "firebase-secret",
      logger,
    });

    await writeNotification({
      notification,
      firebaseRoot: "https://firebase.example",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://firebase.example/deployments/compiler/production.json?auth=firebase-secret",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      },
    );
  });

  it("fails before fetching when the credential is missing", async () => {
    const fetchImpl = jest.fn();
    const writeNotification = createFirebaseNotificationWriter({
      fetchImpl: fetchImpl as never,
      getCredential: () => undefined,
      logger,
    });

    await expect(
      writeNotification({
        notification,
        firebaseRoot: "https://firebase.example",
      }),
    ).rejects.toThrow("FIREBASE_DB environment variable is required");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("propagates a redacted error when Firebase rejects the write", async () => {
    const writeNotification = createFirebaseNotificationWriter({
      fetchImpl: jest
        .fn()
        .mockResolvedValue({ ok: false, status: 503 }) as never,
      getCredential: () => "sensitive-secret",
      logger,
    });

    await expect(
      writeNotification({
        notification,
        firebaseRoot: "https://firebase.example",
      }),
    ).rejects.toThrow("Firebase notification write failed with status 503");
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      "sensitive-secret",
    );
  });
});
