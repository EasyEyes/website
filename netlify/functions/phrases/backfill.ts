import { readFileSync } from "fs";
import { join } from "path";
import { encodeFirebaseSegment } from "../shared/encodeFirebaseSegment";

const FIREBASE_ROOT =
  "https://easyeyes-compiler-default-rtdb.firebaseio.com";
const INITIAL_VERSION = "1.0";

export function buildBackfillPayload(
  phrases: Record<string, Record<string, string>>
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const [key, row] of Object.entries(phrases)) {
    result[encodeFirebaseSegment(key)] = { ...row };
  }
  return result;
}

function loadPhrasesFromFile(i18nPath: string): Record<string, Record<string, string>> {
  const content = readFileSync(i18nPath, "utf8");
  const match = content.match(/export const phrases = \{/);
  if (!match || match.index === undefined) {
    throw new Error("Could not find phrases export in i18n.js");
  }
  const startIndex = match.index + match[0].length - 1;
  let braceCount = 0;
  let endIndex = startIndex;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === "{") braceCount++;
    if (content[i] === "}") braceCount--;
    if (braceCount === 0) {
      endIndex = i + 1;
      break;
    }
  }
  // eslint-disable-next-line no-eval
  return eval(`(${content.substring(startIndex, endIndex)})`);
}

function firebaseUrl(path: string): string {
  return `${FIREBASE_ROOT}/${path}.json?auth=${process.env.FIREBASE_DB}`;
}

async function firebasePut(path: string, value: unknown): Promise<void> {
  const res = await fetch(firebaseUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firebase PUT ${path} failed ${res.status}: ${body}`);
  }
  console.log(`[backfill] wrote ${path}`);
}

async function main(): Promise<void> {
  const i18nPath = join(
    __dirname,
    "../../../docs/experiment/threshold/components/i18n.js"
  );
  const phrases = loadPhrasesFromFile(i18nPath);
  const payload = buildBackfillPayload(phrases);
  const phraseKeys = Object.keys(payload);

  const encodedVersion = encodeFirebaseSegment(INITIAL_VERSION);
  console.log(`[backfill] writing ${phraseKeys.length} phrases to phrasesVersions/${encodedVersion}/phrases/`);
  for (const [encodedKey, row] of Object.entries(payload)) {
    await firebasePut(`phrasesVersions/${encodedVersion}/phrases/${encodedKey}`, row);
  }

  await firebasePut("phrases/currentVersion", INITIAL_VERSION);
  console.log(`[backfill] done. phrases/currentVersion = "${INITIAL_VERSION}"`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
