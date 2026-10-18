const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

function harness(kind) {
  let current;
  let failReopen = false;
  let status = "running";
  const opened = [];
  const reportReads = [];
  const selections = [];
  const focus = jest.fn();
  let deferReports = false;
  const context = vm.createContext({ console });
  vm.runInContext(
    fs.readFileSync(
      path.resolve(__dirname, "../apps-script/update-phrases.gs"),
      "utf8",
    ),
    context,
  );
  const report = () => ({
    run: { status, generatedAt: "2026-10-17" },
    ...(status === "completed"
      ? { findings: { missing: [], removed: [], unverified: [], usedCount: 7 } }
      : {}),
  });
  function mount(html) {
    const timers = [];
    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      beforeParse(window) {
        window.setTimeout = (f) => {
          timers.push(f);
          return timers.length;
        };
        window.clearTimeout = () => {};
        const runner = {
          withSuccessHandler(f) {
            this.success = f;
            return this;
          },
          withFailureHandler(f) {
            this.failure = f;
            return this;
          },
          listPhrasesAuditRuns() {
            this.success({
              runs: [
                { id: "active", status },
                { id: "saved", status: "completed" },
              ],
            });
          },
          getPhrasesAuditRun(id) {
            reportReads.push(id);
            if (deferReports) return;
            this.success(
              id === "active"
                ? report()
                : {
                    run: { status: "completed" },
                    findings: {
                      missing: [
                        {
                          key: "EE_target",
                          references: [],
                          sheetUrl:
                            "https://docs.google.com/spreadsheets/d/example#gid=1&range=B2",
                        },
                      ],
                      removed: [],
                      unverified: [],
                      usedCount: 3,
                    },
                  },
            );
          },
          focusPhraseInSheet(key) {
            selections.push(key);
            this.success();
          },
          getPhrasesAuditStatus() {
            this.success({ status });
          },
          reopenPhraseAuditWindow(state) {
            if (failReopen) {
              this.failure(new Error("Offline"));
              return;
            }
            context.reopenPhraseAuditWindow(JSON.parse(JSON.stringify(state)));
          },
        };
        window.google = {
          script: { run: runner, host: { editor: { focus } } },
        };
      },
    });
    current = { dom, timers, document: dom.window.document };
  }
  context.HtmlService = {
    createHtmlOutput(html) {
      return {
        html,
        setWidth(w) {
          this.width = w;
          return this;
        },
        setHeight(h) {
          this.height = h;
          return this;
        },
      };
    },
  };
  context.SpreadsheetApp = {
    getUi: () => ({
      showModelessDialog(output) {
        const previous = current;
        opened.push({ width: output.width, height: output.height });
        mount(output.html);
        if (previous) previous.dom.window.close();
      },
    }),
  };
  const audit = {
    differences: [
      {
        coordinate: "C5",
        sheetValue: "Sheet </script> $& text",
        firebaseValue: "Saved",
      },
    ],
    sheetUrl: "https://example.com",
    sheetId: 1,
  };
  mount(
    kind === "history"
      ? context.buildPhrasesAuditHistoryHtml()
      : context.buildPhraseAuditHtml(audit),
  );
  return {
    get current() {
      return current;
    },
    opened,
    reportReads,
    selections,
    focus,
    deferReports(value) {
      deferReports = value;
    },
    setStatus(v) {
      status = v;
    },
    fail(v) {
      failReopen = v;
    },
    toggle() {
      current.document.getElementById("audit-window-toggle").click();
    },
  };
}

test.each(["completed", "failed"])(
  "recreates history, preserves selection/search, and observes %s while minimized",
  (terminal) => {
    const h = harness("history");
    try {
      const select = h.current.document.getElementById("run-select");
      select.value = "active";
      select.dispatchEvent(new h.current.dom.window.Event("change"));
      h.current.document.getElementById("key-search").value = "EE_example";
      h.toggle();
      expect(h.opened[0]).toEqual({ width: 340, height: 100 });
      expect(
        h.current.document.getElementById("audit-window-content").hidden,
      ).toBe(true);
      h.setStatus(terminal);
      h.current.timers.shift()();
      h.toggle();
      expect(h.opened[1].width).toBeGreaterThan(340);
      expect(h.current.document.getElementById("run-select").value).toBe(
        "active",
      );
      expect(h.current.document.getElementById("key-search").value).toBe(
        "EE_example",
      );
      expect(
        h.current.document.getElementById("audit-window-content").hidden,
      ).toBe(false);
      expect(h.current.document.getElementById("status").textContent).toContain(
        terminal === "completed" ? "Report generated" : "failed",
      );
    } finally {
      h.current.dom.window.close();
    }
  },
);

test("recreates comparison with the same selected cell and snapshot; failure leaves the original usable", () => {
  const h = harness("comparison");
  try {
    h.current.document.querySelector(".cell-button").click();
    h.fail(true);
    h.toggle();
    expect(h.opened).toHaveLength(0);
    expect(
      h.current.document.getElementById("audit-window-toggle").disabled,
    ).toBe(false);
    expect(
      h.current.document.getElementById("audit-window-error").textContent,
    ).toContain("Offline");
    h.fail(false);
    h.toggle();
    expect(h.opened[0]).toEqual({ width: 340, height: 100 });
    h.toggle();
    expect(h.current.document.getElementById("detail").style.display).toBe(
      "grid",
    );
    expect(h.current.document.getElementById("sheet-value").textContent).toBe(
      "Sheet </script> $& text",
    );
    expect(
      h.current.document.getElementById("firebase-value").textContent,
    ).toBe("Saved");
  } finally {
    h.current.dom.window.close();
  }
});

test("restores the loaded completed report without another report read", () => {
  const h = harness("history");
  try {
    expect(h.reportReads).toEqual(["saved"]);
    h.toggle();
    h.setStatus("completed");
    h.current.timers.shift()();
    h.toggle();
    expect(h.reportReads).toEqual(["saved"]);
    expect(h.current.document.getElementById("run-select").value).toBe("saved");
    expect(
      h.current.document.getElementById("used-summary").textContent,
    ).toContain("3 keys");
    h.toggle();
    h.toggle();
    expect(h.reportReads).toEqual(["saved"]);
  } finally {
    h.current.dom.window.close();
  }
});

test("does not restore the previous report under a newly selected run that is still loading", () => {
  const h = harness("history");
  try {
    h.deferReports(true);
    const select = h.current.document.getElementById("run-select");
    select.value = "active";
    select.dispatchEvent(new h.current.dom.window.Event("change"));
    h.toggle();
    h.deferReports(false);
    h.toggle();
    expect(h.current.document.getElementById("run-select").value).toBe(
      "active",
    );
    expect(h.current.document.getElementById("content").className).toBe(
      "hidden",
    );
    expect(h.current.document.getElementById("status").textContent).toContain(
      "in progress",
    );
    h.setStatus("completed");
    h.current.timers.shift()();
    const readsAfterCompletion = h.reportReads.length;
    h.toggle();
    h.toggle();
    expect(h.reportReads).toHaveLength(readsAfterCompletion);
    expect(
      h.current.document.getElementById("used-summary").textContent,
    ).toContain("7 keys");
  } finally {
    h.current.dom.window.close();
  }
});

test("phrase clicks select the live sheet cell after cached restore without navigating", () => {
  const h = harness("history");
  try {
    h.toggle();
    h.toggle();
    const link = h.current.document.querySelector(".finding summary a");
    const click = new h.current.dom.window.MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    expect(link.dispatchEvent(click)).toBe(false);
    expect(h.selections).toEqual(["EE_target"]);
    expect(h.focus).toHaveBeenCalledTimes(1);
    expect(link.closest("details").open).toBe(false);
    expect(h.reportReads.filter((id) => id === "saved")).toHaveLength(1);
  } finally {
    h.current.dom.window.close();
  }
});
