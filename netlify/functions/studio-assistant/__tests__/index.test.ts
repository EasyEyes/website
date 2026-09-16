import {
  config,
  createAssistantHandler,
  DEFAULT_EFFORT,
  DEFAULT_MODEL,
  effortSetting,
  MAX_MAX_TOKENS,
  parseRequest,
} from "../handler";

const ORIGIN = "https://easyeyes.app";
const API_KEY = "server-only-anthropic-key";

const validBody = () => ({
  protocolVersion: 1,
  pavloviaToken: "gitlab-oauth-token",
  system: [{ type: "text", text: "You help with EasyEyes tables." }],
  messages: [{ role: "user", content: "Add a second condition" }],
  tools: [
    {
      name: "edit_table",
      description: "Edit",
      input_schema: { type: "object", properties: {} },
    },
  ],
});

const event = (
  bodyOverrides: Record<string, unknown> = {},
  httpMethod = "POST",
  headers: Record<string, string | undefined> = {},
) => ({
  httpMethod,
  headers: {
    origin: ORIGIN,
    "x-nf-client-connection-ip": "203.0.113.5",
    ...headers,
  },
  body: JSON.stringify({ ...validBody(), ...bodyOverrides }),
});

const modelReply = {
  id: "msg_1",
  model: "claude-sonnet-5",
  stop_reason: "end_turn",
  content: [{ type: "text", text: "Done." }],
  usage: { input_tokens: 10, output_tokens: 2 },
};

const upstreamOk = () =>
  jest.fn(
    async () =>
      ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(modelReply),
      }) as unknown as Response,
  );

const tokenAccepted = jest.fn(async () => true);
const tokenRejected = jest.fn(async () => false);

describe("studio-assistant Netlify function", () => {
  beforeEach(() => {
    tokenAccepted.mockClear();
    tokenRejected.mockClear();
  });

  it("relays the conversation to the model with the server-side key and returns the message", async () => {
    const fetchImpl = upstreamOk();
    const handler = createAssistantHandler({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
    });

    const response = await handler(event());

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      content: modelReply.content,
      stop_reason: "end_turn",
      usage: modelReply.usage,
      model: "claude-sonnet-5",
    });
    expect(response.headers).toMatchObject({
      "Access-Control-Allow-Origin": ORIGIN,
      "Cache-Control": "no-store",
    });
    expect(tokenAccepted).toHaveBeenCalledWith("gitlab-oauth-token");

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers).toMatchObject({
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    });
    const sent = JSON.parse(init.body as string);
    expect(sent).toMatchObject({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      // Sonnet 5 would otherwise think at "high" effort — 30 s a round.
      // Adaptive thinking stays on (the default): the Studio's spec-based
      // tools keep the output small, so thinking costs seconds, not tens.
      output_config: { effort: DEFAULT_EFFORT },
      system: validBody().system,
      messages: validBody().messages,
      tools: validBody().tools,
    });
    expect(DEFAULT_EFFORT).toBe("medium");
    expect(sent.thinking).toBeUndefined();
    // The account token never travels upstream.
    expect(JSON.stringify(sent)).not.toContain("gitlab-oauth-token");
  });

  it("lets the site change the effort, send none for models without it, or turn thinking off", async () => {
    expect(effortSetting(undefined)).toBe(DEFAULT_EFFORT);
    expect(effortSetting(" Low ")).toBe("low");
    expect(effortSetting("nonsense")).toBe(DEFAULT_EFFORT);
    expect(effortSetting("off")).toBeNull();

    const fetchImpl = upstreamOk();
    const handler = createAssistantHandler({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
      effort: () => "off",
      thinking: () => "off",
    });
    await handler(event());
    const sent = JSON.parse(
      (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    );
    expect(sent.output_config).toBeUndefined();
    expect(sent.thinking).toEqual({ type: "disabled" });
  });

  it("mode 'fast' asks for a thought-free, low-effort round — never more than the site's setting", async () => {
    const fetchImpl = upstreamOk();
    const handler = createAssistantHandler({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
    });
    const response = await handler(event({ mode: "fast" }));
    expect(response.statusCode).toBe(200);
    let sent = JSON.parse(
      (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    );
    expect(sent.output_config).toEqual({ effort: "low" });
    expect(sent.thinking).toEqual({ type: "disabled" });

    // A site that sends no effort setting keeps sending none.
    const noEffort = upstreamOk();
    await createAssistantHandler({
      fetchImpl: noEffort as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
      effort: () => "off",
    })(event({ mode: "fast" }));
    sent = JSON.parse(
      (noEffort.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    );
    expect(sent.output_config).toBeUndefined();
    expect(sent.thinking).toEqual({ type: "disabled" });

    // Only "fast" is a mode; a client cannot ask for more.
    expect((await handler(event({ mode: "max" }))).statusCode).toBe(400);
  });

  it("uses the configured model and caps max_tokens", async () => {
    const fetchImpl = upstreamOk();
    const handler = createAssistantHandler({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiKey: () => API_KEY,
      model: () => "claude-haiku-4-5-20251001",
      verifyPavloviaToken: tokenAccepted,
    });
    await handler(event({ maxTokens: 999_999 }));
    const sent = JSON.parse(
      (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    );
    expect(sent.model).toBe("claude-haiku-4-5-20251001");
    expect(sent.max_tokens).toBe(MAX_MAX_TOKENS);
  });

  it("rejects a sign-in GitLab does not recognise without calling the model", async () => {
    const fetchImpl = upstreamOk();
    const handler = createAssistantHandler({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenRejected,
    });
    const response = await handler(event());
    expect(response.statusCode).toBe(401);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("answers 503 when no key is configured, before any upstream call", async () => {
    const fetchImpl = upstreamOk();
    const handler = createAssistantHandler({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiKey: () => undefined,
      verifyPavloviaToken: tokenAccepted,
    });
    const response = await handler(event());
    expect(response.statusCode).toBe(503);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("refuses foreign origins and non-POST methods", async () => {
    const handler = createAssistantHandler({
      fetchImpl: upstreamOk() as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
    });
    expect(
      (await handler(event({}, "POST", { origin: "https://evil.example" })))
        .statusCode,
    ).toBe(403);
    expect((await handler(event({}, "GET"))).statusCode).toBe(405);
    const preflight = await handler(event({}, "OPTIONS"));
    expect(preflight.statusCode).toBe(204);
    expect(preflight).not.toHaveProperty("body");
  });

  it("rejects malformed requests", async () => {
    const handler = createAssistantHandler({
      fetchImpl: upstreamOk() as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
    });
    for (const bad of [
      { protocolVersion: 2 },
      { pavloviaToken: "" },
      { messages: [] },
      { tools: "edit_table" },
      { maxTokens: -1 },
    ])
      expect((await handler(event(bad))).statusCode).toBe(400);
  });

  it("rate limits an account that calls too often", async () => {
    const handler = createAssistantHandler({
      fetchImpl: upstreamOk() as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
      accountRateLimitMaximumRequests: 2,
      now: () => 1_000_000,
    });
    expect((await handler(event())).statusCode).toBe(200);
    expect((await handler(event())).statusCode).toBe(200);
    const limited = await handler(event());
    expect(limited.statusCode).toBe(429);
    expect(limited.headers?.["Retry-After"]).toBe("60");
  });

  it("surfaces the model's own error message on a bad request", async () => {
    const fetchImpl = jest.fn(
      async () =>
        ({
          ok: false,
          status: 400,
          text: async () =>
            JSON.stringify({
              error: { type: "invalid_request_error", message: "tools[0] bad" },
            }),
        }) as unknown as Response,
    );
    const handler = createAssistantHandler({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiKey: () => API_KEY,
      verifyPavloviaToken: tokenAccepted,
    });
    const response = await handler(event());
    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body).error).toBe("Model error: tools[0] bad");
  });

  it("maps upstream rate limits and key rejections", async () => {
    const status = (code: number) =>
      jest.fn(
        async () =>
          ({
            ok: false,
            status: code,
            text: async () => "{}",
          }) as unknown as Response,
      );
    const make = (code: number) =>
      createAssistantHandler({
        fetchImpl: status(code) as unknown as typeof fetch,
        apiKey: () => API_KEY,
        verifyPavloviaToken: tokenAccepted,
      });
    expect((await make(429)(event())).statusCode).toBe(429);
    expect((await make(401)(event())).statusCode).toBe(503);
  });

  it("parseRequest fills the default max tokens and keeps the arrays", () => {
    const parsed = parseRequest(JSON.stringify(validBody()));
    expect(parsed).toMatchObject({
      protocolVersion: 1,
      maxTokens: 4096,
      messages: validBody().messages,
    });
    expect(parseRequest(null)).toBeUndefined();
    expect(parseRequest("not json")).toBeUndefined();
  });

  it("is deployed at the path the Studio calls, behind an edge rate limit", () => {
    expect(config.path).toBe("/.netlify/functions/studio-assistant");
    expect(config.rateLimit.aggregateBy).toEqual(["ip", "domain"]);
  });
});
