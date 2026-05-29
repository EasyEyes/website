import { encodeFirebaseSegment, decodeFirebaseSegment } from "../encodeFirebaseSegment";

describe("encodeFirebaseSegment", () => {
  test.each([
    [".", "_dot_"],
    ["#", "_hash_"],
    ["$", "_dollar_"],
    ["[", "_lbracket_"],
    ["]", "_rbracket_"],
    ["/", "_slash_"],
  ])("encodes '%s' as '%s'", (char, encoded) => {
    expect(encodeFirebaseSegment(char)).toBe(encoded);
  });

  test("encodes version string '1.2' as '1_dot_2'", () => {
    expect(encodeFirebaseSegment("1.2")).toBe("1_dot_2");
  });

  test("leaves plain alphanumeric strings unchanged", () => {
    expect(encodeFirebaseSegment("hello123")).toBe("hello123");
  });

  test("encodes dotted param name", () => {
    expect(encodeFirebaseSegment("omitPsychoJS.window.monitorFramePeriodBool")).toBe(
      "omitPsychoJS_dot_window_dot_monitorFramePeriodBool"
    );
  });
});

describe("decodeFirebaseSegment", () => {
  test("round-trips through encode then decode", () => {
    const original = "omitPsychoJS.window.monitorFramePeriodBool";
    expect(decodeFirebaseSegment(encodeFirebaseSegment(original))).toBe(original);
  });

  test("decodes all special placeholders", () => {
    expect(decodeFirebaseSegment("a_dot_b_hash_c_dollar_d_lbracket_e_rbracket_f_slash_g")).toBe(
      "a.b#c$d[e]f/g"
    );
  });

  test("leaves plain strings unchanged", () => {
    expect(decodeFirebaseSegment("hello123")).toBe("hello123");
  });
});
