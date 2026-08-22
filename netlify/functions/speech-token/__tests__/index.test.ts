import { config, createSpeechTokenHandler } from "../index";

const ORIGIN = "https://run.pavlovia.org";
const ELEVENLABS_API_KEY = "server-only-elevenlabs-key";
const DEEPGRAM_API_KEY = "server-only-deepgram-key";

const event = (
  provider: "elevenlabs" | "deepgram" = "elevenlabs",
  httpMethod = "POST",
  headers: Record<string, string | undefined> = {},
  bodyOverrides: Partial<{
    protocolVersion: number;
    experimentFullPath: string;
    pavloviaSessionToken: string;
  }> = {},
) => ({
  httpMethod,
  headers: {
    origin: ORIGIN,
    "x-nf-client-connection-ip": "203.0.113.5",
    ...headers,
  },
  body: JSON.stringify({
    protocolVersion: 1,
    provider,
    experimentFullPath: "owner/experiment",
    pavloviaSessionToken: "pavlovia-session-token",
    ...bodyOverrides,
  }),
});

const successfulElevenLabsFetch = jest.fn(
  async () =>
    ({
      ok: true,
      status: 200,
      json: async () => ({ token: "sutkn-short-lived" }),
    }) as Response,
);

const contextAccepted = jest.fn(async () => true);

describe("speech-token Netlify function", () => {
  beforeEach(() => {
    successfulElevenLabsFetch.mockClear();
    contextAccepted.mockClear();
  });

  it("issues a no-store ElevenLabs token only for an accepted experiment context", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
    });

    const response = await handler(event());

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      token: "sutkn-short-lived",
      expiresInSeconds: 900,
    });
    expect(response.headers).toMatchObject({
      "Access-Control-Allow-Origin": ORIGIN,
      "Cache-Control": "no-store",
      "Netlify-CDN-Cache-Control": "no-store",
      Vary: "Origin",
    });
    expect(contextAccepted).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "elevenlabs",
        experimentFullPath: "owner/experiment",
      }),
    );
    expect(successfulElevenLabsFetch).toHaveBeenCalledWith(
      "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }),
    );
  });

  it("issues a Deepgram JWT using the provider-reported expiry", async () => {
    const fetchImpl = jest.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            access_token: "deepgram-jwt",
            expires_in: 60,
          }),
        }) as Response,
    );
    const handler = createSpeechTokenHandler({
      fetchImpl: fetchImpl as typeof fetch,
      deepgramApiKey: () => DEEPGRAM_API_KEY,
      verifyExperimentContext: contextAccepted,
    });

    const response = await handler(event("deepgram"));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      token: "deepgram-jwt",
      expiresInSeconds: 60,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.deepgram.com/v1/auth/grant",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
        }),
        body: JSON.stringify({ ttl_seconds: 60 }),
      }),
    );
  });

  it("rejects a context that Pavlovia does not confirm before requesting a provider token", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: jest.fn(async () => false),
    });

    const response = await handler(event());

    expect(response.statusCode).toBe(401);
    expect(successfulElevenLabsFetch).not.toHaveBeenCalled();
  });

  it("requires the expected Pavlovia resource response before issuing a token", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ resources: [], resourceDirectory: "resources" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: "sutkn-short-lived" }),
      } as Response);
    const handler = createSpeechTokenHandler({
      fetchImpl: fetchImpl as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
    });

    expect((await handler(event())).statusCode).toBe(200);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://pavlovia.org/api/v2/experiments/owner%2Fexperiment/resources?token=pavlovia-session-token",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed requests and missing client identity", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
    });
    const malformed = event();
    malformed.body = JSON.stringify({ provider: "elevenlabs" });
    const unidentified = event("elevenlabs", "POST", {
      "x-nf-client-connection-ip": undefined,
    });

    expect((await handler(malformed)).statusCode).toBe(400);
    expect((await handler(unidentified)).statusCode).toBe(403);
    expect(successfulElevenLabsFetch).not.toHaveBeenCalled();
  });

  it("rejects an unsupported client protocol version", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
    });

    const response = await handler(
      event("elevenlabs", "POST", {}, { protocolVersion: 2 }),
    );

    expect(response.statusCode).toBe(400);
    expect(contextAccepted).not.toHaveBeenCalled();
    expect(successfulElevenLabsFetch).not.toHaveBeenCalled();
  });

  it("does not require per-experiment server registration", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
    });

    const response = await handler(
      event("elevenlabs", "POST", {}, { experimentFullPath: "scientist/study" }),
    );

    expect(response.statusCode).toBe(200);
    expect(contextAccepted).toHaveBeenCalledWith(
      expect.objectContaining({ experimentFullPath: "scientist/study" }),
    );
  });

  it("rejects missing and untrusted browser origins before authorization", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
    });

    expect(
      (await handler(event("elevenlabs", "POST", { origin: undefined })))
        .statusCode,
    ).toBe(403);
    expect(
      (
        await handler(
          event("elevenlabs", "POST", {
            origin: "https://attacker.example",
          }),
        )
      ).statusCode,
    ).toBe(403);
    expect(contextAccepted).not.toHaveBeenCalled();
  });

  it("answers CORS preflight without context verification or provider spend", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
    });

    const response = await handler(event("elevenlabs", "OPTIONS"));

    expect(response.statusCode).toBe(204);
    expect(contextAccepted).not.toHaveBeenCalled();
    expect(successfulElevenLabsFetch).not.toHaveBeenCalled();
  });

  it("redacts absent keys and upstream details", async () => {
    const fetchImpl = jest.fn(
      async () =>
        ({
          ok: false,
          status: 401,
          json: async () => ({ detail: "sensitive account detail" }),
        }) as Response,
    );
    const absentHandler = createSpeechTokenHandler({
      fetchImpl: fetchImpl as typeof fetch,
      elevenLabsApiKey: () => undefined,
      verifyExperimentContext: contextAccepted,
    });
    const failedHandler = createSpeechTokenHandler({
      fetchImpl: fetchImpl as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
    });

    expect((await absentHandler(event())).statusCode).toBe(503);
    const failed = await failedHandler(event());
    expect(failed.statusCode).toBe(503);
    expect(failed.body).not.toContain("sensitive account detail");
    expect(failed.body).not.toContain(ELEVENLABS_API_KEY);
  });

  it("rate-limits one session without blocking another session on the same client", async () => {
    let nowMs = 1000;
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
      now: () => nowMs,
      rateLimitWindowMs: 60_000,
      clientRateLimitMaximumRequests: 10,
      sessionRateLimitMaximumRequests: 2,
    });

    expect((await handler(event())).statusCode).toBe(200);
    expect((await handler(event())).statusCode).toBe(200);
    expect((await handler(event())).statusCode).toBe(429);
    expect(
      (
        await handler(
          event(
            "elevenlabs",
            "POST",
            {},
            {
              pavloviaSessionToken: "different-session-token",
            },
          ),
        )
      ).statusCode,
    ).toBe(200);
    nowMs += 60_001;
    expect((await handler(event())).statusCode).toBe(200);
  });

  it("caps a shared client even when session tokens change", async () => {
    const handler = createSpeechTokenHandler({
      fetchImpl: successfulElevenLabsFetch as typeof fetch,
      elevenLabsApiKey: () => ELEVENLABS_API_KEY,
      verifyExperimentContext: contextAccepted,
      clientRateLimitMaximumRequests: 2,
      sessionRateLimitMaximumRequests: 10,
    });

    expect((await handler(event())).statusCode).toBe(200);
    expect(
      (
        await handler(
          event("elevenlabs", "POST", {}, { pavloviaSessionToken: "two" }),
        )
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await handler(
          event("elevenlabs", "POST", {}, { pavloviaSessionToken: "three" }),
        )
      ).statusCode,
    ).toBe(429);
  });

  it("declares a Netlify edge rate limit for the credential route", () => {
    expect(config).toEqual({
      path: "/.netlify/functions/speech-token",
      rateLimit: {
        windowLimit: 600,
        windowSize: 60,
        aggregateBy: ["ip", "domain"],
      },
    });
  });
});
