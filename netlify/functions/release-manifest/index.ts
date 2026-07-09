import {
  encodeFirebaseSegment,
  decodeFirebaseSegment,
} from "../shared/encodeFirebaseSegment";
import { corsHeaders } from "../shared/cors";
import type { ManifestEntry, ReleaseSummary } from "./types";

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

const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";
const JSON_HEADERS = { "Content-Type": "application/json" };

function firebaseUrl(path: string): string {
  return `${FIREBASE_ROOT}/${path}.json?auth=${process.env.FIREBASE_DB}`;
}

async function firebaseGet(path: string): Promise<unknown> {
  const res = await fetch(firebaseUrl(path));
  if (!res.ok) throw new Error(`Firebase GET ${path} → ${res.status}`);
  try {
    return await res.json();
  } catch {
    throw new Error(`Firebase GET ${path} returned a non-JSON body`);
  }
}

// A multi-location update to a single parent applies atomically in Firebase
// RTDB — either every path in `updates` is written, or none is. That's what
// keeps the manifest entry and the `latest` pointer from ever diverging.
async function firebasePatch(
  path: string,
  updates: Record<string, unknown>
): Promise<{ ok: boolean; status: number; errorBody?: string }> {
  const res = await fetch(firebaseUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "(unreadable)");
    return { ok: false, status: res.status, errorBody };
  }
  return { ok: true, status: res.status };
}

// Cache directives keyed to the immutability of each response shape. A
// published release's manifest entry never changes, so it is cached forever;
// `latest` and `listReleases` depend on the mutable pointer, so neither is
// ever cached. `Netlify-CDN-Cache-Control` drives Netlify's edge;
// `Cache-Control` drives the browser.
const CACHE = {
  none: "no-store",
  immutable: "public, max-age=31536000, immutable",
} as const;

const NETLIFY_VARY = "query, header=Origin";

function withCors(
  response: NetlifyResponse,
  origin: string | undefined
): NetlifyResponse {
  return {
    ...response,
    headers: { ...(response.headers ?? {}), ...corsHeaders(origin) },
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

async function getManifest(release: string): Promise<ManifestEntry | null> {
  const encoded = encodeFirebaseSegment(release);
  return (await firebaseGet(
    `releaseManifest/entries/${encoded}`
  )) as ManifestEntry | null;
}

async function getLatest(): Promise<string | null> {
  return (await firebaseGet("releaseManifest/latest")) as string | null;
}

async function listReleases(): Promise<ReleaseSummary[]> {
  const entries = (await firebaseGet("releaseManifest/entries")) as Record<
    string,
    ManifestEntry
  > | null;
  if (!entries) return [];
  return Object.entries(entries)
    .map(([release, entry]) => ({
      release: decodeFirebaseSegment(release),
      changelog: entry.changelog,
    }))
    .sort((a, b) => (a.release < b.release ? 1 : -1));
}

async function handleGet(event: NetlifyEvent): Promise<NetlifyResponse> {
  const params = event.queryStringParameters ?? {};

  if (params.release !== undefined) {
    const entry = await getManifest(params.release);
    if (!entry) return jsonErr(404, "Release not found");
    return jsonOk(entry, CACHE.immutable);
  }

  if (params.latest !== undefined) {
    const release = await getLatest();
    if (!release) return jsonErr(404, "No latest release");
    return jsonOk({ release }, CACHE.none);
  }

  if (params.list !== undefined) {
    const releases = await listReleases();
    return jsonOk(releases, CACHE.none);
  }

  return jsonErr(400, "Missing query parameter");
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

  const { release, entry } = parsed as {
    release?: unknown;
    entry?: unknown;
  };

  if (typeof release !== "string" || !release) {
    return jsonErr(400, "Missing or invalid release");
  }

  if (!isManifestEntry(entry)) {
    return jsonErr(
      400,
      "Missing or invalid entry (requires engineVersion, glossaryVersion, phrasesVersion, gitSha, changelog as strings)"
    );
  }

  const encoded = encodeFirebaseSegment(release);
  const result = await firebasePatch("releaseManifest", {
    [`entries/${encoded}`]: entry,
    latest: release,
  });

  if (!result.ok) {
    return jsonErr(
      502,
      `Firebase write failed for release ${release} (status ${result.status}): ${result.errorBody ?? ""}`
    );
  }

  return jsonOk({ release, entry });
}

const MANIFEST_ENTRY_FIELDS = [
  "engineVersion",
  "glossaryVersion",
  "phrasesVersion",
  "gitSha",
  "changelog",
] as const;

function isManifestEntry(value: unknown): value is ManifestEntry {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return MANIFEST_ENTRY_FIELDS.every(
    (field) => typeof record[field] === "string" && record[field] !== ""
  );
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (event.httpMethod === "POST") {
    const expectedSecret = process.env.RELEASE_MANIFEST_SECRET;
    const providedSecret =
      event.headers["x-release-manifest-secret"] ??
      event.headers["X-Release-Manifest-Secret"];
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return withCors(jsonErr(401, "Unauthorized"), origin);
    }
  }

  try {
    if (event.httpMethod === "GET")
      return withCors(await handleGet(event), origin);
    if (event.httpMethod === "POST")
      return withCors(await handlePost(event), origin);

    return jsonErr(405, "Method not allowed");
  } catch (err) {
    console.error(`[release-manifest] ${event.httpMethod} failed:`, err);
    return withCors(
      jsonErr(503, "Release manifest backend temporarily unavailable"),
      origin
    );
  }
}
