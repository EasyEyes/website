import {
  DeepLTranslationError,
  GoogleTranslationError,
  translateCells,
} from "../translateCells";
import type { FetchLike, TranslateDeps } from "../types";

const noSleep = () => Promise.resolve();

function makeDeeplFetch(
  responses: Array<{ status: number; body?: unknown }>,
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

function makeGoogleFetch(body: unknown): jest.Mock {
  return jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    }),
  );
}

function deeplOk(texts: string[]): { status: number; body: unknown } {
  return {
    status: 200,
    body: { translations: texts.map((t) => ({ text: `[${t}]` })) },
  };
}

describe("translateCells — hex colorMask (apps-script format)", () => {
  test("non-white → passthrough sentValue, no fetch calls", async () => {
    const deeplFetch = jest.fn();
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#00ffff" } },
      { k1: { fr: "Bonjour" } },
      deps,
    );

    expect(result.k1.fr).toBe("Bonjour");
    expect(deeplFetch).not.toHaveBeenCalled();
  });

  test("#ffffff → deeplFetch called", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    expect(result.k1.fr).toBe("[Bonjour]");
    expect(deeplFetch).toHaveBeenCalledTimes(1);
  });
});

describe("translateCells — cyan cell passthrough", () => {
  test("#00ffff → returns sentValue, no fetch calls made", async () => {
    const deeplFetch = jest.fn();
    const googleFetch = jest.fn();
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: googleFetch as unknown as FetchLike,
      googleApiKey: "gkey",
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#00ffff" } },
      { k1: { fr: "Bonjour" } },
      deps,
    );

    expect(result.k1.fr).toBe("Bonjour");
    expect(deeplFetch).not.toHaveBeenCalled();
    expect(googleFetch).not.toHaveBeenCalled();
  });
});

describe("translateCells — DeepL basic path", () => {
  test("white non-kn cell → deeplFetch called on api.deepl.com/v2/translate", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["Hello"])]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "prokey123",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    expect(result.k1.fr).toBe("[Hello]");
    expect(result.k1.en).toBe("Hello");
    const [url, init] = deeplFetch.mock.calls[0];
    expect(url).toContain("api.deepl.com/v2/translate");
    expect(JSON.parse(init.body).target_lang).toBe("FR");
  });
});

describe("translateCells — kn + googleApiKey", () => {
  test("kn + googleApiKey → googleFetch called, deeplFetch not called", async () => {
    const deeplFetch = jest.fn();
    const googleFetch = makeGoogleFetch({
      data: { translations: [{ translatedText: "ಹಲೋ" }] },
    });
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: googleFetch as unknown as FetchLike,
      googleApiKey: "gkey",
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { kn: "#ffffff" } },
      { k1: { kn: "" } },
      deps,
    );

    expect(result.k1.kn).toBe("ಹಲೋ");
    expect(googleFetch).toHaveBeenCalledTimes(1);
    expect(deeplFetch).not.toHaveBeenCalled();
  });

  test("normalizes a Google network exception", async () => {
    const deps: TranslateDeps = {
      deeplFetch: jest.fn() as unknown as FetchLike,
      googleFetch: jest
        .fn()
        .mockRejectedValue(new Error("socket closed")) as unknown as FetchLike,
      googleApiKey: "gkey",
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello" },
        { k1: { kn: "#ffffff" } },
        { k1: { kn: "" } },
        deps,
      ),
    ).rejects.toEqual(
      expect.objectContaining<Partial<GoogleTranslationError>>({
        name: "GoogleTranslationError",
        status: null,
      }),
    );
  });

  test("normalizes a malformed successful Google response", async () => {
    const deps: TranslateDeps = {
      deeplFetch: jest.fn() as unknown as FetchLike,
      googleFetch: makeGoogleFetch({
        data: { translations: [] },
      }) as unknown as FetchLike,
      googleApiKey: "gkey",
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello" },
        { k1: { kn: "#ffffff" } },
        { k1: { kn: "" } },
        deps,
      ),
    ).rejects.toEqual(
      expect.objectContaining<Partial<GoogleTranslationError>>({
        name: "GoogleTranslationError",
        status: 200,
      }),
    );
  });

  test("batches 51 Kannada phrases into two Google requests", async () => {
    const changedPhrases = Object.fromEntries(
      Array.from({ length: 51 }, (_, index) => [`k${index}`, `Text ${index}`]),
    );
    const colorMask = Object.fromEntries(
      Object.keys(changedPhrases).map((key) => [key, { kn: "#ffffff" }]),
    );
    const sentValues = Object.fromEntries(
      Object.keys(changedPhrases).map((key) => [key, { kn: "" }]),
    );
    const googleFetch = jest.fn((url, init) => {
      const texts = JSON.parse(init.body).q as string[];
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            data: {
              translations: texts.map((text) => ({ translatedText: text })),
            },
          }),
      });
    });

    await translateCells(changedPhrases, colorMask, sentValues, {
      deeplFetch: jest.fn() as unknown as FetchLike,
      googleFetch: googleFetch as unknown as FetchLike,
      googleApiKey: "gkey",
      deeplApiKey: "dkey",
      sleep: noSleep,
    });

    expect(googleFetch).toHaveBeenCalledTimes(2);
    expect(
      googleFetch.mock.calls.map(([, init]) => JSON.parse(init.body).q.length),
    ).toEqual([50, 1]);
  });
});

describe("translateCells — kn without googleApiKey", () => {
  test("kn + no googleApiKey → passthrough sentValue, no fetch calls", async () => {
    const deeplFetch = jest.fn();
    const googleFetch = jest.fn();
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: googleFetch as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { kn: "#ffffff" } },
      { k1: { kn: "existing_kn" } },
      deps,
    );

    expect(result.k1.kn).toBe("existing_kn");
    expect(deeplFetch).not.toHaveBeenCalled();
    expect(googleFetch).not.toHaveBeenCalled();
  });
});

describe("translateCells — cyan-skip precedence", () => {
  test("cyan kn cell → passthrough even when googleApiKey present", async () => {
    const googleFetch = jest.fn();
    const deps: TranslateDeps = {
      deeplFetch: jest.fn() as unknown as FetchLike,
      googleFetch: googleFetch as unknown as FetchLike,
      googleApiKey: "gkey",
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { kn: "#00ffff" } },
      { k1: { kn: "ಹಲೋ" } },
      deps,
    );

    expect(result.k1.kn).toBe("ಹಲೋ");
    expect(googleFetch).not.toHaveBeenCalled();
  });
});

describe("translateCells — DeepL code mapping", () => {
  test("zh-CN → target_lang ZH-HANS in DeepL request", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["你好"])]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await translateCells(
      { k1: "Hello" },
      { k1: { "zh-CN": "#ffffff" } },
      { k1: { "zh-CN": "" } },
      deps,
    );

    const body = JSON.parse(deeplFetch.mock.calls[0][1].body);
    expect(body.target_lang).toBe("ZH-HANS");
  });

  test("no → NB and pt-pt → PT-PT in DeepL requests", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["hei"]), deeplOk(["Olá"])]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await translateCells(
      { k1: "Hello" },
      { k1: { no: "#ffffff", "pt-pt": "#ffffff" } },
      { k1: { no: "", "pt-pt": "" } },
      deps,
    );

    const calledTargets = deeplFetch.mock.calls.map(
      ([, init]: [string, { body: string }]) =>
        JSON.parse(init.body).target_lang,
    );
    expect(calledTargets).toContain("NB");
    expect(calledTargets).toContain("PT-PT");
  });
});

describe("translateCells — 50-text batching", () => {
  test("51 phrases for one language → 2 deeplFetch calls (50 + 1)", async () => {
    const phrases: Record<string, string> = {};
    const mask: Record<string, Record<string, string>> = {};
    const sent: Record<string, Record<string, string>> = {};
    for (let i = 0; i < 51; i++) {
      phrases[`k${i}`] = `text ${i}`;
      mask[`k${i}`] = { fr: "#ffffff" };
      sent[`k${i}`] = { fr: "" };
    }

    const deeplFetch = makeDeeplFetch([
      {
        status: 200,
        body: { translations: Array(50).fill({ text: "translated" }) },
      },
      { status: 200, body: { translations: [{ text: "translated" }] } },
    ]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await translateCells(phrases, mask, sent, deps);

    expect(deeplFetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(deeplFetch.mock.calls[0][1].body).text).toHaveLength(50);
    expect(JSON.parse(deeplFetch.mock.calls[1][1].body).text).toHaveLength(1);
  });
});

describe("translateCells — language-parallel fan-out", () => {
  test("multiple languages → all appear in result, deeplFetch called once per language", async () => {
    const deeplFetch = makeDeeplFetch([
      deeplOk(["Bonjour"]),
      deeplOk(["Hola"]),
    ]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#ffffff", es: "#ffffff" } },
      { k1: { fr: "", es: "" } },
      deps,
    );

    expect(result.k1.fr).toBeDefined();
    expect(result.k1.es).toBeDefined();
    expect(deeplFetch).toHaveBeenCalledTimes(2);
  });
});

describe("translateCells — 429 retry", () => {
  test("429 on first call → retries and returns translation from second call", async () => {
    const deeplFetch = makeDeeplFetch([
      { status: 429, body: null },
      deeplOk(["Hello"]),
    ]);
    const sleep = jest.fn(() => Promise.resolve());
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    expect(result.k1.fr).toBe("[Hello]");
    expect(deeplFetch).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });
});

describe("translateCells — 456 retry", () => {
  test("456 on first call → retries and returns translation from second call", async () => {
    const deeplFetch = makeDeeplFetch([
      { status: 456, body: null },
      deeplOk(["Hello"]),
    ]);
    const sleep = jest.fn(() => Promise.resolve());
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep,
    };

    const result = await translateCells(
      { k1: "Hello" },
      { k1: { es: "#ffffff" } },
      { k1: { es: "" } },
      deps,
    );

    expect(result.k1.es).toBe("[Hello]");
    expect(deeplFetch).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });
});

describe("translateCells — Free key (:fx suffix)", () => {
  test(":fx key → api-free.deepl.com base URL", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "some-key:fx",
      sleep: noSleep,
    };

    await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    expect(deeplFetch.mock.calls[0][0]).toContain("api-free.deepl.com");
  });
});

describe("translateCells — Pro key (no :fx suffix)", () => {
  test("key without :fx → api.deepl.com (not api-free)", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["Bonjour"])]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "prokey123",
      sleep: noSleep,
    };

    await translateCells(
      { k1: "Hello" },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    const url: string = deeplFetch.mock.calls[0][0];
    expect(url).toContain("api.deepl.com");
    expect(url).not.toContain("api-free.deepl.com");
  });
});

describe("translateCells — HTML tag protection", () => {
  test("span-wrapped icon → tag intact and correctly positioned after translation", async () => {
    const deeplFetch = makeDeeplFetch([deeplOk(["▼"])]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: '<span style="font-style: normal">▼</span>' },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    expect(result.k1.fr).toBe('<span style="font-style: normal">[▼]</span>');
    // Only the wrapped text is sent to DeepL, never the tag markup.
    expect(JSON.parse(deeplFetch.mock.calls[0][1].body).text).toEqual(["▼"]);
  });

  test("cell with multiple tags → each translated segment rejoined in place, tags untouched", async () => {
    const deeplFetch = makeDeeplFetch([
      deeplOk(["See ", "this citation", " for details."]),
    ]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      {
        k1: 'See <a href="https://example.com/citation">this citation</a> for details.',
      },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    expect(result.k1.fr).toBe(
      '[See ]<a href="https://example.com/citation">[this citation]</a>[ for details.]',
    );
  });
});

describe("translateCells — emoji protection", () => {
  test("sends emoji as ignored XML and restores them after DeepL repositions them", async () => {
    const deeplFetch = makeDeeplFetch([
      {
        status: 200,
        body: {
          translations: [
            {
              text: 'Arrêter avec <ee-icon id="1">❤️</ee-icon> puis <ee-icon id="0">🚫</ee-icon>.',
            },
          ],
        },
      },
    ]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    const result = await translateCells(
      { k1: "Stop with 🚫, then ❤️." },
      { k1: { fr: "#ffffff" } },
      { k1: { fr: "" } },
      deps,
    );

    const request = JSON.parse(deeplFetch.mock.calls[0][1].body);
    expect(request.text).toEqual([
      'Stop with <ee-icon id="0">🚫</ee-icon>, then <ee-icon id="1">❤️</ee-icon>.',
    ]);
    expect(request).toMatchObject({
      tag_handling: "xml",
      tag_handling_version: "v2",
      ignore_tags: ["ee-icon"],
    });
    expect(result.k1.fr).toBe("Arrêter avec ❤️ puis 🚫.");
  });
});

describe("translateCells — unmapped language failure", () => {
  test("DeepL 400 for unknown lang code → rejects instead of passing through the existing translation", async () => {
    const deeplFetch = makeDeeplFetch([{ status: 400, body: null }]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello" },
        { k1: { xx: "#ffffff" } },
        { k1: { xx: "original_value" } },
        deps,
      ),
    ).rejects.toEqual(new DeepLTranslationError(400));
  });
});

describe("translateCells — DeepL authorization failure", () => {
  test("DeepL 403 rejects instead of passing through the existing translation", async () => {
    const deeplFetch = makeDeeplFetch([{ status: 403, body: null }]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "invalid-key",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello updated" },
        { k1: { fr: "#ffffff" } },
        { k1: { fr: "Bonjour" } },
        deps,
      ),
    ).rejects.toEqual(new DeepLTranslationError(403));
  });

  test("DeepL 500 rejects instead of passing through the existing translation", async () => {
    const deeplFetch = makeDeeplFetch([{ status: 500, body: null }]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello updated" },
        { k1: { fr: "#ffffff" } },
        { k1: { fr: "Bonjour" } },
        deps,
      ),
    ).rejects.toEqual(new DeepLTranslationError(500));
  });

  test("exhausted DeepL retries reject instead of passing through the existing translation", async () => {
    const deeplFetch = makeDeeplFetch([
      { status: 429, body: null },
      { status: 429, body: null },
      { status: 429, body: null },
    ]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello updated" },
        { k1: { fr: "#ffffff" } },
        { k1: { fr: "Bonjour" } },
        deps,
      ),
    ).rejects.toEqual(new DeepLTranslationError(429));
  });

  test("a DeepL network failure rejects as a fatal translation error", async () => {
    const deps: TranslateDeps = {
      deeplFetch: jest
        .fn()
        .mockRejectedValue(
          new Error("connection reset"),
        ) as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello updated" },
        { k1: { fr: "#ffffff" } },
        { k1: { fr: "Bonjour" } },
        deps,
      ),
    ).rejects.toEqual(new DeepLTranslationError(null, "connection reset"));
  });

  test("a malformed successful DeepL response rejects as a fatal translation error", async () => {
    const deeplFetch = makeDeeplFetch([{ status: 200, body: { nope: true } }]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello updated" },
        { k1: { fr: "#ffffff" } },
        { k1: { fr: "Bonjour" } },
        deps,
      ),
    ).rejects.toEqual(
      new DeepLTranslationError(200, "Malformed DeepL response"),
    );
  });

  test("a DeepL response with the wrong translation count is fatal", async () => {
    const deeplFetch = makeDeeplFetch([
      { status: 200, body: { translations: [] } },
    ]);
    const deps: TranslateDeps = {
      deeplFetch: deeplFetch as unknown as FetchLike,
      googleFetch: jest.fn() as unknown as FetchLike,
      googleApiKey: undefined,
      deeplApiKey: "dkey",
      sleep: noSleep,
    };

    await expect(
      translateCells(
        { k1: "Hello updated" },
        { k1: { fr: "#ffffff" } },
        { k1: { fr: "Bonjour" } },
        deps,
      ),
    ).rejects.toEqual(
      new DeepLTranslationError(200, "Malformed DeepL response"),
    );
  });
});
