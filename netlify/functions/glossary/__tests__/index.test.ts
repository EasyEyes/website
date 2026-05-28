import { handler } from "../index";

const VALID_SECRET = "test-secret-123";
const FIREBASE_DB = "firebase-db-secret";
const FIREBASE_ROOT = "https://easyeyes-compiler-default-rtdb.firebaseio.com";

const HEADERS = [
  "INPUT PARAMETER",
  "NOW",
  "TYPE",
  "DEFAULT",
  "EXPLANATION",
  "EXAMPLE",
  "CATEGORIES",
];

function makeRows(
  params: Array<{
    name: string;
    availability?: string;
    type?: string;
    default?: string;
    explanation?: string;
    example?: string;
    categories?: string;
  }>
): string[][] {
  return [
    HEADERS,
    ...params.map((p) => [
      p.name,
      p.availability ?? "now",
      p.type ?? "text",
      p.default ?? "",
      p.explanation ?? "Explanation.",
      p.example ?? "Example.",
      p.categories ?? "",
    ]),
  ];
}

function makeEvent(overrides: {
  headers?: Record<string, string>;
  body?: string | null;
  httpMethod?: string;
}) {
  return {
    httpMethod: "POST",
    headers: { "x-glossary-secret": VALID_SECRET },
    body: JSON.stringify({ rows: makeRows([]) }),
    ...overrides,
  };
}

function mockFetch(responses: Array<{ url: RegExp | string; body: unknown }>) {
  (global as unknown as { fetch: jest.Mock }).fetch = jest.fn((url: string) => {
    const match = responses.find((r) =>
      r.url instanceof RegExp ? r.url.test(url) : url.includes(r.url as string)
    );
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(match?.body ?? null),
    });
  });
}

function capturedPuts(): Array<{ url: string; body: unknown }> {
  const mock = (global as unknown as { fetch: jest.Mock }).fetch;
  return mock.mock.calls
    .filter(([, init]: [string, RequestInit]) => init?.method === "PUT")
    .map(([url, init]: [string, RequestInit]) => ({
      url,
      body: JSON.parse((init.body as string) ?? "null"),
    }));
}

beforeEach(() => {
  process.env.GLOSSARY_SECRET = VALID_SECRET;
  process.env.FIREBASE_DB = FIREBASE_DB;
  jest.resetAllMocks();
});

describe("POST /glossary — authentication", () => {
  test("missing x-glossary-secret header → 401", async () => {
    const res = await handler(makeEvent({ headers: {} }));
    expect(res.statusCode).toBe(401);
  });

  test("wrong secret → 401", async () => {
    const res = await handler(
      makeEvent({ headers: { "x-glossary-secret": "wrong" } })
    );
    expect(res.statusCode).toBe(401);
  });
});

describe("POST /glossary — body validation", () => {
  test("missing rows field → 400", async () => {
    const res = await handler(makeEvent({ body: JSON.stringify({}) }));
    expect(res.statusCode).toBe(400);
  });

  test("rows is not an array → 400", async () => {
    const res = await handler(
      makeEvent({ body: JSON.stringify({ rows: "bad" }) })
    );
    expect(res.statusCode).toBe(400);
  });

  test("invalid JSON body → 400", async () => {
    const res = await handler(makeEvent({ body: "{not-json" }));
    expect(res.statusCode).toBe(400);
  });
});

describe("POST /glossary — versioning", () => {
  test("first-ever push creates version 1.0", async () => {
    mockFetch([{ url: /currentVersion/, body: null }]);

    const rows = makeRows([{ name: "_about" }]);
    const res = await handler(
      makeEvent({ body: JSON.stringify({ rows }) })
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "1.0" });

    const puts = capturedPuts();
    expect(puts.some((p) => p.url.includes("/versions/1_dot_0/glossary"))).toBe(
      true
    );
    expect(
      puts.some(
        (p) =>
          p.url.includes("/currentVersion") && p.body === "1.0"
      )
    ).toBe(true);
  });

  test("same keys, changed values → minor bump", async () => {
    const existingGlossary = {
      _about: {
        name: "_about",
        availability: "now",
        type: "text",
        default: "",
        explanation: "Old explanation.",
        example: "Old example.",
        categories: [],
      },
    };
    mockFetch([
      { url: /currentVersion/, body: "1.0" },
      { url: /versions\/1_dot_0\/glossary/, body: existingGlossary },
    ]);

    const rows = makeRows([
      { name: "_about", explanation: "New explanation." },
    ]);
    const res = await handler(
      makeEvent({ body: JSON.stringify({ rows }) })
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "1.1" });
  });

  test("adding a top-level key → major bump", async () => {
    const existingGlossary = {
      _about: {
        name: "_about",
        availability: "now",
        type: "text",
        default: "",
        explanation: "About.",
        example: "Ex.",
        categories: [],
      },
    };
    mockFetch([
      { url: /currentVersion/, body: "1.3" },
      { url: /versions\/1_dot_3\/glossary/, body: existingGlossary },
    ]);

    const rows = makeRows([{ name: "_about" }, { name: "_newParam" }]);
    const res = await handler(
      makeEvent({ body: JSON.stringify({ rows }) })
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "2.0" });
  });

  test("removing a top-level key → major bump", async () => {
    const existingGlossary = {
      _about: {
        name: "_about",
        availability: "now",
        type: "text",
        default: "",
        explanation: "About.",
        example: "Ex.",
        categories: [],
      },
      _willBeRemoved: {
        name: "_willBeRemoved",
        availability: "now",
        type: "text",
        default: "",
        explanation: "Gone.",
        example: "Ex.",
        categories: [],
      },
    };
    mockFetch([
      { url: /currentVersion/, body: "2.1" },
      { url: /versions\/2_dot_1\/glossary/, body: existingGlossary },
    ]);

    const rows = makeRows([{ name: "_about" }]);
    const res = await handler(
      makeEvent({ body: JSON.stringify({ rows }) })
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "3.0" });
  });
});
