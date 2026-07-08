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

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  try {
    if (event.httpMethod === "GET")
      return withCors(await handleGet(event), origin);

    return jsonErr(405, "Method not allowed");
  } catch (err) {
    console.error(`[release-manifest] ${event.httpMethod} failed:`, err);
    return withCors(
      jsonErr(503, "Release manifest backend temporarily unavailable"),
      origin
    );
  }
}
