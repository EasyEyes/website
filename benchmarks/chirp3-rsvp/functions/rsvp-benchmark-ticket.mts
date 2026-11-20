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

async function readTicketRequest(request: Request): Promise<{
  accessCode?: unknown;
  provider?: unknown;
} | null> {
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
    return JSON.parse(body + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

export function createBenchmarkHandler(
  env = process.env,
  clock = Date.now,
  fetchImpl = fetch,
) {
  // Limits accidental bursts on each warm function instance, not a global quota.
  let windowStart = 0;
  const requests = { chirp3: 0, deepgram: 0 };
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
    let input: { accessCode?: unknown; provider?: unknown } | null;
    try {
      input = await readTicketRequest(request);
    } catch {
      return response(400, { error: "invalidRequest" });
    }
    const supplied = input?.accessCode;
    if (
      typeof supplied !== "string" ||
      supplied.length !== 64 ||
      !timingSafeEqual(digest(supplied), digest(code))
    )
      return response(401, { error: "invalidAccessCode" });
    const provider = input?.provider ?? "chirp3";
    if (provider !== "chirp3" && provider !== "deepgram")
      return response(400, { error: "invalidProvider" });
    const time = clock();
    if (time - windowStart >= 60_000) {
      windowStart = time;
      requests.chirp3 = requests.deepgram = 0;
    }
    if (requests[provider] >= 30)
      return response(429, { error: "benchmarkTicketLimit" });
    requests[provider]++;
    if (provider === "deepgram") {
      const key = env.RSVP_BENCH_DEEPGRAM_API_KEY?.trim();
      if (!key) return response(503, { error: "deepgramNotConfigured" });
      try {
        const grant = await fetchImpl("https://api.deepgram.com/v1/auth/grant", {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(5000),
          headers: {
            Authorization: `Token ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ttl_seconds: 30 }),
        });
        if (!grant.ok) throw Error();
        const { access_token: token } = await grant.json();
        if (typeof token !== "string" || !token.trim()) throw Error();
        return response(200, { token });
      } catch {
        return response(502, { error: "deepgramGrantFailed" });
      }
    }
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
      return response(200, { token: ticket, websocketUrl });
    } catch {
      return response(503, { error: "previewNotConfigured" });
    }
  };
}

export default createBenchmarkHandler();
