import { GoogleChirp3Transcriber } from "@threshold/components/speech/googleChirp3Transcriber";
import { DeepgramRealtimeTranscriber } from "@threshold/components/speech/deepgramRealtimeTranscriber";
import { ElevenLabsRealtimeTranscriber } from "@threshold/components/speech/elevenLabsRealtimeTranscriber";
import { SpeechSession } from "@threshold/components/speech/speechSession";
import { float32ToPcm16 } from "@threshold/components/speech/audioCapture";
import { comparisonSocket } from "./comparison.js";
import { readReplayEvidence, tailLabel, tailVariants } from "./fileDiagnostics.mjs";

export const replayProviders = {
  chirp3: "Chirp 3",
  elevenlabs: "ElevenLabs Scribe v2 Realtime",
  deepgram: "Deepgram Nova-3",
};
export const replayLabel = (provider, enabled) =>
  replayProviders[provider] + (enabled ? " · with keyterms" : " · no keyterms");

async function ticket(provider, accessCode, signal) {
  const response = await fetch("/.netlify/functions/rsvp-benchmark-ticket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessCode, provider }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const code = /^[a-zA-Z0-9_-]{1,60}$/.test(payload?.error ?? "") ? ` · ${payload.error}` : "";
    const upstream = Number.isInteger(payload?.upstreamStatus) ? ` · upstream HTTP ${payload.upstreamStatus}` : "";
    throw new Error(`Ticket HTTP ${response.status}${code}${upstream}`);
  }
  return response.json();
}

const RATE = 16000;
const FRAME = 1600;
async function decode(file) {
  if (file.size > 12 * 1024 * 1024) throw new Error("Audio exceeds 12 MB.");
  const context = new OfflineAudioContext(1, 1, RATE);
  const audio = await context.decodeAudioData(await file.arrayBuffer());
  if (!audio.length || audio.duration > 30) throw new Error("Clips must be 30 seconds or shorter.");
  const mono = new Float32Array(audio.length);
  for (let channel = 0; channel < audio.numberOfChannels; channel++) {
    const samples = audio.getChannelData(channel);
    for (let i = 0; i < mono.length; i++) mono[i] += samples[i] / audio.numberOfChannels;
  }
  return float32ToPcm16(mono);
}

function transcriber(provider, id, getTicket, keyterms, onRetentionWarning, evidence, now) {
  const common = {
    keyterms: keyterms ?? [],
    targetKeytermBiasEnabled: keyterms !== null,
    languageCode: "en-US",
  };
  if (provider === "chirp3")
    return new GoogleChirp3Transcriber({
      ...common, utteranceId: id, credentialProvider: getTicket,
      webSocketFactory(url, protocols) {
        const socket = new WebSocket(url, protocols);
        socket.addEventListener("message", ({ data }) => {
          if (typeof data !== "string") return;
          try {
            const message = JSON.parse(data);
            if (message.utteranceId !== id) return;
            if (message.type === "error") evidence.relayError = message.code;
            if (message.type === "error" || message.type === "complete") evidence.relay = message.trace;
            if (evidence.tailMs === undefined) return;
            if (message.type === "partial" && typeof message.text === "string") {
              evidence.lastInterim = message.text;
              if (evidence.interim.length === 32) evidence.interim.shift();
              evidence.interim.push({ atMs: now(), text: message.text });
            }
            if (message.type === "segment" && evidence.segments.length < 64)
              evidence.segments.push(message.text);
          } catch {
            // The adapter handles invalid relay messages.
          }
        });
        socket.addEventListener("close", (event) => {
          evidence.closeCode = event.code;
          evidence.closedAtMs = now();
        }, { once: true });
        return socket;
      },
    });
  const tokenProvider = async () => (await getTicket()).token;
  if (provider === "deepgram")
    return new DeepgramRealtimeTranscriber({
      ...common, tokenProvider, endpointingMs: 1500, webSocketFactory: comparisonSocket,
    });
  return new ElevenLabsRealtimeTranscriber({
    ...common, languageCode: "en", tokenProvider,
    webSocketFactory(url) {
      const manual = new URL(url);
      manual.searchParams.set("commit_strategy", "manual");
      for (const key of ["vad_silence_threshold_secs", "vad_threshold", "min_speech_duration_ms", "min_silence_duration_ms"])
        manual.searchParams.delete(key);
      return comparisonSocket(manual, undefined, onRetentionWarning);
    },
  });
}

export const delay = (ms, signal) => new Promise((resolve) => {
  if (signal.aborted) return resolve();
  const done = () => {
    clearTimeout(timer);
    signal.removeEventListener("abort", done);
    resolve();
  };
  const timer = setTimeout(done, ms);
  signal.addEventListener("abort", done, { once: true });
});

export async function replayClip(file, clipId, keys, accessCode, signal, nextTicketAt, keyterms, update, tailMs) {
  if (tailMs !== undefined && (!tailVariants.includes(tailMs) || keys.length !== 1 || keys[0] !== "chirp3"))
    throw new Error("Tail diagnostics require Chirp 3 and a supported silence setting.");
  const label = (key) => {
    const base = replayLabel(key, keyterms !== null);
    return tailMs === undefined ? base : tailLabel(base, tailMs);
  };
  const started = performance.now();
  const now = () => Math.round(performance.now() - started);
  const observations = new Map(keys.map((key) => [key, { tailMs, browserSentBytes: 0, segments: [], interim: [] }]));
  const settled = new Set();
  const stage = (key, phase) => {
    if (!signal.aborted && !settled.has(key)) update(key, phase);
  };
  const finish = (key, result) => {
    if (signal.aborted || settled.has(key)) return;
    settled.add(key);
    const observation = observations.get(key);
    const evidence = tailMs !== undefined || (key === "chirp3" && result.error)
      ? readReplayEvidence({ ...observation, elapsedMs: now() }) : undefined;
    if (result.error && /^[a-zA-Z0-9_-]{1,60}$/.test(observation.relayError ?? ""))
      result.error += ` · relay ${observation.relayError}`;
    update(key, result.error ? "failed" : "done", { clipId, provider: label(key), ...result, ...(evidence && { evidence }) });
  };
  let samples;
  try {
    samples = await decode(file);
  } catch (error) {
    for (const key of keys)
      finish(key, { error: error.message?.slice(0, 180) || "Could not decode audio." });
    return { warning: false };
  }
  if (signal.aborted) return { warning: false };
  const originalPcmBytes = samples.byteLength;
  const originalPcmSha256 = tailMs === undefined ? undefined : Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", samples)),
    (value) => value.toString(16).padStart(2, "0"),
  ).join("");
  if (signal.aborted) return { warning: false };
  if (tailMs) {
    const padded = new Int16Array(samples.length + tailMs * RATE / 1000);
    padded.set(samples);
    samples = padded;
  }
  for (const evidence of observations.values())
    Object.assign(evidence, { originalPcmBytes, originalPcmSha256, expectedPcmBytes: samples.byteLength });

  // Only the optional target hints are sent to the transcriber, not the reference record.
  const id = `file-${crypto.randomUUID()}`;
  let warning = false;
  const states = [];
  for (const key of keys) {
    const evidence = observations.get(key);
    let ticketError;
    const getTicket = async () => {
      const now = performance.now();
      const slot = Math.max(now, nextTicketAt.get(key) ?? 0);
      nextTicketAt.set(key, slot + 2200);
      await delay(slot - now, signal);
      signal.throwIfAborted();
      try {
        return await ticket(key, accessCode, signal);
      } catch (error) {
        if (/^Ticket HTTP \d+\b/.test(error.message ?? "")) ticketError = error.message;
        throw error;
      }
    };
    try {
      const adapter = transcriber(key, id, getTicket, keyterms, () => { warning = true; }, evidence, now);
      const session = new SpeechSession(adapter, {
        maximumUtteranceDurationMs: 35_000,
        finalizationTimeoutMs: 10_000,
        externallyControlledEnd: true,
      });
      states.push({ key, session, evidence, error: null, getTicketError: () => ticketError });
    } catch (error) {
      finish(key, { error: error.message?.slice(0, 180) || "Invalid provider configuration." });
    }
  }
  const abort = () => {
    for (const { session } of states) void session.close().catch(() => {});
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    await Promise.all(states.map(async (state) => {
      stage(state.key, "connecting");
      try {
        await state.session.connect();
        state.result = state.session.beginUtterance(id).catch((error) => {
          state.error ??= error?.code || "Transcription failed.";
          finish(state.key, { error: state.error });
          return null;
        });
        stage(state.key, "ready");
      } catch (error) {
        state.error = state.getTicketError() || error?.code || "Could not connect.";
        finish(state.key, { error: state.error });
      }
    }));
    for (const state of states) stage(state.key, "streaming");
    for (let i = 0; i < samples.length && !signal.aborted; i += FRAME) {
      const active = states.filter((state) => !state.error);
      if (!active.length) break;
      const chunk = { samples: samples.subarray(i, i + FRAME), sampleRate: RATE, capturedAtMs: performance.now() };
      for (const state of active) {
        if (!state.session.pushAudio(chunk)) {
          state.error ??= "Provider stopped accepting audio.";
          finish(state.key, { error: state.error });
        } else {
          state.evidence.firstAudioMs ??= now();
          state.evidence.lastAudioMs = now();
          state.evidence.browserSentBytes += chunk.samples.byteLength;
        }
      }
      await delay(chunk.samples.length * 1000 / RATE, signal);
    }
    if (signal.aborted) return { warning };
    for (const state of states) {
      if (state.error) continue;
      try {
        stage(state.key, "finalizing");
        state.evidence.finishMs = now();
        state.session.requestCommit();
      } catch (error) {
        state.error ??= error?.code || "Could not finalize.";
        finish(state.key, { error: state.error });
      }
    }
    await Promise.all(states.map(async (state) => {
      if (state.error) return;
      const result = await state.result;
      finish(state.key, result ? { transcript: result.text } : { error: state.error || "No result." });
    }));
    return { warning };
  } finally {
    signal.removeEventListener("abort", abort);
    await Promise.allSettled(states.map(({ session }) => session.close()));
  }
}
