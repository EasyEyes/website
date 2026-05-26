const DB_URL =
  "https://easyeyes-compiler-default-rtdb.firebaseio.com";

// Firebase forbids ".", "$", "#", "[", "]", "/" in keys.
// We encode "." as "__dot__" on write and decode on read.
function encodeKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(encodeKeys);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k.replace(/\./g, "__dot__"),
        encodeKeys(v),
      ]),
    );
  }
  return obj;
}

function decodeKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(decodeKeys);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k.replace(/__dot__/g, "."),
        decodeKeys(v),
      ]),
    );
  }
  return obj;
}

function authParam(): string {
  const key = process.env.FIREBASE_API_KEY;
  return key ? `?auth=${key}` : "";
}

export async function readGlossaryData(): Promise<{
  glossary: unknown;
  glossaryFull: unknown;
  superMatchingParams: unknown;
}> {
  const [gRes, gfRes, smpRes] = await Promise.all([
    fetch(`${DB_URL}/glossary.json`),
    fetch(`${DB_URL}/glossaryFull.json`),
    fetch(`${DB_URL}/superMatchingParams.json`),
  ]);
  const [glossary, glossaryFull, superMatchingParams] = await Promise.all([
    gRes.json(),
    gfRes.json(),
    smpRes.json(),
  ]);
  return {
    glossary: decodeKeys(glossary ?? {}),
    glossaryFull: decodeKeys(glossaryFull ?? []),
    superMatchingParams: decodeKeys(superMatchingParams ?? []),
  };
}

export async function writeGlossaryData(data: {
  glossary: object;
  glossaryFull: unknown[];
  superMatchingParams: string[];
}): Promise<void> {
  const auth = authParam();
  await Promise.all([
    fetch(`${DB_URL}/glossary.json${auth}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encodeKeys(data.glossary)),
    }),
    fetch(`${DB_URL}/glossaryFull.json${auth}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encodeKeys(data.glossaryFull)),
    }),
    fetch(`${DB_URL}/superMatchingParams.json${auth}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.superMatchingParams),
    }),
  ]);
}
