export type Segment = { type: "tag" | "text"; value: string };

// Matches any HTML tag shape (opening, closing, or self-closing) generically,
// tolerating whitespace irregularities around the leading "/" (e.g. "</ strong>")
// so it protects tags DeepL would otherwise mangle without requiring a hardcoded
// tag list or clean source markup.
const TAG_PATTERN = /<\s*\/?\s*[a-zA-Z][a-zA-Z0-9]*\b[^>]*>/g;

export function segmentHtmlTags(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = new RegExp(TAG_PATTERN);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "tag", value: match[0] });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

export function rejoinHtmlTagSegments(
  segments: Segment[],
  translatedTexts: string[],
): string {
  let i = 0;
  return segments
    .map((seg) => (seg.type === "tag" ? seg.value : translatedTexts[i++]))
    .join("");
}
