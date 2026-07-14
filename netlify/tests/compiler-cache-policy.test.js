const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const config = fs.readFileSync(
  path.resolve(__dirname, "../../netlify.toml"),
  "utf8",
);

const headerBlocks = [
  ...config.matchAll(
    /\[\[headers\]\]\s+for = "([^"]+)"\s+\[headers\.values\]([\s\S]*?)(?=\n\[|$)/g,
  ),
].map(([, route, values]) => ({
  route,
  values: Object.fromEntries(
    [...values.matchAll(/^([^#\s][^=]+?)\s*=\s*"([^"]*)"$/gm)].map(
      ([, name, value]) => [name.trim(), value],
    ),
  ),
}));

const headersFor = (route) =>
  headerBlocks.find((block) => block.route === route)?.values;

test("compiler documents and manifest require browser and CDN revalidation", () => {
  const revalidation = "public, max-age=0, must-revalidate";

  for (const route of [
    "/compiler/",
    "/compiler/index.html",
    "/compiler/deployment.json",
  ]) {
    assert.deepEqual(headersFor(route), {
      "Cache-Control": revalidation,
      "Netlify-CDN-Cache-Control": revalidation,
    });
  }
});

test("compiler hashed assets are cached as immutable for one year", () => {
  const immutable = "public, max-age=31536000, immutable";

  assert.deepEqual(headersFor("/compiler/dist/*"), {
    "Cache-Control": immutable,
    "Netlify-CDN-Cache-Control": immutable,
  });
});

test("existing compiler cross-origin headers remain configured", () => {
  assert.deepEqual(headersFor("/compiler/threshold/*"), {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
});
