const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadScript(name, globals) {
  const file = path.join(
    __dirname,
    "../functions",
    name,
    "apps-script",
    `update-${name}.gs`,
  );
  return vm.runInNewContext(fs.readFileSync(file, "utf8") + "\nthis;", globals);
}

function openUpdateDialog(name, menuIndex = 0) {
  const menuItems = [];
  const menu = {
    addItem(label, action) {
      menuItems.push(action);
      return this;
    },
    addToUi() {},
  };
  let html;
  const server = loadScript(name, {
    SpreadsheetApp: {
      getUi: () => ({
        createMenu: () => menu,
        showModalDialog: (content) => (html = content.html),
        showModelessDialog: (content) => (html = content.html),
      }),
    },
    HtmlService: {
      createHtmlOutput: (html) => ({
        html,
        setWidth() {
          return this;
        },
        setHeight() {
          return this;
        },
      }),
    },
    Utilities: { getUuid: () => "dialog-id" },
  });
  server.onOpen();
  server[menuItems[menuIndex]]();
  const clientScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const elements = Object.fromEntries(
    Array.from(html.matchAll(/id="([^"]+)"/g), ([, id]) => [
      id,
      {
        textContent: "",
        hidden: false,
        addEventListener(event, callback) {
          this[event] = callback;
        },
      },
    ]),
  );
  const timers = new Map();
  const calls = [];
  const progressCalls = [];
  let nextTimer = 0;
  const client = {
    document: { getElementById: (id) => elements[id] },
    setTimeout(callback, delay) {
      const id = ++nextTimer;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    google: {
      script: {
        get run() {
          return {
            withSuccessHandler(callback) {
              this.success = callback;
              return this;
            },
            withFailureHandler(callback) {
              this.failure = callback;
              return this;
            },
            runGlossaryMenuAction(name) {
              calls.push({
                name,
                success: this.success,
                failure: this.failure,
              });
            },
            showGlossaryTimeoutDialog() {
              server.showGlossaryTimeoutDialog();
              calls.push({ name: "timeout", html });
            },
            showPhrasesTimeoutDialog(modeless) {
              server.showPhrasesTimeoutDialog(modeless);
              calls.push({ name: "timeout", html, modeless });
            },
            listGlossaryAuditRuns() {
              calls.push({
                success: this.success,
                failure: this.failure,
              });
            },
            runPhrasesMenuAction(action, progressId, url) {
              calls.push({
                name: action,
                url,
                success: this.success,
                failure: this.failure,
              });
            },
            getPhrasesUpdateProgress(progressId) {
              progressCalls.push({ progressId, success: this.success });
            },
          };
        },
      },
    },
  };
  vm.runInNewContext(clientScript, client);
  return { ...calls[0], calls, elements, timers, progressCalls };
}

for (const [script, menuIndex, action, result] of [
  ["glossary", 0, "update", "Glossary pushed successfully. Version: 3.2"],
  ["glossary", 1, "audit", "Glossary audit requested."],
  ["phrases", 0, "update", { message: "Phrases updated.", type: "success" }],
  [
    "phrases",
    1,
    "retranslate",
    { message: "Translated 2 cells.", type: "success" },
  ],
  [
    "phrases",
    2,
    "check",
    { message: "No potential problems found.", type: "success" },
  ],
  ["phrases", 3, "freshness", { message: "Colors updated.", type: "success" }],
  [
    "phrases",
    4,
    "tabulate",
    { message: "Translation request created.", type: "success" },
  ],
  ["phrases", 6, "compare", { message: "Compared.", type: "success" }],
  [
    "phrases",
    7,
    "audit",
    { message: "Phrases audit requested.", type: "success" },
  ],
]) {
  test(`${script} ${action} explains a reported Apps Script limit`, () => {
    const dialog = openUpdateDialog(script, menuIndex);
    assert.equal(dialog.name, action);
    dialog.failure({ message: "Error: Exceeded maximum execution time" });
    assert.equal(dialog.calls[1].name, "timeout");
    if (script === "phrases") {
      assert.equal(dialog.calls[1].modeless, action === "compare");
    }
    assert.match(dialog.calls[1].html, /Google Sheets.*limits/i);
    assert.equal(dialog.elements.message.textContent, "");
    assert.ok(
      ![...dialog.timers.values()].some(({ delay }) => delay === 360000),
    );
  });

  test(`${script} ${action} waits for the result without a browser deadline`, () => {
    const dialog = openUpdateDialog(script, menuIndex);
    assert.ok(
      ![...dialog.timers.values()].some(({ delay }) => delay === 360000),
    );
    dialog.success(result);
    assert.equal(dialog.elements.message.textContent, result.message || result);
  });

  test(`${script} ${action} keeps non-timeout failures distinct`, () => {
    const dialog = openUpdateDialog(script, menuIndex);
    dialog.failure({ message: "Service unavailable" });
    assert.equal(dialog.elements.message.textContent, "Service unavailable");
    assert.equal(dialog.elements.close.hidden, false);
  });
}

test("reading translations starts one request after URL submission", () => {
  const dialog = openUpdateDialog("phrases", 5);
  assert.equal(dialog.calls.length, 0);
  assert.equal(dialog.timers.size, 0);
  const url = "https://docs.google.com/spreadsheets/d/returned";
  dialog.elements["import-url"].value = url;
  dialog.elements["import-form"].submit({ preventDefault() {} });
  dialog.elements["import-form"].submit({ preventDefault() {} });
  assert.equal(dialog.calls.length, 1);
  assert.equal(dialog.calls[0].name, "import");
  assert.equal(dialog.calls[0].url, url);
  assert.ok(![...dialog.timers.values()].some(({ delay }) => delay === 360000));
  dialog.calls[0].failure({ message: "Exceeded maximum execution time" });
  assert.equal(dialog.calls[1].name, "timeout");
  assert.match(dialog.calls[1].html, /Google Sheets.*limits/i);
});

test("the Glossary audit viewer explains a timeout while loading saved reports", () => {
  const dialog = openUpdateDialog("glossary", 2);
  dialog.failure({ message: "Exceeded maximum execution time" });
  assert.equal(dialog.calls[1].name, "timeout");
  assert.match(dialog.calls[1].html, /Google Sheets.*limits/i);
  assert.equal(dialog.elements.status.textContent, "");
});

test("a late progress response cannot overwrite a Phrases timeout", () => {
  const dialog = openUpdateDialog("phrases");
  const poll = [...dialog.timers].find(([, { delay }]) => delay === 2000);
  assert.ok(poll);
  dialog.timers.delete(poll[0]);
  poll[1].callback();
  assert.equal(dialog.progressCalls[0].progressId, "dialog-id");
  dialog.failure({ message: "Exceeded maximum execution time" });
  dialog.progressCalls[0].success("50 of 100 phrases done");
  assert.equal(dialog.elements.progress.textContent, "");
  assert.equal(dialog.timers.size, 0);
});

test("the Phrases update worker returns validation and billing guidance to the dialog", () => {
  const phrases = loadScript("phrases", {
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => null }),
    },
  });
  const validation = phrases.runPhrasesMenuAction("retranslate", "dialog-id");
  assert.match(validation.message, /PHRASES_SECRET is not set/);
  phrases.pushPhrases = (isFullResync, options) => {
    assert.equal(isFullResync, false);
    options.report("DeepL rejected the API key.", "error", {
      showDeepLBillingAction: true,
    });
  };
  const error = phrases.runPhrasesMenuAction("update", "dialog-id");
  assert.equal(error.type, "error");
  assert.equal(error.showDeepLBillingAction, true);
});

test("the import worker reads the submitted Sheet and reports the import result", () => {
  const url = "https://docs.google.com/spreadsheets/d/returned";
  const range = { getDisplayValues: () => [], getBackgrounds: () => [] };
  const destination = { getDataRange: () => range };
  const phrases = loadScript("phrases", {
    SpreadsheetApp: {
      openByUrl(receivedUrl) {
        assert.equal(receivedUrl, url);
        return { getId: () => "returned", getSheetByName: () => destination };
      },
      getActiveSpreadsheet: () => ({ getSheetByName: () => destination }),
    },
  });
  const incoming = [{ phraseName: "EE_hello" }];
  phrases.validateTranslationImport = () => ({ conflicts: [], incoming });
  phrases.importValidatedTranslations = (id, sheet, cells, report) => {
    assert.equal(id, "returned");
    assert.equal(sheet, destination);
    assert.equal(cells, incoming);
    report("Imported one cell.", "success");
  };
  const result = phrases.runPhrasesMenuAction("import", "", url);
  assert.equal(result.message, "Imported one cell.");
  assert.equal(result.type, "success");
});

test("the comparison worker opens the existing modeless report on success", () => {
  const sheet = {
    getDataRange: () => ({
      getDisplayValues: () => [
        ["EE_LanguageCode", "en"],
        ["EE_hello", "Hello"],
      ],
    }),
    getSheetId: () => 1,
  };
  const opened = [];
  const phrases = loadScript("phrases", {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: () => sheet,
        getId: () => "current",
        getUrl: () => "https://docs.google.com/spreadsheets/d/current",
      }),
      getUi: () => ({
        showModelessDialog: (html, title) => opened.push(title),
      }),
    },
    HtmlService: {
      createHtmlOutput: () => ({
        setWidth() {
          return this;
        },
        setHeight() {
          return this;
        },
      }),
    },
    DriveApp: {
      getFileById: () => ({ getLastUpdated: () => new Date("2026-11-26") }),
    },
  });
  phrases.fetchPhraseAuditJson = (url) =>
    url.includes("versionOnly")
      ? { version: "3.2" }
      : { phrases: { EE_hello: { en: "Hello" } } };
  const result = phrases.runPhrasesMenuAction("compare", "", null);
  assert.equal(result.reportOpened, true);
  assert.deepEqual(opened, ["International Phrases audit"]);
});
