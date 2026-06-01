export type PhraseRow = Record<string, string>;
export type PhraseMap = Record<string, PhraseRow>;

export type VersionedPhrases = {
  version: string;
  phrases: PhraseMap;
};

export type DiffResult = {
  changed: string[];
  removed: string[];
  currentVersion: string | null;
};

export type FetchLike = (
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

export type TranslateDeps = {
  deeplFetch: FetchLike;
  googleFetch: FetchLike;
  googleApiKey: string | undefined;
  deeplApiKey: string;
  sleep?: (ms: number) => Promise<void>;
};
