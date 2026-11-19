import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = resolve(
  process.env.EE_BENCH_SOURCE_ROOT ??
    fileURLToPath(new URL("../../", import.meta.url)),
);
const require = createRequire(
  resolve(source, "docs/experiment/threshold/package.json"),
);
const { chromium } = require("playwright");
const server = createServer(async (req, res) => {
  const path = req.url === "/" ? "/index.html" : req.url;
  if (!/^\/(?:index\.html|main\.js|style\.css)$/i.test(path))
    return res.writeHead(404).end();
  try {
    const contents = await readFile(new URL(`./dist${path}`, import.meta.url));
    const type = path.endsWith(".html")
      ? "text/html"
      : path.endsWith(".css")
      ? "text/css"
      : path.endsWith(".wasm")
      ? "application/wasm"
      : "text/javascript";
    res.writeHead(200, { "Content-Type": type }).end(contents);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  const errors = [];
  page.setDefaultTimeout(7000);
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.error(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.error(message.text());
  });
  page.on("response", (response) => {
    if (!response.ok())
      console.error(response.status(), new URL(response.url()).pathname);
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator("#scenario").selectOption("space");
  assert.match(await page.locator("#arena-cue").innerText(), /press Space/);
  assert.equal(
    await page
      .getByText("rsvpReadingSTTUseKeytermsBool", { exact: true })
      .count(),
    1,
  );
  assert.equal(
    await page.getByText("Deterministic fixture", { exact: false }).count(),
    0,
  );
  await page.locator("#keyterms").selectOption("FALSE");
  await page.locator("#scenario").selectOption("finishWait");
  assert.equal(await page.locator("#stt").inputValue(), "0.5");
  assert.equal(await page.locator("#keyterms").inputValue(), "FALSE");
  await page.locator("#scenario").selectOption("perfect");
  assert.equal(await page.locator("#stt").inputValue(), "10");
  await page.locator("#corpus").setInputFiles({
    name: "test-words.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("boat rose tree\nkitten tiger apple\n"),
  });
  await page.getByText(/Loaded 2 target sets/).waitFor();
  assert.equal(await page.locator("#targets").inputValue(), "boat, rose, tree");
  await page.getByRole("button", { name: "Load next word set" }).click();
  assert.equal(
    await page.locator("#targets").inputValue(),
    "kitten, tiger, apple",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Built Preview UI passed. No audio or provider request was sent.",
  );
} finally {
  await browser?.close();
  server.close();
}
