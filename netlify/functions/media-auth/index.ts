import { corsHeaders } from "../shared/cors";
import { bearerToken, resolvePavloviaUsername } from "../shared/pavlovia";
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

async function handlePost(event: NetlifyEvent): Promise<NetlifyResponse> {
  const token = bearerToken(event.headers);
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
