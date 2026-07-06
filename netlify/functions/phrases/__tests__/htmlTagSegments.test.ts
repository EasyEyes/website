import { segmentHtmlTags, rejoinHtmlTagSegments } from "../../shared/htmlTagSegments";

describe("segmentHtmlTags / rejoinHtmlTagSegments — no tags", () => {
  test("plain text with no HTML tags round-trips unchanged", () => {
    const text = "Hello world, no tags here.";
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([{ type: "text", value: text }]);

    const translatedTexts = segments
      .filter((s) => s.type === "text")
      .map((s) => s.value);
    expect(rejoinHtmlTagSegments(segments, translatedTexts)).toBe(text);
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — span wrapping a short icon", () => {
  test("tag is passed through opaque, wrapped icon text is translated in place", () => {
    const text = '<span style="font-style: normal">▼</span>';
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([
      { type: "tag", value: '<span style="font-style: normal">' },
      { type: "text", value: "▼" },
      { type: "tag", value: "</span>" },
    ]);

    const rejoined = rejoinHtmlTagSegments(segments, ["[TR:▼]"]);
    expect(rejoined).toBe('<span style="font-style: normal">[TR:▼]</span>');
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — span wrapping a full sentence", () => {
  test("tag intact, wrapped multi-word sentence translated", () => {
    const text =
      '<span style="font-weight:bold">This is a full sentence to translate</span>';
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([
      { type: "tag", value: '<span style="font-weight:bold">' },
      { type: "text", value: "This is a full sentence to translate" },
      { type: "tag", value: "</span>" },
    ]);

    const rejoined = rejoinHtmlTagSegments(segments, ["[TR:This is a full sentence to translate]"]);
    expect(rejoined).toBe(
      '<span style="font-weight:bold">[TR:This is a full sentence to translate]</span>',
    );
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — self-closing br", () => {
  test("line break preserved between two translated lines", () => {
    const text = "Line one<br />Line two";
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([
      { type: "text", value: "Line one" },
      { type: "tag", value: "<br />" },
      { type: "text", value: "Line two" },
    ]);

    const rejoined = rejoinHtmlTagSegments(segments, ["[TR:Line one]", "[TR:Line two]"]);
    expect(rejoined).toBe("[TR:Line one]<br />[TR:Line two]");
  });

  test("<br> without slash is also recognized", () => {
    const segments = segmentHtmlTags("a<br>b");
    expect(segments).toEqual([
      { type: "text", value: "a" },
      { type: "tag", value: "<br>" },
      { type: "text", value: "b" },
    ]);
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — strong wrapping a list line, including malformed closing tag", () => {
  test("malformed '</ strong>' (stray space) is still recognized as opaque", () => {
    const text = "<strong>This is the recommended choice.</ strong>";
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([
      { type: "tag", value: "<strong>" },
      { type: "text", value: "This is the recommended choice." },
      { type: "tag", value: "</ strong>" },
    ]);

    const rejoined = rejoinHtmlTagSegments(segments, ["[TR:This is the recommended choice.]"]);
    expect(rejoined).toBe("<strong>[TR:This is the recommended choice.]</ strong>");
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — small wrapping a trailing clause", () => {
  test("reduced-emphasis markup preserved around translated clause", () => {
    const text = "Some main text. <small>This is a trailing clarifying clause.</small>";
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([
      { type: "text", value: "Some main text. " },
      { type: "tag", value: "<small>" },
      { type: "text", value: "This is a trailing clarifying clause." },
      { type: "tag", value: "</small>" },
    ]);

    const rejoined = rejoinHtmlTagSegments(segments, [
      "[TR:Some main text. ]",
      "[TR:This is a trailing clarifying clause.]",
    ]);
    expect(rejoined).toBe(
      "[TR:Some main text. ]<small>[TR:This is a trailing clarifying clause.]</small>",
    );
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — anchor with href", () => {
  test("link text is translatable, href URL stays untouched inside the opaque tag", () => {
    const text = 'See <a href="https://example.com/citation">this citation</a> for details.';
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([
      { type: "text", value: "See " },
      { type: "tag", value: '<a href="https://example.com/citation">' },
      { type: "text", value: "this citation" },
      { type: "tag", value: "</a>" },
      { type: "text", value: " for details." },
    ]);

    const rejoined = rejoinHtmlTagSegments(segments, [
      "[TR:See ]",
      "[TR:this citation]",
      "[TR: for details.]",
    ]);
    expect(rejoined).toBe(
      '[TR:See ]<a href="https://example.com/citation">[TR:this citation]</a>[TR: for details.]',
    );
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — adjacent tags with no text between them", () => {
  test("no empty text segment is inserted between two back-to-back tags", () => {
    const text = "Before<strong></strong>After";
    const segments = segmentHtmlTags(text);

    expect(segments).toEqual([
      { type: "text", value: "Before" },
      { type: "tag", value: "<strong>" },
      { type: "tag", value: "</strong>" },
      { type: "text", value: "After" },
    ]);

    const rejoined = rejoinHtmlTagSegments(segments, ["[TR:Before]", "[TR:After]"]);
    expect(rejoined).toBe("[TR:Before]<strong></strong>[TR:After]");
  });
});

describe("segmentHtmlTags / rejoinHtmlTagSegments — multiple different tag types in one phrase", () => {
  test("span, strong, and anchor all round-trip correctly in a single phrase", () => {
    const text =
      '<span>Icon</span> <strong>Bold text</strong> and <a href="https://x.com">a link</a>.';
    const segments = segmentHtmlTags(text);

    const translatedTexts = segments
      .filter((s) => s.type === "text")
      .map((s) => `[TR:${s.value}]`);
    const rejoined = rejoinHtmlTagSegments(segments, translatedTexts);

    expect(rejoined).toBe(
      '<span>[TR:Icon]</span>[TR: ]<strong>[TR:Bold text]</strong>[TR: and ]<a href="https://x.com">[TR:a link]</a>[TR:.]',
    );
  });
});
