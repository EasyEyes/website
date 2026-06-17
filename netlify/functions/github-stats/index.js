import fetch from "node-fetch";

// Reports slow-changing GitHub values shown in the EasyEyes compiler footer:
// the threshold repo's star count and license, and the latest commit URL of the
// website repo (the "Compiler updated ..." link).
//
// Why this exists: the footer used to read these from live third-party badge
// images (shields.io / badgen) and an unauthenticated GitHub API call. The
// badges broke with "unable to select next GitHub token from pool" when the
// badge service's shared token pool was exhausted, and the direct GitHub call
// shares GitHub's 60-requests/hour unauthenticated limit per visitor IP.
//
// This proxy calls GitHub once with our own PAT (authenticated = 5,000 req/hr,
// our token, not a shared pool) and is cached for a day at Netlify's CDN, so
// GitHub is hit at most ~once/day regardless of traffic.
//
// Environment variables:
//   GITHUB_PAT / GITHUB_TOKEN  Personal access token (optional; only needs
//                              public-repo read). Without it we still work but
//                              fall back to GitHub's unauthenticated limit.
//
// On any error, responds 200 with { available: false } so the compiler can
// degrade gracefully (footer simply omits the values).

const THRESHOLD_REPO = "EasyEyes/threshold";
const WEBSITE_REPO = "EasyEyes/website";

// Cache successful responses for a day, at both the browser and Netlify's CDN.
const SUCCESS_CACHE = "public, max-age=86400, s-maxage=86400";
// Never cache a degraded response, so failures recover on the next request.
const NO_CACHE = "no-store";

const responseWrapper = (statusCode, body, cacheControl) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": cacheControl,
  },
  body: JSON.stringify(body),
});

const ghJson = async (endpoint, headers) => {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${endpoint} failed: ${response.status}`);
  }
  return response.json();
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return responseWrapper(200, {}, NO_CACHE);
  }

  const headers = { "User-Agent": "easyeyes-compiler" };
  const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const [repo, commits] = await Promise.all([
      ghJson(`/repos/${THRESHOLD_REPO}`, headers),
      ghJson(`/repos/${WEBSITE_REPO}/commits?per_page=1`, headers),
    ]);

    return responseWrapper(
      200,
      {
        available: true,
        stars: repo.stargazers_count,
        license: (repo.license && repo.license.spdx_id) || "MIT",
        lastCommitUrl: commits[0] && commits[0].html_url,
      },
      SUCCESS_CACHE,
    );
  } catch (error) {
    console.error("github-stats error:", error);
    return responseWrapper(
      200,
      { available: false, reason: error.message || "Unknown error" },
      NO_CACHE,
    );
  }
};
