import { gzipSync } from "zlib";
import { isDeepStrictEqual } from "util";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { diffEnglish } from "./diffEnglish";
import {
  DeepLTranslationError,
  GoogleTranslationError,
  translateCells,
} from "./translateCells";
import { buildNewVersion } from "./buildNewVersion";
import { getFirebaseDatabaseUrl } from "../shared/firebaseConfig";
import { encodeFirebaseSegment } from "../glossary/encodeFirebaseSegment";
import { corsHeaders } from "../shared/cors";
import type {
  VersionedPhrases,
  PhraseMap,
  TranslateDeps,
  TranslationMatch,
  FreshnessResult,
} from "./types";
import {
  capturePhrasesFailure,
  flushPhrasesTelemetry,
  phrasesErrorStage,
  runPhrasesStage,
} from "./telemetry";

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

type OperationRecord = {
  requestHash: string;
  requestVersion: string;
  newVersion: string;
  response: {
    newVersion: string;
    translatedRows: PhraseMap;
    verified: true;
  };
};

const JSON_HEADERS = { "Content-Type": "application/json" };

function firebaseUrl(path: string): string {
  return `${getFirebaseDatabaseUrl()}/${path}.json?auth=${
    process.env.FIREBASE_DB
  }`;
}
// Firebase is a live dependency in the request path. A slow or degraded
// Firebase must fail fast (well under Netlify's 60s synchronous timeout) and
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

async function firebasePut(
  path: string,
  value: unknown,
): Promise<{ ok: boolean; status: number; errorBody?: string }> {
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
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "(unreadable)");
    return { ok: false, status: res.status, errorBody };
  }
  return { ok: true, status: res.status };
}

async function verifyFirebaseValue(
  path: string,
  expected: unknown,
  attempts = 3,
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const matches = isDeepStrictEqual(await firebaseGet(path), expected);
      const verificationLog = {
        event: "firebase_read_after_write",
        path,
        attempt: attempt + 1,
        maxAttempts: attempts,
        outcome: matches ? "match" : "mismatch",
      };
      if (matches) {
        console.log("[phrases/verification]", verificationLog);
        return true;
      }
      console.warn("[phrases/verification]", verificationLog);
    } catch (error) {
      console.warn("[phrases/verification]", {
        event: "firebase_read_after_write",
        path,
        attempt: attempt + 1,
        maxAttempts: attempts,
        outcome: "read_error",
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }
    if (attempt + 1 < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
  return false;
}

function persistenceVerificationError(path: string): NetlifyResponse {
  return jsonErr(
    502,
    `Firebase did not preserve the expected value at ${path}. The phrases operation is incomplete.`,
    { code: "PERSISTENCE_VERIFICATION_FAILED", fatal: true, path },
  );
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
  cache: string = CACHE.none,
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

function jsonErr(
  statusCode: number,
  message: string,
  details: Record<string, unknown> = {},
): NetlifyResponse {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, "Cache-Control": CACHE.none },
    body: JSON.stringify({ error: message, ...details }),
  };
}

async function getCurrentVersion(): Promise<string | null> {
  return (await firebaseGet("phrases/currentVersion")) as string | null;
}

async function getVersionedPhrases(
  version: string,
): Promise<VersionedPhrases | null> {
  const encoded = encodeFirebaseSegment(version);
  const phrases = (await firebaseGet(
    `phrasesVersions/${encoded}/phrases`,
  )) as PhraseMap | null;
  if (!phrases) return null;
  return { version, phrases };
}

function operationPath(body: Record<string, unknown>): string | null {
  const operationId = body.operationId;
  const batchNumber = body.batchNumber;
  if (
    typeof operationId !== "string" ||
    !/^[a-zA-Z0-9-]{8,80}$/.test(operationId) ||
    !Number.isInteger(batchNumber) ||
    (batchNumber as number) < 1
  ) {
    return null;
  }
  return `phrasesOperations/${operationId}/batches/${batchNumber}`;
}

function operationRequestHash(body: Record<string, unknown>): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        action: body.action,
        changedPhrases: body.changedPhrases,
        colorMask: body.colorMask,
        nonCyanPhrases: body.nonCyanPhrases,
        removedKeys: body.removedKeys,
        activeLanguages: body.activeLanguages,
        batchNumber: body.batchNumber,
      }),
    )
    .digest("hex");
}

function isTranslationMatch(value: unknown): value is TranslationMatch {
  if (typeof value !== "object" || value === null) return false;
  const match = value as Record<string, unknown>;
  if (
    typeof match.matchedEnglishText !== "string" ||
    typeof match.matchedAt !== "string"
  ) {
    return false;
  }
  const parsed = new Date(match.matchedAt);
  return (
    !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === match.matchedAt
  );
}

async function persistTranslationMatches(
  translatedRows: PhraseMap,
  englishByPhrase: Record<string, string>,
  matchedAt: string,
  requestId: string,
  operation: string,
): Promise<NetlifyResponse | null> {
  for (const [phraseName, row] of Object.entries(translatedRows)) {
    const englishText = englishByPhrase[phraseName];
    if (typeof englishText !== "string") continue;
    for (const languageCode of Object.keys(row)) {
      if (languageCode === "en") continue;
      const path = `phraseTranslationMatches/${encodeFirebaseSegment(
        phraseName,
      )}/${encodeFirebaseSegment(languageCode)}`;
      const match: TranslationMatch = {
        matchedEnglishText: englishText,
        matchedAt,
      };
      const result = await runPhrasesStage(
        "translation_match_write",
        requestId,
        operation,
        () => firebasePut(path, match),
      );
      if (
        !result.ok ||
        !(await runPhrasesStage(
          "translation_match_verification",
          requestId,
          operation,
          () => verifyFirebaseValue(path, match),
        ))
      ) {
        return persistenceVerificationError(path);
      }
    }
  }
  return null;
}

async function handleCheckFreshness(
  body: Record<string, unknown>,
): Promise<NetlifyResponse> {
  const requested = body.phrases;
  if (!Array.isArray(requested) || requested.length > 50) {
    return jsonErr(400, "phrases must be an array of at most 50 records");
  }

  const records: Array<{
    phraseName: string;
    englishText: string;
    languageCodes: string[];
  }> = [];
  const seenPhrases = new Set<string>();
  for (const value of requested) {
    if (typeof value !== "object" || value === null) {
      return jsonErr(400, "Invalid freshness phrase record");
    }
    const record = value as Record<string, unknown>;
    if (
      typeof record.phraseName !== "string" ||
      record.phraseName.length === 0 ||
      typeof record.englishText !== "string" ||
      !Array.isArray(record.languageCodes) ||
      record.languageCodes.length === 0 ||
      record.languageCodes.some(
        (language) => typeof language !== "string" || language.length === 0,
      )
    ) {
      return jsonErr(400, "Invalid freshness phrase record");
    }
    const languageCodes = record.languageCodes as string[];
    if (
      seenPhrases.has(record.phraseName) ||
      new Set(languageCodes).size !== languageCodes.length
    ) {
      return jsonErr(400, "Duplicate freshness identifier");
    }
    seenPhrases.add(record.phraseName);
    records.push({
      phraseName: record.phraseName,
      englishText: record.englishText,
      languageCodes,
    });
  }

  const version = await getCurrentVersion();
  const current = version ? await getVersionedPhrases(version) : null;
  if (!current) return jsonErr(409, "No current phrases version is available");
  const knownLanguages = new Set(
    Object.values(current.phrases).flatMap((row) => Object.keys(row)),
  );
  for (const record of records) {
    if (!(record.phraseName in current.phrases)) {
      return jsonErr(400, `Unknown phraseName: ${record.phraseName}`);
    }
    const unknownLanguage = record.languageCodes.find(
      (language) => language === "en" || !knownLanguages.has(language),
    );
    if (unknownLanguage) {
      return jsonErr(400, `Unknown languageCode: ${unknownLanguage}`);
    }
  }

  const freshness: FreshnessResult[] = [];
  for (const record of records) {
    for (const languageCode of record.languageCodes) {
      const translation = current.phrases[record.phraseName]?.[languageCode];
      const match = await firebaseGet(
        `phraseTranslationMatches/${encodeFirebaseSegment(
          record.phraseName,
        )}/${encodeFirebaseSegment(languageCode)}`,
      );
      freshness.push({
        phraseName: record.phraseName,
        languageCode,
        fresh:
          typeof translation === "string" &&
          translation.length > 0 &&
          isTranslationMatch(match) &&
          match.matchedEnglishText === record.englishText,
      });
    }
  }
  return jsonOk({ freshness });
}

async function publishCurrentVersion(
  version: string,
  requestId: string,
  operation: string,
): Promise<NetlifyResponse | null> {
  const versionResult = await runPhrasesStage(
    "current_version_write",
    requestId,
    operation,
    () => firebasePut("phrases/currentVersion", version),
  );
  console.log("[phrases/translate] Firebase PUT currentVersion:", {
    ok: versionResult.ok,
    status: versionResult.status,
    newVersion: version,
  });
  if (!versionResult.ok) {
    return jsonErr(
      502,
      `Firebase write failed for currentVersion (status ${versionResult.status})`,
      { code: "FIREBASE_WRITE_FAILED", fatal: true },
    );
  }
  if (
    !(await runPhrasesStage(
      "current_version_verification",
      requestId,
      operation,
      () => verifyFirebaseValue("phrases/currentVersion", version),
    ))
  ) {
    return persistenceVerificationError("phrases/currentVersion");
  }
  return null;
}

async function handleGet(event: NetlifyEvent): Promise<NetlifyResponse> {
  const params = event.queryStringParameters ?? {};

  if (params.versionOnly !== undefined) {
    // The freshness oracle the compiler relies on — must never be cached.
    const version = await getCurrentVersion();
    const publishedAt = version
      ? ((await firebaseGet(
          `phrasesVersions/${encodeFirebaseSegment(version)}/publishedAt`,
        )) as string | null)
      : null;
    return jsonOk({ version, publishedAt }, CACHE.none);
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
      `users/${encodedUser}/${encodedExp}/phrasesVersion`,
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
  await firebasePut(
    `users/${encodedUser}/${encodedExp}/phrasesVersion`,
    version,
  );

  return jsonOk({ version });
}

async function handleTranslate(
  body: Record<string, unknown>,
  skipSizeGuard: boolean,
  requestId: string,
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
  const activeLanguages = body.activeLanguages as string[] | undefined;
  const requestVersion = body.currentVersion as string;
  const operation = skipSizeGuard ? "fullResync" : "translate";
  const batchNumber =
    typeof body.batchNumber === "number" ? body.batchNumber : undefined;
  const totalBatches =
    typeof body.totalBatches === "number" ? body.totalBatches : undefined;
  const cellCount =
    typeof body.cellCount === "number" ? body.cellCount : undefined;

  console.log("[phrases/translate] input:", {
    requestVersion,
    changedCount: changedPhrases ? Object.keys(changedPhrases).length : 0,
    colorMaskCount: Object.keys(colorMask).length,
    sentValuesCount: Object.keys(sentValues).length,
    removedCount: Array.isArray(removedKeys) ? removedKeys.length : null,
    activeLanguageCount: Array.isArray(activeLanguages)
      ? activeLanguages.length
      : null,
    skipSizeGuard,
  });
  console.log("[phrases/translate] non-white spreadsheet cells:", {
    phraseCount: Object.keys(nonCyanPhrases).length,
  });

  if (!changedPhrases || typeof changedPhrases !== "object") {
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

  if (
    activeLanguages !== undefined &&
    (!Array.isArray(activeLanguages) ||
      activeLanguages.length === 0 ||
      !activeLanguages.includes("en") ||
      activeLanguages.some(
        (language) => typeof language !== "string" || language.length === 0,
      ))
  ) {
    console.log("[phrases/translate] error: invalid activeLanguages");
    return jsonErr(400, "Invalid activeLanguages");
  }

  if (!skipSizeGuard && Object.keys(changedPhrases).length > 50) {
    console.log(
      "[phrases/translate] error: too many changed phrases",
      Object.keys(changedPhrases).length,
    );
    return jsonErr(
      400,
      "Too many changed phrases (max 50 per synchronous call)",
    );
  }

  const idempotencyPath = operationPath(body);
  const requestHash = idempotencyPath ? operationRequestHash(body) : null;
  if (idempotencyPath && requestHash) {
    const prior = (await firebaseGet(
      idempotencyPath,
    )) as OperationRecord | null;
    if (prior) {
      if (prior.requestHash !== requestHash) {
        return jsonErr(409, "Operation batch was reused with different data", {
          code: "IDEMPOTENCY_CONFLICT",
          fatal: true,
        });
      }
      const current = await getCurrentVersion();
      if (current === prior.requestVersion) {
        const publishError = await publishCurrentVersion(
          prior.newVersion,
          requestId,
          operation,
        );
        if (publishError) return publishError;
      }
      console.log({
        event: "phrases_batch_replayed",
        requestId,
        operation,
        batchNumber,
        newVersion: prior.newVersion,
      });
      return jsonOk(prior.response);
    }
  }

  const firebaseVersion = await runPhrasesStage(
    "current_version_read",
    requestId,
    operation,
    getCurrentVersion,
  );
  console.log("[phrases/translate] version check:", {
    requestVersion,
    firebaseVersion,
    match: requestVersion === firebaseVersion,
  });

  if (requestVersion !== firebaseVersion) {
    return jsonErr(409, "Version conflict: currentVersion has advanced");
  }

  const prevVersioned = firebaseVersion
    ? await runPhrasesStage("current_phrases_read", requestId, operation, () =>
        getVersionedPhrases(firebaseVersion),
      )
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

  let translatedRows: PhraseMap;
  try {
    translatedRows = await runPhrasesStage(
      "translation_providers",
      requestId,
      operation,
      () => translateCells(changedPhrases, colorMask, sentValues, deps),
    );
  } catch (error) {
    if (error instanceof DeepLTranslationError) {
      console.error(
        "[phrases/translate] DeepL translation failed; aborting before Firebase write:",
        {
          status: error.status,
        },
      );
      const statusDescription =
        error.status === null
          ? "before receiving a response"
          : `status ${error.status}`;
      return jsonErr(
        502,
        `DeepL rejected the translation request (${statusDescription}). No new phrases version was created.`,
        {
          code: "DEEPL_TRANSLATION_FAILED",
          deeplStatus: error.status,
          latestVersion: firebaseVersion,
          fatal: true,
        },
      );
    }
    if (error instanceof GoogleTranslationError) {
      console.error("[phrases/translate] Google translation failed", {
        status: error.status,
      });
      const statusDescription =
        error.status === null
          ? "before receiving a response"
          : `status ${error.status}`;
      return jsonErr(
        502,
        `Google rejected the translation request (${statusDescription}). No new phrases version was created for this batch.`,
        {
          code: "GOOGLE_TRANSLATION_FAILED",
          googleStatus: error.status,
          latestVersion: firebaseVersion,
          fatal: true,
        },
      );
    }
    throw error;
  }

  console.log("[phrases/translate] translation output:", {
    phraseCount: Object.keys(translatedRows).length,
  });

  const acceptedRows: PhraseMap = Object.fromEntries(
    Object.entries(translatedRows).map(([key, row]) => [key, { ...row }]),
  );
  // Track every accepted non-white value for freshness, while publishing only
  // values that differ from the current immutable snapshot.
  const prevPhrases = prevVersioned?.phrases ?? {};
  for (const [key, langVals] of Object.entries(nonCyanPhrases)) {
    if (key in changedPhrases) continue;
    const prevRow = prevPhrases[key] ?? {};
    for (const [lang, val] of Object.entries(langVals)) {
      if (!acceptedRows[key]) acceptedRows[key] = {};
      acceptedRows[key][lang] = val;
      if (prevRow[lang] !== val) {
        if (!translatedRows[key]) translatedRows[key] = {};
        translatedRows[key][lang] = val;
      }
    }
  }

  const newVersioned = buildNewVersion(
    prevVersioned,
    translatedRows,
    removedKeys,
    activeLanguages,
  );

  console.log("[phrases/translate] buildNewVersion result:", {
    isNull: newVersioned === null,
    newVersion: newVersioned?.version ?? null,
    newPhraseCount: newVersioned ? Object.keys(newVersioned.phrases).length : 0,
  });

  if (newVersioned === null) {
    console.log(
      "[phrases/translate] no changes detected — returning existing version without Firebase write",
    );
    const matchError = await persistTranslationMatches(
      acceptedRows,
      Object.fromEntries(
        Object.entries(prevPhrases).map(([phraseName, row]) => [
          phraseName,
          row.en,
        ]),
      ),
      new Date(Date.now()).toISOString(),
      requestId,
      operation,
    );
    if (matchError) return matchError;
    const response = {
      newVersion: firebaseVersion,
      translatedRows,
      verified: true as const,
    };
    if (idempotencyPath && requestHash && firebaseVersion) {
      const record: OperationRecord = {
        requestHash,
        requestVersion,
        newVersion: firebaseVersion,
        response,
      };
      const recordResult = await runPhrasesStage(
        "idempotency_record_write",
        requestId,
        operation,
        () => firebasePut(idempotencyPath, record),
      );
      if (
        !recordResult.ok ||
        !(await runPhrasesStage(
          "idempotency_record_verification",
          requestId,
          operation,
          () => verifyFirebaseValue(idempotencyPath, record),
        ))
      ) {
        return persistenceVerificationError(idempotencyPath);
      }
    }
    return jsonOk(response);
  }

  const FIREBASE_INVALID_KEY = /[.$#[\]/]|[\x00-\x1f\x7f]|^$/;
  const sanitizedPhrases = Object.fromEntries(
    Object.entries(newVersioned.phrases).filter(
      ([k]) => !FIREBASE_INVALID_KEY.test(k),
    ),
  );
  const droppedCount =
    Object.keys(newVersioned.phrases).length -
    Object.keys(sanitizedPhrases).length;
  if (droppedCount > 0) {
    const dropped = Object.keys(newVersioned.phrases).filter((k) =>
      FIREBASE_INVALID_KEY.test(k),
    );
    console.warn(
      "[phrases/translate] dropping invalid Firebase keys:",
      dropped,
    );
  }

  const encodedNewVersion = encodeFirebaseSegment(newVersioned.version);
  const phrasesResult = await runPhrasesStage(
    "phrase_version_write",
    requestId,
    operation,
    () =>
      firebasePut(
        `phrasesVersions/${encodedNewVersion}/phrases`,
        sanitizedPhrases,
      ),
  );
  console.log("[phrases/translate] Firebase PUT phrases:", {
    ok: phrasesResult.ok,
    status: phrasesResult.status,
  });
  if (!phrasesResult.ok) {
    return jsonErr(
      502,
      `Firebase write failed for phrases (status ${phrasesResult.status}).`,
      { code: "FIREBASE_PHRASES_WRITE_FAILED", fatal: true },
    );
  }
  const phrasesPath = `phrasesVersions/${encodedNewVersion}/phrases`;
  if (
    !(await runPhrasesStage(
      "phrase_version_verification",
      requestId,
      operation,
      () => verifyFirebaseValue(phrasesPath, sanitizedPhrases),
    ))
  ) {
    return persistenceVerificationError(phrasesPath);
  }

  const publishedAt = new Date(Date.now()).toISOString();
  const publicationResult = await runPhrasesStage(
    "publication_metadata_write",
    requestId,
    operation,
    () =>
      firebasePut(
        `phrasesVersions/${encodedNewVersion}/publishedAt`,
        publishedAt,
      ),
  );
  if (!publicationResult.ok) {
    return jsonErr(
      502,
      `Firebase write failed for phrases publication date (status ${publicationResult.status}).`,
      { code: "FIREBASE_PUBLICATION_WRITE_FAILED", fatal: true },
    );
  }
  const publicationPath = `phrasesVersions/${encodedNewVersion}/publishedAt`;
  if (
    !(await runPhrasesStage(
      "publication_metadata_verification",
      requestId,
      operation,
      () => verifyFirebaseValue(publicationPath, publishedAt),
    ))
  ) {
    return persistenceVerificationError(publicationPath);
  }

  const matchError = await persistTranslationMatches(
    acceptedRows,
    Object.fromEntries(
      Object.entries(newVersioned.phrases).map(([phraseName, row]) => [
        phraseName,
        row.en,
      ]),
    ),
    publishedAt,
    requestId,
    operation,
  );
  if (matchError) return matchError;

  const response = {
    newVersion: newVersioned.version,
    translatedRows,
    verified: true as const,
  };
  if (idempotencyPath && requestHash) {
    const record: OperationRecord = {
      requestHash,
      requestVersion,
      newVersion: newVersioned.version,
      response,
    };
    const recordResult = await runPhrasesStage(
      "idempotency_record_write",
      requestId,
      operation,
      () => firebasePut(idempotencyPath, record),
    );
    if (
      !recordResult.ok ||
      !(await runPhrasesStage(
        "idempotency_record_verification",
        requestId,
        operation,
        () => verifyFirebaseValue(idempotencyPath, record),
      ))
    ) {
      return persistenceVerificationError(idempotencyPath);
    }
  }

  const publishError = await publishCurrentVersion(
    newVersioned.version,
    requestId,
    operation,
  );
  if (publishError) return publishError;

  console.log("[phrases/translate] success:", {
    newVersion: newVersioned.version,
    translatedRowCount: Object.keys(translatedRows).length,
  });
  return jsonOk(response);
}

async function handlePost(
  event: NetlifyEvent,
  requestId: string,
): Promise<NetlifyResponse> {
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
    console.log(
      "[phrases/diff] input english count:",
      Object.keys(english).length,
    );
    const version = await getCurrentVersion();
    const previousVersion = version ? await getVersionedPhrases(version) : null;
    const result = diffEnglish(english, previousVersion);
    console.log("[phrases/diff] result:", result);
    return jsonOk(result);
  }

  if (body.action === "translate") {
    return handleTranslate(body, false, requestId);
  }

  if (body.action === "fullResync") {
    return handleTranslate(body, true, requestId);
  }

  if (body.action === "checkFreshness") {
    return handleCheckFreshness(body);
  }

  return jsonErr(400, `Unknown action: ${String(body.action)}`);
}

async function captureHandledFailure(
  response: NetlifyResponse,
  event: NetlifyEvent,
  requestId: string,
  elapsedMs: number,
): Promise<void> {
  if (response.statusCode < 500) return;
  let responseBody: Record<string, unknown> = {};
  let requestBody: Record<string, unknown> = {};
  try {
    responseBody = JSON.parse(response.body);
  } catch {
    responseBody = {};
  }
  try {
    requestBody = JSON.parse(event.body ?? "{}");
  } catch {
    requestBody = {};
  }
  const errorCode =
    typeof responseBody.code === "string"
      ? responseBody.code
      : "PHRASES_API_FAILURE";
  const provider = errorCode.startsWith("DEEPL_")
    ? "deepl"
    : errorCode.startsWith("GOOGLE_")
    ? "google"
    : errorCode.startsWith("FIREBASE_") ||
      errorCode === "PERSISTENCE_VERIFICATION_FAILED"
    ? "firebase"
    : "unknown";
  const stage =
    provider === "deepl"
      ? "deepl_translate"
      : provider === "google"
      ? "google_translate"
      : errorCode === "PERSISTENCE_VERIFICATION_FAILED"
      ? "persistence_verification"
      : provider === "firebase"
      ? "firebase_write"
      : "request";
  capturePhrasesFailure(
    new Error(
      typeof responseBody.error === "string"
        ? responseBody.error
        : "Phrases API request failed",
    ),
    {
      requestId,
      operation:
        typeof requestBody.action === "string"
          ? requestBody.action
          : event.httpMethod,
      stage,
      batchNumber:
        typeof requestBody.batchNumber === "number"
          ? requestBody.batchNumber
          : undefined,
      totalBatches:
        typeof requestBody.totalBatches === "number"
          ? requestBody.totalBatches
          : undefined,
      phraseCount:
        requestBody.changedPhrases &&
        typeof requestBody.changedPhrases === "object"
          ? Object.keys(requestBody.changedPhrases).length
          : undefined,
      cellCount:
        typeof requestBody.cellCount === "number"
          ? requestBody.cellCount
          : undefined,
      statusCode: response.statusCode,
      errorCode,
      elapsedMs,
      latestVersion:
        typeof responseBody.latestVersion === "string"
          ? responseBody.latestVersion
          : undefined,
      provider,
    },
  );
  await flushPhrasesTelemetry();
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];
  const requestId =
    event.headers["x-request-id"] ??
    event.headers["X-Request-Id"] ??
    randomUUID();
  const startedAt = Date.now();

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
    if (event.httpMethod === "POST") {
      const response = withCors(await handlePost(event, requestId), origin);
      await captureHandledFailure(
        response,
        event,
        requestId,
        Date.now() - startedAt,
      );
      return {
        ...response,
        headers: { ...response.headers, "X-Request-Id": requestId },
      };
    }

    return jsonErr(405, "Method not allowed");
  } catch (err) {
    // Fail in a controlled way (503) instead of letting the rejection surface
    // as Netlify's opaque 502. The body is never cached, so clients can retry.
    console.error(`[phrases] ${event.httpMethod} failed:`, err);
    capturePhrasesFailure(err, {
      requestId,
      operation: event.httpMethod,
      stage: phrasesErrorStage(err),
      errorCode: "PHRASES_BACKEND_UNEXPECTED",
      elapsedMs: Date.now() - startedAt,
      provider: "unknown",
    });
    await flushPhrasesTelemetry();
    return withCors(
      {
        ...jsonErr(503, "Phrases backend temporarily unavailable"),
        headers: {
          ...jsonErr(503, "Phrases backend temporarily unavailable").headers,
          "X-Request-Id": requestId,
        },
      },
      origin,
    );
  }
}
