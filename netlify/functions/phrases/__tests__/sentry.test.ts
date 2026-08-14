const mockInit = jest.fn();
const mockCaptureException = jest.fn();
const mockFlush = jest.fn().mockResolvedValue(true);

jest.mock("@sentry/node", () => ({
  init: mockInit,
  captureException: mockCaptureException,
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
});
