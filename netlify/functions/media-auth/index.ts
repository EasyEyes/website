import { corsHeaders } from "../shared/cors";
import {
  loadRoleAssignments,
  permissionsForRole,
  roleForUsername,
  ROLE_ENV_VAR,
} from "./mediaRoles";

type NetlifyEvent = {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const PAVLOVIA_USER_ENDPOINT = "https://gitlab.pavlovia.org/api/v4/user";

const MEDIA_ALLOWED_HEADERS = "Content-Type, Authorization";

// The answer depends on who is asking, so neither the browser nor Netlify's CDN
// may reuse one caller's answer for another.
const NO_STORE = "no-store";

function jsonResponse(statusCode: number, data: unknown): NetlifyResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": NO_STORE,
      "Netlify-CDN-Cache-Control": NO_STORE,
    },
    body: JSON.stringify(data),
  };
}

function withCors(
  response: NetlifyResponse,
  origin: string | undefined,
): NetlifyResponse {
  return {
    ...response,
    headers: {
      ...(response.headers ?? {}),
      ...corsHeaders(origin, MEDIA_ALLOWED_HEADERS),
    },
  };
}

function bearerToken(event: NetlifyEvent): string | null {
  const header =
    event.headers["authorization"] ?? event.headers["Authorization"];
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

/**
 * Resolves the caller's Pavlovia username by spending their token against
 * Pavlovia. The username is deliberately not read from the request body: a
 * client can claim any name, but only the holder of a valid Pavlovia session
 * can make this call answer with that name.
 */
async function resolvePavloviaUsername(token: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(PAVLOVIA_USER_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const body = (await response.json()) as { username?: unknown };
    return typeof body.username === "string" && body.username
      ? body.username
      : null;
  } finally {
    clearTimeout(timer);
  }
}

async function handlePost(event: NetlifyEvent): Promise<NetlifyResponse> {
  const token = bearerToken(event);
  if (!token)
    return jsonResponse(401, {
      reason: "missing-token",
      error: "Log in to Pavlovia first.",
    });

  const username = await resolvePavloviaUsername(token);
  if (!username)
    return jsonResponse(401, {
      reason: "invalid-session",
      error: "Your Pavlovia session has expired. Log in again.",
    });

  const assignments = loadRoleAssignments();

  // Everyone silently losing upload rights looks identical to everyone simply
  // not being on the list, so say which one it is.
  if (assignments.length === 0)
    console.warn(
      `[media-auth] ${ROLE_ENV_VAR} is unset or empty; everyone is a viewer.`,
    );

  const role = roleForUsername(username, assignments);
  const permissions = permissionsForRole(role);

  console.log(`[media-auth] username=${username} role=${role}`);

  // A viewer is a legitimate answer rather than an error: everyone may browse
  // the library and copy links, so only the upload and manage rights vary.
  return jsonResponse(200, { username, role, permissions });
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];

  if (event.httpMethod === "OPTIONS")
    return {
      statusCode: 204,
      headers: corsHeaders(origin, MEDIA_ALLOWED_HEADERS),
      body: "",
    };

  if (event.httpMethod !== "POST")
    return withCors(jsonResponse(405, { error: "Method not allowed" }), origin);

  try {
    return withCors(await handlePost(event), origin);
  } catch (err) {
    // Distinguish "we could not ask Pavlovia" from "Pavlovia said no", so a
    // network blip reads as retryable rather than as a refusal.
    console.error("[media-auth] failed:", err);
    return withCors(
      jsonResponse(503, {
        reason: "unavailable",
        error: "Could not check your account just now. Try again.",
      }),
      origin,
    );
  }
}
