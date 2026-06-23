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

function isCyan(cell: XLSX.CellObject | undefined): boolean {
  if (!cell?.s) return false;
  const rgb = (cell.s as { fgColor?: { rgb?: string } }).fgColor?.rgb;
  if (!rgb) return false;

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
    return false;
  }

  // Cyan range: low red, high green, high blue
  return r < 50 && g > 200 && b > 200;
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

async function callGoogle(
  text: string,
  deps: Deps
): Promise<string> {
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

export async function translatePhraseFile(
  xlsxBuffer: Buffer,
  deps: Deps
): Promise<Buffer> {
  const wb = XLSX.read(xlsxBuffer, { type: "buffer", cellStyles: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");

  // Find the ~LanguageCode row
  let langCodeRow = -1;
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
    if (
      cell &&
      String(cell.v).toLowerCase() === "~languagecode"
    ) {
      langCodeRow = r;
      break;
    }
  }

  if (langCodeRow === -1) {
    throw new Error(
      'Phrase file is missing the required "~LanguageCode" row.'
    );
  }

  // Column 1 (B) = source language
  const sourceCell = ws[XLSX.utils.encode_cell({ r: langCodeRow, c: 1 })];
  const sourceLang = sourceCell ? String(sourceCell.v) : "en";
  console.log(`[translate] ~LanguageCode row index: ${langCodeRow}, sourceLang: ${sourceLang}, sheet range: ${ws["!ref"]}`);

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
        console.log(
          `[bg-check] ${addr} t=${cell?.t ?? "undefined"} fgColor=${bg ?? "none"} isCyan=${isCyan(cell)}`
        );
        if (!isCyan(cell)) continue;
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

  // Fan out all DeepL columns in parallel (batch of 50 per column)
  const BATCH = 50;

  await Promise.all(
    deeplCols.map(async ({ colIdx, langCode, rows, texts }) => {
      for (let i = 0; i < texts.length; i += BATCH) {
        const batchTexts = texts.slice(i, i + BATCH);
        const batchRows = rows.slice(i, i + BATCH);
        const translated = await callDeepL(batchTexts, sourceLang, langCode, deps);
        for (let j = 0; j < batchRows.length; j++) {
          const addr = XLSX.utils.encode_cell({ r: batchRows[j], c: colIdx });
          const existing = ws[addr] ?? { t: "s" };
          ws[addr] = { ...existing, t: "s", v: translated[j], w: translated[j] };
          console.log(`[translate] wrote ${addr} (${langCode}): "${translated[j]}"`);
        }
      }
    })
  );

  // Google Translate for Kannada
  if (googleCol && deps.googleApiKey) {
    const { colIdx, rows, texts } = googleCol;
    await Promise.all(
      texts.map(async (text, i) => {
        const translated = await callGoogle(text, deps);
        const addr = XLSX.utils.encode_cell({ r: rows[i], c: colIdx });
        const existing = ws[addr] ?? { t: "s" };
        ws[addr] = { ...existing, t: "s", v: translated, w: translated };
      })
    );
  }

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx", cellStyles: true }) as Buffer;
}
