import * as Sentry from "@sentry/node";

type VerificationFailure = {
  path: string;
  attempts: number;
  finalOutcome: "mismatch" | "read_error";
};

type RetranslateSelectedCellsEvent = {
  phraseCount: number;
  currentVersion: string | null;
};

let initialized = false;

function initializeSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  if (!initialized) {
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || "production",
    });
    initialized = true;
  }
  return true;
}

export async function reportPersistenceVerificationFailure(
  failure: VerificationFailure,
): Promise<void> {
  if (!initializeSentry()) return;

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

export async function reportRetranslateSelectedCells(
  event: RetranslateSelectedCellsEvent,
): Promise<void> {
  if (!initializeSentry()) return;

  Sentry.captureMessage("retranslateSelectedCells called", {
    level: "info",
    tags: {
      component: "phrases-api",
      operation: "retranslateSelectedCells",
      temporaryInstrumentation: "true",
    },
    extra: {
      phraseCount: event.phraseCount,
      currentVersion: event.currentVersion,
    },
  });
  await Sentry.flush(2000);
}
