import { randomUUID } from "node:crypto";
import { handler } from "./handler";
import { nativeHandler } from "../shared/nativeHandler";

export { handler } from "./handler";
const handleRequest = nativeHandler(handler);

export default async function phrases(request: Request): Promise<Response> {
  const isVersionProbe = new URL(request.url).searchParams.has("versionOnly");
  if (!isVersionProbe) return handleRequest(request);

  const requestId = randomUUID();
  console.info(
    JSON.stringify({
      event: "phrases_version_request_started",
      requestId,
      method: request.method,
    }),
  );
  try {
    const response = await handleRequest(request);
    response.headers.set("x-audit-diagnostic-id", requestId);
    console.info(
      JSON.stringify({
        event: "phrases_version_request_completed",
        requestId,
        status: response.status,
      }),
    );
    return response;
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "phrases_version_request_failed",
        requestId,
        errorName: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    throw error;
  }
}
