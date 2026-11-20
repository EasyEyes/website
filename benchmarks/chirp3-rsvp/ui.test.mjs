import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = resolve(
  process.env.EE_BENCH_SOURCE_ROOT ??
    fileURLToPath(new URL("../../", import.meta.url)),
);
const require = createRequire(
  resolve(source, "docs/experiment/threshold/package.json"),
);
const { chromium } = require("playwright");
const server = createServer(async (req, res) => {
  const path = req.url === "/" ? "/index.html" : req.url;
  if (!/^\/(?:index\.html|main\.js|style\.css)$/i.test(path))
    return res.writeHead(404).end();
  try {
    const contents = await readFile(new URL(`./dist${path}`, import.meta.url));
    const type = path.endsWith(".html")
      ? "text/html"
      : path.endsWith(".css")
      ? "text/css"
      : path.endsWith(".wasm")
      ? "application/wasm"
      : "text/javascript";
    res.writeHead(200, { "Content-Type": type }).end(contents);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
let browser;
try {
  browser = await chromium.launch({
    channel: "chrome",
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.setDefaultTimeout(7000);
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.error(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.error(message.text());
  });
  page.on("response", (response) => {
    if (!response.ok())
      console.error(response.status(), new URL(response.url()).pathname);
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator("#scenario").selectOption("space");
  assert.match(await page.locator("#arena-cue").innerText(), /press Space/);
  assert.equal(
    await page
      .getByText("rsvpReadingSTTUseKeytermsBool", { exact: true })
      .count(),
    1,
  );
  assert.equal(
    await page.getByText("Deterministic fixture", { exact: false }).count(),
    0,
  );
  await page.locator("#keyterms").selectOption("FALSE");
  await page.locator("#scenario").selectOption("finishWait");
  assert.equal(await page.locator("#stt").inputValue(), "0.5");
  assert.equal(await page.locator("#keyterms").inputValue(), "FALSE");
  await page.locator("#scenario").selectOption("perfect");
  assert.equal(await page.locator("#stt").inputValue(), "10");
  await page.locator("#corpus").setInputFiles({
    name: "test-words.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("boat rose tree\nkitten tiger apple\n"),
  });
  await page.getByText(/Loaded 2 target sets/).waitFor();
  assert.equal(await page.locator("#targets").inputValue(), "boat, rose, tree");
  await page.getByRole("button", { name: "Load next word set" }).click();
  assert.equal(
    await page.locator("#targets").inputValue(),
    "kitten, tiger, apple",
  );
  let deepgramConfigured = true;
  let deepgramRejected = false;
  let elevenRetentionWarning = false;
  await page.route("**/.netlify/functions/rsvp-benchmark-ticket", (route) => {
    const { provider } = route.request().postDataJSON();
    if (provider === "deepgram")
      return route.fulfill(deepgramRejected
        ? { status: 502, json: { error: "deepgramGrantRejected", upstreamStatus: 403 } }
        : deepgramConfigured
        ? { json: { token: "test-token" } }
        : { status: 503, json: { error: "deepgramNotConfigured" } });
    if (provider === "elevenlabs")
      return route.fulfill({ json: { token: elevenRetentionWarning ? "warning-token" : "single-use" } });
    return route.fulfill({ json: {
      token: "test-ticket",
      websocketUrl: "wss://relay.example/v1/stream",
    } });
  });
  await page.addInitScript(() => {
    window.testAudio = { chirp3: [], deepgram: [], elevenlabs: [] };
    window.WebSocket = class extends EventTarget {
      static OPEN = 1;
      readyState = 0;
      bufferedAmount = 0;
      constructor(url) {
        super();
        const target = new URL(url);
        this.deepgram = target.hostname === "api.deepgram.com";
        this.eleven = target.hostname === "api.elevenlabs.io";
        if (this.deepgram && target.searchParams.get("mip_opt_out") !== "true")
          throw new Error("Missing opt out");
        if (this.eleven &&
            (target.searchParams.get("enable_logging") !== "false" ||
             target.searchParams.get("language_code") !== "en" ||
             target.searchParams.get("commit_strategy") !== "manual"))
          throw new Error("Unexpected ElevenLabs config");
        setTimeout(() => {
          this.readyState = 1;
          this.dispatchEvent(new Event("open"));
          if (this.eleven) {
            this.reply({ message_type: "session_started", session_id: "eleven-test" });
            if (target.searchParams.get("token") === "warning-token")
              this.reply({ message_type: "warning", warning: "Zero retention was not applied. This session is still being logged." });
          }
        });
      }
      reply(message) {
        queueMicrotask(() =>
          this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(message) })),
        );
      }
      send(data) {
        if (typeof data !== "string") {
          window.testAudio[this.deepgram ? "deepgram" : "chirp3"].push(Array.from(new Uint8Array(data)));
          return;
        }
        const message = JSON.parse(data);
        if (this.eleven) {
          if (message.commit)
            this.reply({ message_type: "committed_transcript", text: "Cold ducks stone." });
          else
            window.testAudio.elevenlabs.push(Array.from(atob(message.audio_base_64), (byte) => byte.charCodeAt(0)));
          return;
        }
        if (!this.deepgram && message.type === "start") {
          this.utteranceId = message.utteranceId;
          this.reply({
            type: "ready", utteranceId: this.utteranceId, model: "chirp_3",
            sampleRate: 16000, languageCode: "en-US",
          });
        } else if (!this.deepgram && message.type === "finish") {
          this.reply({ type: "segment", utteranceId: this.utteranceId, text: "Call my stone." });
          this.reply({ type: "complete", utteranceId: this.utteranceId });
        } else if (this.deepgram && message.type === "CloseStream") {
          this.reply({
            type: "Results", is_final: true, speech_final: false,
            channel: { alternatives: [{ transcript: "Cold ducks stone." }] },
          });
          this.reply({ type: "Metadata", request_id: "dg-test" });
        }
      }
      close(code = 1000) {
        this.readyState = 3;
        this.dispatchEvent(new CloseEvent("close", { code }));
      }
    };
  });
  await page.reload();
  await page.locator("#access-code").fill("a".repeat(64));
  await page.locator("#targets").fill("coat, ducks, stone");
  await page.locator("#scenario").selectOption("pairedWrongFirst");
  assert.match(await page.locator("#script").innerText(), /cold ducks stone/);
  assert(await page.locator("#adaptive").isDisabled());
  const prepare = page.getByRole("button", { name: "Prepare trial" });
  await prepare.click();
  assert.match(await page.locator("#stage").innerText(), /Select a comparison provider/);
  await page.locator("#comparison-provider").selectOption("deepgram");
  await page.locator("#word").fill("0.3");
  await page.locator("#cap").fill("1");
  const runPaired = async () => {
    await prepare.click();
    await page.getByRole("button", { name: "Start showing words" }).click();
    await page.waitForFunction(() => !document.getElementById("prepare").disabled);
  };
  await runPaired();
  const first = page.locator("#report article").first();
  assert.match(await first.innerText(), /All 2 clients sent [1-9]/);
  assert.match(await first.innerText(), /Call my stone/);
  assert.match(await first.innerText(), /Cold ducks stone/);
  const audio = await page.evaluate(() => window.testAudio);
  assert.equal(audio.chirp3.length, audio.deepgram.length);
  assert(audio.chirp3.length > 0);
  assert.deepEqual(audio.chirp3, audio.deepgram);
  await first.getByRole("button", { name: "I said exactly what was planned" }).click();
  assert.match(await page.locator("#paired-aggregate").innerText(), /1\/2 \(50.0%\)/);
  deepgramConfigured = false;
  await runPaired();
  assert.match(await first.innerText(), /Deepgram Nova-3 is not configured/);
  assert.match(await first.innerText(), /Call my stone/);
  await first.getByRole("button", { name: "I said exactly what was planned" }).click();
  assert.match(await page.locator("#paired-aggregate").innerText(), /1 confirmed trial\(s\) excluded/);
  await page.locator("#comparison-provider").selectOption("elevenlabs");
  await page.evaluate(() => { window.testAudio.chirp3 = []; });
  await runPaired();
  assert.match(await first.innerText(), /ElevenLabs Scribe v2 Realtime/);
  assert.match(await first.innerText(), /Cold ducks stone/);
  const elevenAudio = await page.evaluate(() => window.testAudio);
  assert(elevenAudio.elevenlabs.length > 0);
  assert.deepEqual(elevenAudio.chirp3, elevenAudio.elevenlabs);
  elevenRetentionWarning = true;
  await runPaired();
  assert.match(await first.innerText(), /zero retention was not applied/);
  assert.match(await first.innerText(), /Call my stone/);
  assert.equal(await page.evaluate(() => window.testAudio.elevenlabs.length), elevenAudio.elevenlabs.length);
  elevenRetentionWarning = false;
  deepgramConfigured = true;
  await page.locator("#comparison-provider").selectOption("both");
  await page.evaluate(() => {
    window.testAudio = { chirp3: [], deepgram: [], elevenlabs: [] };
  });
  await runPaired();
  assert.match(await first.innerText(), /All 3 clients sent [1-9]/);
  const three = await page.evaluate(() => window.testAudio);
  assert(three.chirp3.length > 0);
  assert.deepEqual(three.chirp3, three.deepgram);
  assert.deepEqual(three.chirp3, three.elevenlabs);
  await first.getByRole("button", { name: "I said exactly what was planned" }).click();
  deepgramRejected = true;
  await runPaired();
  assert.match(await first.innerText(), /provider HTTP 403.*Member role/);
  assert.match(await first.innerText(), /Call my stone/);
  assert.match(await first.innerText(), /Cold ducks stone/);
  assert.match(await first.innerText(), /excluded from the combined summary/);
  assert.deepEqual(errors, []);
  console.log(
    "Built Preview UI passed. Chirp 3 and each comparison adapter sent byte-identical PCM; the ElevenLabs retention warning stopped comparison.",
  );
} finally {
  await browser?.close();
  server.close();
}
