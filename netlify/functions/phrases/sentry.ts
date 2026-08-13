import * as Sentry from "@sentry/node";

type VerificationFailure = {
  path: string;
  attempts: number;
  finalOutcome: "mismatch" | "read_error";
};

let initialized = false;

export async function reportPersistenceVerificationFailure(
  failure: VerificationFailure,
): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  if (!initialized) {
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || "production",
    });
    initialized = true;
  }

  Sentry.captureException(
    new Error("Phrase persistence read-after-write verification failed"),
    {
      tags: {
        component: "phrases-api",
        operation: "firebase-read-after-write",
        outcome: failure.finalOutcome,
      },
      extra: {
        path: failure.path,
        attempts: failure.attempts,
      },
    },
  );
  await Sentry.flush(2000);
}
