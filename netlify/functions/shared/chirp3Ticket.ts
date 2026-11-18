import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export interface Chirp3TicketClaims {
  version: 1;
  audience: string;
  origin: string;
  session: string;
  id: string;
  issuedAt: number;
  expiresAt: number;
}

export const chirp3StreamUrl = (value: string): string => {
  const url = new URL(value);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (
    (url.protocol !== "wss:" && !(local && url.protocol === "ws:")) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/v1/stream"
  )
    throw new Error("Invalid Chirp 3 stream URL.");
  return url.toString();
};

const signature = (payload: string, secret: string): Buffer => {
  if (secret.length < 32)
    throw new Error(
      "Chirp 3 ticket secret must contain at least 32 characters.",
    );
  return createHmac("sha256", secret).update(payload).digest();
};

export const issueChirp3Ticket = (
  input: Pick<Chirp3TicketClaims, "audience" | "origin" | "session">,
  secret: string,
  nowMs = Date.now(),
): string => {
  const issuedAt = Math.floor(nowMs / 1000);
  const claims: Chirp3TicketClaims = {
    ...input,
    version: 1,
    id: randomUUID(),
    issuedAt,
    expiresAt: issuedAt + 60,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${signature(payload, secret).toString("base64url")}`;
};

export const verifyChirp3Ticket = (
  token: string,
  secret: string,
  audience: string,
  origin: string,
  nowMs = Date.now(),
): Chirp3TicketClaims => {
  if (typeof token !== "string" || token.length > 4096)
    throw new Error("Invalid speech ticket.");
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Invalid speech ticket.");
  const expected = signature(parts[0], secret);
  const supplied = Buffer.from(parts[1], "base64url");
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    throw new Error("Invalid speech ticket.");
  const claims = JSON.parse(
    Buffer.from(parts[0], "base64url").toString("utf8"),
  ) as Chirp3TicketClaims;
  const now = Math.floor(nowMs / 1000);
  if (
    claims.version !== 1 ||
    claims.audience !== audience ||
    claims.origin !== origin ||
    typeof claims.session !== "string" ||
    !/^[a-f0-9]{64}$/.test(claims.session) ||
    typeof claims.id !== "string" ||
    !/^[a-f0-9-]{36}$/.test(claims.id) ||
    !Number.isInteger(claims.issuedAt) ||
    !Number.isInteger(claims.expiresAt) ||
    claims.issuedAt > now + 5 ||
    claims.expiresAt <= now ||
    claims.expiresAt - claims.issuedAt !== 60
  )
    throw new Error("Expired or invalid speech ticket.");
  return claims;
};
