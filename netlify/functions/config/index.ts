import { corsHeaders } from "../shared/cors";

type NetlifyEvent = {
  httpMethod: string;
  headers: Record<string, string | undefined>;
};

type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const origin = event.headers["origin"] ?? event.headers["Origin"];

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const config = {
    compileNewExperiment: process.env.STATIC_MODE !== "true",
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders(origin),
    },
    body: JSON.stringify(config),
  };
}
