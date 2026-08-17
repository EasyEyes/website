const PAVLOVIA_USER_ENDPOINT = "https://gitlab.pavlovia.org/api/v4/user";

const LOOKUP_TIMEOUT_MS = 5000;

export function bearerToken(
  headers: Record<string, string | undefined>,
): string | null {
  const header = headers["authorization"] ?? headers["Authorization"];
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
export async function resolvePavloviaUsername(
  token: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

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
