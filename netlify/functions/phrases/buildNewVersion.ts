import type { PhraseMap, VersionedPhrases } from "./types";

export function buildNewVersion(
  prev: VersionedPhrases | null,
  translatedCells: PhraseMap,
  removed: string[],
  activeLanguages?: string[]
): VersionedPhrases | null {
  const activeLanguageSet = activeLanguages ? new Set(activeLanguages) : null;
  const removedLanguage =
    prev !== null &&
    activeLanguageSet !== null &&
    Object.values(prev.phrases).some((row) =>
      Object.keys(row).some((language) => !activeLanguageSet.has(language))
    );

  if (
    prev !== null &&
    Object.keys(translatedCells).length === 0 &&
    removed.length === 0 &&
    !removedLanguage
  ) {
    return null;
  }

  if (prev === null) {
    return { version: "1.0", phrases: { ...translatedCells } };
  }

  const newPhrases: PhraseMap = { ...prev.phrases };

  for (const [key, row] of Object.entries(translatedCells)) {
    newPhrases[key] = { ...newPhrases[key], ...row };
  }

  for (const key of removed) {
    delete newPhrases[key];
  }

  if (activeLanguageSet !== null) {
    for (const row of Object.values(newPhrases)) {
      for (const language of Object.keys(row)) {
        if (!activeLanguageSet.has(language)) delete row[language];
      }
    }
  }

  const prevKeys = new Set(Object.keys(prev.phrases));
  const newKeys = new Set(Object.keys(newPhrases));

  const isMajor =
    removed.length > 0 ||
    removedLanguage ||
    [...newKeys].some((k) => !prevKeys.has(k));

  const [major, minor] = prev.version.split(".").map(Number);
  const newVersion = isMajor ? `${major + 1}.0` : `${major}.${minor + 1}`;

  return { version: newVersion, phrases: newPhrases };
}
