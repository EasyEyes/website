import {
  analysePhrasePaths,
  type PhraseSourceIndex,
  type PhraseCondition,
} from "../../../docs/experiment/threshold/preprocess/phrasePathAnalysis";

export function createStudyPhraseAnalysisHandler(index: PhraseSourceIndex) {
  return async (request: Request) => {
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      });
    if (request.method !== "POST")
      return json({ error: "Method not allowed" }, 405);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return json({ error: "Expected application/json" }, 415);
    try {
      const text = await request.text();
      if (text.length > 1024 * 1024)
        return json({ error: "Study configuration is too large" }, 413);
      const input = JSON.parse(text);
      if (
        input.schemaVersion !== 1 ||
        typeof input.fingerprint !== "string" ||
        !Array.isArray(input.conditions) ||
        !input.conditions.length ||
        input.conditions.length > 256
      )
        return json({ error: "Invalid study phrase analysis request" }, 400);
      if (input.fingerprint !== index.fingerprint)
        return json(
          { error: "Phrase analysis index does not match the compiler build" },
          409,
        );
      const scalar = (value: unknown) =>
        value === null ||
        typeof value === "boolean" ||
        (typeof value === "number" && Number.isFinite(value)) ||
        (typeof value === "string" && value.length <= 4096);
      if (
        !input.conditions.every(
          (condition: PhraseCondition) =>
            condition &&
            typeof condition.name === "string" &&
            condition.name.length <= 256 &&
            condition.parameters &&
            typeof condition.parameters === "object" &&
            !Array.isArray(condition.parameters) &&
            Object.keys(condition.parameters).length <= 1024 &&
            Object.entries(condition.parameters).every(
              ([key, value]) => key.length <= 128 && scalar(value),
            ),
        )
      )
        return json({ error: "Invalid condition parameters" }, 400);
      return json(analysePhrasePaths(index, input.conditions));
    } catch (error) {
      if (error instanceof SyntaxError)
        return json({ error: "Invalid JSON" }, 400);
      return json({ error: "Study phrase analysis unavailable" }, 503);
    }
  };
}
