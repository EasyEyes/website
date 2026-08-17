import { corsHeaders } from "../shared/cors";
import { hasServiceAccount } from "../shared/googleAuth";
import { bearerToken, resolvePavloviaUsername } from "../shared/pavlovia";
import {
  createResumableUpload,
  listMedia,
  mediaUrlForPath,
  objectExists,
  sanitizeMediaFileName,
} from "../shared/mediaStorage";
import {
  loadRoleAssignments,
  permissionsForRole,
  roleForUsername,
} from "../media-auth/mediaRoles";

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

const ALLOWED_HEADERS = "Content-Type, Authorization";

const NO_STORE = "no-store";

const ACCEPTED_TYPES = ["image/", "audio/", "video/"];

/**
 * Large enough for the videos this library exists to hold, small enough that a
 * mistaken upload cannot quietly consume the bucket.
 */
const MAX_UPLOAD_BYTES = 512 * 1024 * 1024;

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
      ...corsHeaders(origin, ALLOWED_HEADERS),
    },
  };
}

const NOT_CONFIGURED = {
  reason: "not-configured",
  error:
    "Firebase setup not done. The media library will work once its storage credentials are in place.",
};

/** Browsing is open to everyone, so listing asks for no credentials. */
async function handleGet(): Promise<NetlifyResponse> {
  const files = await listMedia();
  return jsonResponse(200, {
    files: files.map((record) => ({
      ...record,
      url: mediaUrlForPath(record.path),
    })),
  });
}

type UploadRequest = {
  name: string;
  contentType: string;
  size: number;
};

function readUploadRequest(body: string | null): UploadRequest | null {
  if (!body) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }

  const { name, contentType, size } = parsed;
  if (typeof name !== "string" || !name.trim()) return null;
  if (typeof contentType !== "string") return null;
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0)
    return null;

  return { name, contentType, size };
}

/**
 * Grants permission to upload one named file, rather than accepting the file
 * itself. The browser sends the bytes straight to Google using the returned
 * session URL; see `createResumableUpload` for why.
 */
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

  // Re-checked here rather than trusted from the browser, because the answer
  // media-auth gave the interface is a convenience; this is the barrier.
  const role = roleForUsername(username, loadRoleAssignments());
  if (!permissionsForRole(role).upload)
    return jsonResponse(403, {
      reason: "not-allowed",
      error: `The Pavlovia account "${username}" may not upload media files.`,
    });

  const request = readUploadRequest(event.body);
  if (!request)
    return jsonResponse(400, {
      reason: "bad-request",
      error: "Expected a file name, content type, and size.",
    });

  if (!ACCEPTED_TYPES.some((prefix) => request.contentType.startsWith(prefix)))
    return jsonResponse(400, {
      reason: "unsupported-type",
      error: `${request.name} is not an image, audio, or video file.`,
    });

  if (request.size > MAX_UPLOAD_BYTES)
    return jsonResponse(413, {
      reason: "too-large",
      error: `${request.name} is larger than the ${
        MAX_UPLOAD_BYTES / (1024 * 1024)
      } MB limit.`,
    });

  const path = sanitizeMediaFileName(request.name);

  // Existing media is never replaced, because a live international phrase may
  // already point at it.
  if (await objectExists(path))
    return jsonResponse(409, {
      reason: "name-taken",
      error: `A media file named "${path}" already exists. Rename yours before uploading, since existing media is never replaced.`,
    });

  const uploadUrl = await createResumableUpload({
    path,
    contentType: request.contentType,
    size: request.size,
    originalName: request.name,
    uploadedBy: username,
  });

  console.log(`[media-library] upload path=${path} by=${username}`);

  return jsonResponse(200, { uploadUrl, path, url: mediaUrlForPath(path) });
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];

  if (event.httpMethod === "OPTIONS")
    return {
      statusCode: 204,
      headers: corsHeaders(origin, ALLOWED_HEADERS),
      body: "",
    };

  // Listing and uploading both reach the bucket, so neither can do anything
  // until the credentials exist. Answered before the work starts, so the
  // interface reports a setup step rather than an outage.
  if (!hasServiceAccount())
    return withCors(jsonResponse(503, NOT_CONFIGURED), origin);

  try {
    if (event.httpMethod === "GET") return withCors(await handleGet(), origin);
    if (event.httpMethod === "POST")
      return withCors(await handlePost(event), origin);

    return withCors(jsonResponse(405, { error: "Method not allowed" }), origin);
  } catch (err) {
    // Distinguish "storage was unreachable" from "storage said no", so a blip
    // reads as retryable rather than as a refusal.
    console.error("[media-library] failed:", err);
    return withCors(
      jsonResponse(503, {
        reason: "unavailable",
        error: "The media library is unreachable just now. Try again.",
      }),
      origin,
    );
  }
}
