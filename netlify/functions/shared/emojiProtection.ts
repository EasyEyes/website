const EMOJI_SEQUENCE = new RegExp(
  [
    "(?:\\p{Regional_Indicator}{2})",
    "(?:[#*0-9]\\uFE0F?\\u20E3)",
    "(?:(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic}\\uFE0F)\\p{Emoji_Modifier}?(?:\\u200D(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic})(?:\\uFE0F)?\\p{Emoji_Modifier}?)+)",
    "(?:(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic}\\uFE0F)\\p{Emoji_Modifier}?)",
  ].join("|"),
  "gu",
);

const PROTECTED_ICON_PATTERN =
  /<ee-icon\s+id\s*=\s*(?:"(\d+)"|'(\d+)')\s*(?:\/>|>[\s\S]*?<\/ee-icon\s*>)/gi;

export type ProtectedEmojiText = { text: string; icons: string[] };

function escapeXmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unescapeXmlText(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function protectEmojiForDeepL(text: string): ProtectedEmojiText {
  const icons: string[] = [];
  let lastIndex = 0;
  let protectedText = "";
  const emojiPattern = new RegExp(EMOJI_SEQUENCE);
  let match: RegExpExecArray | null;
  while ((match = emojiPattern.exec(text)) !== null) {
    const index = match.index;
    protectedText += escapeXmlText(text.slice(lastIndex, index));
    const icon = match[0];
    const id = icons.length;
    icons.push(icon);
    protectedText += `<ee-icon id="${id}"/>`;
    lastIndex = index + icon.length;
  }
  protectedText += escapeXmlText(text.slice(lastIndex));
  return { text: protectedText, icons };
}

export function restoreEmojiFromDeepL(
  translatedText: string,
  icons: string[],
): string {
  if (icons.length === 0) return unescapeXmlText(translatedText);

  const restoredIds = new Set<number>();
  const restored = translatedText.replace(
    PROTECTED_ICON_PATTERN,
    (
      _match,
      doubleQuotedId: string | undefined,
      singleQuotedId: string | undefined,
    ) => {
      const id = Number(doubleQuotedId ?? singleQuotedId);
      if (
        !Number.isSafeInteger(id) ||
        id >= icons.length ||
        restoredIds.has(id)
      ) {
        throw new Error("DeepL changed protected emoji");
      }
      restoredIds.add(id);
      return icons[id];
    },
  );

  if (restoredIds.size !== icons.length || /<\/?ee-icon\b/.test(restored)) {
    throw new Error("DeepL changed protected emoji");
  }
  return unescapeXmlText(restored);
}
