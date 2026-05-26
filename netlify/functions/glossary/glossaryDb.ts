const DB_URL =
  "https://easyeyes-compiler-default-rtdb.firebaseio.com";

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
  return { glossary, glossaryFull, superMatchingParams };
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
      body: JSON.stringify(data.glossary),
    }),
    fetch(`${DB_URL}/glossaryFull.json${auth}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.glossaryFull),
    }),
    fetch(`${DB_URL}/superMatchingParams.json${auth}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.superMatchingParams),
    }),
  ]);
}
