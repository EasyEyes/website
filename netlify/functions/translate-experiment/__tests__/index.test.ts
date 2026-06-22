import { makeHandler } from "../index";

const noSleep = () => Promise.resolve();

function makeDeeplFetch(
  responses: Array<{ status: number; body?: unknown }>
): jest.Mock {
  let callCount = 0;
  return jest.fn(() => {
    const resp = responses[Math.min(callCount++, responses.length - 1)];
    return Promise.resolve({
      ok: resp.status >= 200 && resp.status < 300,
      status: resp.status,
      json: () => Promise.resolve(resp.body),
    });
  });
}

function deeplOk(texts: string[]): { status: number; body: unknown } {
  return {
    status: 200,
    body: { translations: texts.map((t) => ({ text: t })) },
  };
}

function makeEvent(body: unknown): { httpMethod: string; body: string } {
  return { httpMethod: "POST", body: JSON.stringify(body) };
}

describe("translate-experiment — well-formed request", () => {
  test("returns 200 with translations in same order and count as input", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour", "Au revoir"])]);
    const handler = makeHandler({ deeplFetch, sleep: noSleep, apiKey: "dkey" });

    const res = await handler(makeEvent({ texts: ["Hello", "Goodbye"], targetLang: "fr" }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.translations).toEqual(["Bonjour", "Au revoir"]);
  });
});

describe("translate-experiment — missing texts", () => {
  test("missing texts field → 400", async () => {
    const handler = makeHandler({ deeplFetch: jest.fn(), sleep: noSleep, apiKey: "dkey" });

    const res = await handler(makeEvent({ targetLang: "fr" }));

    expect(res.statusCode).toBe(400);
  });
});

describe("translate-experiment — missing targetLang", () => {
  test("missing targetLang field → 400", async () => {
    const handler = makeHandler({ deeplFetch: jest.fn(), sleep: noSleep, apiKey: "dkey" });

    const res = await handler(makeEvent({ texts: ["Hello"] }));

    expect(res.statusCode).toBe(400);
  });
});

describe("translate-experiment — 429 retry", () => {
  test("DeepL 429 on first call → retries and returns 200", async () => {
    const deeplFetch = makeDeeplFetch([
      { status: 429, body: null },
      deeplOk(["Hola"]),
    ]);
    const sleep = jest.fn(() => Promise.resolve());
    const handler = makeHandler({ deeplFetch, sleep, apiKey: "dkey" });

    const res = await handler(makeEvent({ texts: ["Hello"], targetLang: "es" }));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).translations).toEqual(["Hola"]);
    expect(deeplFetch).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });
});

describe("translate-experiment — non-retryable DeepL error", () => {
  test("DeepL 500 → function returns 500", async () => {
    const deeplFetch = makeDeeplFetch([{ status: 500, body: null }]);
    const handler = makeHandler({ deeplFetch, sleep: noSleep, apiKey: "dkey" });

    const res = await handler(makeEvent({ texts: ["Hello"], targetLang: "fr" }));

    expect(res.statusCode).toBe(500);
  });
});

describe("translate-experiment — API key security", () => {
  test("API key is sent in Authorization header to DeepL", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const handler = makeHandler({ deeplFetch, sleep: noSleep, apiKey: "secret-key-abc" });

    await handler(makeEvent({ texts: ["Hello"], targetLang: "fr" }));

    const [, init] = deeplFetch.mock.calls[0];
    expect(init.headers["Authorization"]).toBe("DeepL-Auth-Key secret-key-abc");
  });

  test("API key does not appear in response body or headers", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const handler = makeHandler({ deeplFetch, sleep: noSleep, apiKey: "secret-key-abc" });

    const res = await handler(makeEvent({ texts: ["Hello"], targetLang: "fr" }));

    expect(res.body).not.toContain("secret-key-abc");
    const headerValues = Object.values(res.headers ?? {}).join(" ");
    expect(headerValues).not.toContain("secret-key-abc");
  });
});
