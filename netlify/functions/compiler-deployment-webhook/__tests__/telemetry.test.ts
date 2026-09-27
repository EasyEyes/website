const mockInit = jest.fn();
const mockCaptureException = jest.fn();
const mockFlush = jest.fn().mockResolvedValue(true);
const mockSetTag = jest.fn();
const mockSetContext = jest.fn();

jest.mock("@sentry/aws-serverless", () => ({
  init: mockInit,
  captureException: mockCaptureException,
  flush: mockFlush,
  withScope: (callback: (scope: unknown) => void) =>
    callback({ setTag: mockSetTag, setContext: mockSetContext }),
}));

describe("compiler deployment telemetry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SENTRY_DSN;
  });

  it("captures a verification failure with allowlisted deployment context", async () => {
    const { reportVerificationFailure } = require("../telemetry");
    const error = new Error("Firebase notification verification failed");

    await reportVerificationFailure(error, {
      deploymentId: "deploy-123",
      publishedAt: "2026-07-17T10:00:00.000Z",
      reason: "read-failed",
    });

    expect(mockSetTag).toHaveBeenCalledWith(
      "compiler_deployment.operation",
      "verify-firebase-write",
    );
    expect(mockSetTag).toHaveBeenCalledWith(
      "compiler_deployment.reason",
      "read-failed",
    );
    expect(mockSetContext).toHaveBeenCalledWith("compiler_deployment", {
      deploymentId: "deploy-123",
      publishedAt: "2026-07-17T10:00:00.000Z",
      reason: "read-failed",
    });
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it("flushes the event before returning when Sentry is configured", async () => {
    process.env.SENTRY_DSN = "https://public@example.invalid/1";
    const { reportVerificationFailure } = require("../telemetry");
    await reportVerificationFailure(new Error("mismatch"), {
      deploymentId: "deploy-123",
      publishedAt: "2026-07-17T10:00:00.000Z",
      reason: "mismatch",
    });

    expect(mockFlush).toHaveBeenCalledWith(1500);
  });
});
