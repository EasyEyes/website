import { gunzipSync } from "zlib";
import { handler } from "../index";
import type { PhraseMap } from "../types";

const FIREBASE_DB = "firebase-db-secret";
const PHRASES_SECRET = "phrases-secret";

// Gzipped responders return a base64 body; decode it back to the JSON payload.
function decodeBody(res: { body: string; isBase64Encoded?: boolean }): unknown {
  if (res.isBase64Encoded) {
    return JSON.parse(
      gunzipSync(Buffer.from(res.body, "base64")).toString("utf-8"),
    );
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
  const storedValues = new Map<string, unknown>();
  (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(
    (url: string, init?: RequestInit) => {
      const match = responses.find((r) =>
        r.url instanceof RegExp
          ? r.url.test(url)
          : url.includes(r.url as string),
      );
      const ok = match?.ok ?? true;
      const status = match?.status ?? 200;
      if (init?.method === "PUT" && ok) {
        storedValues.set(url, JSON.parse((init.body as string) ?? "null"));
      }
      const body = storedValues.has(url)
        ? storedValues.get(url)
        : match?.body ?? null;
      return Promise.resolve({
        ok,
        status,
        json: () => Promise.resolve(body),
        text: () =>
          Promise.resolve(
            typeof body === "string" ? body : JSON.stringify(body),
          ),
      });
    },
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
afterEach(() => {
  jest.restoreAllMocks();
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
  test("returns the current version and its publication date", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "2.3" },
      {
        url: /phrasesVersions\/2_dot_3\/publishedAt/,
        body: "2026-08-08T12:00:00.000Z",
      },
    ]);

    const res = await handler(makeGetEvent({ versionOnly: "1" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      version: "2.3",
      publishedAt: "2026-08-08T12:00:00.000Z",
    });
  });

  test("returns version metadata without reading phrases data", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: "2.3" }]);

    const res = await handler(makeGetEvent({ versionOnly: "1" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      version: "2.3",
      publishedAt: null,
    });

    const fetchedUrls: string[] = (
      global as unknown as { fetch: jest.Mock }
    ).fetch.mock.calls.map(([url]: [string]) => url);
    expect(fetchedUrls.some((u) => u.includes("/phrases.json"))).toBe(false);
  });

  test("returns { version: null } when Firebase has no currentVersion", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: null }]);

    const res = await handler(makeGetEvent({ versionOnly: "1" }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      version: null,
      publishedAt: null,
    });
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
      "public, max-age=60, stale-while-revalidate=86400",
    );
  });
});

// ── Failure handling ───────────────────────────────────────────────────────────

describe("GET /phrases — failure handling", () => {
  const cacheOf = (res: unknown) =>
    (res as { headers?: Record<string, string> }).headers?.["Cache-Control"];

  test("a Firebase failure returns a controlled, uncached 503 (not an opaque 502)", async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() =>
      Promise.reject(new Error("Firebase unreachable")),
    );

    const res = await handler(makeGetEvent());

    expect(res.statusCode).toBe(503);
    expect(cacheOf(res)).toBe("no-store");
    expect(JSON.parse(res.body).error).toMatch(/temporarily unavailable/i);
  });

  test("a Firebase write non-2xx yields a safe explicit 502", async () => {
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
      }),
    );

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body)).toMatchObject({
      code: "FIREBASE_PHRASES_WRITE_FAILED",
      fatal: true,
    });
    expect(res.body).not.toContain("permission denied");
  });
});

// ── PUT /phrases ───────────────────────────────────────────────────────────────

describe("PUT /phrases — version pinning", () => {
  test("writes currentVersion to users/<u>/<e>/phrasesVersion and returns { version }", async () => {
    mockFetch([{ url: /phrases\/currentVersion/, body: "1.7" }]);

    const res = await handler(
      makePutEvent({ username: "alice", experimentName: "myExp" }),
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ version: "1.7" });

    const puts = capturedPuts();
    expect(
      puts.some(
        (p) =>
          p.url.includes("/users/alice/myExp/phrasesVersion") &&
          p.body === "1.7",
      ),
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
      }),
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
      makePostEvent({ action: "diff", english: { a: "A", b: "B" } }),
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
      }),
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
      }),
    );

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /phrases { action: 'translate' } — happy path", () => {
  test("replays a completed operation batch without publishing another version", async () => {
    mockFetch([
      { url: /phrasesOperations\//, body: null },
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);
    const event = makePostEvent({
      action: "translate",
      changedPhrases: { hello: "Hello updated" },
      colorMask: {},
      sentValues: {},
      currentVersion: "1.0",
      operationId: "123e4567-e89b-42d3-a456-426614174000",
      batchNumber: 1,
      totalBatches: 2,
      cellCount: 1,
    });

    const first = await handler(event);
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    await fetchMock(
      "https://easyeyes-compiler-default-rtdb.firebaseio.com/phrases/currentVersion.json?auth=firebase-db-secret",
      { method: "PUT", body: JSON.stringify("1.2") },
    );
    const replayEvent = makePostEvent({
      action: "translate",
      changedPhrases: { hello: "Hello updated" },
      colorMask: {},
      sentValues: { hello: { fr: "partially written value" } },
      currentVersion: "1.2",
      operationId: "123e4567-e89b-42d3-a456-426614174000",
      batchNumber: 1,
      totalBatches: 2,
      cellCount: 1,
    });
    const second = await handler(replayEvent);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(JSON.parse(second.body)).toEqual(JSON.parse(first.body));
    expect(
      capturedPuts().filter(
        (put) =>
          put.url.includes("phrases/currentVersion") && put.body === "1.1",
      ),
    ).toHaveLength(1);
  });

  test("reads the published phrases and current version back before returning success", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation();
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
      {
        url: /phrasesVersions\/1_dot_1\/phrases/,
        body: {
          hello: { en: "Hello updated", fr: "Bonjour" },
          bye: SAMPLE_PHRASES.bye,
        },
      },
    ]);

    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    const writtenValues = new Map<string, unknown>();
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === "PUT") {
        writtenValues.set(url, JSON.parse(init.body as string));
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(JSON.parse(init.body as string)),
          text: () => Promise.resolve(init.body as string),
        });
      }
      if (url.includes("phrasesVersions/1_dot_1/phrases")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              hello: { en: "Hello updated", fr: "Bonjour" },
              bye: SAMPLE_PHRASES.bye,
            }),
          text: () => Promise.resolve(""),
        });
      }
      if (url.includes("phrases/currentVersion")) {
        const currentVersionReads = fetchMock.mock.calls.filter(
          ([calledUrl, calledInit]: [string, RequestInit | undefined]) =>
            calledUrl.includes("phrases/currentVersion") &&
            calledInit?.method !== "PUT",
        ).length;
        const version = currentVersionReads > 1 ? "1.1" : "1.0";
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(version),
          text: () => Promise.resolve(JSON.stringify(version)),
        });
      }
      if (url.includes("phrasesVersions/1_dot_0/phrases")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(SAMPLE_PHRASES),
          text: () => Promise.resolve(JSON.stringify(SAMPLE_PHRASES)),
        });
      }
      if (writtenValues.has(url)) {
        const value = writtenValues.get(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(value),
          text: () => Promise.resolve(JSON.stringify(value)),
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).verified).toBe(true);
    expect(
      fetchMock.mock.calls.some(
        ([url, init]: [string, RequestInit | undefined]) =>
          url.includes("phrasesVersions/1_dot_1/phrases") &&
          init?.method !== "PUT",
      ),
    ).toBe(true);
    expect(logSpy).toHaveBeenCalledWith("[phrases/verification]", {
      event: "firebase_read_after_write",
      path: "phrasesVersions/1_dot_1/phrases",
      attempt: 1,
      maxAttempts: 3,
      outcome: "match",
    });
    expect(logSpy).toHaveBeenCalledWith("[phrases/verification]", {
      event: "firebase_read_after_write",
      path: "phrases/currentVersion",
      attempt: 1,
      maxAttempts: 3,
      outcome: "match",
    });
  });

  test("returns a fatal error when Firebase read-back does not match the write", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    const defaultImplementation = fetchMock.getMockImplementation();
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url.includes("phrasesVersions/1_dot_1/phrases") &&
        init?.method !== "PUT"
      ) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ hello: { en: "Wrong value" } }),
          text: () => Promise.resolve(""),
        });
      }
      return defaultImplementation?.(url, init);
    });

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body)).toMatchObject({
      code: "PERSISTENCE_VERIFICATION_FAILED",
      fatal: true,
    });
    expect(warnSpy).toHaveBeenLastCalledWith("[phrases/verification]", {
      event: "firebase_read_after_write",
      path: "phrasesVersions/1_dot_1/phrases",
      attempt: 3,
      maxAttempts: 3,
      outcome: "mismatch",
    });
  });

  test("stores the publication date with a newly released version", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1786190400000);
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
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(capturedPuts()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: expect.stringContaining("/phrasesVersions/1_dot_1/publishedAt"),
          body: "2026-08-08T12:00:00.000Z",
        }),
      ]),
    );
  });

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
      }),
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.newVersion).toBe("1.1");
    expect(data.translatedRows).toMatchObject({
      hello: { en: "Hello updated" },
    });

    const puts = capturedPuts();
    expect(
      puts.some((p) => p.url.includes("phrasesVersions/1_dot_1/phrases")),
    ).toBe(true);
    expect(
      puts.some(
        (p) => p.url.includes("phrases/currentVersion") && p.body === "1.1",
      ),
    ).toBe(true);
  });

  test("removes phrase keys omitted from the spreadsheet", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: {},
        removedKeys: ["bye"],
        colorMask: {},
        sentValues: {},
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.newVersion).toBe("2.0");

    const phrasesPut = capturedPuts().find((put) =>
      put.url.includes("phrasesVersions/2_dot_0/phrases"),
    );
    expect(phrasesPut).toBeDefined();
    expect(phrasesPut?.body).toEqual({ hello: SAMPLE_PHRASES.hello });
  });

  test("removes languages omitted from the spreadsheet", async () => {
    const phrasesWithRemovedLanguage: PhraseMap = {
      hello: { en: "Hello", fr: "Bonjour", hr: "Pozdrav" },
      bye: { en: "Goodbye", fr: "Au revoir", hr: "Doviđenja" },
    };
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      {
        url: /phrasesVersions\/1_dot_0\/phrases/,
        body: phrasesWithRemovedLanguage,
      },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: {},
        colorMask: {},
        sentValues: {},
        activeLanguages: ["en", "fr"],
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.newVersion).toBe("2.0");

    const phrasesPut = capturedPuts().find((put) =>
      put.url.includes("phrasesVersions/2_dot_0/phrases"),
    );
    expect(phrasesPut?.body).toEqual(SAMPLE_PHRASES);
  });
});

describe("POST /phrases { action: 'translate' } — DeepL failure", () => {
  test("a DeepL 403 returns a fatal structured response and performs no Firebase writes", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
      {
        url: "api.deepl.com/v2/translate",
        body: { message: "Forbidden" },
        ok: false,
        status: 403,
      },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: { hello: { fr: "#ffffff" } },
        sentValues: { hello: { fr: "Bonjour" } },
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body)).toEqual({
      error:
        "DeepL rejected the translation request (status 403). No new phrases version was created.",
      code: "DEEPL_TRANSLATION_FAILED",
      deeplStatus: 403,
      latestVersion: "1.0",
      fatal: true,
    });
    expect(capturedPuts()).toHaveLength(0);
  });

  test("a DeepL 500 returns a fatal structured response and performs no Firebase writes", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
      {
        url: "api.deepl.com/v2/translate",
        body: { message: "Internal error" },
        ok: false,
        status: 500,
      },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: { hello: { fr: "#ffffff" } },
        sentValues: { hello: { fr: "Bonjour" } },
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body)).toEqual({
      error:
        "DeepL rejected the translation request (status 500). No new phrases version was created.",
      code: "DEEPL_TRANSLATION_FAILED",
      deeplStatus: 500,
      latestVersion: "1.0",
      fatal: true,
    });
    expect(capturedPuts()).toHaveLength(0);
  });

  test("a plain-text DeepL failure does not expose provider response text", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
      {
        url: "api.deepl.com/v2/translate",
        body: "upstream unavailable",
        ok: false,
        status: 503,
      },
    ]);

    const res = await handler(
      makePostEvent({
        action: "translate",
        changedPhrases: { hello: "Hello updated" },
        colorMask: { hello: { fr: "#ffffff" } },
        sentValues: { hello: { fr: "Bonjour" } },
        currentVersion: "1.0",
      }),
    );

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body)).toEqual({
      error:
        "DeepL rejected the translation request (status 503). No new phrases version was created.",
      code: "DEEPL_TRANSLATION_FAILED",
      deeplStatus: 503,
      latestVersion: "1.0",
      fatal: true,
    });
    expect(capturedPuts()).toHaveLength(0);
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
      }),
    );

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.newVersion).toBe("1.1");

    const puts = capturedPuts();
    expect(
      puts.some((p) => p.url.includes("phrasesVersions/1_dot_1/phrases")),
    ).toBe(true);
    const phrasesPut = puts.find((p) =>
      p.url.includes("phrasesVersions/1_dot_1/phrases"),
    );
    expect(
      (phrasesPut?.body as Record<string, Record<string, string>>).hello?.fr,
    ).toBe("Salut");
    const matchPut = puts.find((p) =>
      p.url.includes("phraseTranslationMatches/hello/fr"),
    );
    expect(matchPut?.body).toEqual({
      matchedEnglishText: "Hello",
      matchedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
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
      }),
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
      }),
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
      }),
    );

    expect(res.statusCode).toBe(200);
  });
});

describe("POST /phrases { action: 'checkFreshness' }", () => {
  test("returns identifier-keyed freshness independently of request order", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
      {
        url: /phraseTranslationMatches\/bye\/fr/,
        body: {
          matchedEnglishText: "Old goodbye",
          matchedAt: "2026-08-19T10:00:00.000Z",
        },
      },
      {
        url: /phraseTranslationMatches\/hello\/fr/,
        body: {
          matchedEnglishText: "Hello",
          matchedAt: "2026-08-19T10:00:00.000Z",
        },
      },
    ]);

    const res = await handler(
      makePostEvent({
        action: "checkFreshness",
        phrases: [
          {
            phraseName: "bye",
            englishText: "Goodbye",
            languageCodes: ["fr"],
          },
          {
            phraseName: "hello",
            englishText: "Hello",
            languageCodes: ["fr"],
          },
        ],
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      freshness: [
        { phraseName: "bye", languageCode: "fr", fresh: false },
        { phraseName: "hello", languageCode: "fr", fresh: true },
      ],
    });
  });

  test.each([
    ["missing metadata", null],
    ["malformed metadata", { matchedEnglishText: "Hello", matchedAt: "soon" }],
  ])("marks nonblank translations stale for %s", async (_label, metadata) => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
      { url: /phraseTranslationMatches\/hello\/fr/, body: metadata },
    ]);
    const res = await handler(
      makePostEvent({
        action: "checkFreshness",
        phrases: [
          {
            phraseName: "hello",
            englishText: "Hello",
            languageCodes: ["fr"],
          },
        ],
      }),
    );
    expect(JSON.parse(res.body).freshness[0].fresh).toBe(false);
  });

  test("marks a blank translation stale even when metadata matches", async () => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      {
        url: /phrasesVersions\/1_dot_0\/phrases/,
        body: { hello: { en: "Hello", fr: "" } },
      },
      {
        url: /phraseTranslationMatches\/hello\/fr/,
        body: {
          matchedEnglishText: "Hello",
          matchedAt: "2026-08-19T10:00:00.000Z",
        },
      },
    ]);
    const res = await handler(
      makePostEvent({
        action: "checkFreshness",
        phrases: [
          {
            phraseName: "hello",
            englishText: "Hello",
            languageCodes: ["fr"],
          },
        ],
      }),
    );
    expect(JSON.parse(res.body).freshness[0].fresh).toBe(false);
  });

  test.each([
    [
      "duplicate phrases",
      [
        { phraseName: "hello", englishText: "Hello", languageCodes: ["fr"] },
        { phraseName: "hello", englishText: "Hello", languageCodes: ["fr"] },
      ],
    ],
    [
      "duplicate languages",
      [
        {
          phraseName: "hello",
          englishText: "Hello",
          languageCodes: ["fr", "fr"],
        },
      ],
    ],
    [
      "unknown phrase",
      [{ phraseName: "missing", englishText: "Hello", languageCodes: ["fr"] }],
    ],
    [
      "unknown language",
      [{ phraseName: "hello", englishText: "Hello", languageCodes: ["xx"] }],
    ],
  ])("rejects %s", async (_label, phrases) => {
    mockFetch([
      { url: /phrases\/currentVersion/, body: "1.0" },
      { url: /phrasesVersions\/1_dot_0\/phrases/, body: SAMPLE_PHRASES },
    ]);
    const res = await handler(
      makePostEvent({ action: "checkFreshness", phrases }),
    );
    expect(res.statusCode).toBe(400);
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
      "https://easyeyes.app",
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
