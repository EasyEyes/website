import * as zlib from "zlib";
import * as XLSX from "xlsx";

export type FetchLike = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export type Deps = {
  deeplFetch: FetchLike;
  googleFetch: FetchLike;
  googleApiKey?: string;
  deeplApiKey: string;
  sleep?: (ms: number) => Promise<void>;
};

// ---------------------------------------------------------------------------
// ZIP helpers — bypass SheetJS write (which silently drops all fill styles)
// ---------------------------------------------------------------------------

function zlibCrc32(buf: Buffer): number {
  const z = zlib as unknown as { crc32?: (b: Buffer) => number };
  if (z.crc32) return z.crc32(buf);
  // Fallback for Node < 22
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function readZip(buf: Buffer): Map<string, Buffer> {
  const EOCD = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === EOCD) { eocdOffset = i; break; }
  }
  if (eocdOffset < 0) throw new Error("Not a valid ZIP/xlsx");

  const numEntries = buf.readUInt16LE(eocdOffset + 8);
  const cdOffset   = buf.readUInt32LE(eocdOffset + 16);

  const files = new Map<string, Buffer>();
  let pos = cdOffset;
  for (let i = 0; i < numEntries; i++) {
    const method         = buf.readUInt16LE(pos + 10);
    const compSize       = buf.readUInt32LE(pos + 20);
    const fileNameLen    = buf.readUInt16LE(pos + 28);
    const extraLen       = buf.readUInt16LE(pos + 30);
    const commentLen     = buf.readUInt16LE(pos + 32);
    const localOffset    = buf.readUInt32LE(pos + 42);
    const fileName       = buf.toString("utf8", pos + 46, pos + 46 + fileNameLen);
    pos += 46 + fileNameLen + extraLen + commentLen;

    const lhNameLen  = buf.readUInt16LE(localOffset + 26);
    const lhExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart  = localOffset + 30 + lhNameLen + lhExtraLen;
    const compressed = buf.slice(dataStart, dataStart + compSize);

    files.set(fileName, method === 0 ? compressed : zlib.inflateRawSync(compressed));
  }
  return files;
}

function writeZip(files: Map<string, Buffer>): Buffer {
  const localParts: Buffer[] = [];
  const centralDir: Buffer[] = [];
  let offset = 0;

  for (const [name, data] of files) {
    const nb   = Buffer.from(name, "utf8");
    const comp = zlib.deflateRawSync(data, { level: 6 });
    const crc  = zlibCrc32(data);

    const lh = Buffer.alloc(30 + nb.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8);   // DEFLATE
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nb.length, 26);
    lh.writeUInt16LE(0, 28);
    nb.copy(lh, 30);
    localParts.push(lh, comp);

    const cd = Buffer.alloc(46 + nb.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(8, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(comp.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nb.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nb.copy(cd, 46);
    centralDir.push(cd);

    offset += lh.length + comp.length;
  }

  const cdBuf  = Buffer.concat(centralDir);
  const eocdr  = Buffer.alloc(22);
  eocdr.writeUInt32LE(0x06054b50, 0);
  eocdr.writeUInt16LE(0, 4);
  eocdr.writeUInt16LE(0, 6);
  eocdr.writeUInt16LE(files.size, 8);
  eocdr.writeUInt16LE(files.size, 10);
  eocdr.writeUInt32LE(cdBuf.length, 12);
  eocdr.writeUInt32LE(offset, 16);
  eocdr.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, cdBuf, eocdr]);
}

// ---------------------------------------------------------------------------
// XML helpers for patching sharedStrings + sheet without touching styles.xml
// ---------------------------------------------------------------------------

function appendSharedStrings(
  xml: string,
  newStrings: string[]
): { xml: string; startIndex: number } {
  if (newStrings.length === 0) return { xml, startIndex: 0 };

  const countMatch = xml.match(/uniqueCount="(\d+)"/);
  const startIndex = countMatch ? parseInt(countMatch[1], 10) : 0;
  const total      = startIndex + newStrings.length;

  const entries = newStrings
    .map((s) => {
      const esc = s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<si><t>${esc}</t></si>`;
    })
    .join("");

  const updated = xml
    .replace(/ count="\d+"/, ` count="${total}"`)
    .replace(/uniqueCount="\d+"/, `uniqueCount="${total}"`)
    .replace("</sst>", `${entries}</sst>`);

  return { xml: updated, startIndex };
}

function patchSheetCells(xml: string, updates: Map<string, number>): string {
  let result = xml;
  for (const [addr, newIndex] of updates) {
    // Self-closing: <c r="C2" ... />
    const selfRe = new RegExp(`<c r="${addr}"([^/]*)\\/>`, "");
    const selfM  = selfRe.exec(result);
    if (selfM) {
      const attrs    = ensureSharedStringType(selfM[1]);
      result = result.slice(0, selfM.index)
        + `<c r="${addr}"${attrs}><v>${newIndex}</v></c>`
        + result.slice(selfM.index + selfM[0].length);
      continue;
    }
    // Paired: <c r="C2" ...>...</c>
    const pairedRe = new RegExp(`<c r="${addr}"([^>]*)>[\\s\\S]*?<\\/c>`, "");
    const pairedM  = pairedRe.exec(result);
    if (pairedM) {
      const attrs = ensureSharedStringType(pairedM[1]);
      result = result.slice(0, pairedM.index)
        + `<c r="${addr}"${attrs}><v>${newIndex}</v></c>`
        + result.slice(pairedM.index + pairedM[0].length);
    }
  }
  return result;
}

function ensureSharedStringType(attrs: string): string {
  if (/ t="/.test(attrs)) return attrs.replace(/ t="[^"]*"/, ' t="s"');
  return `${attrs} t="s"`;
}

// ---------------------------------------------------------------------------
// DeepL / Google helpers
// ---------------------------------------------------------------------------

const DEEPL_CODE_MAP: Record<string, string> = {
  "zh-CN": "ZH-HANS",
  "zh-TW": "ZH-HANT",
  no: "NB",
  "pt-pt": "PT-PT",
};

function toDeeplTargetLang(lang: string): string {
  return DEEPL_CODE_MAP[lang] ?? lang.toUpperCase();
}

function deeplBaseUrl(apiKey: string): string {
  return apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";
}

function isWhiteOrNoColor(cell: XLSX.CellObject | undefined): boolean {
  if (!cell?.s) return true;
  const rgb = (cell.s as { fgColor?: { rgb?: string } }).fgColor?.rgb;
  if (!rgb) return true;

  // Normalize to 6-digit RRGGBB (SheetJS may give 6 or 8 chars)
  const hex = rgb.replace(/[^0-9A-Fa-f]/g, "");
  let r: number, g: number, b: number;
  if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (hex.length === 8) {
    // SheetJS uses AARRGGBB
    r = parseInt(hex.slice(2, 4), 16);
    g = parseInt(hex.slice(4, 6), 16);
    b = parseInt(hex.slice(6, 8), 16);
  } else {
    return true;
  }

  // White: all channels at maximum
  return r === 255 && g === 255 && b === 255;
}

async function callDeepL(
  texts: string[],
  sourceLang: string,
  targetLang: string,
  deps: Deps
): Promise<string[]> {
  const sleep = deps.sleep ?? (() => Promise.resolve());
  const baseUrl = deeplBaseUrl(deps.deeplApiKey);
  const RETRY_STATUSES = new Set([429, 456]);

  const requestBody = {
    text: texts,
    source_lang: sourceLang.toUpperCase(),
    target_lang: toDeeplTargetLang(targetLang),
  };
  console.log(`[DeepL] request to ${targetLang}:`, JSON.stringify(requestBody));

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await deps.deeplFetch(`${baseUrl}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${deps.deeplApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[DeepL] response status for ${targetLang}: ${res.status}`);

    if (res.ok) {
      const data = (await res.json()) as {
        translations: Array<{ text: string }>;
      };
      console.log(`[DeepL] response body for ${targetLang}:`, JSON.stringify(data));
      return data.translations.map((t) => t.text);
    }

    const errBody = await res.json().catch(() => null);
    console.log(`[DeepL] error body for ${targetLang}:`, JSON.stringify(errBody));

    if (RETRY_STATUSES.has(res.status)) {
      await sleep(1000);
      continue;
    }

    throw new Error(
      `DeepL translation to "${targetLang}" failed with status ${res.status}`
    );
  }

  throw new Error(
    `DeepL translation to "${targetLang}" failed after 3 attempts`
  );
}

// Q&A phrases are encoded as "SHORTCUT|correctAnswer|question|answer1|answer2|...".
// DeepL is not reliable about leaving the SHORTCUT token (and pipes) untouched when
// it's sent inline with the sentence — it sometimes strips it entirely (observed for
// e.g. "PRED||Is there anything..." losing its "PRED||" prefix). So instead of trusting
// DeepL to preserve non-language scaffolding, we carve the cell into segments, translate
// only the natural-language ones, and rejoin with the original pipes.
function splitForTranslation(
  text: string
): { segments: string[]; translatable: boolean[] } {
  const segments = text.split("|");
  if (segments.length === 1) {
    return { segments, translatable: [true] };
  }
  const translatable = segments.map((seg, i) => {
    if (i === 0) return false; // shortcut/nickname token, never translate
    const trimmed = seg.trim();
    if (trimmed === "" || /^\d+$/.test(trimmed)) return false; // placeholder or numeric answer option
    return true;
  });
  return { segments, translatable };
}

async function callGoogle(text: string, deps: Deps): Promise<string> {
  const res = await deps.googleFetch(
    `https://translation.googleapis.com/language/translate/v2?key=${deps.googleApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target: "kn", format: "text" }),
    }
  );

  if (!res.ok) {
    throw new Error(`Google Translate failed with status ${res.status}`);
  }

  const data = (await res.json()) as {
    data: { translations: Array<{ translatedText: string }> };
  };
  return data.data.translations[0]?.translatedText ?? text;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function translatePhraseFile(
  xlsxBuffer: Buffer,
  deps: Deps
): Promise<Buffer> {
  // Read as raw ZIP so we can patch styles/sheet XML without SheetJS write
  const zipFiles = readZip(xlsxBuffer);

  // SheetJS read is still used for cyan-cell detection and value access
  const wb = XLSX.read(xlsxBuffer, { type: "buffer", cellStyles: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");

  // Find the LanguageCode row (with or without leading ~)
  let langCodeRow = -1;
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
    if (cell && String(cell.v).replace(/^~/, "").toLowerCase() === "languagecode") {
      langCodeRow = r;
      break;
    }
  }

  if (langCodeRow === -1) {
    throw new Error(
      'Phrase file is missing the required "LanguageCode" row.'
    );
  }

  // Column 1 (B) = source language
  const sourceCell = ws[XLSX.utils.encode_cell({ r: langCodeRow, c: 1 })];
  const sourceLang = sourceCell ? String(sourceCell.v) : "en";
  console.log(`[translate] LanguageCode row index: ${langCodeRow}, sourceLang: ${sourceLang}, sheet range: ${ws["!ref"]}`);

  // Collect target language columns (index 2+)
  type ColJob = { colIdx: number; langCode: string; rows: number[]; texts: string[] };
  const deeplCols: ColJob[] = [];
  const googleCol: ColJob | null = (() => {
    let g: ColJob | null = null;
    for (let c = 2; c <= range.e.c; c++) {
      const codeCell = ws[XLSX.utils.encode_cell({ r: langCodeRow, c })];
      if (!codeCell) continue;
      const langCode = String(codeCell.v);

      const rows: number[] = [];
      const texts: string[] = [];

      for (let r = range.s.r; r <= range.e.r; r++) {
        if (r === langCodeRow) continue;
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        const bg = (cell?.s as { fgColor?: { rgb?: string } } | undefined)
          ?.fgColor?.rgb;
        const shouldTranslate = isWhiteOrNoColor(cell);
        console.log(
          `[bg-check] ${addr} t=${cell?.t ?? "undefined"} fgColor=${bg ?? "none"} shouldTranslate=${shouldTranslate}`
        );
        if (!shouldTranslate) continue;
        // Source text comes from column B (index 1) of the same row
        const srcCell = ws[XLSX.utils.encode_cell({ r, c: 1 })];
        const srcText = srcCell ? String(srcCell.v) : "";
        rows.push(r);
        texts.push(srcText);
      }

      console.log(`[translate] col ${c} lang="${langCode}": ${rows.length} cells queued for translation`);
      if (langCode === "kn") {
        g = { colIdx: c, langCode, rows, texts };
      } else {
        deeplCols.push({ colIdx: c, langCode, rows, texts });
      }
    }
    return g;
  })();

  // Collect translated texts by cell address (addr → translated text)
  const cellUpdates = new Map<string, string>();

  // Fan out all DeepL columns in parallel (batch of 50 per column)
  const BATCH = 50;

  await Promise.all(
    deeplCols.map(async ({ colIdx, langCode, rows, texts }) => {
      const parsed = texts.map(splitForTranslation);

      // Flatten every translatable segment across all rows in this column into
      // one list, so the SHORTCUT tokens and numeric answer options never reach
      // DeepL and batching stays within DeepL's per-request text limit.
      type Piece = { rowIdx: number; segIdx: number; text: string };
      const pieces: Piece[] = [];
      parsed.forEach(({ segments, translatable }, rowIdx) => {
        segments.forEach((seg, segIdx) => {
          if (translatable[segIdx]) pieces.push({ rowIdx, segIdx, text: seg });
        });
      });

      const translatedBySeg = new Map<string, string>(); // `${rowIdx}:${segIdx}` -> text
      for (let i = 0; i < pieces.length; i += BATCH) {
        const batch = pieces.slice(i, i + BATCH);
        const translated = await callDeepL(
          batch.map((p) => p.text),
          sourceLang,
          langCode,
          deps
        );
        batch.forEach((p, j) =>
          translatedBySeg.set(`${p.rowIdx}:${p.segIdx}`, translated[j])
        );
      }

      parsed.forEach(({ segments }, rowIdx) => {
        const finalSegments = segments.map(
          (seg, segIdx) => translatedBySeg.get(`${rowIdx}:${segIdx}`) ?? seg
        );
        const result = finalSegments.join("|");
        const addr = XLSX.utils.encode_cell({ r: rows[rowIdx], c: colIdx });
        cellUpdates.set(addr, result);
        console.log(`[translate] queued ${addr} (${langCode}): "${result}"`);
      });
    })
  );

  // Google Translate for Kannada
  if (googleCol && deps.googleApiKey) {
    const { colIdx, rows, texts } = googleCol;
    await Promise.all(
      texts.map(async (text, i) => {
        const translated = await callGoogle(text, deps);
        const addr = XLSX.utils.encode_cell({ r: rows[i], c: colIdx });
        cellUpdates.set(addr, translated);
      })
    );
  }

  if (cellUpdates.size === 0) {
    return writeZip(zipFiles);
  }

  // Locate the sheet XML and shared-strings files inside the ZIP
  const rawSheetPath =
    (wb as unknown as { Directory?: { sheets?: string[] } }).Directory
      ?.sheets?.[0] ?? "/xl/worksheets/sheet1.xml";
  const sheetPath = rawSheetPath.startsWith("/") ? rawSheetPath.slice(1) : rawSheetPath;

  let ssPath = "";
  for (const key of zipFiles.keys()) {
    if (/sharedStrings\.xml$/i.test(key)) { ssPath = key; break; }
  }

  // Append translated strings to sharedStrings.xml
  const ssXml            = ssPath ? (zipFiles.get(ssPath)?.toString("utf8") ?? "") : "";
  const translationOrder = [...cellUpdates.entries()];
  const newStrings       = translationOrder.map(([, t]) => t);
  const { xml: newSsXml, startIndex } = appendSharedStrings(ssXml, newStrings);

  // Build addr → shared-string index map
  const indexUpdates = new Map<string, number>();
  translationOrder.forEach(([addr], i) => indexUpdates.set(addr, startIndex + i));

  // Patch the sheet XML (updates <v> for each translated cell, preserves s="N")
  const sheetXml    = zipFiles.get(sheetPath)?.toString("utf8") ?? "";
  const newSheetXml = patchSheetCells(sheetXml, indexUpdates);

  // Return ZIP with only sharedStrings + sheet XML replaced; styles.xml untouched
  const outputFiles = new Map(zipFiles);
  if (ssPath) outputFiles.set(ssPath, Buffer.from(newSsXml, "utf8"));
  outputFiles.set(sheetPath, Buffer.from(newSheetXml, "utf8"));

  return writeZip(outputFiles);
}
