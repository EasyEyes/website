import { DeepgramRealtimeTranscriber } from "@threshold/components/speech/deepgramRealtimeTranscriber";
import { ElevenLabsRealtimeTranscriber } from "@threshold/components/speech/elevenLabsRealtimeTranscriber";
import { SpeechSession } from "@threshold/components/speech/speechSession";
import { analyze } from "./evidence.js";

export const comparisonProviders = {
  deepgram: { label: "Deepgram Nova-3", env: "RSVP_BENCH_DEEPGRAM_API_KEY" },
  elevenlabs: { label: "ElevenLabs Scribe v2 Realtime", env: "RSVP_BENCH_ELEVENLABS_API_KEY" },
};

function comparisonSocket(url, protocols, onRetentionWarning) {
  const socket = new WebSocket(url, protocols);
  let keepAlive;
  if (protocols) {
    socket.addEventListener("open", () => {
      keepAlive = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN)
          socket.send('{"type":"KeepAlive"}');
      }, 3000);
    }, { once: true });
  }
  if (onRetentionWarning) {
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      try {
        const message = JSON.parse(event.data);
        if (message?.message_type === "warning" &&
            /zero retention|being logged|still logged/i.test(message.warning ?? ""))
          onRetentionWarning();
      } catch {
        // The adapter handles malformed messages.
      }
    });
  }
  socket.addEventListener("close", () => clearInterval(keepAlive), { once: true });
  return {
    get readyState() { return socket.readyState; },
    addEventListener: socket.addEventListener.bind(socket),
    send(data) {
      if ((onRetentionWarning || typeof data !== "string") && socket.bufferedAmount > 256 * 1024)
        throw new Error("The comparison connection is congested.");
      socket.send(data);
    },
    close(code, reason) {
      clearInterval(keepAlive);
      // Browser clients cannot send the reserved 1011 close code.
      socket.close(code === 1011 ? 4001 : code, reason);
    },
  };
}

export function createComparison(run, provider, tokenProvider, elapsed) {
  const eleven = provider === "elevenlabs";
  const report = (run.comparisons[provider] = {
    provider,
    ...(eleven
      ? { model: "scribe_v2_realtime", commitStrategy: "manual", enableLogging: false }
      : { model: "nova-3", endpointingMs: 1500 }),
    chunks: 0,
    samples: 0,
    score: null,
    error: null,
    interimTranscripts: [],
  });
  const common = {
    tokenProvider,
    languageCode: eleven ? "en" : "en-US",
    keyterms: run.targets,
    targetKeytermBiasEnabled: run.settings.keyterms,
  };
  const transcriber = eleven
    ? new ElevenLabsRealtimeTranscriber({
        ...common,
        webSocketFactory(url) {
          const manual = new URL(url);
          // Only Chirp controls the trial; avoid mistaking an automatic commit for the final flush.
          manual.searchParams.set("commit_strategy", "manual");
          for (const key of ["vad_silence_threshold_secs", "vad_threshold", "min_speech_duration_ms", "min_silence_duration_ms"])
            manual.searchParams.delete(key);
          return comparisonSocket(manual, undefined, () => {
            report.retentionWarning = true;
          });
        },
      })
    : new DeepgramRealtimeTranscriber({
        ...common,
        endpointingMs: report.endpointingMs,
        webSocketFactory: comparisonSocket,
      });
  const session = new SpeechSession(transcriber, {
    maximumUtteranceDurationMs: run.settings.cap * 1000,
    finalizationTimeoutMs: run.settings.stt * 1000,
    externallyControlledEnd: true,
  });
  const fail = (error) => {
    report.error ??= error?.code ?? "comparisonFailed";
  };
  session.subscribe((event) => {
    if (event.type === "error") fail(event.error);
    if (event.type === "partial" && !event.settled) {
      const text = event.text.slice(-512);
      const list = report.interimTranscripts;
      if (list.at(-1)?.text !== text) {
        list.push({ ms: elapsed(), text });
        if (list.length > 60) list.shift();
      }
    }
  });
  let outcome;
  const attempt = (fn) => {
    if (!report.error) {
      try {
        fn();
      } catch (error) {
        fail(error);
      }
    }
  };
  return {
    async connect() {
      try {
        await session.connect();
      } catch (error) {
        fail(error);
      }
    },
    begin(id) {
      attempt(() => {
        outcome = session.beginUtterance(id).then(({ text }) => {
          if (report.error) return;
          report.score = analyze(run.targets, text, run.settings);
          report.finishToFinalMs = Math.round(elapsed() - report.finishMs);
        }).catch(fail);
      });
    },
    send(chunk) {
      attempt(() => {
        if (session.pushAudio(chunk)) {
          report.chunks++;
          report.samples += chunk.samples.length;
        }
      });
    },
    finish() {
      attempt(() => {
        report.finishMs = elapsed();
        session.requestCommit();
      });
    },
    async settle() {
      if (report.finishMs != null) await outcome;
    },
    close() {
      return session.close().catch(fail);
    },
  };
}
