/**
 * EasyEyes Studio assistant — the model call behind the Studio's chat pane.
 *
 * A credentialed relay to the Anthropic Messages API. The Studio composes
 * the whole conversation in the browser (system prompt with the live
 * glossary, the current table, the tool definitions, every tool result),
 * because that is where the glossary, the table and the compiler's validator
 * live. This function adds what the browser must not hold — the API key —
 * and enforces what the browser cannot be trusted to: who may call (a valid
 * Pavlovia sign-in, checked against GitLab), how often (per client and per
 * account), how much (payload, message and token caps) and which model.
 *
 * Request (POST, JSON):
 *   { protocolVersion: 1, pavloviaToken, system: ContentBlock[],
 *     messages: Message[], tools: Tool[], maxTokens?: number,
 *     mode?: "fast" }
 * Response: the upstream message's { content, stop_reason, usage, model }.
 *
 * mode "fast" asks for a thought-free, low-effort round. The Studio sends it
 * as a hedge when a normal round is slow, and as the retry after a timeout:
 * the tools are deterministic, so a quick answer is still a correct one. A
 * client can only ask for less effort than the site's default, never more.
 *
 * Environment: ANTHROPIC_API_KEY (required), STUDIO_ASSISTANT_MODEL
 * (optional; default below), STUDIO_ASSISTANT_EFFORT (optional; default
 * below — "low" | "medium" | "high" | "xhigh" | "max", or "off" to send no
 * effort setting for models that lack the parameter), STUDIO_ASSISTANT_THINKING
 * (optional; "adaptive" by default — the model may think, steered by the
 * effort level; "off" answers without thinking blocks).
 */
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

export interface AssistantRequest {
  readonly protocolVersion: 1;
  readonly pavloviaToken: string;
  readonly system: unknown[];
  readonly messages: unknown[];
  readonly tools: unknown[];
  readonly maxTokens: number;
  readonly mode?: "fast";
}

export interface AssistantHandlerDependencies {
  readonly fetchImpl?: FetchLike;
  readonly now?: () => number;
  readonly apiKey?: () => string | undefined;
  readonly model?: () => string | undefined;
  readonly effort?: () => string | undefined;
  readonly thinking?: () => string | undefined;
  /** Replaces the GitLab check (tests). */
  readonly verifyPavloviaToken?: (token: string) => Promise<boolean>;
  readonly upstreamTimeoutMs?: number;
  readonly rateLimitWindowMs?: number;
  readonly clientRateLimitMaximumRequests?: number;
  readonly accountRateLimitMaximumRequests?: number;
}

export const ASSISTANT_PROTOCOL_VERSION = 1;
export const DEFAULT_MODEL = "claude-sonnet-5";
/**
 * Sonnet 5 thinks adaptively at "high" effort unless told otherwise. When
 * the model had to type whole tables that meant 30–40 s a round and, on a
 * full study, the function's 60 s limit. The Studio's tools now take a
 * compact spec or a list of knobs (source/studio/builder) — a study is ~150
 * output tokens — so the model can be allowed to think about the ask, at
 * medium effort, and still answer in seconds. Set STUDIO_ASSISTANT_THINKING
 * to "off" (and effort "low") for the fastest, thought-free rounds.
 */
export const DEFAULT_EFFORT = "medium";
export const EFFORT_LEVELS = ["low", "medium", "high", "xhigh", "max"] as const;
export const DEFAULT_THINKING = "adaptive";
const ANTHROPIC_MESSAGES_ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const PAVLOVIA_GITLAB_USER_ENDPOINT = "https://gitlab.pavlovia.org/api/v4/user";

/** Netlify's synchronous limit is 60 s; leave room to answer. */
const DEFAULT_UPSTREAM_TIMEOUT_MS = 55_000;
const TOKEN_CHECK_TIMEOUT_MS = 5_000;
const TOKEN_CHECK_CACHE_MS = 10 * 60_000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_CLIENT_RATE_LIMIT_MAXIMUM_REQUESTS = 40;
const DEFAULT_ACCOUNT_RATE_LIMIT_MAXIMUM_REQUESTS = 30;
const EDGE_RATE_LIMIT_MAXIMUM_REQUESTS = 120;
const EDGE_RATE_LIMIT_WINDOW_SECONDS = 60;

export const MAX_BODY_BYTES = 2_000_000;
export const MAX_MESSAGES = 200;
export const MAX_TOOLS = 24;
export const MAX_SYSTEM_BLOCKS = 8;
export const DEFAULT_MAX_TOKENS = 4096;
export const MAX_MAX_TOKENS = 8192;

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

const header = (event: NetlifyEvent, name: string): string | undefined =>
  event.headers[name] ?? event.headers[name.toLowerCase()];

const clientIdentifier = (event: NetlifyEvent): string | undefined => {
  const direct =
    header(event, "x-nf-client-connection-ip") ?? header(event, "client-ip");
  if (direct?.trim()) return direct.trim();
  const forwarded = header(event, "x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || undefined;
};

const sha256 = (s: string): string =>
  createHash("sha256").update(s).digest("hex");

class BestEffortRateLimiter {
  private readonly entries = new Map<string, number[]>();
  private requestCount = 0;

  constructor(
    private readonly windowMs: number,
    private readonly maximumRequests: number,
  ) {}

  accept(identifier: string, nowMs: number): boolean {
    const cutoff = nowMs - this.windowMs;
    this.requestCount += 1;
    if (this.requestCount % 100 === 0) {
      for (const [key, timestamps] of this.entries)
        if (!timestamps.some((t) => t > cutoff)) this.entries.delete(key);
    }
    const current = (this.entries.get(identifier) ?? []).filter(
      (t) => t > cutoff,
    );
    if (current.length >= this.maximumRequests) {
      this.entries.set(identifier, current);
      return false;
    }
    current.push(nowMs);
    this.entries.set(identifier, current);
    return true;
  }
}

/** The effort setting to send, or null to send none ("off" / unknown). */
export const effortSetting = (
  raw: string | undefined,
): (typeof EFFORT_LEVELS)[number] | null => {
  const v = (raw ?? "").trim().toLowerCase() || DEFAULT_EFFORT;
  if (v === "off") return null;
  return (EFFORT_LEVELS as readonly string[]).includes(v)
    ? (v as (typeof EFFORT_LEVELS)[number])
    : DEFAULT_EFFORT;
};

/** True when the model may think ("adaptive"); anything else means off. */
export const thinkingEnabled = (raw: string | undefined): boolean =>
  ((raw ?? "").trim().toLowerCase() || DEFAULT_THINKING) === "adaptive";

const validatePositive = (value: number, name: string): number => {
  if (!Number.isFinite(value) || value <= 0)
    throw new RangeError(`${name} must be a finite positive number.`);
  return value;
};

/** Structural validation only; the model API validates block contents. */
export const parseRequest = (
  body: string | null,
): AssistantRequest | undefined => {
  if (!body || body.length > MAX_BODY_BYTES) return undefined;
  let parsed: Partial<AssistantRequest> & {
    maxTokens?: unknown;
    mode?: unknown;
  };
  try {
    parsed = JSON.parse(body);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  if (parsed.protocolVersion !== ASSISTANT_PROTOCOL_VERSION) return undefined;
  if (
    typeof parsed.pavloviaToken !== "string" ||
    !parsed.pavloviaToken.trim() ||
    parsed.pavloviaToken.length > 2048
  )
    return undefined;
  if (
    !Array.isArray(parsed.messages) ||
    parsed.messages.length === 0 ||
    parsed.messages.length > MAX_MESSAGES
  )
    return undefined;
  const system = parsed.system ?? [];
  if (!Array.isArray(system) || system.length > MAX_SYSTEM_BLOCKS)
    return undefined;
  const tools = parsed.tools ?? [];
  if (!Array.isArray(tools) || tools.length > MAX_TOOLS) return undefined;
  let maxTokens = DEFAULT_MAX_TOKENS;
  if (parsed.maxTokens !== undefined) {
    if (typeof parsed.maxTokens !== "number" || !(parsed.maxTokens > 0))
      return undefined;
    maxTokens = Math.min(Math.floor(parsed.maxTokens), MAX_MAX_TOKENS);
  }
  if (parsed.mode !== undefined && parsed.mode !== "fast") return undefined;
  return {
    protocolVersion: ASSISTANT_PROTOCOL_VERSION,
    pavloviaToken: parsed.pavloviaToken,
    system,
    messages: parsed.messages,
    tools,
    maxTokens,
    ...(parsed.mode === "fast" ? { mode: "fast" as const } : {}),
  };
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

/**
 * A Pavlovia sign-in is a GitLab OAuth access token; GitLab's /user answers
 * 200 for a live one. Positive answers are remembered (by hash) for a while
 * so a chat turn with several tool rounds costs one check.
 */
const makeTokenVerifier = (
  fetchImpl: FetchLike,
  now: () => number,
): ((token: string) => Promise<boolean>) => {
  const verified = new Map<string, number>();
  return async (token) => {
    const key = sha256(token);
    const until = verified.get(key);
    if (until !== undefined && until > now()) return true;
    try {
      const response = await withTimeout(
        fetchImpl,
        PAVLOVIA_GITLAB_USER_ENDPOINT,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
        TOKEN_CHECK_TIMEOUT_MS,
      );
      if (!response.ok) return false;
      const user = (await response.json()) as { id?: unknown };
      if (typeof user?.id !== "number") return false;
      verified.set(key, now() + TOKEN_CHECK_CACHE_MS);
      if (verified.size > 5000) verified.clear();
      return true;
    } catch {
      return false;
    }
  };
};

export const createAssistantHandler = (
  dependencies: AssistantHandlerDependencies = {},
) => {
  const fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
  const now = dependencies.now ?? Date.now;
  const apiKey = dependencies.apiKey ?? (() => process.env.ANTHROPIC_API_KEY);
  const model =
    dependencies.model ?? (() => process.env.STUDIO_ASSISTANT_MODEL);
  const effort =
    dependencies.effort ?? (() => process.env.STUDIO_ASSISTANT_EFFORT);
  const thinking =
    dependencies.thinking ?? (() => process.env.STUDIO_ASSISTANT_THINKING);
  const upstreamTimeoutMs = validatePositive(
    dependencies.upstreamTimeoutMs ?? DEFAULT_UPSTREAM_TIMEOUT_MS,
    "upstreamTimeoutMs",
  );
  const verifyPavloviaToken =
    dependencies.verifyPavloviaToken ?? makeTokenVerifier(fetchImpl, now);
  const windowMs = validatePositive(
    dependencies.rateLimitWindowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS,
    "rateLimitWindowMs",
  );
  const clientLimiter = new BestEffortRateLimiter(
    windowMs,
    validatePositive(
      dependencies.clientRateLimitMaximumRequests ??
        DEFAULT_CLIENT_RATE_LIMIT_MAXIMUM_REQUESTS,
      "clientRateLimitMaximumRequests",
    ),
  );
  const accountLimiter = new BestEffortRateLimiter(
    windowMs,
    validatePositive(
      dependencies.accountRateLimitMaximumRequests ??
        DEFAULT_ACCOUNT_RATE_LIMIT_MAXIMUM_REQUESTS,
      "accountRateLimitMaximumRequests",
    ),
  );

  return async (event: NetlifyEvent): Promise<NetlifyResponse> => {
    const origin = header(event, "origin");
    if (!isAllowedOrigin(origin))
      return jsonResponse(403, { error: "Origin not allowed" });
    if (event.httpMethod === "OPTIONS")
      return {
        statusCode: 204,
        headers: {
          ...corsHeaders(origin, ALLOWED_HEADERS),
          "Cache-Control": NO_STORE,
          "Netlify-CDN-Cache-Control": NO_STORE,
        },
      } as unknown as NetlifyResponse;
    if (event.httpMethod !== "POST")
      return jsonResponse(405, { error: "Method not allowed" }, origin, {
        Allow: "POST, OPTIONS",
      });

    const request = parseRequest(event.body);
    if (!request)
      return jsonResponse(400, { error: "Invalid assistant request" }, origin);

    const clientId = clientIdentifier(event);
    if (!clientId)
      return jsonResponse(
        403,
        { error: "Client identity unavailable" },
        origin,
      );
    const t = now();
    if (
      !clientLimiter.accept(sha256(clientId), t) ||
      !accountLimiter.accept(sha256(request.pavloviaToken), t)
    )
      return jsonResponse(
        429,
        { error: "Too many assistant requests; please wait a minute" },
        origin,
        { "Retry-After": String(Math.ceil(windowMs / 1000)) },
      );

    if (!(await verifyPavloviaToken(request.pavloviaToken)))
      return jsonResponse(
        401,
        {
          error: "Sign in to Pavlovia on the Compiler tab to use the assistant",
        },
        origin,
      );

    const key = apiKey()?.trim();
    if (!key)
      return jsonResponse(
        503,
        { error: "The Studio assistant is not configured on this site" },
        origin,
      );
    if (typeof fetchImpl !== "function")
      return jsonResponse(503, { error: "Assistant unavailable" }, origin);

    try {
      const fast = request.mode === "fast";
      const siteEffort = effortSetting(effort());
      // Fast rounds: lowest effort (or none, if the site sends none) and no
      // thinking — whichever is less than the site's setting.
      const effortLevel = fast && siteEffort ? "low" : siteEffort;
      const think = thinkingEnabled(thinking()) && !fast;
      const upstream = await withTimeout(
        fetchImpl,
        ANTHROPIC_MESSAGES_ENDPOINT,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": ANTHROPIC_VERSION,
          },
          body: JSON.stringify({
            model: model()?.trim() || DEFAULT_MODEL,
            max_tokens: request.maxTokens,
            ...(effortLevel ? { output_config: { effort: effortLevel } } : {}),
            ...(think ? {} : { thinking: { type: "disabled" } }),
            system: request.system,
            messages: request.messages,
            tools: request.tools,
          }),
          cache: "no-store",
        },
        upstreamTimeoutMs,
      );
      const text = await upstream.text();
      let body: any = null;
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
      if (!upstream.ok) {
        const upstreamMessage =
          typeof body?.error?.message === "string"
            ? body.error.message
            : undefined;
        if (upstream.status === 429)
          return jsonResponse(
            429,
            { error: "The model is rate limited; please retry shortly" },
            origin,
          );
        if (upstream.status === 401 || upstream.status === 403)
          return jsonResponse(
            503,
            { error: "The Studio assistant's model key was rejected" },
            origin,
          );
        return jsonResponse(
          502,
          {
            error: upstreamMessage
              ? `Model error: ${upstreamMessage.slice(0, 500)}`
              : "The model did not answer",
          },
          origin,
        );
      }
      if (!body || !Array.isArray(body.content))
        return jsonResponse(
          502,
          { error: "The model returned an unexpected response" },
          origin,
        );
      return jsonResponse(
        200,
        {
          content: body.content,
          stop_reason: body.stop_reason ?? null,
          usage: body.usage ?? null,
          model: body.model ?? null,
        },
        origin,
      );
    } catch (error) {
      const aborted = (error as { name?: string })?.name === "AbortError";
      return jsonResponse(
        aborted ? 504 : 503,
        {
          error: aborted
            ? "The model took too long to answer (over 55 s). Ask again, or ask for the change in smaller pieces."
            : "Assistant unavailable",
        },
        origin,
      );
    }
  };
};

export const handler = createAssistantHandler();

export const config = {
  path: "/.netlify/functions/studio-assistant",
  rateLimit: {
    windowLimit: EDGE_RATE_LIMIT_MAXIMUM_REQUESTS,
    windowSize: EDGE_RATE_LIMIT_WINDOW_SECONDS,
    aggregateBy: ["ip", "domain"],
  },
} as const;
