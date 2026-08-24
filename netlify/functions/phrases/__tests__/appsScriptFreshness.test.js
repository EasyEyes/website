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

describe("International Phrases freshness workflows", () => {
  const rows = [
    ["EE_LanguageCode", "en", "fr", "ar"],
    ["second", "Second", "Deuxième", "ثانية"],
    ["first", "First", "Premier", "أول"],
  ];

  test("automatically updates phrases and then colors freshness after a translation edit", () => {
    const context = loadAppsScript();
    const calls = [];
    context.showSpinner = jest.fn((label, title) =>
      calls.push({ spinner: [label, title] }),
    );
    context.updatePhrases = jest.fn((options) =>
      calls.push({ update: options }),
    );
    context.fetchLatestPublishedPhrasesVersion = jest.fn(() => "7.4");
    context.colorStaleTranslationTextRed = jest.fn((message) =>
      calls.push({ color: message }),
    );

    context.handleInternationalPhrasesEdit({
      range: {
        getSheet: () => ({ getName: () => "Translations" }),
      },
    });

    expect(calls).toEqual([
      { spinner: ["Updating phrases…", "Updating phrases …"] },
      { update: { suppressSuccessNotification: true } },
      {
        color:
          "Translation freshness colors updated. Latest phrases version: 7.4.",
      },
    ]);
  });

  test("ignores edits outside the Translations sheet", () => {
    const context = loadAppsScript();
    context.updatePhrases = jest.fn();
    context.colorStaleTranslationTextRed = jest.fn();

    context.handleInternationalPhrasesEdit({
      range: {
        getSheet: () => ({ getName: () => "Metadata" }),
      },
    });

    expect(context.updatePhrases).not.toHaveBeenCalled();
    expect(context.colorStaleTranslationTextRed).not.toHaveBeenCalled();
  });

  test("suppresses only automatic update success notifications", () => {
    const { shouldShowPhrasesSuccess } = loadAppsScript();

    expect(shouldShowPhrasesSuccess()).toBe(true);
    expect(shouldShowPhrasesSuccess({})).toBe(true);
    expect(
      shouldShowPhrasesSuccess({ suppressSuccessNotification: true }),
    ).toBe(false);
  });

  test("keeps untrusted notification URLs as escaped plain text", () => {
    const { buildNotificationMessageHtml } = loadAppsScript();
    const message =
      'Failed at <script>alert("x")</script>: https://example.test/file';

    const html = buildNotificationMessageHtml(
      message,
      "https://example.test/file",
    );

    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  test("builds identifier-based batches independent of row order", () => {
    const { buildFreshnessBatches } = loadAppsScript();
    expect(buildFreshnessBatches(rows, 1)).toEqual([
      {
        action: "checkFreshness",
        phrases: [
          {
            phraseName: "second",
            englishText: "Second",
            languageCodes: ["fr", "ar"],
          },
        ],
      },
      {
        action: "checkFreshness",
        phrases: [
          {
            phraseName: "first",
            englishText: "First",
            languageCodes: ["fr", "ar"],
          },
        ],
      },
    ]);
  });

  test("fetches freshness batches in bounded parallel groups", () => {
    const fetchAll = jest.fn((requests) =>
      requests.map(() => ({
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ freshness: [] }),
      })),
    );
    const largeSheet = [
      ["EE_LanguageCode", "en", "fr"],
      ...Array.from({ length: 251 }, (_, index) => [
        "phrase" + index,
        "English " + index,
        "French " + index,
      ]),
    ];
    const { fetchFreshness } = loadAppsScript({
      UrlFetchApp: { fetchAll },
      Utilities: { getUuid: () => "request-id", sleep: jest.fn() },
    });

    expect(fetchFreshness(largeSheet, "secret")).toEqual([]);
    expect(fetchAll.mock.calls.map(([requests]) => requests.length)).toEqual([
      4, 2,
    ]);
  });

  test("retries only failed requests in a parallel freshness group", () => {
    const ok = {
      getResponseCode: () => 200,
      getContentText: () => "ok",
    };
    const failed = {
      getResponseCode: () => 500,
      getContentText: () => "failed",
    };
    const fetchAll = jest
      .fn()
      .mockReturnValueOnce([failed, ok])
      .mockReturnValueOnce([ok]);
    const sleep = jest.fn();
    const { fetchPhrasesBatchWithRetry } = loadAppsScript({
      UrlFetchApp: { fetchAll },
      Utilities: { sleep },
    });

    const responses = fetchPhrasesBatchWithRetry("https://example.test", [
      { method: "post", payload: "first" },
      { method: "post", payload: "second" },
    ]);

    expect(responses).toEqual([ok, ok]);
    expect(fetchAll.mock.calls[1][0]).toEqual([
      {
        url: "https://example.test",
        method: "post",
        payload: "first",
      },
    ]);
    expect(sleep).toHaveBeenCalledWith(250);
  });

  test("changes only target font colors and treats blanks as stale", () => {
    const { planFreshnessFontColors } = loadAppsScript();
    const values = rows.map((row) => row.slice());
    values[2][3] = "";
    const colors = values.map((row, rowIndex) =>
      row.map(() => (rowIndex === 0 ? "#123456" : "#654321")),
    );
    const planned = planFreshnessFontColors(values, colors, [
      { phraseName: "second", languageCode: "fr", fresh: true },
      { phraseName: "second", languageCode: "ar", fresh: false },
      { phraseName: "first", languageCode: "fr", fresh: true },
      { phraseName: "first", languageCode: "ar", fresh: true },
    ]);
    expect(planned[0]).toEqual(colors[0]);
    expect(planned[1]).toEqual(["#654321", "#654321", "#000000", "#ff0000"]);
    expect(planned[2]).toEqual(["#654321", "#654321", "#000000", "#ff0000"]);
  });

  test("shows a freshness loading dialog while colors are being checked", () => {
    const dialogTitles = [];
    const dialogHtml = [];
    const setFontColors = jest.fn();
    const response = {
      getResponseCode: () => 200,
      getContentText: () =>
        JSON.stringify({
          freshness: [
            { phraseName: "second", languageCode: "fr", fresh: true },
            { phraseName: "second", languageCode: "ar", fresh: true },
            { phraseName: "first", languageCode: "fr", fresh: true },
            { phraseName: "first", languageCode: "ar", fresh: true },
          ],
        }),
    };
    const htmlOutput = {
      setHeight: jest.fn().mockReturnThis(),
      setWidth: jest.fn().mockReturnThis(),
    };
    const { colorStaleTranslationTextRed } = loadAppsScript({
      CacheService: {
        getUserCache: () => ({ remove: jest.fn(), get: jest.fn() }),
      },
      HtmlService: {
        createHtmlOutput: jest.fn((html) => {
          dialogHtml.push(html);
          return htmlOutput;
        }),
      },
      Logger: { log: jest.fn() },
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "secret" }),
      },
      SpreadsheetApp: {
        getActiveSpreadsheet: () => ({
          getSheetByName: () => ({
            getDataRange: () => ({
              getDisplayValues: () => rows,
              getFontColors: () => rows.map((row) => row.map(() => "#000000")),
              setFontColors,
            }),
          }),
        }),
        getUi: () => ({
          showModelessDialog: (_html, title) => dialogTitles.push(title),
        }),
      },
      UrlFetchApp: { fetchAll: jest.fn(() => [response]) },
      Utilities: { getUuid: () => "request-id", sleep: jest.fn() },
    });

    colorStaleTranslationTextRed(
      "Translation freshness colors updated. Latest phrases version: 7.4.",
    );

    expect(dialogTitles[0]).toBe("Checking freshness …");
    expect(dialogTitles.at(-1)).toBe("Success");
    expect(dialogHtml.at(-1)).toContain(
      "Translation freshness colors updated. Latest phrases version: 7.4.",
    );
    expect(htmlOutput.setWidth).toHaveBeenCalledWith(280);
    expect(dialogHtml[0]).toContain(
      "html, body { width: 100%; height: 100%; }",
    );
    expect(setFontColors).toHaveBeenCalledTimes(1);
  });

  test("plans compact deletion bottom-up and right-to-left", () => {
    const { planCompactTranslationRequest } = loadAppsScript();
    const paddedRows = rows.concat(
      Array.from({ length: 7 }, (_, index) => ["meta" + index, "", "", ""]),
      [["onlyFresh", "Fresh", "Frais", "طازج"]],
    );
    const backgrounds = paddedRows.map((row) => row.map(() => "#ffffff"));
    backgrounds[2][2] = "#ffff00";
    backgrounds[10][3] = "#ffff00";
    const plan = planCompactTranslationRequest(paddedRows, backgrounds, [
      { phraseName: "first", languageCode: "fr", fresh: false },
      { phraseName: "onlyFresh", languageCode: "ar", fresh: true },
    ]);
    expect(plan.rowsToDelete).toEqual([10, 9]);
    expect(plan.columnsToDelete).toEqual([3]);
    expect(plan.clears).toContainEqual({ rowIndex: 1, colIndex: 2 });
    expect(plan.clears).not.toContainEqual({ rowIndex: 2, colIndex: 2 });
  });

  test("applies compact requests with batched sheet operations", () => {
    const { applyCompactTranslationPlan } = loadAppsScript();
    const clearContent = jest.fn().mockReturnThis();
    const setBackground = jest.fn().mockReturnThis();
    const getRangeList = jest.fn(() => ({ clearContent, setBackground }));
    const deleteRows = jest.fn();
    const deleteColumns = jest.fn();

    applyCompactTranslationPlan(
      { getRangeList, deleteRows, deleteColumns },
      {
        clears: [
          { rowIndex: 1, colIndex: 2 },
          { rowIndex: 1, colIndex: 3 },
          { rowIndex: 1, colIndex: 5 },
          { rowIndex: 2, colIndex: 2 },
          { rowIndex: 2, colIndex: 3 },
        ],
        rowsToDelete: [14, 13, 11, 10, 9],
        columnsToDelete: [8, 7, 5],
      },
    );

    expect(getRangeList).toHaveBeenCalledWith(["C2:D2", "F2", "C3:D3"]);
    expect(clearContent).toHaveBeenCalledTimes(1);
    expect(setBackground).toHaveBeenCalledWith("#ffffff");
    expect(deleteRows.mock.calls).toEqual([
      [14, 2],
      [10, 3],
    ]);
    expect(deleteColumns.mock.calls).toEqual([
      [8, 2],
      [6, 1],
    ]);
  });

  test("shows loading feedback while creating a translation request", () => {
    const dialogTitles = [];
    const dialogHtml = [];
    const htmlOutput = {
      setHeight: jest.fn().mockReturnThis(),
      setWidth: jest.fn().mockReturnThis(),
    };
    const rangeList = {
      clearContent: jest.fn().mockReturnThis(),
      setBackground: jest.fn().mockReturnThis(),
    };
    const copySheet = {
      setName: jest.fn().mockReturnThis(),
      getRangeList: jest.fn(() => rangeList),
      deleteRows: jest.fn(),
      deleteColumns: jest.fn(),
    };
    const copiedOtherSheet = {
      setName: jest.fn().mockReturnThis(),
    };
    const defaultSheet = { getName: () => "Sheet1" };
    const destination = {
      deleteSheet: jest.fn(),
      getSheets: () => [defaultSheet],
      getUrl: () =>
        "https://docs.google.com/spreadsheets/d/translation-request/edit",
    };
    const translationsSheet = {
      copyTo: jest.fn(() => copySheet),
      getName: () => "Translations",
      getDataRange: () => ({
        getDisplayValues: () => rows,
        getBackgrounds: () => rows.map((row) => row.map(() => "#ffffff")),
      }),
    };
    const metadataSheet = {
      copyTo: jest.fn(() => copiedOtherSheet),
      getName: () => "Metadata",
    };
    const createSpreadsheet = jest.fn(() => destination);
    const source = {
      getName: () => "International Phrases",
      getSheetByName: () => translationsSheet,
      getSheets: () => [translationsSheet, metadataSheet],
      copy: jest.fn(),
    };
    const response = {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ freshness: [] }),
    };
    const { tabulateNeededTranslations } = loadAppsScript({
      CacheService: {
        getUserCache: () => ({ remove: jest.fn(), get: jest.fn() }),
      },
      HtmlService: {
        createHtmlOutput: jest.fn((html) => {
          dialogHtml.push(html);
          return htmlOutput;
        }),
      },
      Logger: { log: jest.fn() },
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "secret" }),
      },
      SpreadsheetApp: {
        create: createSpreadsheet,
        getActiveSpreadsheet: () => source,
        getUi: () => ({
          showModelessDialog: (_html, title) => dialogTitles.push(title),
        }),
      },
      UrlFetchApp: { fetchAll: jest.fn(() => [response]) },
      Utilities: { getUuid: () => "request-id", sleep: jest.fn() },
    });

    tabulateNeededTranslations();

    expect(createSpreadsheet).toHaveBeenCalledWith(
      "International Phrases - needed translations",
    );
    expect(source.copy).not.toHaveBeenCalled();
    expect(translationsSheet.copyTo).toHaveBeenCalledWith(destination);
    expect(metadataSheet.copyTo).toHaveBeenCalledWith(destination);
    expect(copySheet.setName).toHaveBeenCalledWith("Translations");
    expect(copiedOtherSheet.setName).toHaveBeenCalledWith("Metadata");
    expect(destination.deleteSheet).toHaveBeenCalledWith(defaultSheet);
    expect(dialogTitles[0]).toBe("Creating translation request …");
    expect(dialogTitles.at(-1)).toBe("Success");
    expect(dialogHtml.at(-1)).toContain(
      '<a href="https://docs.google.com/spreadsheets/d/translation-request/edit" target="_blank" rel="noopener noreferrer">https://docs.google.com/spreadsheets/d/translation-request/edit</a>',
    );
  });
});
