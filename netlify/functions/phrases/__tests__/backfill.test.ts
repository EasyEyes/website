import { buildBackfillPayload } from "../backfill";

describe("buildBackfillPayload — plain key", () => {
  test("key with no special chars passes through unchanged", () => {
    const result = buildBackfillPayload({ EE_hello: { en: "Hello" } });
    expect(result).toHaveProperty("EE_hello");
    expect(result["EE_hello"]).toEqual({ en: "Hello" });
  });
});

describe("buildBackfillPayload — encoded key", () => {
  test("dot in key is encoded to _dot_", () => {
    const result = buildBackfillPayload({ "key.sub": { en: "Hello" } });
    expect(result).not.toHaveProperty("key.sub");
    expect(result).toHaveProperty("key_dot_sub");
    expect(result["key_dot_sub"]).toEqual({ en: "Hello" });
  });

  test("slash in key is encoded to _slash_", () => {
    const result = buildBackfillPayload({ "key/sub": { en: "Hello" } });
    expect(result).toHaveProperty("key_slash_sub");
  });
});

describe("buildBackfillPayload — multi-language values", () => {
  test("all language values are preserved exactly", () => {
    const row = { en: "Hello", fr: "Bonjour", de: "Hallo", ar: "مرحبا" };
    const result = buildBackfillPayload({ EE_greeting: row });
    expect(result["EE_greeting"]).toEqual(row);
  });

  test("multiple phrase keys are all present in output", () => {
    const phrases = {
      EE_alpha: { en: "Alpha" },
      EE_beta: { en: "Beta" },
      EE_gamma: { en: "Gamma" },
    };
    const result = buildBackfillPayload(phrases);
    expect(Object.keys(result)).toHaveLength(3);
    expect(result).toHaveProperty("EE_alpha");
    expect(result).toHaveProperty("EE_beta");
    expect(result).toHaveProperty("EE_gamma");
  });
});
