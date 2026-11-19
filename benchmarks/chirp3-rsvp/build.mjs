import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const website = fileURLToPath(new URL("../../", import.meta.url));
const source = resolve(process.env.EE_BENCH_SOURCE_ROOT ?? website);
const threshold = join(source, "docs/experiment/threshold");
const { build, createServer } = await import(
  pathToFileURL(join(threshold, "node_modules/vite/dist/node/index.js")).href
);
const settings = {
  configFile: false,
  root,
  base: "./",
  resolve: { alias: { "@threshold": threshold } },
  plugins: [
    {
      name: "benchmark-quest-warning",
      enforce: "pre",
      resolveId(id, importer) {
        if (
          id === "../errorHandling" &&
          importer?.replaceAll("\\", "/").endsWith("/addons/jsQUEST.module.js")
        )
          return "\0benchmark-quest-warning";
      },
      load(id) {
        if (id === "\0benchmark-quest-warning")
          return "export const warning = (...message) => console.warn(...message);";
      },
    },
  ],
};
if (process.argv.includes("--serve")) {
  const server = await createServer({
    ...settings,
    server: {
      host: "127.0.0.1",
      port: 4177,
      strictPort: true,
      fs: { allow: [root, threshold] },
    },
  });
  await server.listen();
  server.printUrls();
} else {
  await build({ ...settings, build: { target: "es2022", outDir: "dist" } });
}
