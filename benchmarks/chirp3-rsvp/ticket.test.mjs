import assert from "node:assert/strict";
import test from "node:test";
import { createBenchmarkHandler } from "./functions/rsvp-benchmark-ticket.ts";
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
const event = {
  httpMethod: "POST",
  headers: { origin: RSVP_BENCH_ORIGIN, "sec-fetch-site": "same-origin" },
  body: JSON.stringify({ accessCode: RSVP_BENCH_ACCESS_CODE }),
};

test("valid preview request mints a short-lived origin-bound relay ticket", async () => {
  const result = await createBenchmarkHandler(env, now)(event);
  assert.equal(result.statusCode, 200);
  const { token, websocketUrl } = JSON.parse(result.body);
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
  assert(!result.body.includes(RSVP_BENCH_ACCESS_CODE));
  assert(!result.body.includes(CHIRP3_TICKET_SECRET));
});

test("production, another preview, and invalid access codes cannot mint tickets", async () => {
  const handle = createBenchmarkHandler(env, now);
  assert.equal(
    (
      await createBenchmarkHandler(
        { ...env, RSVP_BENCH_ORIGIN: "https://easyeyes.app" },
        now,
      )(event)
    ).statusCode,
    503,
  );
  assert.equal(
    (
      await handle({
        ...event,
        headers: {
          ...event.headers,
          origin: "https://deploy-preview-43--easyeyes.netlify.app",
        },
      })
    ).statusCode,
    403,
  );
  assert.equal(
    (
      await handle({
        ...event,
        body: JSON.stringify({ accessCode: "b".repeat(64) }),
      })
    ).statusCode,
    401,
  );
});

test("per-instance warm rate window limits successful requests", async () => {
  const handle = createBenchmarkHandler(env, now);
  assert.equal((await handle({ ...event, httpMethod: "GET" })).statusCode, 405);
  for (let i = 0; i < 30; i++)
    assert.equal((await handle(event)).statusCode, 200);
  assert.equal((await handle(event)).statusCode, 429);
});
