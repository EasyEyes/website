import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { Duplex } from "node:stream";
import WebSocket from "ws";
import {
  issueChirp3Ticket,
  verifyChirp3Ticket,
  chirp3StreamUrl,
} from "../../../netlify/functions/shared/chirp3Ticket.ts";
import { createChirp3Server } from "../server.mjs";
import { buildRecognitionRequest } from "../config.mjs";

const secret = "test-secret-with-at-least-32-characters";
const audience = "ws://localhost:8080/v1/stream";
const origin = "https://run.pavlovia.org";
const claims = { audience, origin, session: "a".repeat(64) };
const configuration = {
  type: "start",
  protocolVersion: 1,
  utteranceId: "trial-1",
  languageCode: "en-US",
  keyterms: ["cat", "dog", "fish"],
  useKeyterms: true,
};

class FakeGoogle extends Duplex {
  requests = [];
  constructor() {
    super({ objectMode: true });
  }
  _read() {}
  _write(message, _encoding, done) {
    this.requests.push(message);
    done();
  }
  _final(done) {
    done();
  }
  result(text, isFinal = true) {
    this.push({ results: [{ isFinal, alternatives: [{ transcript: text }] }] });
  }
  complete() {
    this.push(null);
    this.emit("status", { code: 0 });
  }
}

async function harness(t, options = {}) {
  const streams = [];
  const service = createChirp3Server({
    project: "test-project",
    location: "eu",
    publicUrl: audience,
    ticketSecret: secret,
    createStream: () => {
      const stream = new FakeGoogle();
      streams.push(stream);
      return stream;
    },
    ...options,
  });
  service.server.listen(0, "127.0.0.1");
  await once(service.server, "listening");
  t.after(async () => {
    await service.close();
  });
  const ws = new WebSocket(
    `ws://127.0.0.1:${service.server.address().port}/v1/stream`,
    { origin },
  );
  await once(ws, "open");
  const messages = [];
  ws.on("message", (data) => {
    messages.push(JSON.parse(data.toString()));
  });
  const wait = async (predicate) => {
    const deadline = Date.now() + 3000;
    while (!messages.some(predicate)) {
      if (Date.now() > deadline)
        throw new Error(`Missing response: ${JSON.stringify(messages)}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    return messages.find(predicate);
  };
  const start = (overrides = {}) =>
    ws.send(
      JSON.stringify({
        ...configuration,
        token: issueChirp3Ticket(claims, secret),
        ...overrides,
      }),
    );
  return { ws, streams, messages, wait, start, service };
}

test("tickets bind origin and relay audience, expire, and reject tampering", () => {
  const token = issueChirp3Ticket(claims, secret, 100000);
  assert.equal(
    verifyChirp3Ticket(token, secret, audience, origin, 101000).session,
    claims.session,
  );
  assert.throws(() =>
    verifyChirp3Ticket(token, secret, audience, origin, 160000),
  );
  assert.throws(() =>
    verifyChirp3Ticket(token, secret, audience, "https://evil.invalid", 101000),
  );
  assert.throws(() =>
    verifyChirp3Ticket(token, secret, audience + "other", origin, 101000),
  );
  const [payload, signature] = token.split(".");
  assert.throws(() =>
    verifyChirp3Ticket(
      payload + "a." + signature,
      secret,
      audience,
      origin,
      101000,
    ),
  );
  assert.throws(() => issueChirp3Ticket(claims, "short"));
  assert.throws(() =>
    chirp3StreamUrl("wss://example.run.app/v1/stream?token=secret"),
  );
});

test("recognition uses mono 16k PCM, the condition language, and only the current targets", () => {
  const request = buildRecognitionRequest("test-project", "eu", configuration);
  assert.equal(
    request.recognizer,
    "projects/test-project/locations/eu/recognizers/_",
  );
  assert.equal(request.streamingConfig.config.model, "chirp_3");
  assert.deepEqual(request.streamingConfig.config.languageCodes, ["en-US"]);
  assert.deepEqual(request.streamingConfig.config.explicitDecodingConfig, {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    audioChannelCount: 1,
  });
  assert.deepEqual(
    request.streamingConfig.config.adaptation.phraseSets[0].inlinePhraseSet
      .phrases,
    [{ value: "cat" }, { value: "dog" }, { value: "fish" }],
  );
  assert.equal(
    buildRecognitionRequest("test-project", "eu", {
      ...configuration,
      useKeyterms: false,
    }).streamingConfig.config.adaptation,
    undefined,
  );
  assert.throws(() =>
    buildRecognitionRequest("test-project", "eu", {
      ...configuration,
      languageCode: "",
    }),
  );
});

test("streams audio immediately and retains segments until an explicit successful finish", async (t) => {
  const h = await harness(t);
  h.start();
  await h.wait((m) => m.type === "ready");
  h.ws.send(Buffer.from([1, 0, 2, 0]));
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.deepEqual(h.streams[0].requests[1], {
    audio: Buffer.from([1, 0, 2, 0]),
  });
  h.streams[0].result("cat");
  await h.wait((m) => m.type === "segment");
  assert.equal(
    h.messages.some((m) => m.type === "complete"),
    false,
  );
  h.ws.send(JSON.stringify({ type: "finish", utteranceId: "trial-1" }));
  await new Promise((resolve) => setTimeout(resolve, 10));
  h.streams[0].result("dog fish");
  h.streams[0].complete();
  await h.wait((m) => m.type === "complete");
  assert.deepEqual(
    h.messages.filter((m) => m.type === "segment").map((m) => m.text),
    ["cat", "dog fish"],
  );
});

test("a successful Google stream with no recognized words acknowledges an empty response", async (t) => {
  const h = await harness(t);
  h.start();
  await h.wait((m) => m.type === "ready");
  h.ws.send(Buffer.alloc(3200));
  h.ws.send(JSON.stringify({ type: "finish", utteranceId: "trial-1" }));
  await new Promise((resolve) => setTimeout(resolve, 10));
  h.streams[0].complete();
  await h.wait((m) => m.type === "complete");
  assert.equal(
    h.messages.some((m) => m.type === "segment"),
    false,
  );
});

test("failed Google stream never acknowledges a participant response", async (t) => {
  const h = await harness(t);
  h.start();
  await h.wait((m) => m.type === "ready");
  h.streams[0].destroy(
    Object.assign(new Error("private upstream detail"), { code: 8 }),
  );
  assert.equal((await h.wait((m) => m.type === "error")).code, "quotaExceeded");
  assert.equal(
    h.messages.some((m) => m.type === "complete"),
    false,
  );
  assert.equal(
    JSON.stringify(h.messages).includes("private upstream detail"),
    false,
  );
});

test("bad credentials cannot allocate a Google stream", async (t) => {
  const h = await harness(t);
  h.start({ token: "invalid" });
  assert.equal(
    (await h.wait((m) => m.type === "error")).code,
    "authenticationFailure",
  );
  assert.equal(h.streams.length, 0);
});

test("client disconnect destroys its Google stream", async (t) => {
  const h = await harness(t);
  h.start();
  await h.wait((m) => m.type === "ready");
  h.ws.close();
  await once(h.ws, "close");
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(h.streams[0].destroyed, true);
});

test("missing provider completion times out without fabricating an empty response", async (t) => {
  const h = await harness(t, { finalizationMs: 30 });
  h.start();
  await h.wait((m) => m.type === "ready");
  h.ws.send(Buffer.alloc(3200));
  h.ws.send(JSON.stringify({ type: "finish", utteranceId: "trial-1" }));
  await h.wait((m) => m.type === "error");
  assert.equal(
    h.messages.some((m) => m.type === "complete"),
    false,
  );
});

test("audio flood is rejected before Google can buffer it", async (t) => {
  const h = await harness(t);
  h.start();
  await h.wait((m) => m.type === "ready");
  for (let i = 0; i < 5; i++) h.ws.send(Buffer.alloc(24000));
  await h.wait((m) => m.type === "error");
  assert.equal(
    h.messages.some((m) => m.type === "complete"),
    false,
  );
});

test("a provider stream ending before finish is a technical failure, even with final words", async (t) => {
  const h = await harness(t);
  h.start();
  await h.wait((m) => m.type === "ready");
  h.streams[0].result("cat dog fish");
  h.streams[0].complete();
  await h.wait((m) => m.type === "error");
  assert.equal(
    h.messages.some((m) => m.type === "complete"),
    false,
  );
});

test("a ticket cannot be replayed on another connection in the same process", async (t) => {
  const h = await harness(t);
  const token = issueChirp3Ticket(claims, secret);
  h.start({ token });
  await h.wait((m) => m.type === "ready");
  const second = new WebSocket(
    `ws://127.0.0.1:${h.service.server.address().port}/v1/stream`,
    { origin },
  );
  await once(second, "open");
  const reply = once(second, "message");
  second.send(JSON.stringify({ ...configuration, token }));
  assert.equal(
    JSON.parse((await reply)[0].toString()).code,
    "authenticationFailure",
  );
  assert.equal(h.streams.length, 1);
});

test("connections keep target hints isolated from other trials", async (t) => {
  const h = await harness(t);
  h.start();
  await h.wait((m) => m.type === "ready");
  const second = new WebSocket(
    `ws://127.0.0.1:${h.service.server.address().port}/v1/stream`,
    { origin },
  );
  await once(second, "open");
  const ready = once(second, "message");
  second.send(
    JSON.stringify({
      ...configuration,
      utteranceId: "trial-2",
      keyterms: ["red", "blue"],
      token: issueChirp3Ticket(claims, secret),
    }),
  );
  assert.equal(JSON.parse((await ready)[0].toString()).utteranceId, "trial-2");
  const hints = (stream) =>
    stream.requests[0].streamingConfig.config.adaptation.phraseSets[0].inlinePhraseSet.phrases.map(
      (phrase) => phrase.value,
    );
  assert.deepEqual(hints(h.streams[0]), ["cat", "dog", "fish"]);
  assert.deepEqual(hints(h.streams[1]), ["red", "blue"]);
  second.close();
});

test("unknown origins cannot allocate a connection or Google stream", async (t) => {
  const h = await harness(t);
  const untrusted = new WebSocket(
    `ws://127.0.0.1:${h.service.server.address().port}/v1/stream`,
    { origin: "https://untrusted.invalid" },
  );
  const rejected = await once(untrusted, "error");
  assert.match(rejected[0].message, /403/);
  assert.equal(h.streams.length, 0);
});
