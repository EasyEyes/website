import assert from "node:assert/strict";
import test from "node:test";
import deployedHandler, {
  createBenchmarkHandler,
} from "./functions/rsvp-benchmark-ticket.mts";
import { verifyChirp3Ticket } from "../../netlify/functions/shared/chirp3Ticket.ts";

const RSVP_BENCH_ORIGIN = "https://deploy-preview-42--easyeyes.netlify.app";
const RSVP_BENCH_ACCESS_CODE = "a".repeat(64);
const CHIRP3_RELAY_URL = "wss://test.example/v1/stream";
const CHIRP3_TICKET_SECRET = "test-secret".repeat(4);
const env = {
  RSVP_BENCH_ORIGIN,
  RSVP_BENCH_ACCESS_CODE,
  CHIRP3_RELAY_URL,
  CHIRP3_TICKET_SECRET,
};
const now = () => 1_234_500;
const request = ({
  hostname = RSVP_BENCH_ORIGIN,
  origin = RSVP_BENCH_ORIGIN,
  method = "POST",
  body = JSON.stringify({ accessCode: RSVP_BENCH_ACCESS_CODE }),
} = {}) =>
  new Request(`${hostname}/.netlify/functions/rsvp-benchmark-ticket`, {
    method,
    headers: {
      origin,
      "sec-fetch-site": "same-origin",
      "Content-Type": "application/json",
    },
    body: method === "POST" ? body : undefined,
  });

test("valid preview request mints a short-lived origin-bound relay ticket", async () => {
  assert.equal(typeof deployedHandler, "function");
  const result = await createBenchmarkHandler(env, now)(request());
  assert.ok(result instanceof Response);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "no-store");
  const body = await result.text();
  const { token, websocketUrl } = JSON.parse(body);
  assert.equal(websocketUrl, CHIRP3_RELAY_URL);
  assert.equal(
    verifyChirp3Ticket(
      token,
      CHIRP3_TICKET_SECRET,
      websocketUrl,
      RSVP_BENCH_ORIGIN,
      now(),
    ).origin,
    RSVP_BENCH_ORIGIN,
  );
  assert.throws(() =>
    verifyChirp3Ticket(
      token,
      CHIRP3_TICKET_SECRET,
      websocketUrl,
      "https://easyeyes.app",
      now(),
    ),
  );
  assert(!body.includes(RSVP_BENCH_ACCESS_CODE));
  assert(!body.includes(CHIRP3_TICKET_SECRET));
});

test("production, another preview, and invalid access codes cannot mint tickets", async () => {
  const handle = createBenchmarkHandler(env, now);
  assert.equal(
    (
      await createBenchmarkHandler(
        { ...env, RSVP_BENCH_ORIGIN: "https://easyeyes.app" },
        now,
      )(request())
    ).status,
    503,
  );
  assert.equal(
    (
      await handle(
        request({
          origin: "https://deploy-preview-43--easyeyes.netlify.app",
        }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handle(
        request({
          body: JSON.stringify({ accessCode: "b".repeat(64) }),
        }),
      )
    ).status,
    401,
  );
  assert.equal(
    (await handle(request({ hostname: "https://easyeyes.app" }))).status,
    403,
  );
});

test("per-instance warm rate window limits successful requests", async () => {
  const handle = createBenchmarkHandler(env, now);
  assert.equal((await handle(request({ method: "GET" }))).status, 405);
  assert.equal((await handle(request({ body: "x".repeat(300) }))).status, 400);
  for (let i = 0; i < 30; i++)
    assert.equal((await handle(request())).status, 200);
  assert.equal((await handle(request())).status, 429);
});

test("Deepgram is opt-in, uses a preview-scoped server key, and returns only a short-lived token", async () => {
  const deepgram = { body: JSON.stringify({ accessCode: RSVP_BENCH_ACCESS_CODE, provider: "deepgram" }) };
  assert.equal((await createBenchmarkHandler(env, now)(request(deepgram))).status, 503);
  let calls = 0;
  const handle = createBenchmarkHandler(
    { ...env, RSVP_BENCH_DEEPGRAM_API_KEY: "server-only" },
    now,
    async (url, options) => {
      calls++;
      assert.equal(url, "https://api.deepgram.com/v1/auth/grant");
      assert.equal(options.headers.Authorization, "Token server-only");
      assert.deepEqual(JSON.parse(options.body), { ttl_seconds: 30 });
      return Response.json({ access_token: "short-lived", other: "never forwarded" });
    },
  );
  assert.equal((await handle(request({ ...deepgram, origin: "https://example.com" }))).status, 403);
  assert.equal(calls, 0);
  const result = await handle(request(deepgram));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { token: "short-lived" });
  assert.equal(calls, 1);
});

test("ElevenLabs returns only a capped single-use Scribe token", async () => {
  const body = JSON.stringify({ accessCode: RSVP_BENCH_ACCESS_CODE, provider: "elevenlabs" });
  assert.equal((await createBenchmarkHandler(env, now)(request({ body }))).status, 503);
  const mockEnv = { ...env, RSVP_BENCH_ELEVENLABS_API_KEY: "secret-eleven-key" };
  let calls = 0;
  const handler = createBenchmarkHandler(mockEnv, now, async (url, options) => {
    calls++;
    assert.equal(url, "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe?max_session_duration_seconds=180");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["xi-api-key"], "secret-eleven-key");
    return Response.json({ token: "single-use", other: "not forwarded" });
  });
  const denied = await handler(request({ body, origin: "https://example.com" }));
  assert.equal(denied.status, 403);
  assert.equal(calls, 0);
  const result = await handler(request({ body }));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { token: "single-use" });
  assert.equal(calls, 1);
});
