jest.mock("../glossaryDb");

const { readGlossaryData, writeGlossaryData } = require("../glossaryDb");
const { handler } = require("../");

const VALID_SECRET = "test-secret";

const HEADERS_ROW = [
  "INPUT PARAMETER",
  "NOW",
  "TYPE",
  "DEFAULT",
  "EXPLANATION",
  "EXAMPLE",
  "CATEGORIES",
];

function makeEvent(method, { headers = {}, body = null } = {}) {
  return { httpMethod: method, headers, body };
}

beforeEach(() => {
  process.env.GLOSSARY_SECRET = VALID_SECRET;
  jest.clearAllMocks();
});

describe("glossary Netlify function", () => {
  describe("POST authorization", () => {
    it("returns 401 when x-glossary-secret header is missing", async () => {
      const res = await handler(
        makeEvent("POST", { body: '{"rows":[]}' })
      );
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 when x-glossary-secret header is wrong", async () => {
      const res = await handler(
        makeEvent("POST", {
          headers: { "x-glossary-secret": "wrong-secret" },
          body: '{"rows":[]}',
        })
      );
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST body validation", () => {
    it("returns 400 when body is not valid JSON", async () => {
      const res = await handler(
        makeEvent("POST", {
          headers: { "x-glossary-secret": VALID_SECRET },
          body: "not-json{{{",
        })
      );
      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when body is valid JSON but missing rows field", async () => {
      const res = await handler(
        makeEvent("POST", {
          headers: { "x-glossary-secret": VALID_SECRET },
          body: '{"data": []}',
        })
      );
      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET handler", () => {
    it("returns graceful JS fallback (not 500) when Firebase data is null", async () => {
      readGlossaryData.mockResolvedValue({
        glossary: null,
        glossaryFull: null,
        superMatchingParams: null,
      });
      const res = await handler(makeEvent("GET"));
      expect(res.statusCode).toBe(200);
      expect(res.headers["Content-Type"]).toBe("application/javascript");
      expect(() => new Function("window", res.body)({})).not.toThrow();
    });

    it("returns graceful JS fallback (not 500) when Firebase throws", async () => {
      readGlossaryData.mockRejectedValue(new Error("Firebase unavailable"));
      const res = await handler(makeEvent("GET"));
      expect(res.statusCode).toBe(200);
      expect(() => new Function("window", res.body)({})).not.toThrow();
    });

    it("GET response sets GLOSSARY, GLOSSARY_FULL, SUPER_MATCHING_PARAMS on window", async () => {
      readGlossaryData.mockResolvedValue({
        glossary: { targetKind: { name: "targetKind" } },
        glossaryFull: [{ name: "targetKind" }],
        superMatchingParams: ["param@Block"],
      });
      const res = await handler(makeEvent("GET"));
      expect(res.statusCode).toBe(200);
      const win = {};
      // eslint-disable-next-line no-new-func
      new Function("window", res.body)(win);
      expect(win.GLOSSARY).toEqual({ targetKind: { name: "targetKind" } });
      expect(win.GLOSSARY_FULL).toEqual([{ name: "targetKind" }]);
      expect(win.SUPER_MATCHING_PARAMS).toEqual(["param@Block"]);
    });
  });

  describe("POST success", () => {
    it("returns 200 and writes transformed data when secret and body are valid", async () => {
      writeGlossaryData.mockResolvedValue(undefined);
      const rows = [
        HEADERS_ROW,
        ["targetKind", "now", "text", "letter", "What to show", "A", ""],
        ["param@Block", "now", "text", "", "Super-matching", "", ""],
      ];
      const res = await handler(
        makeEvent("POST", {
          headers: { "x-glossary-secret": VALID_SECRET },
          body: JSON.stringify({ rows }),
        })
      );
      expect(res.statusCode).toBe(200);
      expect(writeGlossaryData).toHaveBeenCalledWith(
        expect.objectContaining({
          glossary: expect.objectContaining({
            targetKind: expect.any(Object),
          }),
          glossaryFull: expect.any(Array),
          superMatchingParams: expect.arrayContaining(["param@Block"]),
        })
      );
    });
  });
});
