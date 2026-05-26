import { transformRows } from "../../../docs/experiment/source/glossaryTransformer";
import { readGlossaryData, writeGlossaryData } from "./glossaryDb";

interface HandlerEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

interface HandlerResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

async function handleGet(): Promise<HandlerResponse> {
  console.log("[glossary] GET request received");
  try {
    const data = await readGlossaryData();
    const glossary = data.glossary ?? {};
    const glossaryFull = data.glossaryFull ?? [];
    const superMatchingParams = data.superMatchingParams ?? [];
    const body = [
      `window.GLOSSARY = ${JSON.stringify(glossary)};`,
      `window.GLOSSARY_FULL = ${JSON.stringify(glossaryFull)};`,
      `window.SUPER_MATCHING_PARAMS = ${JSON.stringify(superMatchingParams)};`,
    ].join("\n");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/javascript" },
      body,
    };
  } catch (err) {
    console.error("[glossary] GET error reading data, returning empty:", err);
    const body = [
      "window.GLOSSARY = {};",
      "window.GLOSSARY_FULL = [];",
      "window.SUPER_MATCHING_PARAMS = [];",
    ].join("\n");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/javascript" },
      body,
    };
  }
}

async function handlePost(event: HandlerEvent): Promise<HandlerResponse> {
  console.log("[glossary] POST request received");
  const secret = process.env.GLOSSARY_SECRET;
  const provided = event.headers["x-glossary-secret"];
  if (!provided || provided !== secret) {
    console.warn("[glossary] POST rejected — invalid or missing secret");
    return { statusCode: 401, body: "Unauthorized" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(event.body ?? "");
  } catch (err) {
    console.error("[glossary] POST rejected — invalid JSON:", err);
    return { statusCode: 400, body: "Bad Request: invalid JSON" };
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as Record<string, unknown>)["rows"])
  ) {
    console.error('[glossary] POST rejected — missing "rows" array in body');
    return { statusCode: 400, body: 'Bad Request: missing "rows" array' };
  }

  const rows = (parsed as { rows: string[][] }).rows;
  console.log(`[glossary] POST transforming ${rows.length} rows`);
  const transformed = transformRows(rows);
  console.log(
    `[glossary] POST transform result — glossary keys: ${
      Object.keys(transformed.glossary ?? {}).length
    }, glossaryFull rows: ${(transformed.glossaryFull ?? []).length}`,
  );
  await writeGlossaryData(transformed);
  console.log("[glossary] POST success — data written");
  return { statusCode: 200, body: "OK" };
}

export const handler = async (
  event: HandlerEvent,
): Promise<HandlerResponse> => {
  console.log(`[glossary] handler invoked — method: ${event.httpMethod}`);
  if (event.httpMethod === "GET") return handleGet();
  if (event.httpMethod === "POST") return handlePost(event);
  console.warn(`[glossary] method not allowed: ${event.httpMethod}`);
  return { statusCode: 405, body: "Method Not Allowed" };
};
