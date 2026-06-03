import type { VersionedPhrases, DiffResult } from "./types";

export function diffEnglish(
  incomingEnglish: Record<string, string>,
  previousVersion: VersionedPhrases | null,
  nonCyanValues?: Record<string, Record<string, string>>
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
      continue;
    }
    // English unchanged — check whether any non-cyan cell value differs from Firebase
    if (nonCyanValues) {
      const otherVals = nonCyanValues[key];
      if (otherVals) {
        const prevRow = prevPhrases[key];
        for (const [lang, val] of Object.entries(otherVals)) {
          if (prevRow[lang] !== val) {
            changed.push(key);
            break;
          }
        }
      }
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
