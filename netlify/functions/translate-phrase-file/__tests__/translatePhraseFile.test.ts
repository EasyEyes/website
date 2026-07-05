import * as zlib from "zlib";
import * as XLSX from "xlsx";
import { translatePhraseFile, type Deps } from "../translatePhraseFile";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const noSleep = () => Promise.resolve();

function makeDeeplFetch(
  responses: Array<{ status: number; body?: unknown }>
): jest.Mock {
  let callCount = 0;
  return jest.fn(() => {
    const resp = responses[Math.min(callCount++, responses.length - 1)];
    return Promise.resolve({
      ok: resp.status >= 200 && resp.status < 300,
      status: resp.status,
      json: () => Promise.resolve(resp.body),
    });
  });
}

function deeplOk(texts: string[]): { status: number; body: unknown } {
  return {
    status: 200,
    body: { translations: texts.map((t) => ({ text: `[${t}]` })) },
  };
}

function makeGoogleFetch(translatedText: string): jest.Mock {
  return jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: { translations: [{ translatedText }] },
        }),
    })
  );
}

/**
 * Build a minimal ZIP buffer (xlsx is a ZIP) with DEFLATE compression.
 * Uses Node's built-in zlib for DEFLATE and CRC-32.
 */
function makeZip(entries: Array<{ name: string; data: string | Buffer }>): Buffer {
  const localParts: Buffer[] = [];
  const centralDirEntries: Buffer[] = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, "utf8");
    const dataBytes = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const compressed = zlib.deflateRawSync(dataBytes, { level: 6 });
    const crc = (zlib as unknown as { crc32(buf: Buffer): number }).crc32(
      dataBytes
    );

    const lh = Buffer.alloc(30 + nameBytes.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8); // DEFLATE
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compressed.length, 18);
    lh.writeUInt32LE(dataBytes.length, 22);
    lh.writeUInt16LE(nameBytes.length, 26);
    lh.writeUInt16LE(0, 28);
    nameBytes.copy(lh, 30);
    localParts.push(lh, compressed);

    const cd = Buffer.alloc(46 + nameBytes.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(8, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compressed.length, 20);
    cd.writeUInt32LE(dataBytes.length, 24);
    cd.writeUInt16LE(nameBytes.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBytes.copy(cd, 46);
    centralDirEntries.push(cd);

    offset += lh.length + compressed.length;
  }

  const cdBuf = Buffer.concat(centralDirEntries);
  const eocdr = Buffer.alloc(22);
  eocdr.writeUInt32LE(0x06054b50, 0);
  eocdr.writeUInt16LE(0, 4);
  eocdr.writeUInt16LE(0, 6);
  eocdr.writeUInt16LE(entries.length, 8);
  eocdr.writeUInt16LE(entries.length, 10);
  eocdr.writeUInt32LE(cdBuf.length, 12);
  eocdr.writeUInt32LE(offset, 16);
  eocdr.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, cdBuf, eocdr]);
}

type CellSpec = { value: string; colored?: boolean };
type ColumnSpec = { code: string; cells: CellSpec[] };

/**
 * Build a phrase xlsx buffer with proper OOXML fill colors.
 *
 * Layout:
 *   Row 1: ~LanguageCode | <sourceCode> | <targetCodes...>
 *   Row N: <symbolN>     | <sourceValue> | <targetValue (cyan?)>...
 */
function buildPhraseXlsx(opts: {
  sourceCode: string;
  symbols: string[];
  sourceCells?: CellSpec[]; // indexed by symbol
  targetColumns: ColumnSpec[];
}): Buffer {
  const { sourceCode, symbols, sourceCells = [], targetColumns } = opts;

  // sharedStrings: collect all distinct string values
  const strings: string[] = [];
  function si(v: string): number {
    const idx = strings.indexOf(v);
    if (idx !== -1) return idx;
    strings.push(v);
    return strings.length - 1;
  }

  // Pre-populate shared strings in order
  si("~LanguageCode");
  si(sourceCode);
  for (const col of targetColumns) si(col.code);
  for (const sym of symbols) si(sym);
  for (const sc of sourceCells) si(sc.value);
  for (const col of targetColumns) for (const c of col.cells) si(c.value);

  // Build sheet XML rows
  const colCount = 1 + 1 + targetColumns.length;
  const colLetters = Array.from({ length: colCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const rows: string[] = [];

  // Header row (~LanguageCode + lang codes)
  const headerCells = [
    `<c r="${colLetters[0]}1" t="s"><v>${si("~LanguageCode")}</v></c>`,
    `<c r="${colLetters[1]}1" t="s"><v>${si(sourceCode)}</v></c>`,
    ...targetColumns.map(
      (col, ci) =>
        `<c r="${colLetters[2 + ci]}1" t="s"><v>${si(col.code)}</v></c>`
    ),
  ];
  rows.push(`<row r="1">${headerCells.join("")}</row>`);

  // Symbol rows
  symbols.forEach((sym, ri) => {
    const rowNum = ri + 2;
    const cells: string[] = [
      `<c r="${colLetters[0]}${rowNum}" t="s"><v>${si(sym)}</v></c>`,
    ];

    const sc = sourceCells[ri];
    if (sc) {
      const styleAttr = sc.colored ? ' s="1"' : "";
      cells.push(
        `<c r="${colLetters[1]}${rowNum}" t="s"${styleAttr}><v>${si(sc.value)}</v></c>`
      );
    }

    targetColumns.forEach((col, ci) => {
      const c = col.cells[ri];
      if (c !== undefined) {
        const styleAttr = c.colored ? ' s="1"' : "";
        cells.push(
          `<c r="${colLetters[2 + ci]}${rowNum}" t="s"${styleAttr}><v>${si(c.value)}</v></c>`
        );
      }
    });

    rows.push(`<row r="${rowNum}">${cells.join("")}</row>`);
  });

  const lastRow = symbols.length + 1;
  const lastCol = colLetters[colCount - 1];

  const SHEET = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows.join("")}</sheetData>
</worksheet>`;

  const SS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${strings.map((s) => `  <si><t>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</t></si>`).join("\n")}
</sst>`;

  return makeZip([
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`,
    },
    { name: "xl/sharedStrings.xml", data: SS },
    {
      name: "xl/styles.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF00FFFF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="0" fillId="2" borderId="0" xfId="0" applyFill="1"/>
  </cellXfs>
</styleSheet>`,
    },
    { name: "xl/worksheets/sheet1.xml", data: SHEET },
  ]);
}

function readCell(buf: Buffer, cellAddr: string): string {
  const wb = XLSX.read(buf, { type: "buffer", cellStyles: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return String(ws[cellAddr]?.v ?? "");
}

// ---------------------------------------------------------------------------
// Behaviors
// ---------------------------------------------------------------------------

describe("white/no-color cell in target column → translated via DeepL", () => {
  test("output xlsx has DeepL result in the white French cell", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello" }],
      targetColumns: [{ code: "fr", cells: [{ value: "" }] }],
    });

    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    // C2: ~Greeting row, fr column
    expect(readCell(out, "C2")).toBe("[Bonjour]");
    expect(deeplFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(deeplFetch.mock.calls[0][1].body);
    expect(body.target_lang).toBe("FR");
    expect(body.source_lang).toBe("EN");
    expect(body.text).toEqual(["Hello"]);
  });
});

// ---------------------------------------------------------------------------
// Behavior 2: source column (index 1) skipped even if cyan
// ---------------------------------------------------------------------------

describe("source column skipped regardless of color", () => {
  test("DeepL not called for colored cell in source column", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello", colored: true }], // source col B has color but is always skipped
      targetColumns: [{ code: "fr", cells: [{ value: "" }] }],
    });

    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    // B2 (source) must be unchanged
    expect(readCell(out, "B2")).toBe("Hello");
    // Only one DeepL call: for the fr column, not the source column
    expect(deeplFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(deeplFetch.mock.calls[0][1].body);
    expect(body.target_lang).toBe("FR");
  });
});

// ---------------------------------------------------------------------------
// Behavior 3: non-cyan cell in target column → unchanged, DeepL not called
// ---------------------------------------------------------------------------

describe("colored cell in target column → unchanged", () => {
  test("colored cell value preserved, DeepL not called", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello" }],
      targetColumns: [
        { code: "fr", cells: [{ value: "Bonjour existant", colored: true }] },
      ],
    });

    const deeplFetch = jest.fn();
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    expect(readCell(out, "C2")).toBe("Bonjour existant");
    expect(deeplFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Behavior 4: missing ~LanguageCode row → throws with descriptive message
// ---------------------------------------------------------------------------

describe("missing LanguageCode row", () => {
  test("throws with LanguageCode in message", async () => {
    // Build a valid xlsx but with no ~LanguageCode row
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"], // no ~LanguageCode — buildPhraseXlsx puts it in row 1 normally
      targetColumns: [{ code: "fr", cells: [{ value: "", cyan: true }] }],
    });

    // Patch: rebuild without the header row by reading and removing A1
    const wb = XLSX.read(buf, { type: "buffer", cellStyles: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    // Overwrite A1 to remove ~LanguageCode
    ws["A1"] = { v: "~SomethingElse", t: "s" };
    const patched = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const deps: Deps = {
      deeplFetch: jest.fn() as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
    };

    await expect(translatePhraseFile(patched, deps)).rejects.toThrow(
      /LanguageCode/i
    );
  });
});

// ---------------------------------------------------------------------------
// Behavior 5: DeepL non-ok → throws with descriptive message
// ---------------------------------------------------------------------------

describe("DeepL failure → throws", () => {
  test("DeepL 500 → throws with status in message", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello" }],
      targetColumns: [{ code: "fr", cells: [{ value: "" }] }],
    });

    const deeplFetch = makeDeeplFetch([{ status: 500, body: null }]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(translatePhraseFile(buf, deps)).rejects.toThrow(/500/);
  });

  test("DeepL 429 exhausts retries → throws", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello" }],
      targetColumns: [{ code: "fr", cells: [{ value: "" }] }],
    });

    // Always 429 → 3 attempts then throw
    const deeplFetch = makeDeeplFetch([
      { status: 429 },
      { status: 429 },
      { status: 429 },
    ]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(translatePhraseFile(buf, deps)).rejects.toThrow(
      /3 attempts|attempts/i
    );
    expect(deeplFetch).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// Behavior 6: kn column → Google Translate, not DeepL
// ---------------------------------------------------------------------------

describe("Kannada (kn) column → Google Translate", () => {
  test("kn white/no-color cell uses googleFetch, deeplFetch not called", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello" }],
      targetColumns: [{ code: "kn", cells: [{ value: "" }] }],
    });

    const deeplFetch = jest.fn();
    const googleFetch = makeGoogleFetch("ಹಲೋ");
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: googleFetch as unknown as Deps["googleFetch"],
      googleApiKey: "gkey",
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    expect(readCell(out, "C2")).toBe("ಹಲೋ");
    expect(deeplFetch).not.toHaveBeenCalled();
    expect(googleFetch).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Behavior 7a: colored cell fill is preserved (not corrupted) when other cells
//   in the same sheet ARE translated via zip patching (regression for SheetJS
//   write silently dropping all fill styles via hardcoded styles.xml)
// ---------------------------------------------------------------------------

describe("colored fill preserved after zip patching", () => {
  test("colored cell retains fill when other cells in same sheet are translated", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting", "~Farewell"],
      sourceCells: [{ value: "Hello" }, { value: "Goodbye" }],
      targetColumns: [
        {
          code: "fr",
          cells: [
            { value: "" },                         // white → translated
            { value: "Au revoir", colored: true }, // colored → not translated, fill preserved
          ],
        },
      ],
    });

    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    // C2: white cell → translated
    expect(readCell(out, "C2")).toBe("[Bonjour]");

    // C3: colored cell → not translated, value preserved
    expect(readCell(out, "C3")).toBe("Au revoir");

    // C3 fill must survive the round-trip (SheetJS write dropped it before the fix)
    const wb2 = XLSX.read(out, { type: "buffer", cellStyles: true });
    const ws2 = wb2.Sheets[wb2.SheetNames[0]];
    const cell = ws2["C3"];
    const rgb  = (cell?.s as { fgColor?: { rgb?: string } } | undefined)?.fgColor?.rgb ?? "";
    // Accept both 6-char "00FFFF" and 8-char "FF00FFFF" representations
    const hex = rgb.replace(/[^0-9A-Fa-f]/g, "");
    expect(hex.slice(-6).toUpperCase()).toBe("00FFFF");
  });
});

// ---------------------------------------------------------------------------
// Behavior 7: multiple target language columns → all translated independently
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Behavior 8: questionAndAnswer-style cells (SHORTCUT|correctAnswer|question|
//   answer1|answer2|...) must keep the shortcut and numeric answers untouched,
//   sending only the natural-language segments to DeepL, then reassembling
//   with the original pipes. Regression test for DeepL silently dropping the
//   shortcut prefix on some rows (e.g. "PRED||Is there anything...") while
//   preserving it on others in the same batch.
// ---------------------------------------------------------------------------

describe("questionAndAnswer cell → shortcut and numeric options preserved", () => {
  test("choice question: shortcut + numbers untouched, question translated", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Q"],
      sourceCells: [
        { value: "BTYSFL||Is beauty useful?|7|6|5|4|3|2|1" },
      ],
      targetColumns: [{ code: "fr", cells: [{ value: "" }] }],
    });

    const deeplFetch = makeDeeplFetch([deeplOk(["La beauté est-elle utile ?"])]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    // Only the question segment should have been sent to DeepL — not the
    // shortcut, not the numeric answer options.
    const body = JSON.parse(deeplFetch.mock.calls[0][1].body);
    expect(body.text).toEqual(["Is beauty useful?"]);

    // Reassembled cell keeps SHORTCUT and numbers verbatim, question translated.
    // (deeplOk() wraps the mocked translation in "[...]".)
    expect(readCell(out, "C2")).toBe(
      "BTYSFL||[La beauté est-elle utile ?]|7|6|5|4|3|2|1"
    );
  });

  test("freeform question with no pipes at all after shortcut||: shortcut preserved", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Q"],
      sourceCells: [{ value: "PRED||Is there anything about you?" }],
      targetColumns: [{ code: "fr", cells: [{ value: "" }] }],
    });

    const deeplFetch = makeDeeplFetch([deeplOk(["Y a-t-il quelque chose ?"])]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    const body = JSON.parse(deeplFetch.mock.calls[0][1].body);
    expect(body.text).toEqual(["Is there anything about you?"]);
    expect(readCell(out, "C2")).toBe("PRED||[Y a-t-il quelque chose ?]");
  });

  test("plain sentence with no pipes is translated as a whole, unaffected", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello" }],
      targetColumns: [{ code: "fr", cells: [{ value: "" }] }],
    });

    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    const body = JSON.parse(deeplFetch.mock.calls[0][1].body);
    expect(body.text).toEqual(["Hello"]);
    expect(readCell(out, "C2")).toBe("[Bonjour]");
  });
});

describe("multiple target columns → each translated", () => {
  test("fr and es columns both get their white/no-color cells translated", async () => {
    const buf = buildPhraseXlsx({
      sourceCode: "en",
      symbols: ["~Greeting"],
      sourceCells: [{ value: "Hello" }],
      targetColumns: [
        { code: "fr", cells: [{ value: "" }] },
        { code: "es", cells: [{ value: "" }] },
      ],
    });

    const deeplFetch = makeDeeplFetch([
      deeplOk(["Bonjour"]), // fr batch
      deeplOk(["Hola"]),    // es batch
    ]);
    const deps: Deps = {
      deeplFetch: deeplFetch as unknown as Deps["deeplFetch"],
      googleFetch: jest.fn() as unknown as Deps["googleFetch"],
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const out = await translatePhraseFile(buf, deps);

    // C2 = fr column, D2 = es column
    expect(readCell(out, "C2")).toBe("[Bonjour]");
    expect(readCell(out, "D2")).toBe("[Hola]");
    expect(deeplFetch).toHaveBeenCalledTimes(2);

    const langs = deeplFetch.mock.calls.map(
      ([, init]: [string, { body: string }]) =>
        JSON.parse(init.body).target_lang
    );
    expect(langs).toContain("FR");
    expect(langs).toContain("ES");
  });
});
