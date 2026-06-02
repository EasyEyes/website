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
};

const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";
const JSON_HEADERS = { "Content-Type": "application/json" };

function firebaseUrl(path: string): string {
  return `${FIREBASE_ROOT}/${path}.json?auth=${process.env.FIREBASE_DB}`;
}

async function firebaseGet(path: string): Promise<unknown> {
  const res = await fetch(firebaseUrl(path));
  return res.json();
}

async function firebasePut(
  path: string,
  value: unknown
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(firebaseUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  return { ok: res.ok, status: res.status };
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

function jsonOk(data: unknown): NetlifyResponse {
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(data) };
}

function jsonErr(statusCode: number, message: string): NetlifyResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
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
    const version = await getCurrentVersion();
    return jsonOk({ version });
  }

  if (params.pinned !== undefined) {
    const slashIdx = params.pinned.indexOf("/");
    const username = params.pinned.slice(0, slashIdx);
    const experiment = params.pinned.slice(slashIdx + 1);
    const encodedUser = encodeFirebaseSegment(username);
    const encodedExp = encodeFirebaseSegment(experiment);
    const version = (await firebaseGet(
      `users/${encodedUser}/${encodedExp}/phrasesVersion`
    )) as string | null;
    if (!version) return jsonErr(404, "No pinned version");
    const data = await getVersionedPhrases(version);
    if (!data) return jsonErr(404, "Version not found");
    return jsonOk(data);
  }

  const version = await getCurrentVersion();
  if (!version) return jsonErr(404, "No current version");
  const data = await getVersionedPhrases(version);
  if (!data) return jsonErr(404, "Version not found");
  return jsonOk(data);
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
  const requestVersion = body.currentVersion as string;

  if (
    !changedPhrases ||
    typeof changedPhrases !== "object"
  ) {
    return jsonErr(400, "Missing changedPhrases");
  }

  if (!skipSizeGuard && Object.keys(changedPhrases).length > 50) {
    return jsonErr(
      400,
      "Too many changed phrases (max 50 per synchronous call)"
    );
  }

  const firebaseVersion = await getCurrentVersion();
  if (requestVersion !== firebaseVersion) {
    return jsonErr(409, "Version conflict: currentVersion has advanced");
  }

  const prevVersioned = firebaseVersion
    ? await getVersionedPhrases(firebaseVersion)
    : null;

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

  const newVersioned = buildNewVersion(prevVersioned, translatedRows, []);

  if (newVersioned === null) {
    return jsonOk({ newVersion: firebaseVersion, translatedRows });
  }

  const encodedNewVersion = encodeFirebaseSegment(newVersioned.version);
  const phrasesResult = await firebasePut(
    `phrasesVersions/${encodedNewVersion}/phrases`,
    newVersioned.phrases
  );
  if (!phrasesResult.ok) {
    return jsonErr(502, "Firebase write failed for phrases");
  }

  const versionResult = await firebasePut(
    "phrases/currentVersion",
    newVersioned.version
  );
  if (!versionResult.ok) {
    return jsonErr(502, "Firebase write failed for currentVersion");
  }

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

  if (body.action === "diff") {
    const english = body.english as Record<string, string> | undefined;
    if (!english || typeof english !== "object") {
      return jsonErr(400, "Missing or invalid english field");
    }
    const version = await getCurrentVersion();
    const previousVersion = version ? await getVersionedPhrases(version) : null;
    return jsonOk(diffEnglish(english, previousVersion));
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

  if (event.httpMethod === "POST" || event.httpMethod === "PUT") {
    const expectedSecret = process.env.PHRASES_SECRET;
    const providedSecret =
      event.headers["x-phrases-secret"] ?? event.headers["X-Phrases-Secret"];
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return withCors(jsonErr(401, "Unauthorized"), origin);
    }
  }

  if (event.httpMethod === "GET") return withCors(await handleGet(event), origin);
  if (event.httpMethod === "PUT") return withCors(await handlePut(event), origin);
  if (event.httpMethod === "POST") return withCors(await handlePost(event), origin);

  return jsonErr(405, "Method not allowed");
}
