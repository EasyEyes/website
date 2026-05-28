import { encodeFirebaseSegment } from "../encodeFirebaseSegment";

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
});
