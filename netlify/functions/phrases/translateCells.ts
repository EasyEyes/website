import {
  segmentHtmlTags,
  rejoinHtmlTagSegments,
} from "../shared/htmlTagSegments";
import type { PhraseMap, TranslateDeps } from "./types";

const DEEPL_CODE_MAP: Record<string, string> = {
  "zh-CN": "ZH-HANS",
  "zh-TW": "ZH-HANT",
  no: "NB",
  "pt-pt": "PT-PT",
};

export class DeepLTranslationError extends Error {
  constructor(
    public readonly status: number | null,
    public readonly technicalDetail?: string,
  ) {
    super(
      status === null
        ? "DeepL translation failed before receiving a response"
        : `DeepL translation failed with status ${status}`,
    );
    this.name = "DeepLTranslationError";
  }
}

function technicalDetail(errorBody: unknown): string | undefined {
  if (errorBody === null) return undefined;
  let detail: string | undefined;
  if (typeof errorBody === "string") {
    try {
      return technicalDetail(JSON.parse(errorBody));
    } catch {
      detail = errorBody;
    }
  } else if (
    typeof errorBody === "object" &&
    errorBody !== null &&
    typeof (errorBody as { message?: unknown }).message === "string"
  ) {
    detail = (errorBody as { message: string }).message;
  } else if (errorBody !== undefined) {
    try {
      detail = JSON.stringify(errorBody);
    } catch {
      detail = undefined;
    }
  }
  return detail?.slice(0, 500);
}

async function responseTechnicalDetail(response: {
  json(): Promise<unknown>;
  text?(): Promise<string>;
}): Promise<string | undefined> {
  if (response.text) {
    const body = await response.text().catch(() => undefined);
    if (body !== undefined) return technicalDetail(body);
  }
  return technicalDetail(await response.json().catch(() => undefined));
}

function deeplBaseUrl(apiKey: string): string {
  return apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";
}

function toDeeplTargetLang(lang: string): string {
  return DEEPL_CODE_MAP[lang] ?? lang.toUpperCase();
}

async function callDeepL(
  texts: string[],
  targetLang: string,
  apiKey: string,
  deeplFetch: TranslateDeps["deeplFetch"],
  sleep: (ms: number) => Promise<void>,
): Promise<string[]> {
  const baseUrl = deeplBaseUrl(apiKey);
  const RETRY_STATUSES = new Set([429, 456]);
  let lastStatus = 0;
  let lastTechnicalDetail: string | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    console.log("[deepl] request:", {
      targetLang,
      textCount: texts.length,
      texts,
      attempt,
    });
    let res;
    try {
      res = await deeplFetch(`${baseUrl}/v2/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: texts,
          target_lang: targetLang,
          source_lang: "EN",
        }),
      });
    } catch (error) {
      throw new DeepLTranslationError(
        null,
        error instanceof Error ? error.message : String(error),
      );
    }

    console.log("[deepl] response status:", res.status);
    lastStatus = res.status;

    if (res.ok) {
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        throw new DeepLTranslationError(200, "Malformed DeepL response");
      }
      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as { translations?: unknown }).translations) ||
        (data as { translations: unknown[] }).translations.length !==
          texts.length ||
        !(data as { translations: unknown[] }).translations.every(
          (translation) =>
            typeof translation === "object" &&
            translation !== null &&
            typeof (translation as { text?: unknown }).text === "string",
        )
      ) {
        throw new DeepLTranslationError(200, "Malformed DeepL response");
      }
      const translations = (data as {
        translations: Array<{ text: string }>;
      }).translations;
      const results = translations.map((t) => t.text);
      console.log("[deepl] translations:", { targetLang, results });
      return results;
    }

    lastTechnicalDetail = await responseTechnicalDetail(res);

    if (RETRY_STATUSES.has(res.status)) {
      console.log("[deepl] retryable status, sleeping:", res.status);
      await sleep(1000);
      continue;
    }

    console.log("[deepl] non-retryable error, giving up:", res.status);
    throw new DeepLTranslationError(res.status, lastTechnicalDetail);
  }

  console.log("[deepl] all attempts exhausted for:", targetLang);
  throw new DeepLTranslationError(lastStatus, lastTechnicalDetail);
}

type DeeplJob = { key: string; engText: string; sentValue: string };

async function translateForLanguage(
  lang: string,
  jobs: DeeplJob[],
  deps: TranslateDeps,
  sleep: (ms: number) => Promise<void>,
  result: PhraseMap,
): Promise<void> {
  const BATCH_SIZE = 50;

  // HTML tags in a phrase (span, br, strong, small, a, ...) must never reach
  // DeepL as translatable prose, so each job is segmented at tag boundaries
  // first; only the "text" segments are flattened, batched, and translated.
  const jobSegments = jobs.map((job) => segmentHtmlTags(job.engText));

  type Piece = { jobIdx: number; segIdx: number; text: string };
  const pieces: Piece[] = [];
  jobSegments.forEach((segments, jobIdx) => {
    segments.forEach((seg, segIdx) => {
      if (seg.type === "text") pieces.push({ jobIdx, segIdx, text: seg.value });
    });
  });

  const translatedBySeg = new Map<string, string>(); // `${jobIdx}:${segIdx}` -> text

  for (let i = 0; i < pieces.length; i += BATCH_SIZE) {
    const batch = pieces.slice(i, i + BATCH_SIZE);
    const translations = await callDeepL(
      batch.map((p) => p.text),
      toDeeplTargetLang(lang),
      deps.deeplApiKey,
      deps.deeplFetch,
      sleep,
    );

    batch.forEach((p, j) =>
      translatedBySeg.set(`${p.jobIdx}:${p.segIdx}`, translations[j]),
    );
  }

  jobs.forEach((job, jobIdx) => {
    const segments = jobSegments[jobIdx];
    const textSegIdxs = segments
      .map((seg, segIdx) => (seg.type === "text" ? segIdx : -1))
      .filter((segIdx) => segIdx !== -1);
    const allTranslated = textSegIdxs.every((segIdx) =>
      translatedBySeg.has(`${jobIdx}:${segIdx}`),
    );

    if (!allTranslated) {
      result[job.key][lang] = job.sentValue;
      return;
    }

    const translatedTexts = textSegIdxs.map(
      (segIdx) => translatedBySeg.get(`${jobIdx}:${segIdx}`)!,
    );
    result[job.key][lang] = rejoinHtmlTagSegments(segments, translatedTexts);
  });
}

async function translateGooglePhrase(
  key: string,
  engText: string,
  sentValue: string,
  deps: TranslateDeps,
  result: PhraseMap,
): Promise<void> {
  const res = await deps.googleFetch(
    `https://translation.googleapis.com/language/translate/v2?key=${deps.googleApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: engText, target: "kn", format: "text" }),
    },
  );

  if (res.ok) {
    const data = (await res.json()) as {
      data: { translations: Array<{ translatedText: string }> };
    };
    result[key]["kn"] = data.data.translations[0]?.translatedText ?? sentValue;
  } else {
    result[key]["kn"] = sentValue;
  }
}

export async function translateCells(
  changedPhrases: Record<string, string>,
  colorMask: Record<string, Record<string, string>>,
  sentValues: Record<string, Record<string, string>>,
  deps: TranslateDeps,
): Promise<PhraseMap> {
  const result: PhraseMap = {};
  const sleep = deps.sleep ?? (() => Promise.resolve());

  for (const [key, engText] of Object.entries(changedPhrases)) {
    result[key] = { en: engText };
  }

  const deeplJobs = new Map<string, DeeplJob[]>();
  const googleJobs: Array<{ key: string; engText: string; sentValue: string }> =
    [];

  for (const [key, engText] of Object.entries(changedPhrases)) {
    const mask = colorMask[key] ?? {};
    const sent = sentValues[key] ?? {};

    for (const [lang, color] of Object.entries(mask)) {
      if (lang === "en") continue;
      const sentValue = sent[lang] ?? "";

      const isWhite = color.toLowerCase() === "#ffffff";
      if (!isWhite) {
        result[key][lang] = sentValue;
        continue;
      }

      if (lang === "kn") {
        if (deps.googleApiKey) {
          googleJobs.push({ key, engText, sentValue });
        } else {
          result[key][lang] = sentValue;
        }
        continue;
      }

      if (!deeplJobs.has(lang)) deeplJobs.set(lang, []);
      deeplJobs.get(lang)!.push({ key, engText, sentValue });
    }
  }

  await Promise.all([
    ...[...deeplJobs.entries()].map(([lang, jobs]) =>
      translateForLanguage(lang, jobs, deps, sleep, result),
    ),
    ...googleJobs.map(({ key, engText, sentValue }) =>
      translateGooglePhrase(key, engText, sentValue, deps, result),
    ),
  ]);

  return result;
}
