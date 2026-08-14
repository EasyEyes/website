const mockInit = jest.fn();
const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
const mockFlush = jest.fn().mockResolvedValue(true);

jest.mock("@sentry/node", () => ({
  init: mockInit,
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  flush: mockFlush,
}));

describe("phrase persistence Sentry reporting", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.SENTRY_DSN;
    delete process.env.SENTRY_ENVIRONMENT;
  });

  test("does nothing when SENTRY_DSN is not configured", async () => {
    const { reportPersistenceVerificationFailure } = await import("../sentry");

    await reportPersistenceVerificationFailure({
      path: "phrases/currentVersion",
      attempts: 3,
      finalOutcome: "mismatch",
    });

    expect(mockInit).not.toHaveBeenCalled();
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  test("logs why temporary retranslation reporting is disabled", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation();
    const { reportRetranslateSelectedCells } = await import("../sentry");

    await reportRetranslateSelectedCells({
      phraseCount: 1,
      currentVersion: "1.0",
    });

    expect(logSpy).toHaveBeenCalledWith("[DEBUG-sentry-retranslate]", {
      stage: "disabled",
      reason: "SENTRY_DSN_not_configured",
    });
  });

  test("captures terminal verification failure with safe metadata and flushes", async () => {
    process.env.SENTRY_DSN = "https://public@example.ingest.sentry.io/123";
    process.env.SENTRY_ENVIRONMENT = "production";
    const { reportPersistenceVerificationFailure } = await import("../sentry");

    await reportPersistenceVerificationFailure({
      path: "phrasesVersions/1_dot_1/phrases",
      attempts: 3,
      finalOutcome: "read_error",
    });

    expect(mockInit).toHaveBeenCalledWith({
      dsn: process.env.SENTRY_DSN,
      environment: "production",
    });
    expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error), {
      tags: {
        component: "phrases-api",
        operation: "firebase-read-after-write",
        outcome: "read_error",
      },
      extra: {
        path: "phrasesVersions/1_dot_1/phrases",
        attempts: 3,
      },
    });
    expect(mockFlush).toHaveBeenCalledWith(2000);
  });

  test("captures temporary retranslateSelectedCells usage", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation();
    mockCaptureMessage.mockReturnValueOnce("event-123");
    process.env.SENTRY_DSN = "https://public@example.ingest.sentry.io/123";
    const { reportRetranslateSelectedCells } = await import("../sentry");

    await reportRetranslateSelectedCells({
      phraseCount: 2,
      currentVersion: "1.4",
    });

    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "retranslateSelectedCells called",
      {
        level: "info",
        tags: {
          component: "phrases-api",
          operation: "retranslateSelectedCells",
          temporaryInstrumentation: "true",
        },
        extra: { phraseCount: 2, currentVersion: "1.4" },
      },
    );
    expect(mockFlush).toHaveBeenCalledWith(2000);
    expect(logSpy).toHaveBeenCalledWith("[DEBUG-sentry-retranslate]", {
      stage: "flushed",
      eventId: "event-123",
      flushSucceeded: true,
      environment: "production",
    });
  });
});
