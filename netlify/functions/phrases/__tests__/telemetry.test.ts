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

describe("phrases telemetry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete process.env.SENTRY_DSN;
  });

  test("captures only allowlisted operational context", async () => {
    const { capturePhrasesFailure } = await import("../telemetry");

    capturePhrasesFailure(new Error("provider failed"), {
      requestId: "operation-1",
      operation: "translate",
      stage: "google_translate",
      batchNumber: 8,
      totalBatches: 18,
      phraseCount: 50,
      cellCount: 2000,
      errorCode: "GOOGLE_TRANSLATION_FAILED",
      provider: "google",
      latestVersion: "40.31",
    });

    expect(mockSetContext).toHaveBeenCalledWith("phrases", {
      requestId: "operation-1",
      operation: "translate",
      stage: "google_translate",
      batchNumber: 8,
      totalBatches: 18,
      phraseCount: 50,
      cellCount: 2000,
      errorCode: "GOOGLE_TRANSLATION_FAILED",
      provider: "google",
      latestVersion: "40.31",
    });
    expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
