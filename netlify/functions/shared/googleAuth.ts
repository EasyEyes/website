import { createSign } from "node:crypto";

export type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export const SERVICE_ACCOUNT_ENV_VAR = "FIREBASE_MEDIA_SERVICE_ACCOUNT";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const JWT_BEARER_GRANT = "urn:ietf:params:oauth:grant-type:jwt-bearer";

/** Google rejects assertions asking for more than an hour. */
const ASSERTION_LIFETIME_SECONDS = 3600;

/** Renew this early, so a token cannot expire midway through a request. */
const RENEWAL_MARGIN_MS = 60_000;

/**
 * The key is carried base64-encoded because its `private_key` field contains
 * newlines, which environment variable editors routinely mangle.
 */
export function loadServiceAccount(
  encoded: string | undefined = process.env[SERVICE_ACCOUNT_ENV_VAR],
): ServiceAccount {
  if (!encoded) throw new Error(`${SERVICE_ACCOUNT_ENV_VAR} is not set`);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  } catch {
    throw new Error(`${SERVICE_ACCOUNT_ENV_VAR} is not base64-encoded JSON`);
  }

  const { project_id: projectId, client_email: clientEmail } = parsed;
  const { private_key: privateKey } = parsed;

  if (
    typeof projectId !== "string" ||
    typeof clientEmail !== "string" ||
    typeof privateKey !== "string"
  )
    throw new Error(
      `${SERVICE_ACCOUNT_ENV_VAR} is missing project_id, client_email, or private_key`,
    );

  return { projectId, clientEmail, privateKey };
}

const base64url = (value: string): string =>
  Buffer.from(value).toString("base64url");

function signedAssertion(account: ServiceAccount, scope: string): string {
  const issuedAt = Math.floor(Date.now() / 1000);

  const claims = {
    iss: account.clientEmail,
    scope,
    aud: TOKEN_ENDPOINT,
    iat: issuedAt,
    exp: issuedAt + ASSERTION_LIFETIME_SECONDS,
  };

  const unsigned = `${base64url(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  )}.${base64url(JSON.stringify(claims))}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);

  return `${unsigned}.${signer.sign(account.privateKey, "base64url")}`;
}

type CachedToken = { value: string; expiresAt: number };

// Netlify reuses a warm container across invocations, so caching here spares
// most requests a round trip to Google.
const tokenCache = new Map<string, CachedToken>();

/**
 * Exchanges the service account key for an OAuth access token, the long way
 * round rather than via googleapis, to keep this function dependency-free like
 * the others in this directory.
 */
export async function getAccessToken(
  scope: string,
  account: ServiceAccount = loadServiceAccount(),
): Promise<string> {
  const cacheKey = `${account.clientEmail}:${scope}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt - RENEWAL_MARGIN_MS > Date.now())
    return cached.value;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: JWT_BEARER_GRANT,
      assertion: signedAssertion(account, scope),
    }),
  });

  if (!response.ok)
    throw new Error(
      `Google token request failed → ${response.status} ${await response.text()}`,
    );

  const body = (await response.json()) as {
    access_token?: unknown;
    expires_in?: unknown;
  };

  if (typeof body.access_token !== "string")
    throw new Error("Google token response had no access_token");

  const lifetime =
    typeof body.expires_in === "number"
      ? body.expires_in
      : ASSERTION_LIFETIME_SECONDS;

  tokenCache.set(cacheKey, {
    value: body.access_token,
    expiresAt: Date.now() + lifetime * 1000,
  });

  return body.access_token;
}

/** Exposed for tests, which must not inherit a token cached by another case. */
export function clearAccessTokenCache(): void {
  tokenCache.clear();
}
