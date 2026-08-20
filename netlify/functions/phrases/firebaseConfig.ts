export function getFirebaseDatabaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const configuredUrl = env.FIREBASE_DATABASE_URL;
  if (!configuredUrl) {
    throw new Error("FIREBASE_DATABASE_URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(configuredUrl);
  } catch {
    throw new Error(
      "FIREBASE_DATABASE_URL must be a valid HTTPS Firebase RTDB root",
    );
  }

  const normalizedUrl = configuredUrl.replace(/\/+$/, "");
  const isFirebaseHost =
    parsed.hostname.endsWith(".firebaseio.com") ||
    parsed.hostname.endsWith(".firebasedatabase.app");
  if (
    parsed.protocol !== "https:" ||
    !isFirebaseHost ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    (parsed.pathname !== "/" && parsed.pathname !== "") ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "FIREBASE_DATABASE_URL must be a valid HTTPS Firebase RTDB root",
    );
  }

  return normalizedUrl;
}
