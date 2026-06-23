import { translatePhraseFile, type Deps } from "./translatePhraseFile";
import { corsHeaders } from "../shared/cors";

type NetlifyEvent = {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonOk(data: unknown): NetlifyResponse {
  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  };
}

function jsonErr(statusCode: number, message: string): NetlifyResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

function withCors(
  response: NetlifyResponse,
  origin: string | undefined
): NetlifyResponse {
  return {
    ...response,
    headers: { ...(response.headers ?? {}), ...corsHeaders(origin) },
  };
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return withCors(jsonErr(405, "Method not allowed"), origin);
  }

  const expectedSecret = process.env.PHRASES_SECRET;
  const providedSecret =
    event.headers["x-phrases-secret"] ?? event.headers["X-Phrases-Secret"];
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return withCors(jsonErr(401, "Unauthorized"), origin);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(event.body ?? "");
  } catch {
    return withCors(jsonErr(400, "Invalid JSON"), origin);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).fileBase64 !== "string"
  ) {
    return withCors(jsonErr(400, "Missing fileBase64 field"), origin);
  }

  const { fileBase64 } = parsed as { fileBase64: string };

  let xlsxBuffer: Buffer;
  try {
    xlsxBuffer = Buffer.from(fileBase64, "base64");
  } catch {
    return withCors(jsonErr(400, "Invalid base64 in fileBase64"), origin);
  }

  const httpFetch: Deps["deeplFetch"] = (url, init) =>
    fetch(url, init as RequestInit) as unknown as ReturnType<Deps["deeplFetch"]>;

  const deps: Deps = {
    deeplFetch: httpFetch,
    googleFetch: httpFetch,
    deeplApiKey: process.env.DEEPL_API_KEY ?? "",
    googleApiKey: process.env.GOOGLE_API_KEY,
  };

  try {
    const outBuffer = await translatePhraseFile(xlsxBuffer, deps);
    return withCors(
      jsonOk({ fileBase64: outBuffer.toString("base64") }),
      origin
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Translation failed";
    return withCors(jsonErr(500, message), origin);
  }
}
