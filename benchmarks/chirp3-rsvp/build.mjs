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
import { basename, dirname, resolve, join } from "node:path";
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
const finishPath = "components/rsvpSpeech/rsvpSpeechFinish.ts";

async function loadBenchmarkFinishSource() {
  const original = execFileSync("git", [
    "-C",
    threshold,
    "show",
    `HEAD:${finishPath}`,
  ]);
  const scratch = await mkdtemp(join(tmpdir(), "easyeyes-finish-"));
  const staged = join(scratch, basename(finishPath));
  try {
    await writeFile(staged, original);
    execFileSync(
      "git",
      ["apply", "-p3", join(root, "patches/repeated-finish.patch")],
      { cwd: scratch },
    );
    return await readFile(staged, "utf8");
  } finally {
    await unlink(staged).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
    await rmdir(scratch);
  }
}
const finishSource = await loadBenchmarkFinishSource();

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
      name: "benchmark-repeated-finish",
      setup(builder) {
        builder.onLoad({ filter: /rsvpSpeechFinish\.ts$/ }, ({ path }) => {
          if (resolve(path) === resolve(threshold, finishPath))
            return {
              contents: finishSource,
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
