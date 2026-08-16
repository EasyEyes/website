import {
  protectEmojiForDeepL,
  restoreEmojiFromDeepL,
} from "../../shared/emojiProtection";

describe("DeepL emoji protection", () => {
  test("wraps complete emoji sequences without wrapping ordinary notation", () => {
    const protectedText = protectEmojiForDeepL(
      "Click 🚫, then ❤️ 👨‍👩‍👧 👍🏽 🇦🇲 1️⃣; keep 50% + $2 → x.",
    );

    expect(protectedText.text).toBe(
      'Click <ee-icon id="0"/>, then <ee-icon id="1"/> <ee-icon id="2"/> <ee-icon id="3"/> <ee-icon id="4"/> <ee-icon id="5"/>; keep 50% + $2 → x.',
    );
    expect(protectedText.icons).toEqual(["🚫", "❤️", "👨‍👩‍👧", "👍🏽", "🇦🇲", "1️⃣"]);
  });

  test("restores icons wherever DeepL positions their protected tags", () => {
    expect(
      restoreEmojiFromDeepL(
        'Arrêter avec <ee-icon id="1"/> puis <ee-icon id="0"/>.',
        ["🚫", "❤️"],
      ),
    ).toBe("Arrêter avec ❤️ puis 🚫.");
  });

  test("escapes XML-sensitive prose for transport and restores it", () => {
    const protectedText = protectEmojiForDeepL("A < B & C > D 🚫");

    expect(protectedText.text).toBe(
      'A &lt; B &amp; C &gt; D <ee-icon id="0"/>',
    );
    expect(
      restoreEmojiFromDeepL(
        'A &lt; B et C &gt; D <ee-icon id="0"/>',
        protectedText.icons,
      ),
    ).toBe("A < B et C > D 🚫");
  });

  test("accepts paired and flexibly serialized placeholder tags", () => {
    expect(
      restoreEmojiFromDeepL(
        "Arrêter avec <ee-icon id = '0'>interdit</ee-icon >.",
        ["🚫"],
      ),
    ).toBe("Arrêter avec 🚫.");
  });

  test("rejects a response that drops a protected icon tag", () => {
    expect(() =>
      restoreEmojiFromDeepL("Arrêter avec interdit.", ["🚫"]),
    ).toThrow("DeepL changed protected emoji");
  });
});
