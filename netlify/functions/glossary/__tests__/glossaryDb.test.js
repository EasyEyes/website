const { readGlossaryData, writeGlossaryData } = require("../glossaryDb");

const GLOSSARY = { "omitPsychoJS.window.monitorFramePeriodBool": { type: "boolean" }, targetKind: { type: "text" } };
const GLOSSARY_FULL = [{ name: "targetKind" }];
const SUPER_MATCHING_PARAMS = ["param@Block"];

// How the data looks in Firebase (dots encoded)
const GLOSSARY_ENCODED = { "omitPsychoJS__dot__window__dot__monitorFramePeriodBool": { type: "boolean" }, targetKind: { type: "text" } };

function mockFetch(...responses) {
  let call = 0;
  global.fetch = jest.fn(() => {
    const body = responses[call++];
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  });
}

beforeEach(() => {
  process.env.FIREBASE_API_KEY = "test-key";
  jest.clearAllMocks();
});

afterEach(() => {
  delete global.fetch;
});

describe("readGlossaryData", () => {
  it("decodes __dot__ keys back to dots", async () => {
    mockFetch(GLOSSARY_ENCODED, GLOSSARY_FULL, SUPER_MATCHING_PARAMS);

    const { glossary } = await readGlossaryData();

    expect(Object.keys(glossary)).toContain("omitPsychoJS.window.monitorFramePeriodBool");
  });

  it("returns all three fields correctly decoded", async () => {
    mockFetch(GLOSSARY_ENCODED, GLOSSARY_FULL, SUPER_MATCHING_PARAMS);

    const result = await readGlossaryData();

    expect(result.glossary).toEqual(GLOSSARY);
    expect(result.glossaryFull).toEqual(GLOSSARY_FULL);
    expect(result.superMatchingParams).toEqual(SUPER_MATCHING_PARAMS);
  });

  it("falls back to empty defaults when Firebase returns null", async () => {
    mockFetch(null, null, null);

    const result = await readGlossaryData();

    expect(result.glossary).toEqual({});
    expect(result.glossaryFull).toEqual([]);
    expect(result.superMatchingParams).toEqual([]);
  });
});

describe("writeGlossaryData", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(null) }),
    );
  });

  it("encodes dots in glossary keys before writing", async () => {
    await writeGlossaryData({
      glossary: GLOSSARY,
      glossaryFull: GLOSSARY_FULL,
      superMatchingParams: SUPER_MATCHING_PARAMS,
    });

    const glossaryBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(Object.keys(glossaryBody)).toContain(
      "omitPsychoJS__dot__window__dot__monitorFramePeriodBool",
    );
    expect(Object.keys(glossaryBody)).not.toContain(
      "omitPsychoJS.window.monitorFramePeriodBool",
    );
  });

  it("includes auth param in all three PUT requests", async () => {
    await writeGlossaryData({
      glossary: GLOSSARY,
      glossaryFull: GLOSSARY_FULL,
      superMatchingParams: SUPER_MATCHING_PARAMS,
    });

    const urls = global.fetch.mock.calls.map((call) => call[0]);
    expect(urls).toHaveLength(3);
    urls.forEach((url) => expect(url).toContain("?auth=test-key"));
  });
});
