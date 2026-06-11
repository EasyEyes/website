import { buildNewVersion } from "../buildNewVersion";
import type { PhraseMap, VersionedPhrases } from "../types";

describe("buildNewVersion — no-op", () => {
  test("empty translatedCells and empty removed → null", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: { k1: { en: "Hello", fr: "Bonjour" } },
    };
    expect(buildNewVersion(prev, {}, [])).toBeNull();
  });
});

describe("buildNewVersion — first push", () => {
  test("null previousVersionData + translatedCells → version 1.0", () => {
    const cells: PhraseMap = { k1: { en: "Hello", fr: "Bonjour" } };
    const result = buildNewVersion(null, cells, []);
    expect(result).not.toBeNull();
    expect(result!.version).toBe("1.0");
    expect(result!.phrases).toEqual(cells);
  });
});

describe("buildNewVersion — minor bump", () => {
  test("translatedCells with existing keys → minor bump", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: {
        k1: { en: "Hello", fr: "Bonjour" },
        k2: { en: "World", fr: "Monde" },
      },
    };
    const result = buildNewVersion(prev, { k1: { en: "Hello", fr: "Salut" } }, []);
    expect(result!.version).toBe("1.1");
    expect(result!.phrases.k1.fr).toBe("Salut");
  });
});

describe("buildNewVersion — carry-forward", () => {
  test("keys not in translatedCells are preserved unchanged", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: {
        k1: { en: "A", de: "X" },
        k2: { en: "B", de: "Y" },
        k3: { en: "C", de: "Z" },
      },
    };
    const result = buildNewVersion(prev, { k1: { en: "A", de: "X2" } }, []);
    expect(result!.phrases.k2).toEqual({ en: "B", de: "Y" });
    expect(result!.phrases.k3).toEqual({ en: "C", de: "Z" });
  });
});

describe("buildNewVersion — major bump on key add", () => {
  test("new key in translatedCells → major bump", () => {
    const prev: VersionedPhrases = {
      version: "1.3",
      phrases: { k1: { en: "Hello", fr: "Bonjour" } },
    };
    const result = buildNewVersion(prev, { newKey: { en: "New", fr: "Nouveau" } }, []);
    expect(result!.version).toBe("2.0");
    expect(result!.phrases).toHaveProperty("k1");
    expect(result!.phrases).toHaveProperty("newKey");
  });
});

describe("buildNewVersion — major bump on key remove", () => {
  test("removed key → major bump, key absent from result", () => {
    const prev: VersionedPhrases = {
      version: "2.1",
      phrases: { k1: { en: "Hello" }, k2: { en: "Bye" } },
    };
    const result = buildNewVersion(prev, {}, ["k2"]);
    expect(result!.version).toBe("3.0");
    expect(result!.phrases).toHaveProperty("k1");
    expect(result!.phrases).not.toHaveProperty("k2");
  });
});

describe("buildNewVersion — major bump with both removed and translated", () => {
  test("removed key + new translated key → major bump", () => {
    const prev: VersionedPhrases = {
      version: "1.5",
      phrases: { old: { en: "Old" }, keep: { en: "Keep" } },
    };
    const result = buildNewVersion(prev, { fresh: { en: "Fresh" } }, ["old"]);
    expect(result!.version).toBe("2.0");
    expect(result!.phrases).not.toHaveProperty("old");
    expect(result!.phrases).toHaveProperty("fresh");
    expect(result!.phrases).toHaveProperty("keep");
  });
});
