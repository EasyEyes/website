const REPOSITORIES = {
  website: "website",
  "threshold-scientists": "threshold-scientist",
  threshold: "threshold",
  psychojs: "psychojs",
  "remote-calibrator": "remote-calibrator",
  "speaker-calibrator": "speaker-calibration",
};
const SHA = /^[0-9a-f]{40}$/i;

export function sourceUrl(repository, commit, path, line) {
  const slug = REPOSITORIES[repository];
  if (
    !slug ||
    !SHA.test(commit ?? "") ||
    typeof path !== "string" ||
    !path ||
    path.startsWith("/") ||
    path.split("/").includes("..") ||
    !Number.isInteger(line) ||
    line < 1
  )
    return null;
  return `https://github.com/EasyEyes/${slug}/blob/${commit}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}#L${line}`;
}

function locations(repositories, metadata) {
  return Object.entries(repositories).flatMap(([repository, paths]) =>
    Object.entries(paths).map(([path, lines]) => ({
      repository,
      path,
      lines: lines.map((line) => ({
        line,
        url: sourceUrl(repository, metadata[repository]?.commit, path, line),
      })),
    })),
  );
}

export function reviewGlossaryRun(run) {
  const summary = {
    id: run.id,
    status: run.status,
    requestedAt: run.requestedAt ?? null,
    completedAt: run.completedAt ?? null,
    error: run.error ?? null,
  };
  if (run.status !== "completed" || !run.report)
    return { run: summary, findings: null };
  const report = run.report;
  const findings = { counts: report.counts, version: report.source.version };
  for (const section of ["obsoleteUsed", "used"]) {
    findings[section] = Object.entries(report[section])
      .map(([key, repositories]) => ({
        key,
        references: locations(repositories, report.repositories),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }
  findings.unused = Object.entries(report.unused)
    .map(([key, evidence]) => ({
      key,
      comments: Object.entries(evidence.commentReferences ?? {}).flatMap(
        ([repository, references]) =>
          references.map((entry) => ({
            repository,
            path: entry.path,
            lines: entry.line.map((line) => ({
              line,
              url: sourceUrl(
                repository,
                entry.commit ?? report.repositories[repository]?.commit,
                entry.path,
                line,
              ),
            })),
          })),
      ),
      removals: Object.entries(evidence.removalEvidence ?? {}).flatMap(
        ([repository, entries]) =>
          entries.map((entry) => ({
            repository,
            path: entry.path,
            removedAt: entry.removedAt,
            commitUrl:
              REPOSITORIES[repository] && SHA.test(entry.commit ?? "")
                ? `https://github.com/EasyEyes/${REPOSITORIES[repository]}/commit/${entry.commit}`
                : null,
            lines: (entry.previousReferences ?? []).flatMap((reference) =>
              reference.line.map((line) => ({
                line,
                url: sourceUrl(
                  repository,
                  entry.previousCommit,
                  entry.path,
                  line,
                ),
              })),
            ),
          })),
      ),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  return { run: { ...summary, generatedAt: report.generatedAt }, findings };
}
