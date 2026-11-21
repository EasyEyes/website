import { execFileSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const website = fileURLToPath(new URL("../../", import.meta.url));
const threshold = join(website, "docs/experiment/threshold");
const toolsRoot = resolve(process.env.EE_BENCH_TOOL_ROOT ?? website);
const require = createRequire(join(toolsRoot, "package.json"));
const { build } = process.env.EE_BENCH_TOOL_ROOT
  ? createRequire(join(toolsRoot, "docs/experiment/threshold/package.json"))(
      "esbuild",
    )
  : require("esbuild");
const output = join(root, "dist");
const patches = ["repeated-finish.patch", "capture-drain.patch"];

async function loadBenchmarkSources() {
  const scratch = await mkdtemp(join(tmpdir(), "easyeyes-benchmark-"));
  const sources = new Map();
  const files = new Set();
  const directories = new Set();
  try {
    for (const patch of patches) {
      const patchPath = join(root, "patches", patch);
      const content = await readFile(patchPath, "utf8");
      for (const [, path] of content.matchAll(/^--- a\/(components\/[\w/]+\.ts)\r?$/gm)) {
        const staged = join(scratch, path);
        if (files.has(staged)) continue;
        files.add(staged);
        for (let dir = dirname(staged); dir !== scratch; dir = dirname(dir))
          directories.add(dir);
        await mkdir(dirname(staged), { recursive: true });
        await writeFile(
          staged,
          execFileSync("git", ["-C", threshold, "show", `HEAD:${path}`]),
        );
      }
      execFileSync("git", ["apply", patchPath], { cwd: scratch });
    }
    for (const staged of files)
      sources.set(resolve(threshold, staged.slice(scratch.length + 1)), await readFile(staged, "utf8"));
    return sources;
  } finally {
    for (const staged of files)
      await unlink(staged).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    for (const dir of [...directories].sort((a, b) => b.length - a.length))
      await rmdir(dir).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    await rmdir(scratch);
  }
}
const benchmarkSources = await loadBenchmarkSources();

await mkdir(output, { recursive: true });
await build({
  entryPoints: [join(root, "main.js")],
  outfile: join(output, "main.js"),
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  alias: { "@threshold": threshold },
  plugins: [
    {
      name: "benchmark-source-patches",
      setup(builder) {
        builder.onLoad({ filter: /\.ts$/ }, ({ path }) => {
          const contents = benchmarkSources.get(resolve(path));
          if (contents !== undefined)
            return {
              contents,
              loader: "ts",
              resolveDir: dirname(path),
            };
        });
      },
    },
    {
      name: "benchmark-quest-warning",
      setup(builder) {
        builder.onResolve(
          { filter: /^\.\.\/errorHandling$/ },
          ({ importer }) => {
            if (
              importer
                .replaceAll("\\", "/")
                .endsWith("/addons/jsQUEST.module.js")
            )
              return { path: "quest-warning", namespace: "benchmark" };
          },
        );
        builder.onLoad(
          { filter: /^quest-warning$/, namespace: "benchmark" },
          () => ({
            contents:
              "export const warning = (...message) => console.warn(...message);",
          }),
        );
      },
    },
  ],
});
await Promise.all(
  ["index.html", "style.css"].map((name) =>
    copyFile(join(root, name), join(output, name)),
  ),
);
