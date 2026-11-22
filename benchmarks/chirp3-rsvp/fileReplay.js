import { GoogleChirp3Transcriber } from "@threshold/components/speech/googleChirp3Transcriber";
import { DeepgramRealtimeTranscriber } from "@threshold/components/speech/deepgramRealtimeTranscriber";
import { ElevenLabsRealtimeTranscriber } from "@threshold/components/speech/elevenLabsRealtimeTranscriber";
import { SpeechSession } from "@threshold/components/speech/speechSession";
import { float32ToPcm16 } from "@threshold/components/speech/audioCapture";
import { comparisonSocket } from "./comparison.js";

export const replayProviders = {
  chirp3: "Chirp 3 · no keyterms",
  elevenlabs: "ElevenLabs Scribe v2 Realtime · no keyterms",
  deepgram: "Deepgram Nova-3 · no keyterms",
};

async function ticket(provider, accessCode, signal) {
  const response = await fetch("/.netlify/functions/rsvp-benchmark-ticket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessCode, provider }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Ticket HTTP ${response.status}`);
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

function transcriber(provider, id, getTicket, onRetentionWarning) {
  const common = { keyterms: [], targetKeytermBiasEnabled: false, languageCode: "en-US" };
  if (provider === "chirp3")
    return new GoogleChirp3Transcriber({
      ...common, utteranceId: id, credentialProvider: getTicket,
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

const delay = (ms, signal) => new Promise((resolve) => {
  if (signal.aborted) return resolve();
  const done = () => {
    clearTimeout(timer);
    signal.removeEventListener("abort", done);
    resolve();
  };
  const timer = setTimeout(done, ms);
  signal.addEventListener("abort", done, { once: true });
});

export async function replayClip(file, clipId, keys, accessCode, signal) {
  const fail = (provider, error) => ({ clipId, provider: replayProviders[provider], error });
  let samples;
  try {
    samples = await decode(file);
  } catch (error) {
    return { rows: keys.map((key) => fail(key, error.message?.slice(0, 180) || "Could not decode audio.")), warning: false };
  }
  if (signal.aborted) return { rows: [], warning: false };

  // The reference text is never passed into this module or into the credentials request.
  const id = `file-${crypto.randomUUID()}`;
  let warning = false;
  const states = keys.map((key) => {
    const getTicket = () => ticket(key, accessCode, signal);
    const session = new SpeechSession(transcriber(key, id, getTicket, () => { warning = true; }), {
      maximumUtteranceDurationMs: 35_000,
      finalizationTimeoutMs: 10_000,
      externallyControlledEnd: true,
    });
    return { key, session, error: null };
  });
  const abort = () => {
    for (const { session } of states) void session.close().catch(() => {});
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    await Promise.all(states.map(async (state) => {
      try {
        await state.session.connect();
        state.result = state.session.beginUtterance(id).catch((error) => {
          state.error ??= error?.code || "Transcription failed.";
          return null;
        });
      } catch (error) {
        state.error = error?.code || error.message?.match(/^Ticket HTTP \d+$/)?.[0] || "Could not connect.";
      }
    }));
    for (let i = 0; i < samples.length && !signal.aborted; i += FRAME) {
      const active = states.filter((state) => !state.error);
      if (!active.length) break;
      const chunk = { samples: samples.subarray(i, i + FRAME), sampleRate: RATE, capturedAtMs: performance.now() };
      for (const state of active)
        if (!state.session.pushAudio(chunk)) state.error ??= "Provider stopped accepting audio.";
      await delay(chunk.samples.length * 1000 / RATE, signal);
    }
    if (signal.aborted) return { rows: [], warning };
    for (const state of states) {
      if (state.error) continue;
      try {
        state.session.requestCommit();
      } catch (error) {
        state.error ??= error?.code || "Could not finalize.";
      }
    }
    const rows = await Promise.all(states.map(async (state) => {
      if (state.error) return fail(state.key, state.error);
      const result = await state.result;
      return result
        ? { clipId, provider: replayProviders[state.key], transcript: result.text }
        : fail(state.key, state.error || "No result.");
    }));
    return { rows, warning };
  } finally {
    signal.removeEventListener("abort", abort);
    await Promise.allSettled(states.map(({ session }) => session.close()));
  }
}
