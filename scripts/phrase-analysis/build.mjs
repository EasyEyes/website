import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const indexer = fileURLToPath(new URL("./source-index.cjs", import.meta.url));
const target = new URL(
  "../../netlify/functions/study-phrase-analysis/source-index.json",
  import.meta.url,
);
const { fingerprint } = JSON.parse(
  execFileSync(process.execPath, [indexer, "--fingerprint"], {
    maxBuffer: 8 * 1024 * 1024,
  }),
);
let cached;
try {
  cached = JSON.parse(readFileSync(target, "utf8"));
} catch {
  /* Build on a clean checkout. */
}
const checksum = (index) =>
  createHash("sha256")
    .update(JSON.stringify({ ...index, contentSha256: undefined }))
    .digest("hex");
if (
  cached?.schemaVersion === 2 &&
  cached.fingerprint === fingerprint &&
  Array.isArray(cached.sites) &&
  Array.isArray(cached.glossarySites) &&
  Array.isArray(cached.parseFailures) &&
  !cached.parseFailures.length &&
  cached.contentSha256 === checksum(cached)
) {
  console.log(`Reusing phrase analysis index ${fingerprint}`);
} else {
  const index = JSON.parse(
    execFileSync(process.execPath, [indexer], { maxBuffer: 32 * 1024 * 1024 }),
  );
  if (index.fingerprint !== fingerprint || index.parseFailures.length)
    throw new Error("Phrase source index could not be built completely");
  index.contentSha256 = checksum(index);
  writeFileSync(target, JSON.stringify(index) + "\n");
  console.log(
    `Built phrase analysis index ${fingerprint}: ${index.sites.length} sites`,
  );
}
