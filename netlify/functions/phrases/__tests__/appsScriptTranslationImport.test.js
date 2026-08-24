const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadAppsScript(overrides = {}) {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../apps-script/update-phrases.gs"),
    "utf8",
  );
  const context = vm.createContext({ console, ...overrides });
  vm.runInContext(source, context);
  return context;
}

function makeResponse(status, body) {
  return {
    getResponseCode: () => status,
    getContentText: () => JSON.stringify(body),
  };
}

function placeDataAtTranslationRows(rows) {
  return [
    rows[0],
    ...Array.from({ length: 8 }, () => rows[0].map(() => "")),
    ...rows.slice(1),
  ];
}

function makeImportHarness({
  failBackgroundReadback = false,
  phraseCount = 1,
  changeEnglishAfterFirstBatch = false,
} = {}) {
  const failureState = { failBackgroundReadback };
  const phrases = Array.from({ length: phraseCount }, (_, index) => ({
    phraseName:
      phraseCount === 1 ? "first" : `phrase-${String(index).padStart(3, "0")}`,
    englishText: phraseCount === 1 ? "First" : `English ${index}`,
    value: phraseCount === 1 ? "Premier" : `French ${index}`,
  }));
  const rows = [
    ["EE_LanguageCode", "en", "fr"],
    ...phrases.map((phrase) => [phrase.phraseName, phrase.englishText, "Old"]),
  ];
  const backgrounds = rows.map((row) => row.map(() => "#ffffff"));
  const userProperties = new Map();
  const requests = [];
  const sheet = {
    getParent: () => ({ getId: () => "international-phrases" }),
    getSheetId: () => 123,
    getDataRange: () => ({
      getDisplayValues: () => rows.map((row) => [...row]),
    }),
    getRange: (row, column) => ({
      setValue: (value) => {
        rows[row - 1][column - 1] = value;
      },
      setBackground: (value) => {
        if (!failureState.failBackgroundReadback)
          backgrounds[row - 1][column - 1] = value;
      },
      getDisplayValue: () => rows[row - 1][column - 1],
      getBackground: () => backgrounds[row - 1][column - 1],
    }),
  };
  const context = loadAppsScript({
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => "secret" }),
      getUserProperties: () => ({
        getProperty: (key) => userProperties.get(key) || null,
        setProperty: (key, value) => userProperties.set(key, value),
        deleteProperty: (key) => userProperties.delete(key),
      }),
    },
    UrlFetchApp: {
      fetch: (url, options) => {
        if (!options || options.method === "get") {
          return makeResponse(200, { version: "1.0" });
        }
        const payload = JSON.parse(options.payload);
        requests.push(payload);
        const translatedRows = Object.fromEntries(
          Object.keys(payload.changedPhrases).map((phraseName) => [
            phraseName,
            {
              fr: phrases.find((phrase) => phrase.phraseName === phraseName)
                .value,
            },
          ]),
        );
        if (changeEnglishAfterFirstBatch && payload.batchNumber === 1) {
          rows[51][1] = "Changed while importing";
        }
        return makeResponse(200, {
          verified: true,
          newVersion: `1.${payload.batchNumber}`,
          translatedRows,
        });
      },
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: "SHA_256" },
      computeDigest: (_algorithm, value) => value,
      base64EncodeWebSafe: (value) => value,
      getUuid: () => "operation-id",
      sleep: jest.fn(),
    },
  });
  context.notify = jest.fn();
  return {
    context,
    failureState,
    incoming: phrases.map((phrase) => ({
      ...phrase,
      languageCode: "fr",
      background: "#ffff00",
    })),
    requests,
    rows,
    sheet,
    userProperties,
  };
}

describe("returned translation validation", () => {
  test("counts only non-white translation cells from spreadsheet row 10 onward", () => {
    const { validateTranslationImport } = loadAppsScript();
    const current = [
      ["EE_LanguageCode", "en", "pcm", "fr"],
      ["metadata", "English metadata", "Metadata", "Métadonnées"],
      ...Array.from({ length: 7 }, () => ["", "", "", ""]),
      ["first", "First", "Old Pcm", "Ancien"],
    ];
    const compact = current.map((row) => row.slice());
    compact[9][2] = "New Pcm";
    const backgrounds = compact.map((row) => row.map(() => "#ffffff"));
    backgrounds[1][2] = "#ffff00";
    backgrounds[1][3] = "#ffff00";
    backgrounds[9][1] = "#ffff00";
    backgrounds[9][2] = "#ffff00";

    expect(validateTranslationImport(compact, backgrounds, current)).toEqual({
      conflicts: [],
      incoming: [
        {
          phraseName: "first",
          languageCode: "pcm",
          englishText: "First",
          value: "New Pcm",
          background: "#ffff00",
        },
      ],
    });
  });

  test("fingerprints checkpoints by returned and destination spreadsheet identities", () => {
    const { buildTranslationImportCheckpointFingerprint } = loadAppsScript({
      Utilities: {
        DigestAlgorithm: { SHA_256: "SHA_256" },
        computeDigest: (_algorithm, value) => value,
        base64EncodeWebSafe: (value) => value,
      },
    });
    const base = {
      returnedSpreadsheetId: "returned-sheet-a",
      destinationSpreadsheetId: "international-phrases-a",
      destinationSheetId: 123,
      incoming: [
        {
          phraseName: "first",
          languageCode: "fr",
          englishText: "First",
          value: "Premier",
          background: "#ffff00",
        },
      ],
    };

    expect(buildTranslationImportCheckpointFingerprint(base)).not.toBe(
      buildTranslationImportCheckpointFingerprint({
        ...base,
        returnedSpreadsheetId: "returned-sheet-b",
      }),
    );
    expect(buildTranslationImportCheckpointFingerprint(base)).not.toBe(
      buildTranslationImportCheckpointFingerprint({
        ...base,
        destinationSpreadsheetId: "international-phrases-b",
      }),
    );
    expect(buildTranslationImportCheckpointFingerprint(base)).not.toBe(
      buildTranslationImportCheckpointFingerprint({
        ...base,
        destinationSheetId: 456,
      }),
    );
  });

  test("canonicalizes validated cells in import checkpoint fingerprints", () => {
    const { buildTranslationImportCheckpointFingerprint } = loadAppsScript({
      Utilities: {
        DigestAlgorithm: { SHA_256: "SHA_256" },
        computeDigest: (_algorithm, value) => value,
        base64EncodeWebSafe: (value) => value,
      },
    });
    const first = {
      phraseName: "first",
      languageCode: "fr",
      englishText: "First",
      value: "Premier",
      background: "#ffff00",
    };
    const second = {
      phraseName: "second",
      languageCode: "ar",
      englishText: "Second",
      value: "ثانية",
      background: "#00ffff",
    };
    const base = {
      returnedSpreadsheetId: "returned-sheet",
      destinationSpreadsheetId: "international-phrases",
      destinationSheetId: 123,
    };

    expect(
      buildTranslationImportCheckpointFingerprint({
        ...base,
        incoming: [first, second],
      }),
    ).toBe(
      buildTranslationImportCheckpointFingerprint({
        ...base,
        incoming: [second, first],
      }),
    );
    expect(
      buildTranslationImportCheckpointFingerprint({
        ...base,
        incoming: [first],
      }),
    ).not.toBe(
      buildTranslationImportCheckpointFingerprint({
        ...base,
        incoming: [{ ...first, value: "Première" }],
      }),
    );
  });

  test("does not advance the checkpoint when destination read-back fails", () => {
    const { context, failureState, requests, sheet, userProperties } =
      makeImportHarness({ failBackgroundReadback: true });
    const incoming = [
      {
        phraseName: "first",
        languageCode: "fr",
        englishText: "First",
        value: "Premier",
        background: "#ffff00",
      },
    ];

    expect(() =>
      context.importValidatedTranslations("returned-sheet", sheet, incoming),
    ).toThrow("did not read back correctly");

    expect(requests).toHaveLength(1);
    const checkpoint = JSON.parse(
      userProperties.get("phrasesTranslationImportCheckpoint"),
    );
    expect(checkpoint).toMatchObject({
      operationId: "operation-id",
      nextBatchIndex: 0,
      currentVersion: "1.0",
    });

    failureState.failBackgroundReadback = false;
    context.importValidatedTranslations("returned-sheet", sheet, incoming);

    expect(requests).toHaveLength(2);
    expect(requests[1]).toMatchObject({
      operationId: "operation-id",
      batchNumber: 1,
      currentVersion: "1.0",
    });
    expect(userProperties.has("phrasesTranslationImportCheckpoint")).toBe(
      false,
    );
  });

  test("stops before a later batch when current English changes", () => {
    const { context, incoming, requests, rows, sheet, userProperties } =
      makeImportHarness({
        phraseCount: 51,
        changeEnglishAfterFirstBatch: true,
      });

    expect(() =>
      context.importValidatedTranslations("returned-sheet", sheet, incoming),
    ).toThrow("English changed during import for phrase-050");

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      batchNumber: 1,
      totalBatches: 2,
      cellCount: 51,
    });
    expect(Object.keys(requests[0].changedPhrases)).toHaveLength(50);
    const checkpoint = JSON.parse(
      userProperties.get("phrasesTranslationImportCheckpoint"),
    );
    expect(checkpoint).toMatchObject({
      operationId: "operation-id",
      nextBatchIndex: 1,
      currentVersion: "1.1",
    });

    rows[51][1] = "English 50";
    context.importValidatedTranslations("returned-sheet", sheet, incoming);

    expect(requests).toHaveLength(2);
    expect(requests[1]).toMatchObject({
      operationId: "operation-id",
      batchNumber: 2,
      totalBatches: 2,
      currentVersion: "1.1",
    });
    expect(Object.keys(requests[1].changedPhrases)).toEqual(["phrase-050"]);
    expect(userProperties.has("phrasesTranslationImportCheckpoint")).toBe(
      false,
    );
  });

  test("marks returned-sheet translation payloads as validated imports", () => {
    const { buildTranslationImportPayload } = loadAppsScript();
    const payload = buildTranslationImportPayload(
      { first: "First" },
      { first: { fr: "#ffff00" } },
      { first: { fr: "Premier" } },
      ["en", "fr"],
      "1.0",
      "operation-id",
      1,
      1,
      1,
    );

    expect(payload.translationImport).toBe(true);
    expect(payload.changedPhrases).toEqual({ first: "First" });
  });

  test("matches moved rows and columns using stable identifiers", () => {
    const { validateTranslationImport } = loadAppsScript();
    const current = placeDataAtTranslationRows([
      ["EE_LanguageCode", "en", "fr", "ar"],
      ["first", "First", "Premier", "أول"],
      ["second", "Second", "Deuxième", "ثانية"],
    ]);
    const compact = placeDataAtTranslationRows([
      ["EE_LanguageCode", "en", "ar", "fr"],
      ["second", "Second", "ثانية جديدة", "Deuxième"],
      ["first", "First", "أول", "Nouveau"],
    ]);
    const backgrounds = compact.map((row) => row.map(() => "#ffffff"));
    backgrounds[9][2] = "#ffff00";
    backgrounds[10][3] = "#00ffff";
    expect(validateTranslationImport(compact, backgrounds, current)).toEqual({
      conflicts: [],
      incoming: [
        {
          phraseName: "second",
          languageCode: "ar",
          englishText: "Second",
          value: "ثانية جديدة",
          background: "#ffff00",
        },
        {
          phraseName: "first",
          languageCode: "fr",
          englishText: "First",
          value: "Nouveau",
          background: "#00ffff",
        },
      ],
    });
  });

  test("collects every English conflict before any caller mutation", () => {
    const { validateTranslationImport, formatEnglishConflicts } =
      loadAppsScript();
    const current = placeDataAtTranslationRows([
      ["EE_LanguageCode", "en", "fr"],
      ["first", "Current first", "Premier"],
      ["second", "Current second", "Deuxième"],
    ]);
    const compact = placeDataAtTranslationRows([
      ["EE_LanguageCode", "en", "fr"],
      ["first", "Old first", "Nouveau"],
      ["second", "Old second", "Nouvelle"],
    ]);
    const backgrounds = compact.map((row) => row.map(() => "#ffffff"));
    backgrounds[9][2] = "#ffff00";
    backgrounds[10][2] = "#ffff00";
    const result = validateTranslationImport(compact, backgrounds, current);
    expect(result.conflicts).toHaveLength(2);
    const report = formatEnglishConflicts(result.conflicts);
    expect(report).toContain(
      "first\nReturned: Old first\nInternational: Current first",
    );
    expect(report).toContain(
      "second\nReturned: Old second\nInternational: Current second",
    );
  });

  test.each([
    [
      "duplicate phrase",
      [
        ["EE_LanguageCode", "en", "fr"],
        ["same", "One", ""],
        ["same", "Two", ""],
      ],
    ],
    [
      "duplicate language",
      [
        ["EE_LanguageCode", "en", "fr", "fr"],
        ["same", "One", "", ""],
      ],
    ],
  ])("rejects %s identifiers", (_label, compact) => {
    const { validateTranslationImport } = loadAppsScript();
    const backgrounds = compact.map((row) => row.map(() => "#ffffff"));
    expect(() =>
      validateTranslationImport(compact, backgrounds, [
        ["EE_LanguageCode", "en", "fr"],
        ["same", "One", ""],
      ]),
    ).toThrow("Duplicate");
  });
});
