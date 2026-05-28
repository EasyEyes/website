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

function makeGetEvent(queryStringParameters: Record<string, string> = {}) {
  return {
    httpMethod: "GET",
    headers: {},
    body: null,
    queryStringParameters,
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

describe("POST /glossary — boolean default coercion", () => {
  function glossaryPutBody(): Record<string, { default: unknown }> {
    const put = capturedPuts().find((p) =>
      /\/versions\/[^/]+\/glossary\.json/.test(p.url)
    );
    return (put?.body ?? {}) as Record<string, { default: unknown }>;
  }

  test("JS boolean true default for boolean type is stored as 'TRUE'", async () => {
    mockFetch([{ url: /currentVersion/, body: null }]);

    // Mimic AppScript sending raw JS booleans for Excel TRUE/FALSE cells.
    const rows: unknown[][] = [
      ["INPUT PARAMETER", "NOW", "TYPE", "DEFAULT", "EXPLANATION", "EXAMPLE", "CATEGORIES"],
      ["needCookiesBool", "now", "boolean", true, "expl", "ex", ""],
    ];

    const res = await handler(makeEvent({ body: JSON.stringify({ rows }) }));
    expect(res.statusCode).toBe(200);
    expect(glossaryPutBody()["needCookiesBool"].default).toBe("TRUE");
  });

  test("JS boolean false default for boolean type is stored as 'FALSE'", async () => {
    mockFetch([{ url: /currentVersion/, body: null }]);

    const rows: unknown[][] = [
      ["INPUT PARAMETER", "NOW", "TYPE", "DEFAULT", "EXPLANATION", "EXAMPLE", "CATEGORIES"],
      ["simulateParticipantBool", "now", "boolean", false, "expl", "ex", ""],
    ];

    const res = await handler(makeEvent({ body: JSON.stringify({ rows }) }));
    expect(res.statusCode).toBe(200);
    expect(glossaryPutBody()["simulateParticipantBool"].default).toBe("FALSE");
  });

  test("lowercase string 'true'/'false' for boolean type is normalized to uppercase", async () => {
    mockFetch([{ url: /currentVersion/, body: null }]);

    const rows: unknown[][] = [
      ["INPUT PARAMETER", "NOW", "TYPE", "DEFAULT", "EXPLANATION", "EXAMPLE", "CATEGORIES"],
      ["aBool", "now", "boolean", "true", "expl", "ex", ""],
      ["bBool", "now", "boolean", " False ", "expl", "ex", ""],
    ];

    const res = await handler(makeEvent({ body: JSON.stringify({ rows }) }));
    expect(res.statusCode).toBe(200);
    const body = glossaryPutBody();
    expect(body["aBool"].default).toBe("TRUE");
    expect(body["bBool"].default).toBe("FALSE");
  });

  test("non-boolean types preserve their default value untouched", async () => {
    mockFetch([{ url: /currentVersion/, body: null }]);

    const rows: unknown[][] = [
      ["INPUT PARAMETER", "NOW", "TYPE", "DEFAULT", "EXPLANATION", "EXAMPLE", "CATEGORIES"],
      ["aText", "now", "text", "Hello World", "expl", "ex", ""],
      ["aNumerical", "now", "numerical", "12.5", "expl", "ex", ""],
    ];

    const res = await handler(makeEvent({ body: JSON.stringify({ rows }) }));
    expect(res.statusCode).toBe(200);
    const body = glossaryPutBody();
    expect(body["aText"].default).toBe("Hello World");
    expect(body["aNumerical"].default).toBe("12.5");
  });
});

const SAMPLE_GLOSSARY = {
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

function makePutEvent(body: unknown) {
  return {
    httpMethod: "PUT",
    headers: {},
    body: body === null ? null : JSON.stringify(body),
    queryStringParameters: {},
  };
}

describe("PUT /glossary — version pinning", () => {
  test("null body → 400", async () => {
    const res = await handler(makePutEvent(null));
    expect(res.statusCode).toBe(400);
  });

  test("invalid JSON body → 400", async () => {
    const res = await handler({
      httpMethod: "PUT",
      headers: {},
      body: "{not-json",
      queryStringParameters: {},
    });
    expect(res.statusCode).toBe(400);
  });

  test("body missing username → 400", async () => {
    const res = await handler(makePutEvent({ experimentName: "myExp" }));
    expect(res.statusCode).toBe(400);
  });

  test("body missing experimentName → 400", async () => {
    const res = await handler(makePutEvent({ username: "alice" }));
    expect(res.statusCode).toBe(400);
  });

  test("valid body writes current version to correct Firebase path and returns 200", async () => {
    mockFetch([{ url: /currentVersion/, body: "1.5" }]);

    const res = await handler(
      makePutEvent({ username: "alice", experimentName: "myExp" })
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "1.5" });

    const puts = capturedPuts();
    expect(
      puts.some((p) =>
        p.url.includes("/users/alice/myExp/glossaryVersion") &&
        p.body === "1.5"
      )
    ).toBe(true);
  });
});

describe("PUT /glossary — round-trip with GET", () => {
  test("PUT pins version; subsequent GET ?username&experiment returns that version's GlossaryData", async () => {
    const pinnedGlossary = {
      _about: { name: "_about", availability: "now", type: "text", default: "", explanation: "Pinned.", example: "", categories: [] },
    };

    mockFetch([
      { url: /currentVersion/, body: "1.5" },
      { url: /users\/alice\/myExp\/glossaryVersion/, body: "1.5" },
      { url: /versions\/1_dot_5\/glossary/, body: pinnedGlossary },
    ]);

    const putRes = await handler(
      makePutEvent({ username: "alice", experimentName: "myExp" })
    );
    expect(putRes.statusCode).toBe(200);

    const getRes = await handler(
      makeGetEvent({ username: "alice", experiment: "myExp" })
    );
    expect(getRes.statusCode).toBe(200);
    const data = JSON.parse(getRes.body);
    expect(data.version).toBe("1.5");
    expect(data.glossary).toEqual(pinnedGlossary);
  });
});

describe("GET /glossary — response headers", () => {
  test("all GET responses include Content-Type: application/json", async () => {
    mockFetch([
      { url: /currentVersion/, body: "1.0" },
      { url: /versions\/1_dot_0\/glossary/, body: SAMPLE_GLOSSARY },
    ]);

    const res = await handler(makeGetEvent());
    expect(res.statusCode).toBe(200);
    expect((res as { headers?: Record<string, string> }).headers?.["Content-Type"]).toBe("application/json");
  });
});

describe("GET /glossary — bare (no query params)", () => {
  test("returns 200 with GlossaryData for the current version", async () => {
    mockFetch([
      { url: /currentVersion/, body: "1.0" },
      { url: /versions\/1_dot_0\/glossary/, body: SAMPLE_GLOSSARY },
    ]);

    const res = await handler(makeGetEvent());
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.version).toBe("1.0");
    expect(data.glossary).toEqual(SAMPLE_GLOSSARY);
  });

  test("glossaryFull equals Object.values(glossary)", async () => {
    mockFetch([
      { url: /currentVersion/, body: "1.0" },
      { url: /versions\/1_dot_0\/glossary/, body: SAMPLE_GLOSSARY },
    ]);

    const res = await handler(makeGetEvent());
    const data = JSON.parse(res.body);
    expect(data.glossaryFull).toEqual(Object.values(SAMPLE_GLOSSARY));
  });

  test("superMatchingParams contains exactly the keys with '@'", async () => {
    const glossaryWithAt = {
      ...SAMPLE_GLOSSARY,
      "@fontSize": { name: "@fontSize", availability: "now", type: "numerical", default: "12", explanation: "", example: "", categories: [] },
      "@spacing": { name: "@spacing", availability: "now", type: "numerical", default: "1", explanation: "", example: "", categories: [] },
    };
    mockFetch([
      { url: /currentVersion/, body: "1.0" },
      { url: /versions\/1_dot_0\/glossary/, body: glossaryWithAt },
    ]);

    const res = await handler(makeGetEvent());
    const data = JSON.parse(res.body);
    expect(data.superMatchingParams.sort()).toEqual(["@fontSize", "@spacing"]);
  });
});

describe("GET /glossary?username=&experiment= — per-experiment version lookup", () => {
  test("pinned version exists → returns that version's GlossaryData", async () => {
    const pinnedGlossary = {
      _about: { name: "_about", availability: "now", type: "text", default: "", explanation: "Pinned.", example: "", categories: [] },
    };
    mockFetch([
      { url: /currentVersion/, body: "2.0" },
      { url: /users\/alice\/myExp\/glossaryVersion/, body: "1.0" },
      { url: /versions\/1_dot_0\/glossary/, body: pinnedGlossary },
    ]);

    const res = await handler(makeGetEvent({ username: "alice", experiment: "myExp" }));
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.version).toBe("1.0");
    expect(data.glossary).toEqual(pinnedGlossary);
  });

  test("no pin exists → falls back to current version silently", async () => {
    mockFetch([
      { url: /currentVersion/, body: "2.0" },
      { url: /users\/alice\/newExp\/glossaryVersion/, body: null },
      { url: /versions\/2_dot_0\/glossary/, body: SAMPLE_GLOSSARY },
    ]);

    const res = await handler(makeGetEvent({ username: "alice", experiment: "newExp" }));
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.version).toBe("2.0");
    expect(data.glossary).toEqual(SAMPLE_GLOSSARY);
  });
});

describe("GET /glossary?v= — version lookup", () => {
  test("unknown version → 404", async () => {
    mockFetch([
      { url: /currentVersion/, body: "1.0" },
      { url: /versions\/9_dot_9\/glossary/, body: null },
    ]);

    const res = await handler(makeGetEvent({ v: "9.9" }));
    expect(res.statusCode).toBe(404);
  });

  test("existing version → 200 with correct snapshot", async () => {
    mockFetch([
      { url: /currentVersion/, body: "2.0" },
      { url: /versions\/1_dot_0\/glossary/, body: SAMPLE_GLOSSARY },
    ]);

    const res = await handler(makeGetEvent({ v: "1.0" }));
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.version).toBe("1.0");
    expect(data.glossary).toEqual(SAMPLE_GLOSSARY);
  });
});
