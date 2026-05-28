import { encodeFirebaseSegment } from "./encodeFirebaseSegment";

type NetlifyEvent = {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
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

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
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
