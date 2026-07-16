import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const compilerRoot = path.resolve(
  process.argv[2] || path.join(repositoryRoot, "docs/experiment"),
);

await Promise.all(
  ["index.html", "deployment.json"].map((filename) =>
    copyFile(
      path.join(compilerRoot, "dist", filename),
      path.join(compilerRoot, filename),
    ),
  ),
);
