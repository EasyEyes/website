import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve, join } from "node:path";
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
