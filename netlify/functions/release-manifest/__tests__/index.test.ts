import { handler } from "../index";
import type { ManifestEntry } from "../types";

const FIREBASE_DB = "firebase-db-secret";

const SAMPLE_ENTRY: ManifestEntry = {
  engineVersion: "2026.6.19",
  glossaryVersion: "4.2",
  phrasesVersion: "3.1",
  gitSha: "abc1234",
  changelog: "Initial release manifest support.",
};

function makeGetEvent(queryStringParameters: Record<string, string> = {}) {
  return {
    httpMethod: "GET",
    headers: {},
    body: null,
    queryStringParameters,
  };
}

function makePostEvent(
  body: unknown,
  headers: Record<string, string> = {}
) {
  return {
    httpMethod: "POST",
    headers,
    body: JSON.stringify(body),
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

beforeEach(() => {
  process.env.FIREBASE_DB = FIREBASE_DB;
  jest.resetAllMocks();
});

// ── GET /release-manifest?release=<id> ─────────────────────────────────────────

describe("GET /release-manifest?release=<id>", () => {
  test("returns the manifest entry for a published release, cached immutably", async () => {
    mockFetch([
      { url: /releaseManifest\/entries\/2026-06-19/, body: SAMPLE_ENTRY },
    ]);

    const res = await handler(makeGetEvent({ release: "2026-06-19" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual(SAMPLE_ENTRY);
    expect(res.headers?.["Cache-Control"]).toBe(
      "public, max-age=31536000, immutable"
    );
    expect(res.headers?.["Netlify-CDN-Cache-Control"]).toBe(
      "public, max-age=31536000, immutable"
    );
  });

  test("returns a controlled 404 (not a server error) for an unknown release", async () => {
    mockFetch([
      { url: /releaseManifest\/entries\/not-a-real-release/, body: null },
    ]);

    const res = await handler(makeGetEvent({ release: "not-a-real-release" }));

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body).error).toBeDefined();
  });
});

// ── GET /release-manifest?latest=1 ──────────────────────────────────────────────

describe("GET /release-manifest?latest=1", () => {
  test("returns the current latest release id, never cached", async () => {
    mockFetch([{ url: /releaseManifest\/latest/, body: "2026-06-19" }]);

    const res = await handler(makeGetEvent({ latest: "1" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ release: "2026-06-19" });
    expect(res.headers?.["Cache-Control"]).toBe("no-store");
    expect(res.headers?.["Netlify-CDN-Cache-Control"]).toBe("no-store");
  });
});

// ── GET /release-manifest?list=1 ────────────────────────────────────────────────

describe("GET /release-manifest?list=1", () => {
  test("returns releases newest-first with changelog, never cached", async () => {
    mockFetch([
      {
        url: /releaseManifest\/entries/,
        body: {
          "2026-06-19": { ...SAMPLE_ENTRY, changelog: "June release." },
          "2026-05-01": { ...SAMPLE_ENTRY, changelog: "May release." },
          "2026-07-08": { ...SAMPLE_ENTRY, changelog: "July release." },
        },
      },
    ]);

    const res = await handler(makeGetEvent({ list: "1" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([
      { release: "2026-07-08", changelog: "July release." },
      { release: "2026-06-19", changelog: "June release." },
      { release: "2026-05-01", changelog: "May release." },
    ]);
    expect(res.headers?.["Cache-Control"]).toBe("no-store");
    expect(res.headers?.["Netlify-CDN-Cache-Control"]).toBe("no-store");
  });
});

// ── POST /release-manifest (publish a release) ──────────────────────────────────

describe("POST /release-manifest — secret gate", () => {
  test("rejects a request with no secret header", async () => {
    const res = await handler(
      makePostEvent({ release: "2026-06-19", entry: SAMPLE_ENTRY })
    );

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error).toBeDefined();
  });

  test("rejects a request with the wrong secret", async () => {
    process.env.RELEASE_MANIFEST_SECRET = "correct-secret";

    const res = await handler(
      makePostEvent(
        { release: "2026-06-19", entry: SAMPLE_ENTRY },
        { "x-release-manifest-secret": "wrong-secret" }
      )
    );

    expect(res.statusCode).toBe(401);
  });
});

describe("POST /release-manifest — publish a release", () => {
  beforeEach(() => {
    process.env.RELEASE_MANIFEST_SECRET = "correct-secret";
  });

  test("writes the entry and advances latest in a single atomic call", async () => {
    mockFetch([{ url: /releaseManifest\.json/, body: null }]);

    const res = await handler(
      makePostEvent(
        { release: "2026-06-19", entry: SAMPLE_ENTRY },
        { "x-release-manifest-secret": "correct-secret" }
      )
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({
      release: "2026-06-19",
      entry: SAMPLE_ENTRY,
    });

    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/releaseManifest\.json/);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      "entries/2026-06-19": SAMPLE_ENTRY,
      latest: "2026-06-19",
    });
  });

  test("rejects a release id that is missing", async () => {
    mockFetch([{ url: /releaseManifest\.json/, body: null }]);

    const res = await handler(
      makePostEvent(
        { entry: SAMPLE_ENTRY },
        { "x-release-manifest-secret": "correct-secret" }
      )
    );

    expect(res.statusCode).toBe(400);
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("rejects an entry missing a required field", async () => {
    mockFetch([{ url: /releaseManifest\.json/, body: null }]);
    const { changelog, ...incompleteEntry } = SAMPLE_ENTRY;

    const res = await handler(
      makePostEvent(
        { release: "2026-06-19", entry: incompleteEntry },
        { "x-release-manifest-secret": "correct-secret" }
      )
    );

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/entry/i);
    const fetchMock = (global as unknown as { fetch: jest.Mock }).fetch;
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ── Failure handling ───────────────────────────────────────────────────────────

describe("GET /release-manifest — failure handling", () => {
  test("a Firebase failure returns a controlled, uncached 503 (not an opaque 502)", async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() =>
      Promise.reject(new Error("Firebase unreachable"))
    );

    const res = await handler(makeGetEvent({ release: "2026-06-19" }));

    expect(res.statusCode).toBe(503);
    expect(res.headers?.["Cache-Control"]).toBe("no-store");
    expect(JSON.parse(res.body).error).toMatch(/temporarily unavailable/i);
  });
});

describe("POST /release-manifest — failure handling", () => {
  beforeEach(() => {
    process.env.RELEASE_MANIFEST_SECRET = "correct-secret";
  });

  test("a failed Firebase write is reported loudly, not swallowed as success", async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve("internal error"),
      })
    );

    const res = await handler(
      makePostEvent(
        { release: "2026-06-19", entry: SAMPLE_ENTRY },
        { "x-release-manifest-secret": "correct-secret" }
      )
    );

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body).error).toMatch(/2026-06-19/);
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
