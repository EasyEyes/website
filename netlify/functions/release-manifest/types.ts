export type ManifestEntry = {
  engineVersion: string;
  glossaryVersion: string;
  phrasesVersion: string;
  gitSha: string;
  changelog: string;
};

export type ReleaseSummary = {
  release: string;
  changelog: string;
};
