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
    expect(menu.addToUi).toHaveBeenCalledTimes(1);
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

    expect(html).toContain("Firebase copy");
    expect(html).toContain("International Phrases spreadsheet");
    expect(html).toContain("Differing cells: 1");
    expect(html).toContain("AA123");
    expect(html).toContain('target="_blank"');
    expect(html).toContain("overflow: auto");
    expect(html).not.toContain("contenteditable");
    expect(html).not.toContain("</script><script>alert(1)</script>");

    const inlineScript = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
    expect(inlineScript).toBeDefined();
    expect(() => new vm.Script(inlineScript)).not.toThrow();
  });
});
