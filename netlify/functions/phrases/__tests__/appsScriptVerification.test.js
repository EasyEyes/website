const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadAppsScript() {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../apps-script/update-phrases.gs"),
    "utf8",
  );
  const context = vm.createContext({ console });
  vm.runInContext(source, context);
  return context;
}

describe("International Phrases completion verification", () => {
  test("does not automatically translate Nigerian Pidgin cells", () => {
    const { isAutomaticallyTranslatedLanguage } = loadAppsScript();

    expect(isAutomaticallyTranslatedLanguage("pcm")).toBe(false);
    expect(isAutomaticallyTranslatedLanguage("tl")).toBe(true);
  });

  test("omits Nigerian Pidgin from phrase translation payloads", () => {
    const { buildTranslatePayload } = loadAppsScript();
    const rows = [
      ["EE_LanguageCode", "en", "pcm", "tl"],
      ["example", "Hello", "", "Kumusta"],
    ];
    const backgrounds = [
      ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
      ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
    ];

    const payload = buildTranslatePayload(
      rows,
      backgrounds,
      ["example"],
      "1.0",
      false,
    );

    expect(payload.colorMask.example).toEqual({ tl: "#ffffff" });
    expect(payload.sentValues.example).toEqual({ tl: "Kumusta" });
    expect(payload.activeLanguages).toEqual(["en", "pcm", "tl"]);
  });

  test("retries a transient phrases API failure before returning", () => {
    const transient = {
      getResponseCode: () => 503,
      getContentText: () => "temporarily unavailable",
    };
    const success = {
      getResponseCode: () => 200,
      getContentText: () => "{}",
    };
    const fetch = jest
      .fn()
      .mockReturnValueOnce(transient)
      .mockReturnValueOnce(success);
    const source = fs.readFileSync(
      path.resolve(__dirname, "../apps-script/update-phrases.gs"),
      "utf8",
    );
    const context = vm.createContext({
      console,
      UrlFetchApp: { fetch },
      Utilities: { sleep: jest.fn() },
    });
    vm.runInContext(source, context);

    expect(context.fetchPhrasesWithRetry("https://example.test", {})).toBe(
      success,
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test("rejects an API success response that lacks persistence verification", () => {
    const { parseVerifiedPhrasesResult } = loadAppsScript();

    expect(() =>
      parseVerifiedPhrasesResult(
        JSON.stringify({ newVersion: "1.1", translatedRows: {} }),
      ),
    ).toThrow("did not confirm persisted data");
  });

  test("reports exact sheet cells whose written values do not read back", () => {
    const { findUnverifiedSheetWrites } = loadAppsScript();
    const writes = [
      { rowIndex: 1, colIndex: 2, value: "Bonjour" },
      { rowIndex: 2, colIndex: 2, value: "Au revoir" },
    ];
    const sheet = {
      getRange: (row, column) => ({
        getDisplayValue: () =>
          row === 2 && column === 3 ? "Wrong value" : "Au revoir",
      }),
    };

    expect(findUnverifiedSheetWrites(sheet, writes)).toEqual([
      {
        coordinate: "C2",
        expected: "Bonjour",
        actual: "Wrong value",
      },
    ]);
  });

  test("reports partial publication truthfully when batch 8 fails", () => {
    const { formatPhrasesBatchFailure } = loadAppsScript();

    const message = formatPhrasesBatchFailure({
      batchNumber: 8,
      totalBatches: 18,
      statusCode: 503,
      failureMessage: "Phrases backend temporarily unavailable",
      completedCells: 13992,
      totalCells: 34399,
      latestVersion: "40.31",
    });

    expect(message).toContain("Batches 1–7 were published successfully");
    expect(message).toContain("Latest published version: 40.31");
    expect(message).toContain("Completed 13992 of 34399 cells");
    expect(message).toContain("20407 cells remain");
    expect(message).not.toContain("EasyEyes was NOT updated");
    expect(message).not.toContain("No new phrases version was created");
  });

  test("loads a matching retranslation checkpoint at the failed batch", () => {
    const properties = new Map();
    const context = vm.createContext({
      console,
      PropertiesService: {
        getUserProperties: () => ({
          getProperty: (key) => properties.get(key) ?? null,
          setProperty: (key, value) => properties.set(key, value),
          deleteProperty: (key) => properties.delete(key),
        }),
      },
    });
    const source = fs.readFileSync(
      path.resolve(__dirname, "../apps-script/update-phrases.gs"),
      "utf8",
    );
    vm.runInContext(source, context);

    context.savePhrasesCheckpoint({
      fingerprint: "selection-a",
      operationId: "operation-a",
      nextBatchIndex: 7,
      completedCells: 13992,
      currentVersion: "40.31",
    });

    expect(context.loadPhrasesCheckpoint("selection-a")).toEqual({
      fingerprint: "selection-a",
      operationId: "operation-a",
      nextBatchIndex: 7,
      completedCells: 13992,
      currentVersion: "40.31",
    });
    expect(context.loadPhrasesCheckpoint("different-selection")).toBeNull();
  });

  test("checkpoint fingerprint is unchanged by successful translation writes", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../apps-script/update-phrases.gs"),
      "utf8",
    );
    const context = vm.createContext({
      console,
      Utilities: {
        DigestAlgorithm: { SHA_256: "SHA_256" },
        computeDigest: (_algorithm, value) => value,
        base64EncodeWebSafe: (value) => value,
      },
    });
    vm.runInContext(source, context);
    const stableSelection = {
      operation: "retranslate",
      keys: ["hello"],
      changedPhrases: { hello: "Hello" },
      colorMask: { hello: { fr: "#ffffff" } },
    };

    const beforeWrite = context.buildPhrasesCheckpointFingerprint({
      ...stableSelection,
      sentValues: { hello: { fr: "" } },
    });
    const afterWrite = context.buildPhrasesCheckpointFingerprint({
      ...stableSelection,
      sentValues: { hello: { fr: "Bonjour" } },
    });

    expect(afterWrite).toBe(beforeWrite);
  });
});
