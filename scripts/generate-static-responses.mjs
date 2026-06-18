#!/usr/bin/env node
/**
 * Generate static JSON files for phrases and glossary Netlify functions.
 *
 * When Firebase is down, run this script to snapshot the current Google
 * Spreadsheet data into static JSON files, then set STATIC_MODE=true in
 * the Netlify environment to serve them.
 *
 * Usage — pick one input method per sheet:
 *
 *   # Published CSV URL (no credentials needed if the sheet is published)
 *   node scripts/generate-static-responses.mjs \
 *     --phrases-url="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv&gid=0" \
 *     --glossary-url="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv&gid=0"
 *
 *   # Google Sheets API v4 (sheet must be accessible with the key)
 *   GOOGLE_API_KEY=<key> node scripts/generate-static-responses.mjs \
 *     --phrases-sheet-id=<id> \
 *     --glossary-sheet-id=<id>
 *
 *   # Local CSV export
 *   node scripts/generate-static-responses.mjs \
 *     --phrases-csv=path/to/Translations.csv \
 *     --glossary-csv=path/to/InputParameters.csv
 *
 * Output files (committed to repo, overwritten by this script):
 *   netlify/functions/phrases/static-phrases.json
 *   netlify/functions/glossary/static-glossary.json
 *
 * After running, set STATIC_MODE=true in Netlify env vars and redeploy.
 * To return to Firebase, remove STATIC_MODE (or set it to false) and redeploy.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = resolve(__dirname, "..");

// ── CLI arg parsing ──────────────────────────────────────────────────────────

const args = {};
for (const arg of process.argv.slice(2)) {
  if (!arg.startsWith("--")) continue;
  const eq = arg.indexOf("=");
  if (eq === -1) args[arg.slice(2)] = true;
  else args[arg.slice(2, eq)] = arg.slice(eq + 1);
}

// ── CSV parser ───────────────────────────────────────────────────────────────

function parseCSV(text) {
  const rows = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const row = [];

    while (i < n && text[i] !== "\n" && text[i] !== "\r") {
      if (text[i] === '"') {
        i++;
        let field = "";
        while (i < n) {
          if (text[i] === '"' && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (text[i] === '"') {
            i++;
            break;
          } else {
            field += text[i++];
          }
        }
        row.push(field);
      } else {
        let field = "";
        while (i < n && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
          field += text[i++];
        }
        row.push(field);
      }
      if (i < n && text[i] === ",") i++;
    }

    if (i < n && text[i] === "\r") i++;
    if (i < n && text[i] === "\n") i++;

    if (row.some((c) => c !== "")) rows.push(row);
  }

  return rows;
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchCSV(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${url}`);
  return resp.text();
}

async function fetchSheetsAPI(sheetId, sheetName, apiKey) {
  const range = encodeURIComponent(`${sheetName}!A:ZZ`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Sheets API ${resp.status}: ${body}`);
  }
  const json = await resp.json();
  return json.values ?? [];
}

async function getRows(prefix, defaultSheetName) {
  const csvFile = args[`${prefix}-csv`];
  const csvUrl = args[`${prefix}-url`];
  const sheetId = args[`${prefix}-sheet-id`];
  const sheetName = args[`${prefix}-sheet-name`] ?? defaultSheetName;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (csvFile) {
    console.log(`[${prefix}] reading from file: ${csvFile}`);
    return parseCSV(readFileSync(csvFile, "utf-8"));
  }
  if (csvUrl) {
    console.log(`[${prefix}] fetching CSV: ${csvUrl}`);
    return parseCSV(await fetchCSV(csvUrl));
  }
  if (sheetId && apiKey) {
    console.log(`[${prefix}] Sheets API: ${sheetId} / ${sheetName}`);
    return fetchSheetsAPI(sheetId, sheetName, apiKey);
  }

  throw new Error(
    `No input for "${prefix}". Provide one of:\n` +
      `  --${prefix}-csv=<file>\n` +
      `  --${prefix}-url=<published-csv-url>\n` +
      `  --${prefix}-sheet-id=<id>  (with GOOGLE_API_KEY env var)`,
  );
}

// ── Phrases transformer ──────────────────────────────────────────────────────
// Mirrors the logic the apps script uses when reading the Translations sheet.
// Column "language" → phrase key; all other columns → language code → value.

function transformPhrases(rows) {
  if (rows.length < 2) return {};

  const header = rows[0];
  const keyIdx = header.indexOf("language");
  const enIdx = header.indexOf("en");

  if (keyIdx === -1 || enIdx === -1) {
    throw new Error(
      `Phrases sheet must have "language" and "en" columns. Got: ${header.join(", ")}`,
    );
  }

  const phrases = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const key = (row[keyIdx] ?? "").trim();
    if (!key) continue;

    const phraseRow = {};
    for (let h = 0; h < header.length; h++) {
      const lang = header[h];
      if (!lang || h === keyIdx) continue;
      phraseRow[lang] = row[h] ?? "";
    }
    phrases[key] = phraseRow;
  }

  return phrases;
}

// ── Glossary transformer ─────────────────────────────────────────────────────
// Mirrors transformRawRows in netlify/functions/glossary/index.ts.

function transformGlossary(rows) {
  if (rows.length < 2) return {};

  const headers = rows[0].map((h) => String(h ?? "").trim().toUpperCase());
  const col = {};
  headers.forEach((h, i) => { col[h] = i; });

  const str = (v) => String(v ?? "");
  const glossary = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = str(row[col["INPUT PARAMETER"] ?? 0]).trim();
    if (!name || name.includes("__")) continue;

    const type = str(row[col["TYPE"] ?? 2]);
    const rawDefault = row[col["DEFAULT"] ?? 3];
    const normalizedDefault =
      type === "boolean"
        ? str(rawDefault).trim().toUpperCase()
        : str(rawDefault);
    const rawCategories = str(row[col["CATEGORIES"] ?? 6]);

    glossary[name] = {
      name,
      availability: str(row[col["NOW"] ?? 1]),
      type,
      default: normalizedDefault,
      explanation: str(row[col["EXPLANATION"] ?? 4]),
      example: str(row[col["EXAMPLE"] ?? 5]),
      categories:
        type === "categorical" || type === "multicategorical"
          ? rawCategories.split(",").map((s) => s.trim())
          : [],
    };
  }

  return glossary;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const version = typeof args.version === "string" ? args.version : "static";

  // Phrases
  const phrasesRows = await getRows("phrases", "Translations");
  const phrases = transformPhrases(phrasesRows);
  const phrasesPayload = { version, phrases };
  const phrasesOut = resolve(
    WEBSITE_DIR,
    "netlify/functions/phrases/static-phrases.json",
  );
  writeFileSync(phrasesOut, JSON.stringify(phrasesPayload, null, 2), "utf-8");
  console.log(
    `✓ Wrote ${phrasesOut}  (${Object.keys(phrases).length} phrase keys)`,
  );

  // Glossary
  const glossaryRows = await getRows("glossary", "InputParameters");
  const glossary = transformGlossary(glossaryRows);
  const glossaryFull = Object.values(glossary);
  const superMatchingParams = Object.keys(glossary).filter((k) =>
    k.includes("@"),
  );
  const glossaryPayload = { version, glossary, glossaryFull, superMatchingParams };
  const glossaryOut = resolve(
    WEBSITE_DIR,
    "netlify/functions/glossary/static-glossary.json",
  );
  writeFileSync(glossaryOut, JSON.stringify(glossaryPayload, null, 2), "utf-8");
  console.log(
    `✓ Wrote ${glossaryOut}  (${Object.keys(glossary).length} glossary entries)`,
  );
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
