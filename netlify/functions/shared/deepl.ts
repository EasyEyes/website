type FetchLike = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export const DEEPL_CODE_MAP: Record<string, string> = {
  "zh-CN": "ZH-HANS",
  "zh-TW": "ZH-HANT",
  no: "NB",
  "pt-pt": "PT-PT",
};

function deeplBaseUrl(apiKey: string): string {
  return apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";
}

export function toDeeplTargetLang(lang: string): string {
  return DEEPL_CODE_MAP[lang] ?? lang.toUpperCase();
}

export async function callDeepL(
  texts: string[],
  targetLang: string,
  apiKey: string,
  deeplFetch: FetchLike,
  sleep: (ms: number) => Promise<void>,
): Promise<string[] | null> {
  const baseUrl = deeplBaseUrl(apiKey);
  const RETRY_STATUSES = new Set([429, 456]);

  for (let attempt = 0; attempt < 3; attempt++) {
    console.log("[deepl] request:", { targetLang, textCount: texts.length, texts, attempt });
    const res = await deeplFetch(`${baseUrl}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: texts, target_lang: targetLang, source_lang: "EN" }),
    });

    console.log("[deepl] response status:", res.status);

    if (res.ok) {
      const data = (await res.json()) as {
        translations: Array<{ text: string }>;
      };
      const results = data.translations.map((t) => t.text);
      console.log("[deepl] translations:", { targetLang, results });
      return results;
    }

    if (RETRY_STATUSES.has(res.status)) {
      console.log("[deepl] retryable status, sleeping:", res.status);
      await sleep(1000);
      continue;
    }

    console.log("[deepl] non-retryable error, giving up:", res.status);
    return null;
  }

  console.log("[deepl] all attempts exhausted for:", targetLang);
  return null;
}
