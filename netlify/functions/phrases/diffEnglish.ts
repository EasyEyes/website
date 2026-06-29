import type { VersionedPhrases, DiffResult } from "./types";

export function diffEnglish(
  incomingEnglish: Record<string, string>,
  previousVersion: VersionedPhrases | null
): DiffResult {
  if (previousVersion === null) {
    return {
      changed: Object.keys(incomingEnglish),
      removed: [],
      currentVersion: null,
    };
  }

  const prevPhrases = previousVersion.phrases;
  const changed: string[] = [];
  const removed: string[] = [];

  for (const [key, enText] of Object.entries(incomingEnglish)) {
    if (!(key in prevPhrases) || prevPhrases[key].en !== enText) {
      changed.push(key);
    }
  }

  for (const key of Object.keys(prevPhrases)) {
    if (!(key in incomingEnglish)) {
      removed.push(key);
    }
  }

  return {
    changed,
    removed,
    currentVersion: previousVersion.version,
  };
}
