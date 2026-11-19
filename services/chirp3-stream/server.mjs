import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import {
  chirp3StreamUrl,
  verifyChirp3Ticket,
} from "../../netlify/functions/shared/chirp3Ticket.ts";
import { isAllowedOrigin } from "../../netlify/functions/shared/cors.ts";
import { buildRecognitionRequest } from "./config.mjs";

const MAX_AUDIO_MESSAGE = 24000;
const MAX_BUFFER = 256 * 1024;
const MAX_PENDING_AUDIO_WRITES = 16;

export function createChirp3Server({
  project,
  location,
  publicUrl,
  ticketSecret,
  createStream,
  maxConnections = 80,
  maxStreamMs = 290000,
  finalizationMs = 290000,
}) {
  if (
    !/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(project ?? "") ||
    !["eu", "us"].includes(location) ||
    ticketSecret?.length < 32 ||
    typeof ticketSecret !== "string" ||
    typeof createStream !== "function" ||
    !Number.isInteger(maxConnections) ||
    maxConnections < 1 ||
    maxConnections > 1000 ||
    !Number.isFinite(maxStreamMs) ||
    maxStreamMs <= 0 ||
    maxStreamMs > 290000 ||
    !Number.isFinite(finalizationMs) ||
    finalizationMs <= 0 ||
    finalizationMs > 290000
  )
    throw new Error("Invalid Chirp 3 server configuration.");
  const audience = chirp3StreamUrl(publicUrl);
  const server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.writeHead(request.url === "/health" ? 200 : 404);
    response.end(request.url === "/health" ? "ok" : "Not found");
  });
  const sockets = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_AUDIO_MESSAGE,
    perMessageDeflate: false,
    clientTracking: true,
  });
  const usedTickets = new Map();
  server.on("upgrade", (request, socket, head) => {
    socket.on("error", () => socket.destroy());
    if (
      request.url !== "/v1/stream" ||
      !isAllowedOrigin(request.headers.origin) ||
      sockets.clients.size >= maxConnections
    ) {
      socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
      return;
    }
    sockets.handleUpgrade(request, socket, head, (ws) =>
      sockets.emit("connection", ws, request),
    );
  });
  sockets.on("connection", (ws, request) => {
    let stream, recognitionRequest, utteranceId;
    let phase = "authenticating";
    let pendingAudioWrites = 0;
    let totalAudioBytes = 0,
      audioStartedAt,
      lastAudioAt;
    let ended = false,
      statusOk = false,
      alive = true;
    let authTimer, durationTimer, finalTimer, heartbeat;
    const send = (message) => {
      if (ws.readyState !== WebSocket.OPEN || ws.bufferedAmount > MAX_BUFFER) {
        ws.terminate();
        return false;
      }
      ws.send(JSON.stringify(message));
      return true;
    };
    const cleanup = () => {
      clearTimeout(authTimer);
      clearTimeout(durationTimer);
      clearTimeout(finalTimer);
      clearInterval(heartbeat);
      if (phase !== "completed") stream?.destroy();
    };
    const fail = (code) => {
      if (phase === "failed" || phase === "completed") return;
      phase = "failed";
      send({ type: "error", code, utteranceId });
      cleanup();
      ws.close(1011, "speech-failed");
    };
    const complete = () => {
      if (!ended || !statusOk || phase !== "finalizing") return;
      phase = "completed";
      send({ type: "complete", utteranceId });
      cleanup();
      ws.close(1000, "speech-complete");
    };
    const openGoogleStream = () => {
      stream = createStream();
      stream.on("error", (error) =>
        fail(
          error?.code === 8
            ? "quotaExceeded"
            : error?.code === 7 || error?.code === 16
            ? "authenticationFailure"
            : "providerUnavailable",
        ),
      );
      stream.on("data", (response) => {
        if (phase !== "listening" && phase !== "finalizing") return;
        const interim = [];
        for (const result of response.results ?? []) {
          const text = result.alternatives?.[0]?.transcript;
          if (typeof text !== "string") continue;
          if (result.isFinal) send({ type: "segment", utteranceId, text });
          else if (text.trim()) interim.push(text);
        }
        if (interim.length)
          send({ type: "partial", utteranceId, text: interim.join(" ") });
      });
      stream.on("status", (status) => {
        if (status.code !== 0) {
          fail("providerUnavailable");
          return;
        }
        statusOk = true;
        complete();
      });
      stream.on("end", () => {
        ended = true;
        if (phase !== "finalizing") {
          fail("providerUnavailable");
          return;
        }
        complete();
      });
      stream.write(recognitionRequest, (error) => {
        if (error) fail("providerUnavailable");
      });
    };
    authTimer = setTimeout(() => fail("authenticationFailure"), 5000);
    durationTimer = setTimeout(() => fail("sessionLimit"), maxStreamMs);
    heartbeat = setInterval(() => {
      if (!alive) {
        fail("connectionFailure");
        return;
      }
      alive = false;
      ws.ping();
      if (
        phase === "listening" &&
        lastAudioAt &&
        Date.now() - lastAudioAt > 15000
      )
        fail("connectionFailure");
    }, 10000);
    ws.on("pong", () => {
      alive = true;
    });
    ws.on("close", cleanup);
    ws.on("error", () => {
      fail("connectionFailure");
      ws.terminate();
    });
    ws.on("message", (data, isBinary) => {
      try {
        if (isBinary) {
          if (
            (phase !== "awaitingAudio" && phase !== "listening") ||
            !data.length ||
            data.length % 2 ||
            data.length > MAX_AUDIO_MESSAGE
          )
            throw new Error("Unexpected audio.");
          const now = Date.now();
          audioStartedAt ??= now;
          lastAudioAt = now;
          totalAudioBytes += data.length;
          if (
            totalAudioBytes > 32000 * 285 ||
            totalAudioBytes > (now - audioStartedAt + 2000) * 32
          )
            throw new Error("Audio backlog exceeded.");
          if (pendingAudioWrites >= MAX_PENDING_AUDIO_WRITES) {
            fail("providerUnavailable");
            return;
          }
          try {
            if (phase === "awaitingAudio") {
              phase = "listening";
              openGoogleStream();
              if (phase !== "listening") return;
            }
            // The writable stream queues audio behind the recognition config.
            // Count outstanding writes even when the SDK stream is not writable yet.
            pendingAudioWrites++;
            stream.write({ audio: Buffer.from(data) }, (error) => {
              pendingAudioWrites--;
              if (error) fail("providerUnavailable");
            });
          } catch {
            fail("providerUnavailable");
          }
          return;
        }
        const message = JSON.parse(data.toString());
        if (phase === "authenticating") {
          const claims = verifyChirp3Ticket(
            message.token,
            ticketSecret,
            audience,
            request.headers.origin,
          );
          const now = Math.floor(Date.now() / 1000);
          for (const [id, expiry] of usedTickets)
            if (expiry <= now) usedTickets.delete(id);
          if (usedTickets.has(claims.id)) throw new Error("Reused ticket.");
          recognitionRequest = buildRecognitionRequest(
            project,
            location,
            message,
          );
          usedTickets.set(claims.id, claims.expiresAt);
          utteranceId = message.utteranceId;
          clearTimeout(authTimer);
          // Ready means the relay can accept PCM, not that Google is connected.
          phase = "awaitingAudio";
          send({
            type: "ready",
            utteranceId,
            provider: "chirp3",
            model: "chirp_3",
            languageCode: message.languageCode,
            sampleRate: 16000,
          });
          return;
        }
        if (
          message.type === "finish" &&
          message.utteranceId === utteranceId &&
          (phase === "awaitingAudio" || phase === "listening")
        ) {
          if (!totalAudioBytes) {
            fail("invalidAudio");
            return;
          }
          phase = "finalizing";
          finalTimer = setTimeout(
            () => fail("providerUnavailable"),
            finalizationMs,
          );
          stream.end();
          return;
        }
        throw new Error("Unexpected speech control.");
      } catch {
        fail(
          phase === "authenticating"
            ? "authenticationFailure"
            : "invalidConfiguration",
        );
      }
    });
  });
  return {
    server,
    sockets,
    close: async () => {
      for (const ws of sockets.clients) ws.terminate();
      sockets.close();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
