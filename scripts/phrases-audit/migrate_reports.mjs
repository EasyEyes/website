#!/usr/bin/env node
/** Move completed reports from compressed chunks into readable run documents. */

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { gunzipSync } from "node:zlib";
import { MAX_STORED_REPORT_BYTES } from "../../netlify/functions/phrases-audit/handler.mjs";

const require = createRequire(
  new URL(
    "../../netlify/functions/phrases-audit/package.json",
    import.meta.url,
  ),
);
const { cert, initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const apply = process.argv[2] === "--apply";
if (process.argv.length > 3 || (process.argv[2] && !apply)) {
  throw new Error("Usage: migrate_reports.mjs [--apply]");
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccount)
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is required");
const app = initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
const runs = await getFirestore(app)
  .collection("internationalPhraseAuditRuns")
  .get();

for (const run of runs.docs) {
  if (run.data().status !== "completed") continue;
  const chunks = await run.ref
    .collection("reportChunks")
    .orderBy("__name__")
    .get();
  if (chunks.empty) continue;
  const encoded = chunks.docs.map((chunk) => chunk.data().gzipBase64).join("");
  const report = JSON.parse(
    gunzipSync(Buffer.from(encoded, "base64")).toString("utf8"),
  );
  if (
    !report.generatedAt ||
    !report.phraseUsage ||
    !report.history ||
    !report.missingFromSheet
  ) {
    throw new Error(`${run.id}: incomplete report`);
  }
  const size = Buffer.byteLength(JSON.stringify(report));
  if (size > MAX_STORED_REPORT_BYTES) {
    throw new Error(
      `${run.id}: report exceeds readable document limit (${size} bytes)`,
    );
  }
  if (run.data().report) assert.deepEqual(run.data().report, report);
  console.log(`${run.id}: ${chunks.size} chunk(s), ${size} readable bytes`);
  if (!apply) continue;

  await run.ref.update({ report, chunkCount: FieldValue.delete() });
  const saved = await run.ref.get();
  assert.deepEqual(saved.data().report, report);
  for (const chunk of chunks.docs) await chunk.ref.delete();
  console.log(`${run.id}: readable report verified; chunks removed`);
}

if (!apply) console.log("Dry run only; use --apply to migrate reports.");
