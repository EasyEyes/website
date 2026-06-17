import { handler } from "../index";

const FIREBASE_DB = "firebase-db-secret";
const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";

type FetchMock = jest.Mock;

function mockFetch(responses: Array<{ url: RegExp | string; body: unknown; ok?: boolean }>) {
  (global as unknown as { fetch: FetchMock }).fetch = jest.fn((url: string) => {
    const match = responses.find((r) =>
      r.url instanceof RegExp ? r.url.test(url) : url.includes(r.url as string)
    );
    const ok = match?.ok !== false;
    return Promise.resolve({
      ok,
      json: () => Promise.resolve(match?.body ?? null),
    });
  });
}

function fetchCallCount(): number {
  return (global as unknown as { fetch: FetchMock }).fetch.mock.calls.length;
}

function fetchedUrls(): string[] {
  return (global as unknown as { fetch: FetchMock }).fetch.mock.calls.map(
    ([url]: [string]) => url
  );
}

beforeEach(() => {
  process.env.FIREBASE_DB = FIREBASE_DB;
  jest.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Body validation
// ---------------------------------------------------------------------------

describe("POST /glossary-filter — body validation", () => {
  test("missing body → 400", async () => {
    const res = await handler({ httpMethod: "POST", headers: {}, body: null });
    expect(res.statusCode).toBe(400);
  });

  test("invalid JSON body → 400", async () => {
    const res = await handler({ httpMethod: "POST", headers: {}, body: "{not-json" });
    expect(res.statusCode).toBe(400);
  });

  test("missing v field → 400", async () => {
    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ keys: ["targetFont"] }),
    });
    expect(res.statusCode).toBe(400);
  });

  test("missing keys field → 400", async () => {
    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0" }),
    });
    expect(res.statusCode).toBe(400);
  });

  test("keys is not an array → 400", async () => {
    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: "targetFont" }),
    });
    expect(res.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Firebase: version not found
// ---------------------------------------------------------------------------

describe("POST /glossary-filter — version not found", () => {
  test("Firebase returns null for version → 404", async () => {
    mockFetch([{ url: /versions\/9_dot_9\/glossary/, body: null }]);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "9.9", keys: ["targetFont"] }),
    });

    expect(res.statusCode).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Filtering behaviour
// ---------------------------------------------------------------------------

const FULL_GLOSSARY = {
  targetFont: {
    name: "targetFont",
    availability: "now",
    type: "text",
    default: "Roboto",
    explanation: "Font.",
    example: "Arial",
    categories: [],
  },
  targetSizeDeg: {
    name: "targetSizeDeg",
    availability: "now",
    type: "numerical",
    default: "2",
    explanation: "Size.",
    example: "2",
    categories: [],
  },
  _about: {
    name: "_about",
    availability: "now",
    type: "text",
    default: "",
    explanation: "About.",
    example: "",
    categories: [],
  },
  "@@targetFont": {
    name: "@@targetFont",
    availability: "now",
    type: "text",
    default: "",
    explanation: "Super-match.",
    example: "",
    categories: [],
  },
  "@@spacing": {
    name: "@@spacing",
    availability: "now",
    type: "numerical",
    default: "1",
    explanation: "Super-match spacing.",
    example: "1",
    categories: [],
  },
};

function mockVersion(version: string, glossary: Record<string, unknown>) {
  const encoded = version.replace(/\./g, "_dot_");
  mockFetch([{ url: new RegExp(`versions/${encoded}/glossary`), body: glossary }]);
}

describe("POST /glossary-filter — filtering", () => {
  test("returns only requested keys (non-requested keys absent)", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["targetFont"] }),
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.glossary).toHaveProperty("targetFont");
    expect(data.glossary).not.toHaveProperty("targetSizeDeg");
    expect(data.glossary).not.toHaveProperty("_about");
  });

  test("@@-named entries always present even when absent from keys", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["_about"] }),
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.glossary).toHaveProperty("@@targetFont");
    expect(data.glossary).toHaveProperty("@@spacing");
  });

  test("requested key absent from glossary is silently omitted", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["nonExistentParam", "targetFont"] }),
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.glossary).toHaveProperty("targetFont");
    expect(data.glossary).not.toHaveProperty("nonExistentParam");
  });

  test("empty keys list → only @@ entries in response", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: [] }),
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(Object.keys(data.glossary).every((k: string) => k.includes("@@"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Response shape
// ---------------------------------------------------------------------------

describe("POST /glossary-filter — response shape", () => {
  test("response has version, glossary, glossaryFull, superMatchingParams", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["targetFont"] }),
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty("version", "1.0");
    expect(data).toHaveProperty("glossary");
    expect(data).toHaveProperty("glossaryFull");
    expect(data).toHaveProperty("superMatchingParams");
  });

  test("glossaryFull equals Object.values(glossary)", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["targetFont"] }),
    });

    const data = JSON.parse(res.body);
    expect(data.glossaryFull).toEqual(Object.values(data.glossary));
  });

  test("superMatchingParams contains exactly the @@ keys included", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["targetFont"] }),
    });

    const data = JSON.parse(res.body);
    expect(data.superMatchingParams.sort()).toEqual(["@@spacing", "@@targetFont"]);
  });

  test("superMatchingParams is empty when no @@ entries exist", async () => {
    const glossaryNoAt = {
      targetFont: FULL_GLOSSARY.targetFont,
      _about: FULL_GLOSSARY._about,
    };
    mockVersion("2.0", glossaryNoAt);

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "2.0", keys: ["targetFont"] }),
    });

    const data = JSON.parse(res.body);
    expect(data.superMatchingParams).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Firebase failure → 503
// ---------------------------------------------------------------------------

describe("POST /glossary-filter — Firebase failure", () => {
  test("Firebase throws → 503", async () => {
    (global as unknown as { fetch: FetchMock }).fetch = jest.fn(() =>
      Promise.reject(new Error("Firebase unreachable"))
    );

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["targetFont"] }),
    });

    expect(res.statusCode).toBe(503);
  });

  test("Firebase returns non-ok status → 503", async () => {
    (global as unknown as { fetch: FetchMock }).fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve(null) })
    );

    const res = await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["targetFont"] }),
    });

    expect(res.statusCode).toBe(503);
  });
});

// ---------------------------------------------------------------------------
// Single Firebase GET per request
// ---------------------------------------------------------------------------

describe("POST /glossary-filter — Firebase call count", () => {
  test("only one Firebase GET is performed per request", async () => {
    mockVersion("1.0", FULL_GLOSSARY);

    await handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ v: "1.0", keys: ["targetFont", "targetSizeDeg", "_about"] }),
    });

    expect(fetchCallCount()).toBe(1);
    expect(fetchedUrls()[0]).toMatch(/versions\/1_dot_0\/glossary/);
  });
});
