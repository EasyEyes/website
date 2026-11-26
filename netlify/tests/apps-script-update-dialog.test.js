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
      { textContent: "", hidden: false },
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
            runGlossaryUpdate() {
              calls.push({
                name: "glossary",
                success: this.success,
                failure: this.failure,
              });
            },
            runPhrasesUpdate(action) {
              calls.push({
                name: action,
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
  assert.equal(calls.length, 1);
  return { ...calls[0], elements, timers, progressCalls };
}

for (const [script, menuIndex, action, result] of [
  ["glossary", 0, "glossary", "Glossary pushed successfully. Version: 3.2"],
  ["phrases", 0, "update", { message: "Phrases updated.", type: "success" }],
  [
    "phrases",
    1,
    "retranslate",
    { message: "Translated 2 cells.", type: "success" },
  ],
]) {
  test(`${action} explains a reported Apps Script limit`, () => {
    const dialog = openUpdateDialog(script, menuIndex);
    assert.equal(dialog.name, action);
    dialog.failure({ message: "Error: Exceeded maximum execution time" });
    assert.match(dialog.elements.message.textContent, /Google Sheets.*limits/i);
    assert.match(
      dialog.elements.message.textContent,
      /action reached the execution time limit/i,
    );
    assert.equal(dialog.elements.close.hidden, false);
    assert.ok(
      ![...dialog.timers.values()].some(({ delay }) => delay === 360000),
    );
  });

  test(`${action} can still report a result after the dialog stops waiting`, () => {
    const dialog = openUpdateDialog(script, menuIndex);
    const deadline = [...dialog.timers.values()].find(
      ({ delay }) => delay === 360000,
    );
    assert.ok(deadline);
    deadline.callback();
    assert.match(
      dialog.elements.message.textContent,
      /may have reached that limit/i,
    );
    assert.equal(dialog.elements.heading.textContent, "Update status unknown");
    dialog.success(result);
    assert.equal(dialog.elements.message.textContent, result.message || result);
  });

  test(`${action} keeps non-timeout failures distinct`, () => {
    const dialog = openUpdateDialog(script, menuIndex);
    dialog.failure({ message: "Service unavailable" });
    assert.equal(dialog.elements.message.textContent, "Service unavailable");
    assert.equal(dialog.elements.close.hidden, false);
  });
}

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
  const validation = phrases.runPhrasesUpdate("retranslate", "dialog-id");
  assert.match(validation.message, /PHRASES_SECRET is not set/);
  phrases.pushPhrases = (isFullResync, options) => {
    assert.equal(isFullResync, false);
    options.report("DeepL rejected the API key.", "error", {
      showDeepLBillingAction: true,
    });
  };
  const error = phrases.runPhrasesUpdate("update", "dialog-id");
  assert.equal(error.type, "error");
  assert.equal(error.showDeepLBillingAction, true);
});
