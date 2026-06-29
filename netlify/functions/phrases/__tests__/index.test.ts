import { gunzipSync } from "zlib";
import { handler } from "../index";
import type { PhraseMap } from "../types";

const FIREBASE_DB = "firebase-db-secret";
const PHRASES_SECRET = "phrases-secret";

// Gzipped responders return a base64 body; decode it back to the JSON payload.
function decodeBody(res: { body: string; isBase64Encoded?: boolean }): unknown {
  if (res.isBase64Encoded) {
    return JSON.parse(gunzipSync(Buffer.from(res.body, "base64")).toString("utf-8"));
  }
  return JSON.parse(res.body);
}

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
    headers: { "x-phrases-secret": PHRASES_SECRET },
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
      const body = match?.body ?? null;
      return Promise.resolve({
        ok,
        status,
        json: () => Promise.resolve(body),
        text: () =>
          Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
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
  process.env.PHRASES_SECRET = PHRASES_SECRET;
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
    const data = decodeBody(res) as { version: string; phrases: PhraseMap };
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
  test("resolves users/<u>/<e>/phrasesVersion and returns just { version } (no payload)", async () => {
    mockFetch([{ url: /users\/alice\/myExp\/phrasesVersion/, body: "1.5" }]);

    const res = await handler(makeGetEvent({ pinned: "alice/myExp" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "1.5" });

    const fetchedUrls: string[] = (
      global as unknown as { fetch: jest.Mock }
    ).fetch.mock.calls.map(([url]: [string]) => url);
    expect(fetchedUrls.some((u) => u.includes("phrasesVersions"))).toBe(false);
  });

  test("returns 404 when no pinned version stored", async () => {
    mockFetch([{ url: /users\/alice\/noPin\/phrasesVersion/, body: null }]);

    const res = await handler(makeGetEvent({ pinned: "alice/noPin" }));
    expect(res.statusCode).toBe(404);
  });
});

// ── GET /phrases?v=<version> ───────────────────────────────────────────────────

describe("GET /phrases?v=<version>", () => {
  test("returns the gzipped { version, phrases } payload for that exact version", async () => {
    mockFetch([
      { url: /phrasesVersions\/2_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(makeGetEvent({ v: "2.0" }));

    expect(res.statusCode).toBe(200);
    expect(res.isBase64Encoded).toBe(true);
    const data = decodeBody(res) as { version: string; phrases: PhraseMap };
    expect(data.version).toBe("2.0");
    expect(data.phrases).toEqual(SAMPLE_PHRASES);

    // Resolved directly by version — never reads currentVersion or a pin.
    const fetchedUrls: string[] = (
      global as unknown as { fetch: jest.Mock }
    ).fetch.mock.calls.map(([url]: [string]) => url);
    expect(fetchedUrls.some((u) => u.includes("currentVersion"))).toBe(false);
  });

  test("returns 404 when that version has no phrases", async () => {
    mockFetch([{ url: /phrasesVersions\/9_dot_9\/phrases/, body: null }]);

    const res = await handler(makeGetEvent({ v: "9.9" }));
    expect(res.statusCode).toBe(404);
  });
});

// ── Cache directives ───────────────────────────────────────────────────────────

describe("GET /phrases — cache directives", () => {
  const cacheOf = (res: unknown) =>
    (res as { headers?: Record<string, string> }).headers?.["Cache-Control"];
  const cdnCacheOf = (res: unknown) =>
    (res as { headers?: Record<string, string> }).headers?.[
      "Netlify-CDN-Cache-Control"
    ];

  test("?versionOnly=1 is never cached", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: "2.0" }]);
    const res = await handler(makeGetEvent({ versionOnly: "1" }));
    expect(cacheOf(res)).toBe("no-store");
    expect(cdnCacheOf(res)).toBe("no-store");
  });

  test("?v=<version> is cached immutably", async () => {
    mockFetch([
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);
    const res = await handler(makeGetEvent({ v: "1.0" }));
    expect(res.statusCode).toBe(200);
    expect(cacheOf(res)).toBe("public, max-age=31536000, immutable");
    expect(cdnCacheOf(res)).toBe("public, max-age=31536000, immutable");
  });

  test("?pinned resolves to { version } and is never cached", async () => {
    mockFetch([{ url: /users\/alice\/myExp\/phrasesVersion/, body: "1.5" }]);
    const res = await handler(makeGetEvent({ pinned: "alice/myExp" }));
    expect(cacheOf(res)).toBe("no-store");
  });

  test("bare current uses a short, revalidating window", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);
    const res = await handler(makeGetEvent());
    expect(cacheOf(res)).toBe(
      "public, max-age=60, stale-while-revalidate=86400"
    );
  });
});

// ── Failure handling ───────────────────────────────────────────────────────────

describe("GET /phrases — failure handling", () => {
  const cacheOf = (res: unknown) =>
    (res as { headers?: Record<string, string> }).headers?.["Cache-Control"];

  test("a Firebase failure returns a controlled, uncached 503 (not an opaque 502)", async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() =>
      Promise.reject(new Error("Firebase unreachable"))
    );

    const res = await handler(makeGetEvent());

    expect(res.statusCode).toBe(503);
    expect(cacheOf(res)).toBe("no-store");
    expect(JSON.parse(res.body).error).toMatch(/temporarily unavailable/i);
  });

  test("a Firebase write non-2xx still yields the explicit 502 with the error body", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
      {
        url: /phrasesVersions\/1_dot_1\/phrases/,
        body: "permission denied",
        ok: false,
        status: 401,
      },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body).error).toMatch(/permission denied/i);
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

// ── POST /phrases { action: "translate" } + nonCyanPhrases ───────────────────

describe("POST /phrases { action: 'translate' } — nonCyanPhrases", () => {
  test("non-cyan value that differs from Firebase is stored in a new version", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: {},
        colorMask: {},
        sentValues: {},
        nonCyanPhrases: { hello: { fr: "Salut" } },
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.newVersion).toBe("1.1");

    const puts = capturedPuts();
    expect(puts.some((p) => p.url.includes("phrasesVersions/1_dot_1/phrases"))).toBe(true);
    const phrasesPut = puts.find((p) => p.url.includes("phrasesVersions/1_dot_1/phrases"));
    expect((phrasesPut?.body as Record<string, Record<string, string>>).hello?.fr).toBe("Salut");
  });

  test("non-cyan value identical to Firebase creates no new version", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: {},
        colorMask: {},
        sentValues: {},
        nonCyanPhrases: { hello: { fr: "Bonjour" } },
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.newVersion).toBe("1.0");
    expect(capturedPuts()).toHaveLength(0);
  });

  test("non-cyan update skips keys already in changedPhrases", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: {},
        sentValues: {},
        nonCyanPhrases: { hello: { fr: "Salut" } },
        currentVersion: "1.0",
      })
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.translatedRows.hello?.fr).toBeUndefined();
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
