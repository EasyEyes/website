import { handler } from "../index";
import type { PhraseMap } from "../types";

const FIREBASE_DB = "firebase-db-secret";

const SAMPLE_PHRASES: PhraseMap = {
  hello: { en: "Hello", fr: "Bonjour" },
  bye: { en: "Goodbye", fr: "Au revoir" },
};

function makeGetEvent(queryStringParameters: Record<string, string> = {}) {
  return {
    httpMethod: "GET",
    headers: {},
    body: null,
    queryStringParameters,
  };
}

function makePutEvent(body: unknown) {
  return {
    httpMethod: "PUT",
    headers: {},
    body: body === null ? null : JSON.stringify(body),
    queryStringParameters: {},
  };
}

function makePostEvent(body: unknown) {
  return {
    httpMethod: "POST",
    headers: {},
    body: body === null ? null : JSON.stringify(body),
    queryStringParameters: {},
  };
}

type MockResponse = {
  url: RegExp | string;
  body: unknown;
  ok?: boolean;
  status?: number;
};

function mockFetch(responses: MockResponse[]) {
  (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(
    (url: string) => {
      const match = responses.find((r) =>
        r.url instanceof RegExp
          ? r.url.test(url)
          : url.includes(r.url as string)
      );
      const ok = match?.ok ?? true;
      const status = match?.status ?? 200;
      return Promise.resolve({
        ok,
        status,
        json: () => Promise.resolve(match?.body ?? null),
      });
    }
  );
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
  process.env.FIREBASE_DB = FIREBASE_DB;
  process.env.DEEPL_API_KEY = "test-deepl-key";
  delete process.env.GOOGLE_API_KEY;
  jest.resetAllMocks();
});

// ── GET /phrases (bare) ────────────────────────────────────────────────────────

describe("GET /phrases — bare (no query params)", () => {
  test("returns 200 with { version, phrases } for current version", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(makeGetEvent());

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.version).toBe("1.0");
    expect(data.phrases).toEqual(SAMPLE_PHRASES);
  });

  test("returns Content-Type: application/json header", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(makeGetEvent());
    expect(res.headers?.["Content-Type"]).toBe("application/json");
  });

  test("returns 404 when no current version in Firebase", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: null }]);

    const res = await handler(makeGetEvent());
    expect(res.statusCode).toBe(404);
  });
});

// ── GET /phrases?versionOnly=1 ─────────────────────────────────────────────────

describe("GET /phrases?versionOnly=1", () => {
  test("returns { version } without reading phrases data", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: "2.3" }]);

    const res = await handler(makeGetEvent({ versionOnly: "1" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "2.3" });

    const fetchedUrls: string[] = (
      global as unknown as { fetch: jest.Mock }
    ).fetch.mock.calls.map(([url]: [string]) => url);
    expect(fetchedUrls.some((u) => u.includes("phrasesVersions"))).toBe(false);
  });

  test("returns { version: null } when Firebase has no currentVersion", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: null }]);

    const res = await handler(makeGetEvent({ versionOnly: "1" }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: null });
  });
});

// ── GET /phrases?pinned=<user>/<experiment> ────────────────────────────────────

describe("GET /phrases?pinned=<user>/<experiment>", () => {
  test("reads users/<u>/<e>/phrasesVersion and returns that version's data", async () => {
    const pinnedPhrases: PhraseMap = { hello: { en: "Hello", de: "Hallo" } };
    mockFetch([
      { url: /users\/alice\/myExp\/phrasesVersion/, body: "1.5" },
      { url: /phrasesVersions\/1_dot_5\/phrases/, body: pinnedPhrases },
    ]);

    const res = await handler(makeGetEvent({ pinned: "alice/myExp" }));

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.version).toBe("1.5");
    expect(data.phrases).toEqual(pinnedPhrases);
  });

  test("returns 404 when no pinned version stored", async () => {
    mockFetch([{ url: /users\/alice\/noPin\/phrasesVersion/, body: null }]);

    const res = await handler(makeGetEvent({ pinned: "alice/noPin" }));
    expect(res.statusCode).toBe(404);
  });
});

// ── PUT /phrases ───────────────────────────────────────────────────────────────

describe("PUT /phrases — version pinning", () => {
  test("writes currentVersion to users/<u>/<e>/phrasesVersion and returns { version }", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: "1.7" }]);

    const res = await handler(
      makePutEvent({ username: "alice", experimentName: "myExp" })
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "1.7" });

    const puts = capturedPuts();
    expect(
      puts.some(
        (p) =>
          p.url.includes("/users/alice/myExp/phrasesVersion") &&
          p.body === "1.7"
      )
    ).toBe(true);
  });

  test("null body → 400", async () => {
    const res = await handler(makePutEvent(null));
    expect(res.statusCode).toBe(400);
  });

  test("missing username → 400", async () => {
    const res = await handler(makePutEvent({ experimentName: "myExp" }));
    expect(res.statusCode).toBe(400);
  });

  test("missing experimentName → 400", async () => {
    const res = await handler(makePutEvent({ username: "alice" }));
    expect(res.statusCode).toBe(400);
  });
});

// ── POST /phrases { action: "diff" } ──────────────────────────────────────────

describe("POST /phrases { action: 'diff' }", () => {
  test("returns { changed, removed, currentVersion } without writing Firebase", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    // hello is unchanged; newPhrase is new; bye is removed
    const res = await handler(
      makePostEvent({
        action: "diff",
        english: { hello: "Hello", newPhrase: "New text" },
      })
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.changed).toContain("newPhrase");
    expect(data.changed).not.toContain("hello");
    expect(data.removed).toContain("bye");
    expect(data.currentVersion).toBe("1.0");

    expect(capturedPuts()).toHaveLength(0);
  });

  test("returns all keys as changed when no previous version exists", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: null }]);

    const res = await handler(
      makePostEvent({ action: "diff", english: { a: "A", b: "B" } })
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.changed).toEqual(expect.arrayContaining(["a", "b"]));
    expect(data.removed).toEqual([]);
    expect(data.currentVersion).toBeNull();
  });
});

// ── POST /phrases { action: "translate" } ─────────────────────────────────────

describe("POST /phrases { action: 'translate' } — guards", () => {
  test("TOCTOU: returns 409 when request currentVersion differs from Firebase", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: "1.1" }]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(409);
  });

  test("returns 400 when more than 50 phrases changed", async () => {
    const changedPhrases: Record<string, string> = {};
    for (let i = 0; i < 51; i++) changedPhrases[`key${i}`] = `Text ${i}`;

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases,
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /phrases { action: 'translate' } — happy path", () => {
  test("writes new version to Firebase and returns { newVersion, translatedRows }", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    // Empty colorMask → translateCells makes no DeepL/Google calls; returns { en } only
    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.newVersion).toBe("1.1");
    expect(data.translatedRows).toMatchObject({ hello: { en: "Hello updated" } });

    const puts = capturedPuts();
    expect(puts.some((p) => p.url.includes("phrasesVersions/1_dot_1/phrases"))).toBe(true);
    expect(puts.some((p) => p.url.includes("phrases/currentVersion") && p.body === "1.1")).toBe(true);
  });
});

// ── POST /phrases { action: "fullResync" } ────────────────────────────────────

describe("POST /phrases { action: 'fullResync' }", () => {
  test("bypasses the 50-phrase limit and returns 200", async () => {
    const changedPhrases: Record<string, string> = {};
    for (let i = 0; i < 51; i++) changedPhrases[`key${i}`] = `Text ${i}`;

    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(
      makePostEvent({
        action: "fullResync",
        changedPhrases,
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(200);
  });
});

// ── CORS ───────────────────────────────────────────────────────────────────────

describe("CORS — OPTIONS preflight", () => {
  test("OPTIONS returns 204 with CORS headers for allowed origin", async () => {
    const res = await handler({
      httpMethod: "OPTIONS",
      headers: { origin: "https://easyeyes.app" },
      body: null,
      queryStringParameters: {},
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers?.["Access-Control-Allow-Origin"]).toBe(
      "https://easyeyes.app"
    );
  });

  test("OPTIONS returns 204 with no CORS headers for disallowed origin", async () => {
    const res = await handler({
      httpMethod: "OPTIONS",
      headers: { origin: "https://evil.com" },
      body: null,
      queryStringParameters: {},
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers?.["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
