import { encodeFirebaseSegment } from "./encodeFirebaseSegment";

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

const FIREBASE_ROOT =
  "https://easyeyes-compiler-default-rtdb.firebaseio.com";

const COLUMN_MAP: Record<string, keyof Omit<GlossaryEntry, "categories">> = {
  "INPUT PARAMETER": "name",
  NOW: "availability",
  TYPE: "type",
  DEFAULT: "default",
  EXPLANATION: "explanation",
  EXAMPLE: "example",
};

function transformRawRows(rows: string[][]): Record<string, GlossaryEntry> {
  if (rows.length < 2) return {};

  const headers = rows[0].map((h) => h.trim().toUpperCase());
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h] = i;
  });

  const result: Record<string, GlossaryEntry> = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[colIndex["INPUT PARAMETER"] ?? 0] ?? "";
    if (!name || name.includes("__")) continue;

    const type = row[colIndex["TYPE"] ?? 2] ?? "";
    const rawCategories = row[colIndex["CATEGORIES"] ?? 6] ?? "";

    const entry: GlossaryEntry = {
      name,
      availability: row[colIndex["NOW"] ?? 1] ?? "",
      type,
      default: row[colIndex["DEFAULT"] ?? 3] ?? "",
      explanation: row[colIndex["EXPLANATION"] ?? 4] ?? "",
      example: row[colIndex["EXAMPLE"] ?? 5] ?? "",
      categories:
        type === "categorical" || type === "multicategorical"
          ? rawCategories.split(",").map((s) => s.trim())
          : [],
    };

    result[name] = entry;
  }

  return result;
}

function firebaseUrl(path: string): string {
  return `${FIREBASE_ROOT}/${path}.json?auth=${process.env.FIREBASE_DB}`;
}

async function firebaseGet(path: string): Promise<unknown> {
  const res = await fetch(firebaseUrl(path));
  return res.json();
}

async function firebasePut(path: string, value: unknown): Promise<void> {
  await fetch(firebaseUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
}

function bumpVersion(
  current: string,
  incomingKeys: Set<string>,
  existingKeys: Set<string>
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
  const glossary = (await firebaseGet(
    `versions/${encodeFirebaseSegment(version)}/glossary`
  )) as Record<string, GlossaryEntry> | null;
  if (!glossary) return null;
  return {
    version,
    glossary,
    glossaryFull: Object.values(glossary),
    superMatchingParams: Object.keys(glossary).filter((k) => k.includes("@")),
  };
}

const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonOk(data: unknown): NetlifyResponse {
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(data) };
}

function jsonErr(statusCode: number, message: string): NetlifyResponse {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify({ error: message }) };
}

async function handleGet(
  event: NetlifyEvent
): Promise<NetlifyResponse> {
  const params = event.queryStringParameters ?? {};
  const currentVersion = (await firebaseGet("currentVersion")) as string | null;

  if (params.v !== undefined) {
    const data = await getGlossaryData(params.v);
    if (!data) return jsonErr(404, "Version not found");
    return jsonOk(data);
  }

  if (params.username !== undefined && params.experiment !== undefined) {
    const encodedUser = encodeFirebaseSegment(params.username);
    const encodedExp = encodeFirebaseSegment(params.experiment);
    const pinned = (await firebaseGet(
      `users/${encodedUser}/${encodedExp}/glossaryVersion`
    )) as string | null;
    const version = pinned ?? currentVersion ?? "1.0";
    const data = await getGlossaryData(version);
    if (!data) return jsonErr(404, "Version not found");
    return jsonOk(data);
  }

  if (!currentVersion) return jsonErr(404, "No current version");
  const data = await getGlossaryData(currentVersion);
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

  const currentVersion = (await firebaseGet("currentVersion")) as string;
  const encodedUser = encodeFirebaseSegment(username);
  const encodedExp = encodeFirebaseSegment(experimentName);
  await firebasePut(
    `users/${encodedUser}/${encodedExp}/glossaryVersion`,
    currentVersion
  );

  return jsonOk({ version: currentVersion });
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod === "GET") return handleGet(event);
  if (event.httpMethod === "PUT") return handlePut(event);

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
    const existingGlossary = (await firebaseGet(
      `versions/${encodeFirebaseSegment(currentVersion)}/glossary`
    )) as Record<string, GlossaryEntry> | null;

    const existingKeys = new Set(Object.keys(existingGlossary ?? {}));
    const incomingKeys = new Set(Object.keys(incoming));
    newVersion = bumpVersion(currentVersion, incomingKeys, existingKeys);
  }

  const encodedVersion = encodeFirebaseSegment(newVersion);
  await firebasePut(`versions/${encodedVersion}/glossary`, incoming);
  await firebasePut("currentVersion", newVersion);

  return { statusCode: 200, body: JSON.stringify({ version: newVersion }) };
}
