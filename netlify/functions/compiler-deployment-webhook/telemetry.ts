import * as Sentry from "@sentry/aws-serverless";

import type { VerificationFailureContext } from "./compilerDeployment";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0,
});

export async function reportVerificationFailure(
  error: unknown,
  context: VerificationFailureContext,
): Promise<void> {
  Sentry.withScope((scope) => {
    scope.setTag("compiler_deployment.operation", "verify-firebase-write");
    scope.setTag("compiler_deployment.reason", context.reason);
    scope.setContext("compiler_deployment", context);
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
  });

  if (process.env.SENTRY_DSN) await Sentry.flush(1500);
}
