import fetch from "node-fetch";

// Reports how much of our monthly Formspree submission quota has been used.
//
// Used by the EasyEyes compiler to enrich the "LOGGING CAUTION" warning with a
// live usage figure. The Formspree API key is held server-side (env var) and is
// never exposed to the browser.
//
// Environment variables:
//   FORMSPREE_API_KEY        Formspree master/read API key (required).
//   FORMSPREE_FORM_ID        Formspree form hashid (default: mqkrdveg).
//   FORMSPREE_MONTHLY_QUOTA  Monthly submission limit (default: 20000).
//
// On any error or missing configuration, responds 200 with { available: false }
// so the compiler can degrade gracefully (still show the warning, just without
// the usage figure).

const FORMSPREE_API_BASE = "https://formspree.io/api/0";
const DEFAULT_FORM_ID = "mqkrdveg";
const DEFAULT_MONTHLY_QUOTA = 20000;

const responseWrapper = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};

const startOfCurrentMonthISO = () => {
  const now = new Date();
  // First instant of the current month in UTC, ISO-formatted (no trailing Z,
  // matching Formspree's documented `since` format e.g. 2018-11-03T12:00:00).
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
  );
  return start.toISOString().replace(/\.\d{3}Z$/, "");
};

// Count submissions received since the start of this month by paging through
// the documented submissions endpoint. Capped to avoid runaway pagination.
const countSubmissionsThisMonth = async (formId, apiKey) => {
  const since = startOfCurrentMonthISO();
  const pageLimit = 1000;
  const maxPages = 60; // hard cap: 60 * 1000 = 60,000 submissions
  let total = 0;
  let offset = 0;

  for (let page = 0; page < maxPages; page++) {
    const url = `${FORMSPREE_API_BASE}/forms/${formId}/submissions?since=${encodeURIComponent(
      since,
    )}&limit=${pageLimit}&offset=${offset}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Formspree submissions request failed: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    const items = Array.isArray(data)
      ? data
      : data.submissions || data.results || [];
    total += items.length;
    if (items.length < pageLimit) break;
    offset += pageLimit;
  }

  return total;
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return responseWrapper(200, {});
  }

  const apiKey = process.env.FORMSPREE_API_KEY;
  const formId = process.env.FORMSPREE_FORM_ID || DEFAULT_FORM_ID;
  const limit =
    parseInt(process.env.FORMSPREE_MONTHLY_QUOTA, 10) || DEFAULT_MONTHLY_QUOTA;

  if (!apiKey) {
    return responseWrapper(200, {
      available: false,
      reason: "FORMSPREE_API_KEY not configured",
    });
  }

  try {
    const used = await countSubmissionsThisMonth(formId, apiKey);
    return responseWrapper(200, {
      available: true,
      used,
      limit,
      month: startOfCurrentMonthISO().slice(0, 7),
    });
  } catch (error) {
    console.error("formspree-quota error:", error);
    return responseWrapper(200, {
      available: false,
      reason: error.message || "Unknown error",
    });
  }
};
