const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadAppsScript(globals = {}) {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../apps-script/update-phrases.gs"),
    "utf8",
  );
  const context = vm.createContext({ console, ...globals });
  vm.runInContext(source, context);
  return context;
}

describe("International Phrases Firebase audit", () => {
  test("adds the audit command to the EasyEyes menu", () => {
    const menu = {
      addItem: jest.fn(),
      addToUi: jest.fn(),
    };
    menu.addItem.mockReturnValue(menu);
    const createMenu = jest.fn().mockReturnValue(menu);
    const { onOpen } = loadAppsScript({
      SpreadsheetApp: { getUi: () => ({ createMenu }) },
    });

    onOpen();

    expect(createMenu).toHaveBeenCalledWith("EasyEyes");
    expect(menu.addItem).toHaveBeenCalledWith(
      "Compare latest EasyEyes copy with this spreadsheet",
      "compareLatestEasyEyesCopy",
    );
    expect(menu.addItem).toHaveBeenCalledWith(
      "Run International Phrases audit",
      "requestPhrasesAudit",
    );
    expect(menu.addItem).toHaveBeenCalledWith(
      "View International Phrases audit history",
      "showPhrasesAuditHistory",
    );
    expect(menu.addToUi).toHaveBeenCalledTimes(1);
  });

  test("reads audit history through Apps Script without exposing the secret to HTML", () => {
    const fetch = jest.fn().mockReturnValue({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ runs: [] }),
    });
    const context = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "sheet-secret" }),
      },
      UrlFetchApp: { fetch },
    });

    expect(context.listPhrasesAuditRuns()).toEqual({ runs: [] });
    expect(fetch).toHaveBeenCalledWith(
      "https://easyeyes.app/.netlify/functions/phrases-audit?action=review",
      expect.objectContaining({
        method: "post",
        headers: { "x-phrases-secret": "sheet-secret" },
        payload: JSON.stringify({ operation: "list", id: null }),
      }),
    );
    const html = context.buildPhrasesAuditHistoryHtml();
    expect(html).not.toContain("sheet-secret");
    expect(html.indexOf("Referenced in code, missing from sheet")).toBeLessThan(
      html.indexOf("Unused with verified removal"),
    );
    expect(html.indexOf("Unused with verified removal")).toBeLessThan(
      html.indexOf("Unused without verified removal"),
    );
    const inlineScript = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
    expect(() => new vm.Script(inlineScript)).not.toThrow();
  });

  test("links audit keys to their current Sheet cells", () => {
    const report = {
      findings: {
        missing: [{ key: "EE_absent" }, { key: "EE_addedLater" }],
        removed: [{ key: "EE_removed" }],
        unverified: [{ key: "EE_other" }],
      },
    };
    const sheet = {
      getLastColumn: () => 3,
      getLastRow: () => 11,
      getSheetId: () => 42,
      getRange: jest.fn((row, column) => {
        if (row === 1 && column === 1)
          return {
            getDisplayValues: () => [["note", "EE_LanguageCode", "en"]],
          };
        if (row === 1 && column === 2) return { getA1Notation: () => "B1" };
        if (row === 2 && column === 2)
          return {
            getDisplayValues: () => [
              ...Array.from({ length: 8 }, () => [""]),
              ["EE_addedLater"],
              ["EE_removed"],
            ],
          };
        throw new Error("Unexpected range");
      }),
    };
    const context = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "sheet-secret" }),
      },
      UrlFetchApp: {
        fetch: () => ({
          getResponseCode: () => 200,
          getContentText: () => JSON.stringify(report),
        }),
      },
      SpreadsheetApp: {
        getActiveSpreadsheet: () => ({
          getSheetByName: () => sheet,
          getUrl: () => "https://docs.google.com/spreadsheets/d/sheet123/edit",
        }),
      },
    });

    const result = context.getPhrasesAuditRun("run-1");
    expect(result.findings.missing[0].sheetUrl).toBeUndefined();
    expect(result.findings.missing[1].sheetUrl).toBe(
      "https://docs.google.com/spreadsheets/d/sheet123/edit#gid=42&range=B10",
    );
    expect(result.findings.removed[0].sheetUrl).toBe(
      "https://docs.google.com/spreadsheets/d/sheet123/edit#gid=42&range=B11",
    );
    expect(result.findings.unverified[0].sheetUrl).toBeUndefined();
  });

  test("requests a background audit without updating the spreadsheet", () => {
    const fetch = jest.fn().mockReturnValue({
      getResponseCode: () => 202,
      getContentText: () => JSON.stringify({ id: "run-1", status: "queued" }),
    });
    const context = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "secret" }),
      },
      UrlFetchApp: { fetch },
    });
    context.notify = jest.fn();

    context.requestPhrasesAudit();

    expect(fetch).toHaveBeenCalledWith(
      "https://easyeyes.app/.netlify/functions/phrases-audit?action=start",
      expect.objectContaining({
        method: "post",
        headers: { "x-phrases-secret": "secret" },
      }),
    );
    expect(context.notify).toHaveBeenCalledWith(
      "International Phrases audit requested. Run ID: run-1",
      "success",
    );
  });

  test("returns coordinates and both exact values for differing cells", () => {
    const { comparePhraseCells } = loadAppsScript();
    const rows = [
      ["EE_LanguageCode", "en", "fr"],
      ["EE_save", "Save ", "Enregistrer"],
      ["EE_cancel", "Cancel", "Annuler"],
    ];
    const firebasePhrases = {
      EE_save: { en: "Save", fr: "Sauvegarder" },
      EE_cancel: { en: "Cancel", fr: "Annuler" },
    };

    expect(comparePhraseCells(rows, firebasePhrases)).toEqual([
      {
        coordinate: "B2",
        firebaseValue: "Save",
        sheetValue: "Save ",
      },
      {
        coordinate: "C2",
        firebaseValue: "Sauvegarder",
        sheetValue: "Enregistrer",
      },
    ]);
  });

  test("treats missing and empty cells as equal, but flags missing phrases", () => {
    const { comparePhraseCells } = loadAppsScript();
    const rows = [
      ["EE_LanguageCode", "en", "fr"],
      ["EE_save", "Save", ""],
      ["EE_new", "New", "Nouveau"],
    ];
    const firebasePhrases = {
      EE_save: { en: "Save" },
    };

    expect(comparePhraseCells(rows, firebasePhrases)).toEqual([
      {
        coordinate: "A3",
        firebaseValue: "",
        sheetValue: "EE_new",
      },
      {
        coordinate: "B3",
        firebaseValue: "",
        sheetValue: "New",
      },
      {
        coordinate: "C3",
        firebaseValue: "",
        sheetValue: "Nouveau",
      },
    ]);
  });

  test("flags exact phrase-key whitespace without losing row matching", () => {
    const { comparePhraseCells } = loadAppsScript();
    const rows = [
      ["EE_LanguageCode", "en"],
      [" EE_save ", "Save"],
    ];
    const firebasePhrases = { EE_save: { en: "Save" } };

    expect(comparePhraseCells(rows, firebasePhrases)).toEqual([
      {
        coordinate: "A2",
        firebaseValue: "EE_save",
        sheetValue: " EE_save ",
      },
    ]);
  });

  test("converts column numbers beyond Z to A1 notation", () => {
    const { toA1Coordinate } = loadAppsScript();

    expect(toA1Coordinate(1, 1)).toBe("A1");
    expect(toA1Coordinate(27, 123)).toBe("AA123");
    expect(toA1Coordinate(52, 4)).toBe("AZ4");
  });

  test("builds a scalable, read-only audit dialog with source dates", () => {
    const { buildPhraseAuditHtml } = loadAppsScript();
    const html = buildPhraseAuditHtml({
      firebasePublishedAt: "2026-08-12T09:00:00.000Z",
      sheetModifiedAt: "2026-08-12T09:30:00.000Z",
      sheetUrl: "https://docs.google.com/spreadsheets/d/id/edit#gid=7",
      sheetId: 7,
      differences: [
        {
          coordinate: "AA123",
          firebaseValue: "Firebase phrase",
          sheetValue: "International phrase </script><script>alert(1)</script>",
        },
      ],
    });

    expect(html.indexOf("International Phrases spreadsheet")).toBeLessThan(
      html.indexOf("Firebase copy"),
    );
    expect(html).toContain("Differing cells: 1");
    expect(html).toContain("AA123");
    expect(html).toContain(
      '<a class="sheet-cell-link" id="sheet-cell-link" target="_blank" rel="noopener noreferrer"></a> International Phrases spreadsheet',
    );
    expect(html).toContain(
      '<span id="firebase-coordinate"></span> in Firebase copy',
    );
    expect(html).toContain('<pre class="value" id="sheet-value"></pre>');
    expect(html.indexOf('id="sheet-cell-link"')).toBeLessThan(
      html.indexOf('id="firebase-coordinate"'),
    );
    expect(html).not.toContain('id="detail-title"');
    expect(html).toContain("overflow: auto");
    expect(html).not.toContain("contenteditable");
    expect(html).not.toContain("</script><script>alert(1)</script>");

    const inlineScript = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
    expect(inlineScript).toBeDefined();
    expect(() => new vm.Script(inlineScript)).not.toThrow();

    function createElement() {
      return {
        children: [],
        listeners: {},
        style: {},
        textContent: "",
        addEventListener(eventName, listener) {
          this.listeners[eventName] = listener;
        },
        appendChild(child) {
          this.children.push(child);
        },
        focus: jest.fn(),
        setAttribute: jest.fn(),
      };
    }

    const elements = {};
    [
      "firebase-date",
      "sheet-date",
      "cell-list",
      "summary",
      "detail",
      "back",
      "sheet-cell-link",
      "sheet-value",
      "firebase-coordinate",
      "firebase-value",
    ].forEach((id) => {
      elements[id] = createElement();
    });
    const document = {
      createDocumentFragment: createElement,
      createElement,
      getElementById: (id) => elements[id],
    };

    vm.runInNewContext(inlineScript, { document });
    const firstCellButton = elements["cell-list"].children[0].children[0];
    firstCellButton.listeners.click();

    expect(elements["sheet-cell-link"].textContent).toBe("AA123");
    expect(elements["sheet-cell-link"].href).toBe(
      "https://docs.google.com/spreadsheets/d/id/edit#gid=7&range=AA123",
    );
    expect(elements["sheet-value"].textContent).toBe(
      "International phrase </script><script>alert(1)</script>",
    );
    expect(elements["firebase-coordinate"].textContent).toBe("AA123");
    expect(elements["firebase-value"].textContent).toBe("Firebase phrase");
  });
});
