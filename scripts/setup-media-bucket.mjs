/**
 * One-off setup for the media bucket. Safe to re-run; every call replaces the
 * previous configuration with the same values.
 *
 *   node scripts/setup-media-bucket.mjs
 *
 * Two things need doing that the Firebase console cannot do:
 *
 *   1. CORS. The browser sends media bytes straight to Google rather than
 *      through a Netlify function, so the bucket must accept cross-origin PUTs
 *      from the compiler's origins. Without this, uploads fail with a CORS
 *      error that says nothing about the real cause.
 *
 *   2. Public reads. Netlify proxies /media/* to the bucket anonymously, so the
 *      objects have to be world-readable. Writes stay closed: they are only
 *      possible through the service account the upload function holds.
 */
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const BUCKET = process.env.MEDIA_BUCKET ?? "easyeyes-media.firebasestorage.app";

/**
 * Extra origins may be passed as arguments, which deploy previews need:
 *
 *   node scripts/setup-media-bucket.mjs https://deploy-preview-42--easyeyes.netlify.app
 *
 * They have to be named one at a time because Google's CORS configuration
 * matches origins exactly and accepts no wildcard beyond a bare "*".
 */
const ALLOWED_ORIGINS = [
  "https://easyeyes.app",
  "http://localhost:5500",
  "http://localhost:8888",
  ...process.argv.slice(2),
];

const SCOPE = "https://www.googleapis.com/auth/devstorage.full_control";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

function serviceAccountFromEnv() {
  const env = (() => {
    try {
      return readFileSync(join(ROOT, ".env"), "utf8");
    } catch {
      return "";
    }
  })();

  const read = (name) =>
    process.env[name] ?? env.match(new RegExp(`^${name}=(.+)$`, "m"))?.[1];

  const clientEmail = read("FIREBASE_MEDIA_CLIENT_EMAIL");
  const privateKey = read("FIREBASE_MEDIA_PRIVATE_KEY");

  if (clientEmail && privateKey)
    return {
      client_email: clientEmail.trim(),
      private_key: privateKey
        .trim()
        .replace(/^["']|["']$/g, "")
        .replace(/\\n/g, "\n"),
    };

  const encoded = read("FIREBASE_MEDIA_SERVICE_ACCOUNT");
  if (!encoded)
    throw new Error(
      "Set FIREBASE_MEDIA_CLIENT_EMAIL and FIREBASE_MEDIA_PRIVATE_KEY, or FIREBASE_MEDIA_SERVICE_ACCOUNT",
    );

  return JSON.parse(Buffer.from(encoded.trim(), "base64").toString("utf8"));
}

async function accessToken(account) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: account.client_email,
    scope: SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: issuedAt,
    exp: issuedAt + 3600,
  })}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(account.private_key, "base64url")}`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok)
    throw new Error(`Token request failed → ${response.status} ${await response.text()}`);

  return (await response.json()).access_token;
}

async function call(url, token, method, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok)
    throw new Error(`${method} ${url} → ${response.status} ${await response.text()}`);

  return response.json();
}

async function main() {
  const account = serviceAccountFromEnv();
  console.log(`Configuring ${BUCKET} as ${account.client_email}`);

  const token = await accessToken(account);
  const base = `https://storage.googleapis.com/storage/v1/b/${BUCKET}`;

  await call(base, token, "PATCH", {
    cors: [
      {
        origin: ALLOWED_ORIGINS,
        method: ["GET", "HEAD", "PUT", "POST", "OPTIONS"],
        responseHeader: ["Content-Type", "Location", "Range", "x-goog-*"],
        maxAgeSeconds: 3600,
      },
    ],
  });
  console.log(`  CORS allowed for: ${ALLOWED_ORIGINS.join(", ")}`);

  const policy = await call(`${base}/iam`, token, "GET");
  const bindings = policy.bindings ?? [];
  const reader = bindings.find((b) => b.role === "roles/storage.objectViewer");

  if (reader?.members?.includes("allUsers")) {
    console.log("  Public reads already allowed");
  } else {
    if (reader) reader.members = [...(reader.members ?? []), "allUsers"];
    else
      bindings.push({
        role: "roles/storage.objectViewer",
        members: ["allUsers"],
      });

    await call(`${base}/iam`, token, "PUT", { ...policy, bindings });
    console.log("  Public reads allowed (objects only; writes stay closed)");
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
