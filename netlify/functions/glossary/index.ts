import {
  encodeFirebaseSegment,
  decodeFirebaseSegment,
} from "./encodeFirebaseSegment";
import { isAllowedOrigin, corsHeaders } from "../shared/cors";

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

const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";

const COLUMN_MAP: Record<string, keyof Omit<GlossaryEntry, "categories">> = {
  "INPUT PARAMETER": "name",
  NOW: "availability",
  TYPE: "type",
  DEFAULT: "default",
  EXPLANATION: "explanation",
  EXAMPLE: "example",
};

// Cells from the AppScript arrive as native JSON types (string, number,
// boolean, null) — not just strings. Coerce every scalar field we store to a
// string so Firebase matches the typed shape GlossaryEntry advertises, and
// downstream consumers (compiler, UI) can treat fields uniformly.
const asString = (v: unknown): string => String(v ?? "");

function transformRawRows(rows: string[][]): Record<string, GlossaryEntry> {
  if (rows.length < 2) return {};

  const headers = rows[0].map((h) => asString(h).trim().toUpperCase());
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h] = i;
  });

  const result: Record<string, GlossaryEntry> = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = asString(row[colIndex["INPUT PARAMETER"] ?? 0]);
    if (!name || name.includes("__")) continue;

    const type = asString(row[colIndex["TYPE"] ?? 2]);
    const rawCategories = asString(row[colIndex["CATEGORIES"] ?? 6]);
    const rawDefault = row[colIndex["DEFAULT"] ?? 3];
    const normalizedDefault =
      type === "boolean"
        ? asString(rawDefault).trim().toUpperCase()
        : asString(rawDefault);

    const entry: GlossaryEntry = {
      name,
      availability: asString(row[colIndex["NOW"] ?? 1]),
      type,
      default: normalizedDefault,
      explanation: asString(row[colIndex["EXPLANATION"] ?? 4]),
      example: asString(row[colIndex["EXAMPLE"] ?? 5]),
      categories:
        type === "categorical" || type === "multicategorical"
          ? rawCategories.split(",").map((s) => s.trim())
          : [],
    };

    result[encodeFirebaseSegment(name)] = entry;
  }

  return result;
}

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

async function firebaseGetKeys(path: string): Promise<Set<string>> {
  const url = `${firebaseUrl(path)}&shallow=true`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Firebase GET (shallow) ${path} → ${res.status}`);
  const data = (await res.json()) as Record<string, true> | null;
  return new Set(Object.keys(data ?? {}));
}

type FirebasePutResult = { ok: boolean; status: number; body: unknown };

async function firebasePut(
  path: string,
  value: unknown,
): Promise<FirebasePutResult> {
  const res = await fetchWithTimeout(
    firebaseUrl(path),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    },
    5000,
    0,
  );
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  console.log(
    `[glossary] firebasePut ${path} → ${res.status}`,
    JSON.stringify(body),
  );
  return { ok: res.ok, status: res.status, body };
}

function bumpVersion(
  current: string,
  incomingKeys: Set<string>,
  existingKeys: Set<string>,
): string {
  const [major, minor] = current.split(".").map(Number);
  const isMajor =
    incomingKeys.size !== existingKeys.size ||
    [...incomingKeys].some((k) => !existingKeys.has(k));
  if (isMajor) return `${major + 1}.0`;
  return `${major}.${minor + 1}`;
}

type GlossaryData = {
  version: string;
  glossary: Record<string, GlossaryEntry>;
  glossaryFull: GlossaryEntry[];
  superMatchingParams: string[];
};

async function getGlossaryData(version: string): Promise<GlossaryData | null> {
  const raw = (await firebaseGet(
    `versions/${encodeFirebaseSegment(version)}/glossary`,
  )) as Record<string, GlossaryEntry> | null;
  if (!raw) return null;
  const glossary: Record<string, GlossaryEntry> = {};
  for (const [k, v] of Object.entries(raw)) {
    glossary[decodeFirebaseSegment(k)] = v;
  }
  return {
    version,
    glossary,
    glossaryFull: Object.values(glossary),
    superMatchingParams: Object.keys(glossary).filter((k) => k.includes("@")),
  };
}

const JSON_HEADERS = { "Content-Type": "application/json" };

// Cache directives keyed to the immutability of each response shape. A specific
// version (`?v=`) never changes once published, so it is cached forever; the
// version probe (`?versionOnly=1`) is the freshness oracle and must never be
// cached; the bare "current" response is only used for initial display, so a
// short window with stale-while-revalidate is enough. `Netlify-CDN-Cache-Control`
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

const GLOSSARY_ALLOWED_HEADERS = "Content-Type, x-glossary-secret";

// Browser callers (Pavlovia experiment runtime, EasyEyes site, Netlify deploy
// previews) need CORS headers. AppScript hits this endpoint server-side via
// UrlFetchApp, which ignores CORS, so it continues to work regardless.
function withCors(
  response: NetlifyResponse,
  origin: string | undefined,
): NetlifyResponse {
  return {
    ...response,
    headers: { ...(response.headers ?? {}), ...corsHeaders(origin, GLOSSARY_ALLOWED_HEADERS) },
  };
}

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

function jsonErr(statusCode: number, message: string): NetlifyResponse {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, "Cache-Control": CACHE.none },
    body: JSON.stringify({ error: message }),
  };
}

async function handleGet(event: NetlifyEvent): Promise<NetlifyResponse> {
  const params = event.queryStringParameters ?? {};
  console.log(`[glossary] GET params=${JSON.stringify(params)}`);

  if (params.versionOnly !== undefined) {
    const version = (await firebaseGet("currentVersion")) as string | null;
    console.log(`[glossary] GET versionOnly currentVersion=${version}`);
    return jsonOk({ version }, CACHE.none);
  }

  const currentVersion = (await firebaseGet("currentVersion")) as string | null;
  console.log(`[glossary] GET currentVersion=${currentVersion}`);

  if (params.v !== undefined) {
    const data = await getGlossaryData(params.v);
    console.log(
      `[glossary] GET by v=${params.v} found=${!!data} entries=${
        data ? Object.keys(data.glossary).length : 0
      }`,
    );
    if (!data) return jsonErr(404, "Version not found");
    // A specific version is immutable — safe to cache indefinitely.
    return jsonOk(data, CACHE.immutable);
  }

  if (params.username !== undefined && params.experiment !== undefined) {
    const encodedUser = encodeFirebaseSegment(params.username);
    const encodedExp = encodeFirebaseSegment(params.experiment);
    const pinned = (await firebaseGet(
      `users/${encodedUser}/${encodedExp}/glossaryVersion`,
    )) as string | null;
    const version = pinned ?? currentVersion ?? "1.0";
    console.log(
      `[glossary] GET user=${params.username} exp=${params.experiment} pinned=${pinned} resolvedVersion=${version}`,
    );
    const data = await getGlossaryData(version);
    console.log(
      `[glossary] GET data found=${!!data} entries=${
        data ? Object.keys(data.glossary).length : 0
      }`,
    );
    if (!data) return jsonErr(404, "Version not found");
    // Resolution depends on the mutable per-experiment pin, so don't cache.
    const response = jsonOk(data, CACHE.none);
    console.log(
      `[glossary] GET responding 200 bodyBytes=${response.body.length}`,
    );
    return response;
  }

  if (!currentVersion) return jsonErr(404, "No current version");
  const data = await getGlossaryData(currentVersion);
  console.log(
    `[glossary] GET fallback currentVersion data found=${!!data} entries=${
      data ? Object.keys(data.glossary).length : 0
    }`,
  );
  if (!data) return jsonErr(404, "Version not found");
  // "Current" is ambiguous and changes on publish; keep the window short and
  // let the version probe drive correctness. The Select File flow fetches by
  // explicit `?v=` instead of relying on this branch.
  return jsonOk(data, CACHE.short);
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

  const currentVersion = (await firebaseGet("currentVersion")) as string;
  const encodedUser = encodeFirebaseSegment(username);
  const encodedExp = encodeFirebaseSegment(experimentName);
  await firebasePut(
    `users/${encodedUser}/${encodedExp}/glossaryVersion`,
    currentVersion,
  );

  return jsonOk({ version: currentVersion });
}

async function handlePost(event: NetlifyEvent): Promise<NetlifyResponse> {
  const secret = event.headers["x-glossary-secret"];
  if (!secret || secret !== process.env.GLOSSARY_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(event.body ?? "");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).rows)
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid rows" }),
    };
  }

  const rows = (parsed as { rows: string[][] }).rows;
  const incoming = transformRawRows(rows);

  const currentVersion = (await firebaseGet("currentVersion")) as string | null;

  let newVersion: string;

  if (!currentVersion) {
    newVersion = "1.0";
  } else {
    const existingKeys = await firebaseGetKeys(
      `versions/${encodeFirebaseSegment(currentVersion)}/glossary`,
    );
    const incomingKeys = new Set(Object.keys(incoming));
    newVersion = bumpVersion(currentVersion, incomingKeys, existingKeys);
  }

  const encodedVersion = encodeFirebaseSegment(newVersion);
  console.log(
    `[glossary] writing versions/${encodedVersion}/glossary (${
      Object.keys(incoming).length
    } entries)`,
  );
  const glossaryResult = await firebasePut(
    `versions/${encodedVersion}/glossary`,
    incoming,
  );
  if (!glossaryResult.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Firebase write failed for glossary",
        firebaseStatus: glossaryResult.status,
        firebaseBody: glossaryResult.body,
      }),
    };
  }

  console.log(`[glossary] writing currentVersion = ${newVersion}`);
  const versionResult = await firebasePut("currentVersion", newVersion);
  if (!versionResult.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Firebase write failed for currentVersion",
        firebaseStatus: versionResult.status,
        firebaseBody: versionResult.body,
      }),
    };
  }

  return { statusCode: 200, body: JSON.stringify({ version: newVersion }) };
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];
  console.log(
    `[glossary] ${event.httpMethod} origin=${
      origin ?? "<none>"
    } allowed=${isAllowedOrigin(origin)} qs=${JSON.stringify(
      event.queryStringParameters ?? {},
    )}`,
  );

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin, GLOSSARY_ALLOWED_HEADERS), body: "" };
  }

  try {
    if (event.httpMethod === "GET")
      return withCors(await handleGet(event), origin);
    if (event.httpMethod === "PUT")
      return withCors(await handlePut(event), origin);
    return withCors(await handlePost(event), origin);
  } catch (err) {
    // Fail in a controlled way (503) instead of letting the rejection surface
    // as Netlify's opaque 502. The body is never cached, so clients can retry.
    console.error(`[glossary] ${event.httpMethod} failed:`, err);
    return withCors(
      jsonErr(503, "Glossary backend temporarily unavailable"),
      origin,
    );
  }
}
