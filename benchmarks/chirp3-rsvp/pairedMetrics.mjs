export function summarizePairs(runs) {
  const groups = new Map();
  for (const run of runs) {
    if (!run.comparison || !["pairedCorrect", "pairedWrongFirst"].includes(run.scenario))
      continue;
    if (run.actuallySaid?.trim().toLowerCase().replace(/\s+/g, " ") !==
        run.intended.toLowerCase())
      continue;
    const condition = {
      keyterms: run.settings.keyterms,
      ignoreOrder: run.settings.ignoreOrder,
      durationSec: run.durationSec,
      cap: run.settings.cap,
      silence: run.settings.silence,
      stt: run.settings.stt,
    };
    const key = JSON.stringify(condition);
    const group = groups.get(key) ?? {
      ...condition,
      correctRuns: 0,
      wrongFirstRuns: 0,
      excluded: 0,
      chirp3: { correctWords: 0, falseFirstCredit: 0, laterMisses: 0 },
      deepgram: { correctWords: 0, falseFirstCredit: 0, laterMisses: 0 },
    };
    groups.set(key, group);
    if (!run.score || !run.comparison.score || !run.comparison.sameInput) {
      group.excluded++;
      continue;
    }
    const correctRun = run.scenario === "pairedCorrect";
    if (correctRun) group.correctRuns++;
    else group.wrongFirstRuns++;
    for (const [provider, { vector }] of [
      ["chirp3", run.score],
      ["deepgram", run.comparison.score],
    ]) {
      const counts = group[provider];
      if (correctRun) counts.correctWords += vector.reduce((sum, bit) => sum + bit, 0);
      else {
        counts.falseFirstCredit += vector[0];
        counts.laterMisses += 2 - vector[1] - vector[2];
      }
    }
  }
  return [...groups.values()];
}
