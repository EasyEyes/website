import { createHash } from "crypto";
import { corsHeaders, isAllowedOrigin } from "../shared/cors";

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

type FetchLike = typeof fetch;
type SpeechProvider = "elevenlabs" | "deepgram";

interface SpeechTokenRequest {
  readonly protocolVersion: 1;
  readonly provider: SpeechProvider;
  readonly experimentFullPath: string;
  readonly pavloviaSessionToken: string;
}

export interface SpeechTokenHandlerDependencies {
  readonly fetchImpl?: FetchLike;
  readonly now?: () => number;
  readonly elevenLabsApiKey?: () => string | undefined;
  readonly deepgramApiKey?: () => string | undefined;
  readonly verifyExperimentContext?: (
    request: SpeechTokenRequest,
  ) => Promise<boolean>;
  readonly upstreamTimeoutMs?: number;
  readonly rateLimitWindowMs?: number;
  readonly clientRateLimitMaximumRequests?: number;
  readonly sessionRateLimitMaximumRequests?: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

const ELEVENLABS_TOKEN_ENDPOINT =
  "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe";
const DEEPGRAM_TOKEN_ENDPOINT = "https://api.deepgram.com/v1/auth/grant";
const SPEECH_TOKEN_PROTOCOL_VERSION = 1;
const PAVLOVIA_BASE_URL = "https://pavlovia.org";
const ELEVENLABS_TOKEN_LIFETIME_SECONDS = 15 * 60;
const DEEPGRAM_TOKEN_LIFETIME_SECONDS = 60;
const DEFAULT_UPSTREAM_TIMEOUT_MS = 5000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_CLIENT_RATE_LIMIT_MAXIMUM_REQUESTS = 600;
const DEFAULT_SESSION_RATE_LIMIT_MAXIMUM_REQUESTS = 60;
const EDGE_RATE_LIMIT_MAXIMUM_REQUESTS = 600;
const EDGE_RATE_LIMIT_WINDOW_SECONDS = 60;
const ALLOWED_HEADERS = "Content-Type";
const NO_STORE = "no-store";

const jsonResponse = (
  statusCode: number,
  data: unknown,
  origin?: string,
  additionalHeaders: Record<string, string> = {},
): NetlifyResponse => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": NO_STORE,
    "Netlify-CDN-Cache-Control": NO_STORE,
    ...corsHeaders(origin, ALLOWED_HEADERS),
    ...additionalHeaders,
  },
  body: JSON.stringify(data),
});

const header = (event: NetlifyEvent, name: string): string | undefined => {
  const lowercase = name.toLowerCase();
  return event.headers[name] ?? event.headers[lowercase];
};

const clientIdentifier = (event: NetlifyEvent): string | undefined => {
  const direct =
    header(event, "x-nf-client-connection-ip") ?? header(event, "client-ip");
  if (direct?.trim()) return direct.trim();
  const forwarded = header(event, "x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || undefined;
};

class BestEffortRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();
  private requestCount = 0;

  constructor(
    private readonly windowMs: number,
    private readonly maximumRequests: number,
  ) {}

  accept(identifier: string, nowMs: number): boolean {
    const cutoff = nowMs - this.windowMs;
    this.requestCount += 1;
    if (this.requestCount % 100 === 0) {
      for (const [key, entry] of this.entries) {
        if (!entry.timestamps.some((timestamp) => timestamp > cutoff)) {
          this.entries.delete(key);
        }
      }
    }
    const previous = this.entries.get(identifier)?.timestamps ?? [];
    const current = previous.filter((timestamp) => timestamp > cutoff);
    if (current.length >= this.maximumRequests) {
      this.entries.set(identifier, { timestamps: current });
      return false;
    }
    current.push(nowMs);
    this.entries.set(identifier, { timestamps: current });
    return true;
  }
}

const validatePositive = (value: number, name: string): number => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number.`);
  }
  return value;
};

const parseRequest = (body: string | null): SpeechTokenRequest | undefined => {
  if (!body || body.length > 16_384) return undefined;
  try {
    const parsed = JSON.parse(body) as Partial<SpeechTokenRequest>;
    if (parsed.protocolVersion !== SPEECH_TOKEN_PROTOCOL_VERSION) {
      return undefined;
    }
    if (parsed.provider !== "elevenlabs" && parsed.provider !== "deepgram") {
      return undefined;
    }
    if (
      typeof parsed.experimentFullPath !== "string" ||
      !/^[^/\s]+\/[^/\s]+$/.test(parsed.experimentFullPath) ||
      parsed.experimentFullPath.length > 300 ||
      typeof parsed.pavloviaSessionToken !== "string" ||
      !parsed.pavloviaSessionToken.trim() ||
      parsed.pavloviaSessionToken.length > 2048
    ) {
      return undefined;
    }
    return {
      protocolVersion: SPEECH_TOKEN_PROTOCOL_VERSION,
      provider: parsed.provider,
      experimentFullPath: parsed.experimentFullPath,
      pavloviaSessionToken: parsed.pavloviaSessionToken,
    };
  } catch {
    return undefined;
  }
};

const withTimeout = async (
  fetchImpl: FetchLike,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const checkPavloviaExperimentContext = async (
  fetchImpl: FetchLike,
  request: SpeechTokenRequest,
  timeoutMs: number,
): Promise<boolean> => {
  const url = new URL(
    `/api/v2/experiments/${encodeURIComponent(
      request.experimentFullPath,
    )}/resources`,
    PAVLOVIA_BASE_URL,
  );
  url.searchParams.set("token", request.pavloviaSessionToken);
  try {
    const response = await withTimeout(
      fetchImpl,
      url.toString(),
      { method: "GET", cache: "no-store" },
      timeoutMs,
    );
    if (!response.ok) return false;
    const body = (await response.json()) as {
      resources?: unknown;
      resourceDirectory?: unknown;
    };
    return (
      Array.isArray(body.resources) &&
      typeof body.resourceDirectory === "string"
    );
  } catch {
    return false;
  }
};

export const createSpeechTokenHandler = (
  dependencies: SpeechTokenHandlerDependencies = {},
) => {
  const fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
  const now = dependencies.now ?? Date.now;
  const elevenLabsApiKey =
    dependencies.elevenLabsApiKey ?? (() => process.env.ELEVENLABS_API_KEY);
  const deepgramApiKey =
    dependencies.deepgramApiKey ?? (() => process.env.DEEPGRAM_API_KEY);
  const upstreamTimeoutMs = validatePositive(
    dependencies.upstreamTimeoutMs ?? DEFAULT_UPSTREAM_TIMEOUT_MS,
    "upstreamTimeoutMs",
  );
  const verifyExperimentContext =
    dependencies.verifyExperimentContext ??
    ((request: SpeechTokenRequest) =>
      checkPavloviaExperimentContext(
        fetchImpl,
        request,
        upstreamTimeoutMs,
      ));
  const rateLimitWindowMs = validatePositive(
    dependencies.rateLimitWindowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS,
    "rateLimitWindowMs",
  );
  const clientRateLimitMaximumRequests = validatePositive(
    dependencies.clientRateLimitMaximumRequests ??
      DEFAULT_CLIENT_RATE_LIMIT_MAXIMUM_REQUESTS,
    "clientRateLimitMaximumRequests",
  );
  const sessionRateLimitMaximumRequests = validatePositive(
    dependencies.sessionRateLimitMaximumRequests ??
      DEFAULT_SESSION_RATE_LIMIT_MAXIMUM_REQUESTS,
    "sessionRateLimitMaximumRequests",
  );
  const clientRateLimiter = new BestEffortRateLimiter(
    rateLimitWindowMs,
    clientRateLimitMaximumRequests,
  );
  const sessionRateLimiter = new BestEffortRateLimiter(
    rateLimitWindowMs,
    sessionRateLimitMaximumRequests,
  );

  return async (event: NetlifyEvent): Promise<NetlifyResponse> => {
    const origin = header(event, "origin");
    if (!isAllowedOrigin(origin)) {
      return jsonResponse(403, { error: "Origin not allowed" });
    }
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          ...corsHeaders(origin, ALLOWED_HEADERS),
          "Cache-Control": NO_STORE,
          "Netlify-CDN-Cache-Control": NO_STORE,
        },
        body: "",
      };
    }
    if (event.httpMethod !== "POST") {
      return jsonResponse(405, { error: "Method not allowed" }, origin, {
        Allow: "POST, OPTIONS",
      });
    }

    const request = parseRequest(event.body);
    if (!request) {
      return jsonResponse(400, { error: "Invalid credential request" }, origin);
    }
    const clientId = clientIdentifier(event);
    if (!clientId) {
      return jsonResponse(
        403,
        { error: "Client identity unavailable" },
        origin,
      );
    }
    const clientRateLimitId = createHash("sha256")
      .update(`${clientId}:${request.provider}`)
      .digest("hex");
    const sessionRateLimitId = createHash("sha256")
      .update(`${clientId}:${request.provider}:${request.pavloviaSessionToken}`)
      .digest("hex");
    const requestTime = now();
    if (
      !clientRateLimiter.accept(clientRateLimitId, requestTime) ||
      !sessionRateLimiter.accept(sessionRateLimitId, requestTime)
    ) {
      return jsonResponse(
        429,
        { error: "Too many credential requests" },
        origin,
        { "Retry-After": String(Math.ceil(rateLimitWindowMs / 1000)) },
      );
    }
    if (!(await verifyExperimentContext(request))) {
      return jsonResponse(401, { error: "Invalid experiment session" }, origin);
    }
    if (typeof fetchImpl !== "function") {
      return jsonResponse(
        503,
        { error: "Credential service unavailable" },
        origin,
      );
    }
    const apiKey =
      request.provider === "elevenlabs"
        ? elevenLabsApiKey()?.trim()
        : deepgramApiKey()?.trim();
    if (!apiKey) {
      return jsonResponse(
        503,
        { error: "Realtime transcription is not configured" },
        origin,
      );
    }

    try {
      const upstream =
        request.provider === "elevenlabs"
          ? await withTimeout(
              fetchImpl,
              ELEVENLABS_TOKEN_ENDPOINT,
              {
                method: "POST",
                headers: { Accept: "application/json", "xi-api-key": apiKey },
                cache: "no-store",
              },
              upstreamTimeoutMs,
            )
          : await withTimeout(
              fetchImpl,
              DEEPGRAM_TOKEN_ENDPOINT,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  Authorization: `Token ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ttl_seconds: DEEPGRAM_TOKEN_LIFETIME_SECONDS,
                }),
                cache: "no-store",
              },
              upstreamTimeoutMs,
            );

      if (!upstream.ok) {
        return jsonResponse(
          upstream.status === 429 ? 429 : 503,
          {
            error:
              upstream.status === 429
                ? "Credential service rate limited"
                : "Credential service unavailable",
          },
          origin,
        );
      }
      const body = (await upstream.json()) as {
        token?: unknown;
        access_token?: unknown;
        expires_in?: unknown;
      };
      const token =
        request.provider === "elevenlabs" ? body.token : body.access_token;
      if (typeof token !== "string" || !token.trim()) {
        return jsonResponse(
          503,
          { error: "Credential service returned an invalid response" },
          origin,
        );
      }
      const expiresInSeconds =
        request.provider === "elevenlabs"
          ? ELEVENLABS_TOKEN_LIFETIME_SECONDS
          : typeof body.expires_in === "number"
          ? body.expires_in
          : DEEPGRAM_TOKEN_LIFETIME_SECONDS;
      return jsonResponse(200, { token, expiresInSeconds }, origin);
    } catch {
      return jsonResponse(
        503,
        { error: "Credential service unavailable" },
        origin,
      );
    }
  };
};

export const handler = createSpeechTokenHandler();

export const config = {
  path: "/.netlify/functions/speech-token",
  rateLimit: {
    windowLimit: EDGE_RATE_LIMIT_MAXIMUM_REQUESTS,
    windowSize: EDGE_RATE_LIMIT_WINDOW_SECONDS,
    aggregateBy: ["ip", "domain"],
  },
} as const;
