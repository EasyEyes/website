import {
  createDeploySucceededHandler,
  createFirebaseNotificationWriter,
} from "../index";

describe("compiler deployment notification", () => {
  const createLogger = () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });

  it("publishes the exact deployment identity and publication time for production", async () => {
    const writeNotification = jest.fn().mockResolvedValue(undefined);
    const handler = createDeploySucceededHandler({ writeNotification });
    const publishedAt = "2026-07-14T09:10:11.123Z";

    await handler({
      deploy: {
        id: "deploy-123",
        context: "production",
        publishedAt,
      },
    } as never);

    expect(writeNotification).toHaveBeenCalledWith({
      notification: {
        deploymentId: "deploy-123",
        publishedAt,
      },
      firebaseRoot: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
    });
  });

  it("publishes deploy previews only to the ODE database", async () => {
    const writeNotification = jest.fn().mockResolvedValue(undefined);
    const handler = createDeploySucceededHandler({ writeNotification });
    const createdAt = "2026-07-15T14:04:21.909Z";

    await handler({
      deploy: {
        id: "preview-123",
        context: "deploy-preview",
        createdAt,
        publishedAt: null,
      },
    } as never);

    expect(writeNotification).toHaveBeenCalledWith({
      notification: {
        deploymentId: "preview-123",
        publishedAt: createdAt,
      },
      firebaseRoot: "https://easyeyes-compiler-ode01.firebaseio.com",
    });
  });

  it.each([
    [
      "branch deploy",
      {
        id: "branch-1",
        context: "branch-deploy",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    ],
    [
      "other non-production context",
      {
        id: "other-1",
        context: "staging",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    ],
    [
      "inherited object property context",
      {
        id: "inherited-1",
        context: "constructor",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    ],
    [
      "missing publication time",
      { id: "deploy-123", context: "production", publishedAt: null },
    ],
    [
      "empty deployment id",
      {
        id: "",
        context: "production",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    ],
    [
      "deployment id containing HTML",
      {
        id: '<script>alert("deployment input")</script>',
        context: "production",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    ],
    [
      "deployment id containing a path",
      {
        id: "deploy/../../production",
        context: "production",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    ],
    [
      "invalid publication time",
      {
        id: "deploy-123",
        context: "production",
        publishedAt: "not-a-timestamp",
      },
    ],
    [
      "impossible publication date",
      {
        id: "deploy-123",
        context: "production",
        publishedAt: "2026-02-31T09:10:11.123Z",
      },
    ],
  ])("does not publish a %s", async (_description, deploy) => {
    const writeNotification = jest.fn().mockResolvedValue(undefined);
    const handler = createDeploySucceededHandler({ writeNotification });

    await expect(handler({ deploy } as never)).resolves.toBeUndefined();

    expect(writeNotification).not.toHaveBeenCalled();
  });

  it.each([undefined, null, {}, { deploy: null }, { deploy: {} }])(
    "ignores malformed event %#",
    async (event) => {
      const writeNotification = jest.fn().mockResolvedValue(undefined);
      const handler = createDeploySucceededHandler({ writeNotification });

      await expect(handler(event as never)).resolves.toBeUndefined();

      expect(writeNotification).not.toHaveBeenCalled();
    },
  );

  it("writes through Firebase REST using the existing server credential", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const logger = createLogger();
    const writeNotification = createFirebaseNotificationWriter({
      fetchImpl: fetchImpl as never,
      getCredential: () => "firebase-db-secret",
      logger,
    });
    const notification = {
      deploymentId: "deploy-123",
      publishedAt: "2026-07-14T09:10:11.123Z",
    };

    await writeNotification({
      notification,
      firebaseRoot: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://easyeyes-compiler-default-rtdb.firebaseio.com/deployments/compiler/production.json?auth=firebase-db-secret",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      },
    );
    expect(logger.info).toHaveBeenNthCalledWith(
      1,
      "[compiler-deployment] Firebase notification write started",
      {
        deploymentId: "deploy-123",
        publishedAt: "2026-07-14T09:10:11.123Z",
        firebaseRoot: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
      },
    );
    expect(logger.info).toHaveBeenNthCalledWith(
      2,
      "[compiler-deployment] Firebase notification write succeeded",
      {
        deploymentId: "deploy-123",
        publishedAt: "2026-07-14T09:10:11.123Z",
        firebaseRoot: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
        status: 200,
      },
    );
  });

  it("logs accepted and rejected deploy events without raw invalid input", async () => {
    const writeNotification = jest.fn().mockResolvedValue(undefined);
    const logger = createLogger();
    const handler = createDeploySucceededHandler({ writeNotification, logger });

    await handler({
      deploy: {
        id: "deploy-123",
        context: "production",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    } as never);
    await handler({
      deploy: {
        id: '<script>alert("sensitive invalid input")</script>',
        context: "production",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    } as never);

    expect(logger.info).toHaveBeenCalledWith(
      "[compiler-deployment] deploySucceeded event accepted",
      {
        deploymentId: "deploy-123",
        context: "production",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    );
    expect(logger.warn).toHaveBeenCalledWith(
      "[compiler-deployment] deploySucceeded event ignored",
      { reason: "invalid-deployment-id", context: "production" },
    );
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(
      "sensitive invalid input",
    );
  });

  it("propagates Firebase failures without logging credentials or response data", async () => {
    const secret = "sensitive-firebase-secret";
    const responseBody = "sensitive-upstream-response";
    const logger = createLogger();
    const writeNotification = createFirebaseNotificationWriter({
      fetchImpl: jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: () => Promise.resolve(responseBody),
      }) as never,
      getCredential: () => secret,
      logger,
    });

    let thrown: unknown;
    try {
      await writeNotification({
        notification: {
          deploymentId: "deploy-123",
          publishedAt: "2026-07-14T09:10:11.123Z",
        },
        firebaseRoot: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual(
      new Error("Firebase notification write failed with status 503"),
    );
    expect(logger.error).toHaveBeenCalledWith(
      "[compiler-deployment] Firebase notification write failed with status 503",
    );
    const observableOutput = JSON.stringify({
      thrown,
      logs: logger.error.mock.calls,
    });
    expect(observableOutput).not.toContain(secret);
    expect(observableOutput).not.toContain(responseBody);
  });

  it("redacts the credential when the Firebase request itself rejects", async () => {
    const secret = "sensitive-firebase-secret";
    const logger = createLogger();
    const writeNotification = createFirebaseNotificationWriter({
      fetchImpl: jest
        .fn()
        .mockRejectedValue(
          new Error(`request failed for https://firebase.test?auth=${secret}`),
        ) as never,
      getCredential: () => secret,
      logger,
    });

    await expect(
      writeNotification({
        notification: {
          deploymentId: "deploy-123",
          publishedAt: "2026-07-14T09:10:11.123Z",
        },
        firebaseRoot: "https://easyeyes-compiler-default-rtdb.firebaseio.com",
      }),
    ).rejects.toThrow("Firebase notification write failed");

    const observableOutput = JSON.stringify(logger.error.mock.calls);
    expect(observableOutput).not.toContain(secret);
  });
});
