const REPOSITORIES = {
  website: "website",
  "threshold-scientists": "threshold-scientist",
  threshold: "threshold",
  psychojs: "psychojs",
  "remote-calibrator": "remote-calibrator",
  "speaker-calibrator": "speaker-calibration",
};

const SHA = /^[0-9a-f]{40}$/i;

function githubRoot(repository) {
  const slug = REPOSITORIES[repository];
  return slug ? `https://github.com/EasyEyes/${slug}` : null;
}

function fileUrl(repository, revision, path, line, parent = false) {
  const root = githubRoot(repository);
  if (
    !root ||
    !SHA.test(revision ?? "") ||
    !path ||
    path.split("/").includes("..")
  )
    return null;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const lineAnchor = Number.isInteger(line) && line > 0 ? `#L${line}` : "";
  return `${root}/blob/${revision}${
    parent ? "%5E" : ""
  }/${encodedPath}${lineAnchor}`;
}

function sourceReference(reference, repositories) {
  return {
    repository: reference.repository,
    path: reference.path,
    line: reference.line,
    matchKind: reference.matchKind,
    description: reference.description,
    url: fileUrl(
      reference.repository,
      repositories[reference.repository]?.commit,
      reference.path,
      reference.line,
    ),
  };
}

function removalEvidence(removal) {
  const root = githubRoot(removal.repository);
  const commit = SHA.test(removal.commit ?? "") ? removal.commit : null;
  return {
    repository: removal.repository,
    removedAt: removal.removedAt,
    commitUrl: root && commit ? `${root}/commit/${commit}` : null,
    previousReferences: (removal.previousReferences ?? []).map((reference) => ({
      path: reference.path,
      line: reference.line,
      url: commit
        ? fileUrl(
            removal.repository,
            commit,
            reference.path,
            reference.line,
            true,
          )
        : null,
    })),
  };
}

const byKey = (a, b) => a.key.localeCompare(b.key);
const newestFirst = (a, b) =>
  Date.parse(b.removedAt ?? "") - Date.parse(a.removedAt ?? "");

export function reviewRun(run) {
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
  const repositories = report.phraseUsage?.repositories ?? {};
  const historyKeys = report.history?.keys ?? {};
  const missing = Object.entries(report.missingFromSheet?.missing ?? {})
    .map(([key, references]) => ({
      key,
      references: references.map((reference) =>
        sourceReference(reference, repositories),
      ),
    }))
    .sort(byKey);
  const removed = Object.entries(historyKeys)
    .map(([key, value]) => ({
      key,
      lastRemovedAt: value.lastRemoval?.removedAt ?? null,
      removals: Object.values(value.removalsByRepository ?? {})
        .map(removalEvidence)
        .sort(newestFirst),
    }))
    .sort(
      (a, b) =>
        Date.parse(b.lastRemovedAt ?? "") - Date.parse(a.lastRemovedAt ?? "") ||
        byKey(a, b),
    );
  const unverified = (report.phraseUsage?.unused ?? [])
    .filter((key) => !historyKeys[key])
    .map((key) => ({ key }))
    .sort(byKey);

  return {
    run: { ...summary, generatedAt: report.generatedAt },
    findings: {
      missing,
      removed,
      unverified,
      usedCount:
        report.phraseUsage?.counts?.used ??
        Object.keys(report.phraseUsage?.used ?? {}).length,
      mismatches: report.mismatches ?? null,
    },
  };
}
