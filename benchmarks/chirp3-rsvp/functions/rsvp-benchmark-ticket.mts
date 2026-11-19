import { createHash, timingSafeEqual } from "node:crypto";
import {
  chirp3StreamUrl,
  issueChirp3Ticket,
} from "../../../netlify/functions/shared/chirp3Ticket.ts";

const previewOrigin =
  /^https:\/\/(?:deploy-preview-\d+|benchmark-chirp3-rsvp)--easyeyes\.netlify\.app$/;
const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const response = (status: number, payload: object) =>
  Response.json(payload, { status, headers });
const digest = (value: string) => createHash("sha256").update(value).digest();

async function readAccessCode(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw Error("Missing body");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let body = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 256) {
        await reader.cancel();
        throw Error("Request is too large");
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode())?.accessCode;
  } finally {
    reader.releaseLock();
  }
}

export function createBenchmarkHandler(env = process.env, clock = Date.now) {
  // Limits accidental bursts on each warm function instance, not a global quota.
  let windowStart = 0;
  let issued = 0;
  return async (request: Request) => {
    const origin = env.RSVP_BENCH_ORIGIN;
    const code = env.RSVP_BENCH_ACCESS_CODE;
    const secret = env.CHIRP3_TICKET_SECRET;
    const relay = env.CHIRP3_RELAY_URL;
    if (
      !origin ||
      !previewOrigin.test(origin) ||
      !code ||
      !/^[a-f0-9]{64}$/i.test(code) ||
      !secret ||
      secret.length < 32 ||
      !relay
    )
      return response(503, { error: "previewNotConfigured" });
    if (request.method !== "POST")
      return response(405, { error: "methodNotAllowed" });
    if (
      new URL(request.url).origin !== origin ||
      request.headers.get("origin") !== origin ||
      request.headers.get("sec-fetch-site") !== "same-origin"
    )
      return response(403, { error: "previewOriginRequired" });
    let supplied: unknown;
    try {
      supplied = await readAccessCode(request);
    } catch {
      return response(400, { error: "invalidRequest" });
    }
    if (
      typeof supplied !== "string" ||
      supplied.length !== 64 ||
      !timingSafeEqual(digest(supplied), digest(code))
    )
      return response(401, { error: "invalidAccessCode" });
    const time = clock();
    if (time - windowStart >= 60_000) {
      windowStart = time;
      issued = 0;
    }
    if (issued >= 30) return response(429, { error: "benchmarkTicketLimit" });
    try {
      const websocketUrl = chirp3StreamUrl(relay);
      if (new URL(websocketUrl).protocol !== "wss:") throw Error();
      const ticket = issueChirp3Ticket(
        {
          audience: websocketUrl,
          origin,
          session: digest("rsvp-benchmark:" + origin).toString("hex"),
        },
        secret,
        time,
      );
      issued++;
      return response(200, { token: ticket, websocketUrl });
    } catch {
      return response(503, { error: "previewNotConfigured" });
    }
  };
}

export default createBenchmarkHandler();
