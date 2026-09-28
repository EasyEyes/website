const NETLIFY_PREVIEW_RE = /^https:\/\/[a-z0-9-]+--easyeyes\.netlify\.app$/;
const LOCALHOST_RE = /^http:\/\/localhost:\d+$/;
const STATIC_ALLOWED_ORIGINS = new Set([
  "https://run.pavlovia.org",
  "https://pavlovia.org",
  "https://easyeyes.app",
  "http://localhost:5500",
]);

export function isAllowedOrigin(origin: string | undefined): origin is string {
  if (!origin) return false;
  if (STATIC_ALLOWED_ORIGINS.has(origin)) return true;
  if (LOCALHOST_RE.test(origin)) return true;
  return NETLIFY_PREVIEW_RE.test(origin);
}

export function corsHeaders(
  origin: string | undefined,
  allowedHeaders = "Content-Type"
): Record<string, string> {
  if (!isAllowedOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": allowedHeaders,
    Vary: "Origin",
  };
}
