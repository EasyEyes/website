import type { PhraseMap, TranslateDeps } from "./types";
import { callDeepL, toDeeplTargetLang } from "../shared/deepl";

type DeeplJob = { key: string; engText: string; sentValue: string };

async function translateForLanguage(
  lang: string,
  jobs: DeeplJob[],
  deps: TranslateDeps,
  sleep: (ms: number) => Promise<void>,
  result: PhraseMap,
): Promise<void> {
  const BATCH_SIZE = 50;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const translations = await callDeepL(
      batch.map((j) => j.engText),
      toDeeplTargetLang(lang),
      deps.deeplApiKey,
      deps.deeplFetch,
      sleep,
    );

    for (let j = 0; j < batch.length; j++) {
      const { key, sentValue } = batch[j];
      result[key][lang] = translations?.[j] ?? sentValue;
    }
  }
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

      const isCyan = color.toLowerCase() === "#00ffff";
      if (!isCyan) {
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
