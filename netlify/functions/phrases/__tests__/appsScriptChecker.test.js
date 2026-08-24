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

describe("International Phrases Apps Script checker", () => {
  test("reports empty translatable target cells", () => {
    const { checkEmptyTranslationCells } = loadAppsScript();
    const rows = [
      ["EE_LanguageCode", "en", "fr", "de"],
      ["EE_save", "Save", "", "Speichern"],
      ["EE_cancel", "Cancel", "Annuler", "   "],
      ["EE_manual", "Manual", "", "Manuell"],
      ["", "Orphan", "", ""],
    ];
    const backgrounds = [
      ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
      ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
      ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
      ["#ffffff", "#ffffff", "#ffff00", "#ffffff"],
      ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
    ];

    expect(checkEmptyTranslationCells(rows, backgrounds)).toBe(
      "Empty translatable cells (possible failed translations):\n" +
        "EE_cancel — de\n" +
        "EE_save — fr",
    );
  });

  test("returns an empty report when every translatable target is populated", () => {
    const { checkEmptyTranslationCells } = loadAppsScript();
    const rows = [
      ["EE_LanguageCode", "en", "fr"],
      ["EE_save", "Save", "Enregistrer"],
    ];
    const backgrounds = [
      ["#ffffff", "#ffffff", "#ffffff"],
      ["#ffffff", "#ffffff", "#ffffff"],
    ];

    expect(checkEmptyTranslationCells(rows, backgrounds)).toBe("");
  });
});
