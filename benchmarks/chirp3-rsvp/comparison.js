import { DeepgramRealtimeTranscriber } from "@threshold/components/speech/deepgramRealtimeTranscriber";
import { SpeechSession } from "@threshold/components/speech/speechSession";
import { analyze } from "./evidence.js";

function comparisonSocket(url, protocols) {
  const socket = new WebSocket(url, protocols);
  let keepAlive;
  socket.addEventListener("open", () => {
    keepAlive = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN)
        socket.send('{"type":"KeepAlive"}');
    }, 3000);
  }, { once: true });
  socket.addEventListener("close", () => clearInterval(keepAlive), { once: true });
  return {
    get readyState() { return socket.readyState; },
    addEventListener: socket.addEventListener.bind(socket),
    send(data) {
      if (typeof data !== "string" && socket.bufferedAmount > 256 * 1024)
        throw new Error("The Deepgram audio connection is congested.");
      socket.send(data);
    },
    close(code, reason) {
      clearInterval(keepAlive);
      // Browser clients cannot send the reserved 1011 close code.
      socket.close(code === 1011 ? 4001 : code, reason);
    },
  };
}

export function createComparison(run, tokenProvider, elapsed) {
  const report = (run.comparison = {
    provider: "deepgram",
    model: "nova-3",
    endpointingMs: 1500,
    chunks: 0,
    samples: 0,
    score: null,
    error: null,
    interimTranscripts: [],
  });
  const transcriber = new DeepgramRealtimeTranscriber({
    tokenProvider,
    languageCode: "en-US",
    keyterms: run.targets,
    targetKeytermBiasEnabled: run.settings.keyterms,
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
