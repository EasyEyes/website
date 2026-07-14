import {
  createDeploySucceededHandler,
  createFirebaseNotificationWriter,
} from "../index";

describe("compiler deployment notification", () => {
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

    expect(writeNotification).toHaveBeenCalledWith(
      "deployments/compiler/production",
      {
        deploymentId: "deploy-123",
        publishedAt,
      },
    );
  });

  it.each([
    [
      "deploy preview",
      {
        id: "preview-1",
        context: "deploy-preview",
        publishedAt: "2026-07-14T09:10:11.123Z",
      },
    ],
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
    const writeNotification = createFirebaseNotificationWriter({
      fetchImpl: fetchImpl as never,
      getCredential: () => "firebase-db-secret",
      logger: { error: jest.fn() },
    });
    const notification = {
      deploymentId: "deploy-123",
      publishedAt: "2026-07-14T09:10:11.123Z",
    };

    await writeNotification("deployments/compiler/production", notification);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://easyeyes-compiler-default-rtdb.firebaseio.com/deployments/compiler/production.json?auth=firebase-db-secret",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      },
    );
  });

  it("propagates Firebase failures without logging credentials or response data", async () => {
    const secret = "sensitive-firebase-secret";
    const responseBody = "sensitive-upstream-response";
    const logger = { error: jest.fn() };
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
      await writeNotification("deployments/compiler/production", {
        deploymentId: "deploy-123",
        publishedAt: "2026-07-14T09:10:11.123Z",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual(
      new Error("Firebase notification write failed with status 503"),
    );
    expect(logger.error).toHaveBeenCalledWith(
      "Firebase notification write failed with status 503",
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
    const logger = { error: jest.fn() };
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
      writeNotification("deployments/compiler/production", {
        deploymentId: "deploy-123",
        publishedAt: "2026-07-14T09:10:11.123Z",
      }),
    ).rejects.toThrow("Firebase notification write failed");

    const observableOutput = JSON.stringify(logger.error.mock.calls);
    expect(observableOutput).not.toContain(secret);
  });
});
