import * as Sentry from "@sentry/aws-serverless";

export type PhrasesTelemetryContext = {
  requestId: string;
  operation: string;
  stage: string;
  batchNumber?: number;
  totalBatches?: number;
  phraseCount?: number;
  cellCount?: number;
  statusCode?: number;
  errorCode?: string;
  elapsedMs?: number;
  latestVersion?: string | null;
  provider?: "deepl" | "google" | "firebase" | "unknown";
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0,
});

function allowedContext(context: PhrasesTelemetryContext) {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  );
}

export function capturePhrasesFailure(
  error: unknown,
  context: PhrasesTelemetryContext,
): void {
  Sentry.withScope((scope) => {
    scope.setTag("phrases.operation", context.operation);
    scope.setTag("phrases.stage", context.stage);
    scope.setTag("phrases.error_code", context.errorCode ?? "UNKNOWN");
    if (context.provider) scope.setTag("phrases.provider", context.provider);
    scope.setContext("phrases", allowedContext(context));
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
  });
}

export async function flushPhrasesTelemetry(): Promise<void> {
  if (process.env.SENTRY_DSN) await Sentry.flush(1500);
}

export async function runPhrasesStage<T>(
  stage: string,
  requestId: string,
  operation: string,
  work: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  try {
    return await work();
  } catch (error) {
    if (error && typeof error === "object") {
      Object.assign(error, { phrasesStage: stage });
    }
    throw error;
  } finally {
    console.log({
      event: "phrases_stage_completed",
      requestId,
      operation,
      stage,
      elapsedMs: Date.now() - startedAt,
    });
  }
}

export function phrasesErrorStage(error: unknown): string {
  return error &&
    typeof error === "object" &&
    typeof (error as { phrasesStage?: unknown }).phrasesStage === "string"
    ? (error as { phrasesStage: string }).phrasesStage
    : "unknown";
}
