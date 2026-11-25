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
  let ticketRequests = 0;
  await page.route("**/.netlify/functions/rsvp-benchmark-ticket", (route) => {
    ticketRequests++;
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
    window.testHints = { chirp3: [], deepgram: [], elevenlabs: [] };
    window.WebSocket = class extends EventTarget {
      static OPEN = 1;
      readyState = 0;
      bufferedAmount = 0;
      constructor(url) {
        super();
        const target = new URL(url);
        this.deepgram = target.hostname === "api.deepgram.com";
        this.eleven = target.hostname === "api.elevenlabs.io";
        if (this.deepgram) window.testHints.deepgram.push(target.searchParams.getAll("keyterm"));
        if (this.eleven) window.testHints.elevenlabs.push(target.searchParams.getAll("keyterms"));
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
          this.bytes = (this.bytes ?? 0) + data.byteLength;
          return;
        }
        const message = JSON.parse(data);
        if (this.eleven) {
          if (message.commit) {
            const final = () => this.reply({ message_type: "committed_transcript", text: "Cold ducks stone." });
            if (window.testHoldElevenFinal) window.testReleaseElevenFinal = final;
            else final();
          } else
            window.testAudio.elevenlabs.push(Array.from(atob(message.audio_base_64), (byte) => byte.charCodeAt(0)));
          return;
        }
        if (!this.deepgram && message.type === "start") {
          window.testHints.chirp3.push({ enabled: message.useKeyterms, terms: message.keyterms });
          this.utteranceId = message.utteranceId;
          this.reply({
            type: "ready", utteranceId: this.utteranceId, model: "chirp_3",
            sampleRate: 16000, languageCode: "en-US",
          });
        } else if (!this.deepgram && message.type === "finish") {
          const bytes = this.bytes;
          const text = window.testTailProbe && bytes === 16000 ? "Call my" : "Call my stone.";
          this.reply({ type: "segment", utteranceId: this.utteranceId, text });
          this.reply({
            type: "complete",
            utteranceId: this.utteranceId,
            trace: { receivedBytes: bytes, writtenBytes: bytes, finalCount: 1,
              grpcStatus: 0, results: [{ atMs: 510, endOffsetMs: 500, isFinal: true, text }] },
          });
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
  assert.match(await first.innerText(), /Chirp PCM bytes: browser \d+, relay \d+, gRPC writes \d+/);
  const trace = JSON.parse(await first.locator("details pre").textContent());
  assert.equal(trace.audioSent.samples * 2, trace.chirpRelayTrace.receivedBytes);
  const drained = trace.events.find((event) => event.name === "capture-drained");
  assert.ok(drained && drained.ms <= trace.audioSent.finishMs);
  assert.ok(trace.audioSent.lastAudioMs <= trace.audioSent.finishMs);
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
  await page.evaluate(() => {
    window.testAudio.chirp3 = [];
    window.testAudio.elevenlabs = [];
  });
  await runPaired();
  assert.match(await first.innerText(), /zero retention was not applied/);
  assert.match(await first.innerText(), /Call my stone/);
  assert.match(await first.innerText(), /Cold ducks stone/);
  const warnedAudio = await page.evaluate(() => window.testAudio);
  assert(warnedAudio.elevenlabs.length > 0);
  assert.deepEqual(warnedAudio.chirp3, warnedAudio.elevenlabs);
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
  const jsonFile = (name, value) => ({
    name, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(value)),
  });
  const clips = [
    { id: "audio-01", file: "example.wav", reference: "call my stone", speakerGroup: "p1" },
    {
      id: "audio-02", file: "example-2.wav", reference: "cold ducks money",
      targets: ["cold", "ducks", "stone"], speakerGroup: "p2", referenceStatus: "needsReview",
    },
  ];
  const wav = Buffer.alloc(44 + 16000);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(16000, 24);
  wav.writeUInt32LE(32000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(wav.length - 44, 40);
  const beforeFileMode = ticketRequests;
  await page.getByRole("button", { name: "Audio files + references" }).click();
  await page.locator("#file-manifest").setInputFiles(jsonFile("manifest.json", { version: 1, clips }));
  await page.locator("#file-audio").setInputFiles(
    clips.map((clip) => ({ name: clip.file, mimeType: "audio/wav", buffer: wav })),
  );
  await page.getByText(/2 matching audio files/).waitFor();
  assert.equal(ticketRequests, beforeFileMode);
  await page.locator("#file-code").fill("a".repeat(64));
  await page.locator("#file-run").click();
  assert.equal(ticketRequests, beforeFileMode);
  await page.evaluate(() => {
    window.testAudio = { chirp3: [], deepgram: [], elevenlabs: [] };
    window.testHints = { chirp3: [], deepgram: [], elevenlabs: [] };
    window.testHoldElevenFinal = true;
  });
  await page.locator("#file-consent").check();
  await page.locator("#file-run").click();
  await page.getByText(/1 \/ 4 provider jobs finished/).waitFor();
  assert.match(await page.locator("#file-progress-active").innerText(), /ElevenLabs.*\nWaiting for final transcript/);
  assert.match(await page.locator("#file-progress-log").innerText(), /example\.wav[\s\S]+Call my stone/);
  const checkpoint = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export results JSON" }).click();
  const checkpointData = JSON.parse(await readFile(await (await checkpoint).path(), "utf8"));
  assert.deepEqual(checkpointData.results.map((r) => [r.clipId, r.provider]), [["audio-01", "Chirp 3 · no keyterms"]]);
  assert.equal(checkpointData.reports, undefined);
  await page.evaluate(() => {
    window.testHoldElevenFinal = false;
    window.testReleaseElevenFinal();
  });
  await page.getByText(/Run ended after 2 clips/).waitFor({ timeout: 16000 });
  assert.match(await page.locator("#file-progress-counts").innerText(), /4 \/ 4 provider jobs finished · 4 transcribed · 0 failed/);
  const summary = await page.locator("#file-summary tbody").nth(1).innerText();
  assert.match(summary, /Chirp 3[^\n]+2\/2[^\n]+2\/5 \(40\.0%\)/);
  assert.match(summary, /ElevenLabs[^\n]+2\/2[^\n]+3\/5 \(60\.0%\)[^\n]+1\/1 \(100\.0%\)/);
  assert.match(await page.locator("#file-overlap-result").innerText(), /Invalidated by disagreement: 2\/2 \(100\.00%\)/);
  await page.getByText("Listen to and review individual clips").click();
  await page.locator("#file-clip").selectOption("audio-02");
  assert.match(await page.locator("#file-item-results").innerText(), /Expected: 110/);
  const elevenReview = page.locator('#file-item-results details[data-provider^="ElevenLabs"]');
  await elevenReview.locator("summary").click();
  assert.match(await elevenReview.innerText(), /Cold ducks stone/);
  const player = page.locator("#file-player");
  assert.match(await player.getAttribute("src"), /^blob:/);
  await player.evaluate(async (audio) => {
    await audio.play();
    audio.pause();
  });
  assert.equal(ticketRequests, beforeFileMode + 4, "local playback must not request a ticket");
  await page.getByLabel("Audio quality / review status").selectOption("difficult");
  await page.getByLabel("Human transcript · edit only if the original is wrong").fill("cold ducks stone");
  await page.getByRole("button", { name: "Save audio / reference review" }).click();
  assert.match(await page.locator("#file-item-results").innerText(), /Expected: 111/);
  await page.locator("#file-scope").selectOption("original");
  assert.match(await page.locator("#file-summary tbody").nth(1).innerText(), /ElevenLabs[^\n]+1\/1 \(100\.0%\)/);
  await page.locator("#file-scope").selectOption("unflagged");
  assert.match(await page.locator("#file-summary tbody").nth(1).innerText(), /ElevenLabs[^\n]+1\/1/);
  await page.locator("#file-scope").selectOption("adjudicated");
  await elevenReview.getByLabel("Review stone", { exact: false }).selectOption("0");
  await elevenReview.getByRole("button", { name: "Save target decisions" }).click();
  assert.match(await elevenReview.innerText(), /stone\s+1\s+1\s+0\s+Missed target/);
  assert.equal(await page.locator(".file-scatter circle").count(), 2);
  const replayed = await page.evaluate(() => window.testAudio);
  assert.equal(replayed.chirp3.length, 10);
  assert.deepEqual(replayed.chirp3, replayed.elevenlabs);
  assert.equal(ticketRequests, beforeFileMode + 4);
  await page.locator("#file-keyterms").selectOption("both");
  await page.locator("#file-run").click();
  await page.getByText(/Run ended after 2 clip runs/).waitFor({ timeout: 16000 });
  assert.match(await page.locator("#file-progress-providers").innerText(), /Chirp 3: 4 \/ 4 successful across this dataset/);
  await page.getByText("Keyterms effect · Off → On", { exact: true }).waitFor();
  const { testAudio: bothAudio, testHints } = await page.evaluate(() => ({
    testAudio: window.testAudio, testHints: window.testHints,
  }));
  assert.deepEqual(bothAudio.chirp3.slice(10), replayed.chirp3);
  assert.deepEqual(bothAudio.chirp3, bothAudio.elevenlabs);
  assert.deepEqual(testHints.chirp3, [
    { enabled: false, terms: [] },
    { enabled: false, terms: [] },
    { enabled: true, terms: ["call", "my", "stone"] },
    { enabled: true, terms: ["cold", "ducks", "stone"] },
  ]);
  assert.deepEqual(testHints.elevenlabs, [[], [], ["call", "my", "stone"], ["cold", "ducks", "stone"]]);
  assert.equal(ticketRequests, beforeFileMode + 8);
  const exported = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export results JSON" }).click();
  const saved = await (await exported).path();
  const data = JSON.parse(await readFile(saved, "utf8"));
  assert.equal(data.reviews[0].reference, "cold ducks stone");
  assert.equal(data.reports.original.details.find((r) => r.clipId === "audio-02").expected.join(""), "110");
  await page.locator("#file-manifest").setInputFiles(jsonFile("manifest.json", { version: 1, clips }));
  await page.locator("#file-results").setInputFiles(saved);
  await page.locator("#file-clip").selectOption("audio-02");
  assert.match(await page.locator("#file-item-results").innerText(), /Expected: 111/);
  await page.locator("#file-keyterms").selectOption("off");
  await page.locator('input[name="file-provider"][value="deepgram"]').check();
  await page.locator("#file-consent").check();
  await page.locator("#file-run").click();
  await page.getByText("Batch paused for Deepgram Nova-3", { exact: true }).waitFor();
  assert.match(await page.locator("#file-progress-counts").innerText(), /1 \/ 2 provider jobs finished · 0 transcribed · 1 failed · 1 not finished/);
  assert.match(await page.locator("#file-progress-log").innerText(), /Ticket HTTP 502/);
  if (process.env.EE_BENCH_ACAD_MANIFEST) {
    const acad = JSON.parse(await readFile(process.env.EE_BENCH_ACAD_MANIFEST, "utf8"));
    await page.locator("#file-manifest").setInputFiles(process.env.EE_BENCH_ACAD_MANIFEST);
    await page.getByText(new RegExp(`^${acad.clips.length} clips`)).waitFor();
    await page.locator("#file-review-filter").selectOption("diff");
    assert.ok(await page.locator("#file-clip option").count() >=
      acad.clips.filter((clip) => clip.referenceStatus === "needsReview").length);
    assert.equal(ticketRequests, beforeFileMode + 9);
  }
  await page.locator("#file-manifest").setInputFiles(jsonFile("manifest.json", { version: 1, clips }));
  await page.getByText(/2 clips · 2 matching audio files/).waitFor();
  await page.locator("#file-workers").selectOption("2");
  await page.locator('input[name="file-provider"][value="deepgram"]').uncheck();
  await page.locator("#file-consent").check();
  await page.evaluate(() => { window.testHoldElevenFinal = true; });
  await page.locator("#file-run").click();
  await page.waitForFunction(() => {
    const active = document.getElementById("file-progress-active").textContent;
    return active.includes("example.wav") && active.includes("example-2.wav");
  });
  await page.locator("#file-cancel").click();
  await page.getByText("Cancelled · finished results are saved in this tab", { exact: true }).waitFor();
  await page.locator("#file-manifest").setInputFiles(jsonFile("manifest.json", { version: 1, clips }));
  await page.getByText(/2 clips · 2 matching audio files/).waitFor();
  await page.evaluate(() => { window.testTailProbe = true; });
  await page.locator("#file-keyterms").selectOption("on");
  await page.locator("#file-tail-test").check();
  await page.locator("#file-consent").check();
  await page.locator("#file-run").click();
  await page.getByText(/Run ended after 4 clip runs/).waitFor({ timeout: 22000 });
  const tail = page.locator("#file-tail-summary");
  assert.match(await tail.innerText(), /Complete pairs: 2\/2.*2 at 0 ms → 0 at 800 ms/);
  assert.match(await tail.innerText(), /4 matched, 0 mismatched, 0 unavailable/);
  await tail.locator("summary").click();
  assert.match(await tail.innerText(), /16000 \/ 16000 \/ 16000 \/ 16000 · matched/);
  assert.match(await tail.innerText(), /41600 \/ 41600 \/ 41600 \/ 41600 · matched/);
  const tailDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export results JSON" }).click();
  const tailData = JSON.parse(await readFile(await (await tailDownload).path(), "utf8"));
  assert.equal(tailData.reports.original.summary.length, 0);
  assert.equal(tailData.results.length, 4);
  assert.equal(tailData.results[0].evidence.relay.results[0].endOffsetMs, 500);
  assert.match(tailData.results[0].evidence.originalPcmSha256, /^[a-f0-9]{64}$/);
  for (const clip of clips) {
    const pair = tailData.results.filter(({ clipId }) => clipId === clip.id);
    assert.equal(pair[0].evidence.originalPcmSha256, pair[1].evidence.originalPcmSha256);
  }
  assert.deepEqual(errors, []);
  console.log(
    "Preview UI passed: live comparison and complete same-audio RSVP dataset replay.",
  );
} finally {
  await browser?.close();
  server.close();
}
