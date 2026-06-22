import { callDeepL, toDeeplTargetLang } from "../shared/deepl";
import { corsHeaders } from "../shared/cors";

type FetchLike = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

type HandlerDeps = {
  deeplFetch: FetchLike;
  sleep: (ms: number) => Promise<void>;
  apiKey: string;
};

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

function ok(data: unknown, origin: string | undefined): NetlifyResponse {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    body: JSON.stringify(data),
  };
}

function err(statusCode: number, message: string, origin?: string | undefined): NetlifyResponse {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    body: JSON.stringify({ error: message }),
  };
}

export function makeHandler(deps: HandlerDeps) {
  return async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
    const origin = event.headers["origin"];

    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: corsHeaders(origin), body: "" };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(event.body ?? "");
    } catch {
      return err(400, "Invalid JSON", origin);
    }

    if (typeof parsed !== "object" || parsed === null) {
      return err(400, "Invalid request body", origin);
    }

    const body = parsed as Record<string, unknown>;

    if (!Array.isArray(body.texts)) {
      return err(400, "Missing or invalid texts field", origin);
    }

    if (typeof body.targetLang !== "string") {
      return err(400, "Missing or invalid targetLang field", origin);
    }

    const texts = body.texts as string[];
    const targetLang = toDeeplTargetLang(body.targetLang);

    const results = await callDeepL(texts, targetLang, deps.apiKey, deps.deeplFetch, deps.sleep);

    if (results === null) {
      return err(500, "Translation failed", origin);
    }

    return ok({ translations: results }, origin);
  };
}

const defaultDeps: HandlerDeps = {
  deeplFetch: (url, init) => fetch(url, init as RequestInit) as unknown as ReturnType<FetchLike>,
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  apiKey: process.env.DEEPL_API_KEY ?? "",
};

export const handler = makeHandler(defaultDeps);
