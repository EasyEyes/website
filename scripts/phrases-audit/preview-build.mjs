import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function selectPreviewAudit(environment, report, tree) {
  if (
    environment.CONTEXT !== "deploy-preview" ||
    (environment.HEAD || environment.BRANCH) !== "feat/compiler-phrase-audit" ||
    environment.REVIEW_ID !== "153" ||
    !report
  )
    return null;
  if (report.status !== "completed" || !report.report?.phraseUsage?.used)
    throw new Error("Incomplete preview phrase audit");
  for (const [repository, details] of Object.entries(
    report.report.phraseUsage.repositories,
  )) {
    for (const [root, expected] of Object.entries(details.roots)) {
      const actual = tree(repository, root);
      if (actual !== null && actual !== expected)
        throw new Error(`Preview audit source mismatch: ${repository}/${root}`);
    }
  }
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = new URL("./preview-report.json", import.meta.url);
  const repositories = {
    website: ".",
    "threshold-scientists": "docs/experiment",
    threshold: "docs/experiment/threshold",
    psychojs: "docs/experiment/threshold/psychojs",
  };
  const report = existsSync(source)
    ? JSON.parse(readFileSync(source, "utf8"))
    : null;
  const selected = selectPreviewAudit(
    process.env,
    report,
    (repository, root) => {
      if (!(repository in repositories)) return null;
      return execFileSync(
        "git",
        ["-C", repositories[repository], "rev-parse", `HEAD:${root}`],
        { encoding: "utf8" },
      ).trim();
    },
  );
  console.log(
    JSON.stringify({
      context: process.env.CONTEXT,
      branch: process.env.BRANCH,
      head: process.env.HEAD,
      review: process.env.REVIEW_ID,
      reportPresent: Boolean(report),
    }),
  );
  writeFileSync(
    new URL(
      "../../netlify/functions/phrases-audit-compiler/preview-report.json",
      import.meta.url,
    ),
    JSON.stringify({ run: selected }) + "\n",
  );
  console.log(
    selected
      ? `Isolated preview audit: ${selected.id}`
      : "Shared phrase audit unchanged",
  );
}
