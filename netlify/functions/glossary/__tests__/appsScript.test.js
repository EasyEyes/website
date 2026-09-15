const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadAppsScript(globals = {}) {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../apps-script/update-glossary.gs"),
    "utf8",
  );
  const context = vm.createContext({ console, ...globals });
  vm.runInContext(source, context);
  return context;
}

function makeResponse(status, body) {
  return {
    getResponseCode: () => status,
    getContentText: () => JSON.stringify(body),
  };
}

describe("Glossary Apps Script client", () => {
  test("builds the raw-row payload expected by the glossary function", () => {
    const { buildPayload } = loadAppsScript();
    const rows = [
      ["name", "type"],
      ["_about", "text"],
    ];

    expect(JSON.stringify(buildPayload(rows))).toBe(JSON.stringify({ rows }));
  });

  test("builds an authenticated JSON POST request", () => {
    const { buildFetchOptions } = loadAppsScript();
    const payload = { rows: [["_about", "text"]] };
    const options = buildFetchOptions(
      "https://easyeyes.app/.netlify/functions/glossary",
      "test-secret",
      payload,
    );

    expect(options).toMatchObject({
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
    });
    expect(options.headers["x-glossary-secret"]).toBe("test-secret");
    expect(JSON.parse(options.payload)).toEqual(payload);
  });

  test("stops before reading the sheet when the secret is missing", () => {
    const alert = jest.fn();
    const getActiveSpreadsheet = jest.fn();
    const { pushGlossary } = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => null }),
      },
      SpreadsheetApp: {
        getUi: () => ({ alert }),
        getActiveSpreadsheet,
      },
      Logger: { log: jest.fn() },
    });

    pushGlossary();

    expect(alert).toHaveBeenCalledWith(
      expect.stringContaining("GLOSSARY_SECRET is not set"),
    );
    expect(getActiveSpreadsheet).not.toHaveBeenCalled();
  });

  test("stops before fetching when the InputParameters sheet is missing", () => {
    const alert = jest.fn();
    const fetch = jest.fn();
    const { pushGlossary } = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "test-secret" }),
      },
      SpreadsheetApp: {
        getUi: () => ({ alert }),
        getActiveSpreadsheet: () => ({ getSheetByName: () => null }),
      },
      UrlFetchApp: { fetch },
      Logger: { log: jest.fn() },
    });

    pushGlossary();

    expect(alert).toHaveBeenCalledWith('Sheet "InputParameters" not found.');
    expect(fetch).not.toHaveBeenCalled();
  });

  test("posts displayed rows and reports the published version", () => {
    const rows = [
      ["name", "type"],
      ["_about", "text"],
    ];
    const alert = jest.fn();
    const fetch = jest.fn(() => makeResponse(200, { version: "3.2" }));
    const { pushGlossary } = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "test-secret" }),
      },
      SpreadsheetApp: {
        getUi: () => ({ alert }),
        getActiveSpreadsheet: () => ({
          getSheetByName: () => ({
            getDataRange: () => ({ getDisplayValues: () => rows }),
          }),
        }),
      },
      UrlFetchApp: { fetch },
    });

    pushGlossary();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://easyeyes.app/.netlify/functions/glossary");
    expect(options.headers["x-glossary-secret"]).toBe("test-secret");
    expect(JSON.parse(options.payload)).toEqual({ rows });
    expect(alert).toHaveBeenCalledWith(
      "Glossary pushed successfully. Version: 3.2",
    );
  });

  test("reports a non-success response without claiming publication", () => {
    const alert = jest.fn();
    const fetch = jest.fn(() => ({
      getResponseCode: () => 401,
      getContentText: () => "Unauthorized",
    }));
    const { pushGlossary } = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "wrong-secret" }),
      },
      SpreadsheetApp: {
        getUi: () => ({ alert }),
        getActiveSpreadsheet: () => ({
          getSheetByName: () => ({
            getDataRange: () => ({ getDisplayValues: () => [["name"]] }),
          }),
        }),
      },
      UrlFetchApp: { fetch },
    });

    pushGlossary();

    expect(alert).toHaveBeenCalledWith(
      "Glossary push failed (401): Unauthorized",
    );
    expect(alert).not.toHaveBeenCalledWith(
      expect.stringContaining("pushed successfully"),
    );
  });
});
