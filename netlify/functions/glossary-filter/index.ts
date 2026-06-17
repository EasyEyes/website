import {
  encodeFirebaseSegment,
  decodeFirebaseSegment,
} from "../shared/encodeFirebaseSegment";
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

type GlossaryEntry = {
  name: string;
  availability: string;
  type: string;
  default: string;
  explanation: string;
  example: string;
  categories: string[];
};

type GlossaryData = {
  version: string;
  glossary: Record<string, GlossaryEntry>;
  glossaryFull: GlossaryEntry[];
  superMatchingParams: string[];
};

const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";

function firebaseUrl(path: string): string {
  return `${FIREBASE_ROOT}/${path}.json?auth=${process.env.FIREBASE_DB}`;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000,
  retries = 1,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (err) {
      lastErr = err;
      if (attempt < retries)
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

async function firebaseGet(path: string): Promise<unknown> {
  const res = await fetchWithTimeout(firebaseUrl(path));
  if (!res.ok) throw new Error(`Firebase GET ${path} → ${res.status}`);
  try {
    return await res.json();
  } catch {
    throw new Error(`Firebase GET ${path} returned a non-JSON body`);
  }
}

const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonOk(data: unknown): NetlifyResponse {
  return {
    statusCode: 200,
    headers: { ...JSON_HEADERS, "Cache-Control": "no-store" },
    body: JSON.stringify(data),
  };
}

function jsonErr(statusCode: number, message: string): NetlifyResponse {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, "Cache-Control": "no-store" },
    body: JSON.stringify({ error: message }),
  };
}

function withCors(
  response: NetlifyResponse,
  origin: string | undefined,
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

  try {
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.body ?? "");
    } catch {
      return withCors(jsonErr(400, "Invalid JSON"), origin);
    }

    if (typeof parsed !== "object" || parsed === null) {
      return withCors(jsonErr(400, "Invalid request body"), origin);
    }

    const body = parsed as Record<string, unknown>;

    if (typeof body.v !== "string") {
      return withCors(jsonErr(400, "Missing or invalid v"), origin);
    }

    if (!Array.isArray(body.keys)) {
      return withCors(jsonErr(400, "Missing or invalid keys"), origin);
    }

    const version = body.v;
    const keys = body.keys as string[];

    const raw = (await firebaseGet(
      `versions/${encodeFirebaseSegment(version)}/glossary`,
    )) as Record<string, GlossaryEntry> | null;

    if (!raw) return withCors(jsonErr(404, "Version not found"), origin);

    const keySet = new Set(keys);
    const glossary: Record<string, GlossaryEntry> = {};

    for (const [encodedKey, entry] of Object.entries(raw)) {
      const name = decodeFirebaseSegment(encodedKey);
      if (keySet.has(name) || name.includes("@@")) {
        glossary[name] = entry;
      }
    }

    const data: GlossaryData = {
      version,
      glossary,
      glossaryFull: Object.values(glossary),
      superMatchingParams: Object.keys(glossary).filter((k) => k.includes("@@")),
    };

    return withCors(jsonOk(data), origin);
  } catch (err) {
    console.error("[glossary-filter] POST failed:", err);
    return withCors(
      jsonErr(503, "Glossary backend temporarily unavailable"),
      origin,
    );
  }
}
