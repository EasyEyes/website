import { gzipSync } from "zlib";
import { diffEnglish } from "./diffEnglish";
import { translateCells } from "./translateCells";
import { buildNewVersion } from "./buildNewVersion";
import { encodeFirebaseSegment } from "../glossary/encodeFirebaseSegment";
import { corsHeaders } from "../shared/cors";
import type { VersionedPhrases, PhraseMap, TranslateDeps } from "./types";

type NetlifyEvent = {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
  queryStringParameters?: Record<string, string | undefined>;
};

type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
};

const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";
const JSON_HEADERS = { "Content-Type": "application/json" };

function firebaseUrl(path: string): string {
  return `${FIREBASE_ROOT}/${path}.json?auth=${process.env.FIREBASE_DB}`;
}

// Firebase is a live dependency in the request path. A slow or degraded
// Firebase must fail fast (well under Netlify's 10s function timeout) and
// recover from transient blips, rather than hanging until Netlify kills the
// invocation and returns an opaque 502. Each attempt is bounded by an
// AbortController; reads retry once with a short backoff, writes never retry
// (to avoid duplicate PUTs).
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000,
  retries = 1
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

async function firebasePut(
  path: string,
  value: unknown
): Promise<{ ok: boolean; status: number; errorBody?: string }> {
  const res = await fetchWithTimeout(
    firebaseUrl(path),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    },
    5000,
    0
  );
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "(unreadable)");
    return { ok: false, status: res.status, errorBody };
  }
  return { ok: true, status: res.status };
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

// Cache directives keyed to the immutability of each response shape. A specific
// version (`?v=`) never changes once published, so it is cached forever; the
// version probe (`?versionOnly=1`) is the freshness oracle and the pinned-version
// resolution (`?pinned`) depends on the mutable pin, so neither is ever cached;
// the bare "current" response is only used for initial display, so a short
// window with stale-while-revalidate is enough. `Netlify-CDN-Cache-Control`
// drives Netlify's edge; `Cache-Control` drives the browser.
const CACHE = {
  none: "no-store",
  immutable: "public, max-age=31536000, immutable",
  short: "public, max-age=60, stale-while-revalidate=86400",
} as const;

// CORS responses carry a per-origin `Access-Control-Allow-Origin`, but Netlify's
// CDN keys cached responses on the query string only by default. Without this,
// the first request to fill an immutable (`?v=`) entry freezes whatever ACAO it
// had — including the empty header from a no-Origin/non-allowed request — and
// serves it to every origin for a year, breaking CORS. Keying on Origin too
// gives each origin its own cache slot with its own correct ACAO header.
const NETLIFY_VARY = "query, header=Origin";

function jsonOk(data: unknown, cache: string = CACHE.none): NetlifyResponse {
  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      "Cache-Control": cache,
      "Netlify-CDN-Cache-Control": cache,
      "Netlify-Vary": NETLIFY_VARY,
    },
    body: JSON.stringify(data),
  };
}

function jsonOkGzipped(
  data: unknown,
  cache: string = CACHE.none
): NetlifyResponse {
  const compressed = gzipSync(Buffer.from(JSON.stringify(data), "utf-8"));
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip",
      "Cache-Control": cache,
      "Netlify-CDN-Cache-Control": cache,
      "Netlify-Vary": NETLIFY_VARY,
    },
    body: compressed.toString("base64"),
    isBase64Encoded: true,
  };
}

function jsonErr(statusCode: number, message: string): NetlifyResponse {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, "Cache-Control": CACHE.none },
    body: JSON.stringify({ error: message }),
  };
}

async function getCurrentVersion(): Promise<string | null> {
  return (await firebaseGet("phrases/currentVersion")) as string | null;
}

async function getVersionedPhrases(
  version: string
): Promise<VersionedPhrases | null> {
  const encoded = encodeFirebaseSegment(version);
  const phrases = (await firebaseGet(
    `phrasesVersions/${encoded}/phrases`
  )) as PhraseMap | null;
  if (!phrases) return null;
  return { version, phrases };
}

async function handleGet(event: NetlifyEvent): Promise<NetlifyResponse> {
  const params = event.queryStringParameters ?? {};

  if (params.versionOnly !== undefined) {
    // The freshness oracle the compiler relies on — must never be cached.
    const version = await getCurrentVersion();
    return jsonOk({ version }, CACHE.none);
  }

  if (params.v !== undefined) {
    // A specific version is immutable once published — cache it forever at the
    // edge and in the browser. This is the participant hot path.
    const data = await getVersionedPhrases(params.v);
    if (!data) return jsonErr(404, "Version not found");
    return jsonOkGzipped(data, CACHE.immutable);
  }

  if (params.pinned !== undefined) {
    // Resolve the (mutable) per-experiment pin to a version only. The caller
    // then fetches the immutable payload by explicit `?v=<version>`. Resolution
    // depends on the mutable pin, so don't cache.
    const slashIdx = params.pinned.indexOf("/");
    const username = params.pinned.slice(0, slashIdx);
    const experiment = params.pinned.slice(slashIdx + 1);
    const encodedUser = encodeFirebaseSegment(username);
    const encodedExp = encodeFirebaseSegment(experiment);
    const version = (await firebaseGet(
      `users/${encodedUser}/${encodedExp}/phrasesVersion`
    )) as string | null;
    if (!version) return jsonErr(404, "No pinned version");
    return jsonOk({ version }, CACHE.none);
  }

  // "Current" changes on publish; keep the window short and let the version
  // probe drive correctness. Participants fetch by explicit `?v=` instead.
  const version = await getCurrentVersion();
  if (!version) return jsonErr(404, "No current version");
  const data = await getVersionedPhrases(version);
  if (!data) return jsonErr(404, "Version not found");
  return jsonOkGzipped(data, CACHE.short);
}

async function handlePut(event: NetlifyEvent): Promise<NetlifyResponse> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(event.body ?? "");
  } catch {
    return jsonErr(400, "Invalid JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).username !== "string" ||
    typeof (parsed as Record<string, unknown>).experimentName !== "string"
  ) {
    return jsonErr(400, "Missing or invalid username or experimentName");
  }

  const { username, experimentName } = parsed as {
    username: string;
    experimentName: string;
  };

  const version = await getCurrentVersion();
  if (!version) return jsonErr(500, "No current version");

  const encodedUser = encodeFirebaseSegment(username);
  const encodedExp = encodeFirebaseSegment(experimentName);
  await firebasePut(`users/${encodedUser}/${encodedExp}/phrasesVersion`, version);

  return jsonOk({ version });
}

async function handleTranslate(
  body: Record<string, unknown>,
  skipSizeGuard: boolean
): Promise<NetlifyResponse> {
  const changedPhrases = body.changedPhrases as Record<string, string>;
  const colorMask = (body.colorMask ?? {}) as Record<
    string,
    Record<string, string>
  >;
  const sentValues = (body.sentValues ?? {}) as Record<
    string,
    Record<string, string>
  >;
  const nonCyanPhrases = (body.nonCyanPhrases ?? {}) as Record<
    string,
    Record<string, string>
  >;
  const removedKeys = body.removedKeys ?? [];
  const requestVersion = body.currentVersion as string;

  console.log("[phrases/translate] input:", {
    changedPhrases,
    requestVersion,
    changedCount: changedPhrases ? Object.keys(changedPhrases).length : 0,
    colorMaskKeys: Object.keys(colorMask),
    sentValuesKeys: Object.keys(sentValues),
    removedCount: Array.isArray(removedKeys) ? removedKeys.length : null,
    skipSizeGuard,
  });

  if (
    !changedPhrases ||
    typeof changedPhrases !== "object"
  ) {
    console.log("[phrases/translate] error: missing changedPhrases");
    return jsonErr(400, "Missing changedPhrases");
  }

  if (
    !Array.isArray(removedKeys) ||
    removedKeys.some((key) => typeof key !== "string")
  ) {
    console.log("[phrases/translate] error: invalid removedKeys");
    return jsonErr(400, "Invalid removedKeys");
  }

  if (!skipSizeGuard && Object.keys(changedPhrases).length > 50) {
    console.log("[phrases/translate] error: too many changed phrases", Object.keys(changedPhrases).length);
    return jsonErr(
      400,
      "Too many changed phrases (max 50 per synchronous call)"
    );
  }

  const firebaseVersion = await getCurrentVersion();
  console.log("[phrases/translate] version check:", { requestVersion, firebaseVersion, match: requestVersion === firebaseVersion });

  if (requestVersion !== firebaseVersion) {
    return jsonErr(409, "Version conflict: currentVersion has advanced");
  }

  const prevVersioned = firebaseVersion
    ? await getVersionedPhrases(firebaseVersion)
    : null;

  console.log("[phrases/translate] prevVersioned:", {
    version: prevVersioned?.version ?? null,
    phraseCount: prevVersioned ? Object.keys(prevVersioned.phrases).length : 0,
  });

  const httpFetch: TranslateDeps["deeplFetch"] = (url, init) =>
    fetch(url, init as RequestInit) as unknown as ReturnType<
      TranslateDeps["deeplFetch"]
    >;

  const deps: TranslateDeps = {
    deeplFetch: httpFetch,
    googleFetch: httpFetch,
    deeplApiKey: process.env.DEEPL_API_KEY ?? "",
    googleApiKey: process.env.GOOGLE_API_KEY,
  };

  const translatedRows = await translateCells(
    changedPhrases,
    colorMask,
    sentValues,
    deps
  );

  console.log("[phrases/translate] translatedRows:", translatedRows);

  // Merge non-cyan updates: for keys not already handled by translateCells,
  // store any values that differ from what is currently in Firebase.
  const prevPhrases = prevVersioned?.phrases ?? {};
  for (const [key, langVals] of Object.entries(nonCyanPhrases)) {
    if (key in changedPhrases) continue;
    const prevRow = prevPhrases[key] ?? {};
    for (const [lang, val] of Object.entries(langVals)) {
      if (prevRow[lang] !== val) {
        if (!translatedRows[key]) translatedRows[key] = {};
        translatedRows[key][lang] = val;
      }
    }
  }

  const newVersioned = buildNewVersion(
    prevVersioned,
    translatedRows,
    removedKeys
  );

  console.log("[phrases/translate] buildNewVersion result:", {
    isNull: newVersioned === null,
    newVersion: newVersioned?.version ?? null,
    newPhraseCount: newVersioned ? Object.keys(newVersioned.phrases).length : 0,
  });

  if (newVersioned === null) {
    console.log("[phrases/translate] no changes detected — returning existing version without Firebase write");
    return jsonOk({ newVersion: firebaseVersion, translatedRows });
  }

  const FIREBASE_INVALID_KEY = /[.$#[\]/]|[\x00-\x1f\x7f]|^$/;
  const sanitizedPhrases = Object.fromEntries(
    Object.entries(newVersioned.phrases).filter(([k]) => !FIREBASE_INVALID_KEY.test(k))
  );
  const droppedCount = Object.keys(newVersioned.phrases).length - Object.keys(sanitizedPhrases).length;
  if (droppedCount > 0) {
    const dropped = Object.keys(newVersioned.phrases).filter((k) => FIREBASE_INVALID_KEY.test(k));
    console.warn("[phrases/translate] dropping invalid Firebase keys:", dropped);
  }

  const encodedNewVersion = encodeFirebaseSegment(newVersioned.version);
  const phrasesResult = await firebasePut(
    `phrasesVersions/${encodedNewVersion}/phrases`,
    sanitizedPhrases
  );
  console.log("[phrases/translate] Firebase PUT phrases:", { ok: phrasesResult.ok, status: phrasesResult.status, errorBody: phrasesResult.errorBody });
  if (!phrasesResult.ok) {
    return jsonErr(502, `Firebase write failed for phrases (status ${phrasesResult.status}): ${phrasesResult.errorBody ?? ""}`);
  }

  const versionResult = await firebasePut(
    "phrases/currentVersion",
    newVersioned.version
  );
  console.log("[phrases/translate] Firebase PUT currentVersion:", { ok: versionResult.ok, status: versionResult.status, errorBody: versionResult.errorBody, newVersion: newVersioned.version });
  if (!versionResult.ok) {
    return jsonErr(502, `Firebase write failed for currentVersion (status ${versionResult.status}): ${versionResult.errorBody ?? ""}`);
  }

  console.log("[phrases/translate] success:", { newVersion: newVersioned.version, translatedRowCount: Object.keys(translatedRows).length });
  return jsonOk({ newVersion: newVersioned.version, translatedRows });
}

async function handlePost(event: NetlifyEvent): Promise<NetlifyResponse> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(event.body ?? "");
  } catch {
    return jsonErr(400, "Invalid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    return jsonErr(400, "Invalid request body");
  }

  const body = parsed as Record<string, unknown>;

  console.log("[phrases/POST] action:", body.action);

  if (body.action === "diff") {
    const english = body.english as Record<string, string> | undefined;
    if (!english || typeof english !== "object") {
      return jsonErr(400, "Missing or invalid english field");
    }
    console.log("[phrases/diff] input english count:", Object.keys(english).length);
    const version = await getCurrentVersion();
    const previousVersion = version ? await getVersionedPhrases(version) : null;
    const result = diffEnglish(english, previousVersion);
    console.log("[phrases/diff] result:", result);
    return jsonOk(result);
  }

  if (body.action === "translate") {
    return handleTranslate(body, false);
  }

  if (body.action === "fullResync") {
    return handleTranslate(body, true);
  }

  return jsonErr(400, `Unknown action: ${String(body.action)}`);
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (event.httpMethod === "POST") {
    const expectedSecret = process.env.PHRASES_SECRET;
    const providedSecret =
      event.headers["x-phrases-secret"] ?? event.headers["X-Phrases-Secret"];
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return withCors(jsonErr(401, "Unauthorized"), origin);
    }
  }

  try {
    if (event.httpMethod === "GET")
      return withCors(await handleGet(event), origin);
    if (event.httpMethod === "PUT")
      return withCors(await handlePut(event), origin);
    if (event.httpMethod === "POST")
      return withCors(await handlePost(event), origin);

    return jsonErr(405, "Method not allowed");
  } catch (err) {
    // Fail in a controlled way (503) instead of letting the rejection surface
    // as Netlify's opaque 502. The body is never cached, so clients can retry.
    console.error(`[phrases] ${event.httpMethod} failed:`, err);
    return withCors(
      jsonErr(503, "Phrases backend temporarily unavailable"),
      origin
    );
  }
}
