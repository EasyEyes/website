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
  test("omits the unused Edit sheet control from both audit windows", () => {
    const context = loadAppsScript();
    for (const html of [
      context.buildPhrasesAuditHistoryHtml(),
      context.buildPhraseAuditHtml({ differences: [] }),
    ]) {
      expect(html).not.toContain("audit-window-edit");
      expect(html).not.toContain(">Edit sheet<");
      expect(html).toContain("audit-window-toggle");
    }
  });
  test("opens audit history without blocking spreadsheet editing", () => {
    const output = { setWidth: jest.fn(), setHeight: jest.fn() };
    output.setWidth.mockReturnValue(output);
    output.setHeight.mockReturnValue(output);
    const showModelessDialog = jest.fn();
    const context = loadAppsScript({
      SpreadsheetApp: { getUi: () => ({ showModelessDialog }) },
      HtmlService: { createHtmlOutput: () => output },
    });
    context.showPhrasesAuditHistory();
    expect(showModelessDialog).toHaveBeenCalledWith(
      output,
      "International Phrases audit history",
    );
  });

  test.each(["running", "queued", "failed"])(
    "shows the saved report while the newest run is %s",
    (status) => {
      const html = loadAppsScript().buildPhrasesAuditHistoryHtml();
      const elements = {};
      const createElement = () => ({
        textContent: "",
        value: "",
        className: "",
        children: [],
        style: {},
        addEventListener: jest.fn(),
        appendChild(child) {
          this.children.push(child);
        },
      });
      const document = {
        getElementById: (id) =>
          elements[id] || (elements[id] = createElement()),
        createElement,
        createDocumentFragment: createElement,
      };
      const getRun = jest.fn();
      const runner = {
        withSuccessHandler(callback) {
          this.success = callback;
          return this;
        },
        withFailureHandler() {
          return this;
        },
        listPhrasesAuditRuns() {
          this.success({
            runs: [
              { id: "new", status },
              { id: "saved", status: "completed" },
            ],
          });
        },
        getPhrasesAuditRun(id) {
          getRun(id);
          this.success({
            run: { generatedAt: "2026-10-15" },
            findings: {
              missing: [],
              removed: [],
              unverified: [],
              usedCount: 3,
            },
          });
        },
      };
      vm.runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1], {
        document,
        google: { script: { run: runner } },
        window: { addEventListener: jest.fn() },
        setTimeout: jest.fn(),
        clearTimeout: jest.fn(),
      });
      expect(getRun).toHaveBeenCalledWith("saved");
      expect(elements.content.className).toBe("");
      expect(elements["used-summary"].textContent).toContain("3 keys");
      expect(elements["run-select"].children[0].textContent).toContain(status);
      expect(elements["run-select"].children[0].style.color).toBe(
        status === "failed" ? "#b3261e" : "#137333",
      );
    },
  );

  test.each(["completed", "failed"])(
    "polls a selectable active run until %s without replacing another report",
    (terminalStatus) => {
      const html = loadAppsScript().buildPhrasesAuditHistoryHtml();
      const elements = {};
      const createElement = () => ({
        textContent: "",
        value: "",
        className: "",
        children: [],
        listeners: {},
        style: {},
        setAttribute: jest.fn(),
        addEventListener(event, callback) {
          this.listeners[event] = callback;
        },
        appendChild(child) {
          this.children.push(child);
        },
      });
      const document = {
        getElementById: (id) =>
          elements[id] || (elements[id] = createElement()),
        createElement,
        createDocumentFragment: createElement,
      };
      const timers = [];
      const setTimeout = jest.fn((callback) => {
        timers.push(callback);
        return timers.length;
      });
      const clearTimeout = jest.fn();
      const host = {
        setWidth: jest.fn(),
        setHeight: jest.fn(),
        editor: { focus: jest.fn() },
      };
      const events = {};
      let status = "running";
      let statusSuccess;
      let statusFailure;
      const getRun = jest.fn();
      const runner = {
        withSuccessHandler(callback) {
          this.success = callback;
          return this;
        },
        withFailureHandler(callback) {
          this.failure = callback;
          return this;
        },
        listPhrasesAuditRuns(cursor) {
          if (cursor) {
            expect(cursor).toBe("saved");
            this.success({
              runs: [
                { id: "saved", status: "completed" },
                { id: "older", status: "completed" },
              ],
              nextCursor: null,
            });
            return;
          }
          this.success({
            runs: [
              { id: "new", status },
              { id: "saved", status: "completed" },
            ],
            nextCursor: "saved",
          });
        },
        getPhrasesAuditStatus() {
          statusSuccess = this.success;
          statusFailure = this.failure;
        },
        getPhrasesAuditRun(id) {
          getRun(id);
          const runStatus = id === "saved" ? "completed" : status;
          this.success({
            run: {
              status: runStatus,
              error: "Audit failed",
              generatedAt: "2026-10-15",
            },
            ...(runStatus === "completed"
              ? {
                  findings: {
                    missing: [],
                    removed: [],
                    unverified: [],
                    usedCount: 3,
                  },
                }
              : {}),
          });
        },
      };
      vm.runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1], {
        document,
        google: { script: { run: runner, host } },
        setTimeout,
        clearTimeout,
        window: {
          addEventListener: (event, callback) => {
            events[event] = callback;
          },
        },
      });
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10000);
      elements["load-older-audits"].listeners.click();
      expect(elements["run-select"].children).toHaveLength(3);
      expect(elements["run-select"].value).toBe("saved");
      expect(getRun).toHaveBeenCalledTimes(1);
      expect(elements["load-older-audits"].className).toBe("hidden");
      timers.shift()();
      expect(timers).toHaveLength(0);
      statusFailure(new Error("Offline"));
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 20000);
      timers.shift()();
      statusSuccess({ status: "running" });
      expect(getRun).toHaveBeenCalledTimes(1);
      expect(elements["run-select"].value).toBe("saved");
      elements["run-select"].value = "new";
      elements["run-select"].listeners.change();
      expect(elements.status.textContent).toBe("This audit is in progress.");
      expect(elements.content.className).toBe("hidden");
      expect(elements["run-select"].children[0].disabled).not.toBe(true);
      timers.shift()();
      status = terminalStatus;
      statusSuccess({ status });
      expect(elements["run-select"].children[0].textContent).toContain(
        terminalStatus,
      );
      expect(elements["run-select"].children[0].style.color).toBe(
        terminalStatus === "failed" ? "#b3261e" : "",
      );
      expect(getRun).toHaveBeenCalledTimes(3);
      expect(timers).toHaveLength(0);
      expect(elements.content.className).toBe(
        terminalStatus === "completed" ? "" : "hidden",
      );
      events.pagehide();
      expect(clearTimeout).toHaveBeenCalled();
    },
  );

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

  test("tells the Sheet user to wait when an audit is already running", () => {
    const fetch = jest.fn().mockReturnValue({
      getResponseCode: () => 409,
      getContentText: () =>
        JSON.stringify({ code: "audit_in_progress", id: "existing-run" }),
    });
    const context = loadAppsScript({
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: () => "secret" }),
      },
      UrlFetchApp: { fetch },
    });
    context.notify = jest.fn();

    context.requestPhrasesAudit();

    expect(context.notify).toHaveBeenCalledWith(
      expect.stringContaining("Please wait for it to finish"),
      "warning",
    );
    expect(context.notify).toHaveBeenCalledWith(
      expect.stringContaining("existing-run"),
      "warning",
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
      "audit-window-toggle",
      "audit-window-content",
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

    const host = {
      setWidth: jest.fn(),
      setHeight: jest.fn(),
      editor: { focus: jest.fn() },
    };
    vm.runInNewContext(inlineScript, {
      document,
      window: { innerWidth: 900, innerHeight: 600 },
      google: { script: { host } },
    });
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
