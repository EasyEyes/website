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
  } catch {
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
  const secret = process.env.GLOSSARY_SECRET;
  const provided = event.headers["x-glossary-secret"];
  if (!provided || provided !== secret) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(event.body ?? "");
  } catch {
    return { statusCode: 400, body: "Bad Request: invalid JSON" };
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as Record<string, unknown>)["rows"])
  ) {
    return { statusCode: 400, body: 'Bad Request: missing "rows" array' };
  }

  const rows = (parsed as { rows: string[][] }).rows;
  const transformed = transformRows(rows);
  await writeGlossaryData(transformed);
  return { statusCode: 200, body: "OK" };
}

export const handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod === "GET") return handleGet();
  if (event.httpMethod === "POST") return handlePost(event);
  return { statusCode: 405, body: "Method Not Allowed" };
};
