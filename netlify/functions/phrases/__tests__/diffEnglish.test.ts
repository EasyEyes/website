import { diffEnglish } from "../diffEnglish";
import type { VersionedPhrases } from "../types";

describe("diffEnglish — null previousVersion", () => {
  test("all incoming keys in changed, removed empty, currentVersion null", () => {
    const result = diffEnglish({ hello: "Hello", world: "World" }, null);
    expect(result.changed).toEqual(expect.arrayContaining(["hello", "world"]));
    expect(result.changed).toHaveLength(2);
    expect(result.removed).toEqual([]);
    expect(result.currentVersion).toBeNull();
  });
});

describe("diffEnglish — no-op", () => {
  test("identical English → empty changed, empty removed, currentVersion passed through", () => {
    const prev: VersionedPhrases = {
      version: "1.2",
      phrases: { hello: { en: "Hello", fr: "Bonjour" } },
    };
    const result = diffEnglish({ hello: "Hello" }, prev);
    expect(result.changed).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.currentVersion).toBe("1.2");
  });
});

describe("diffEnglish — changed English", () => {
  test("key with different English text appears in changed", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: { hello: { en: "Hello" } },
    };
    const result = diffEnglish({ hello: "Hi" }, prev);
    expect(result.changed).toContain("hello");
    expect(result.removed).toEqual([]);
  });
});

describe("diffEnglish — removed key", () => {
  test("key absent from incoming appears in removed", () => {
    const prev: VersionedPhrases = {
      version: "2.0",
      phrases: {
        hello: { en: "Hello" },
        goodbye: { en: "Goodbye" },
      },
    };
    const result = diffEnglish({ hello: "Hello" }, prev);
    expect(result.removed).toContain("goodbye");
    expect(result.changed).toEqual([]);
  });
});

describe("diffEnglish — new key", () => {
  test("key not in previousVersion appears in changed", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: { hello: { en: "Hello" } },
    };
    const result = diffEnglish({ hello: "Hello", newKey: "New text" }, prev);
    expect(result.changed).toContain("newKey");
    expect(result.changed).not.toContain("hello");
    expect(result.removed).toEqual([]);
  });
});

describe("diffEnglish — nonCyanValues: unchanged non-cyan cells", () => {
  test("identical non-cyan values → key not in changed", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: { hello: { en: "Hello", fr: "Bonjour" } },
    };
    const result = diffEnglish(
      { hello: "Hello" },
      prev,
      { hello: { fr: "Bonjour" } }
    );
    expect(result.changed).toEqual([]);
  });
});

describe("diffEnglish — nonCyanValues: changed non-cyan cell", () => {
  test("non-cyan value differs from Firebase → key in changed", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: { hello: { en: "Hello", fr: "Bonjour" } },
    };
    const result = diffEnglish(
      { hello: "Hello" },
      prev,
      { hello: { fr: "Au revoir" } }
    );
    expect(result.changed).toContain("hello");
  });

  test("non-cyan value absent from Firebase → key in changed", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: { hello: { en: "Hello" } },
    };
    const result = diffEnglish(
      { hello: "Hello" },
      prev,
      { hello: { fr: "Bonjour" } }
    );
    expect(result.changed).toContain("hello");
  });

  test("nonCyanValues omitted → no change detected when English matches", () => {
    const prev: VersionedPhrases = {
      version: "1.0",
      phrases: { hello: { en: "Hello", fr: "Bonjour" } },
    };
    const result = diffEnglish({ hello: "Hello" }, prev);
    expect(result.changed).toEqual([]);
  });
});

describe("diffEnglish — mixed scenario", () => {
  test("changed + removed + new key all detected in one call", () => {
    const prev: VersionedPhrases = {
      version: "3.1",
      phrases: {
        unchanged: { en: "Same" },
        modified: { en: "Old text" },
        gone: { en: "Will be removed" },
      },
    };
    const result = diffEnglish(
      { unchanged: "Same", modified: "New text", brandNew: "New key" },
      prev
    );
    expect(result.changed).toContain("modified");
    expect(result.changed).toContain("brandNew");
    expect(result.changed).not.toContain("unchanged");
    expect(result.removed).toContain("gone");
    expect(result.currentVersion).toBe("3.1");
  });
});
