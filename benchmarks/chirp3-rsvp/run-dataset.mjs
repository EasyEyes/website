import { createRequire } from "node:module";
import { readFile, rename, stat, unlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { randomUUID } from "node:crypto";
import { readManifest, readResults } from "./fileMetrics.mjs";
import { manifestKey } from "./fileReview.mjs";

const { values } = parseArgs({ options: {
  manifest: { type: "string" }, output: { type: "string" },
  providers: { type: "string", default: "chirp3,elevenlabs" },
  workers: { type: "string", default: "3" },
  batch: { type: "string", default: "all" },
  keyterms: { type: "string", default: "on" },
  "strict-order": { type: "boolean" },
  "tail-test": { type: "boolean" },
  "allow-provider-upload": { type: "boolean" },
} });
const preview = "https://deploy-preview-169--easyeyes.netlify.app/";
const accessCode = process.env.RSVP_BENCH_ACCESS_CODE?.trim();
const providers = [...new Set(values.providers.split(","))];
if (!values.manifest || !values.output || !values["allow-provider-upload"] ||
    !/^[a-f0-9]{64}$/i.test(accessCode ?? "") ||
    providers.some((p) => !["chirp3", "elevenlabs", "deepgram"].includes(p)) ||
    !["1", "2", "3"].includes(values.workers) || !["off", "on", "both"].includes(values.keyterms) ||
    !["25", "100", "all"].includes(values.batch))
  throw new Error("Provide --manifest, --output, --allow-provider-upload and RSVP_BENCH_ACCESS_CODE. Optional: --providers chirp3,elevenlabs --keyterms on --workers 3 --batch 25");

const manifestPath = resolve(values.manifest);
const output = resolve(values.output);
const manifest = readManifest(JSON.parse(await readFile(manifestPath, "utf8")));
const key = manifestKey(manifest.clips);
const settingsOrder = !values["strict-order"];
let saved;
try { saved = JSON.parse(await readFile(output, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
if (saved) {
  if (saved.manifestKey !== key || saved.settings?.ignoreOrder !== settingsOrder)
    throw new Error("Checkpoint does not match this manifest or word-order setting. Choose a different output file.");
  readResults(saved, manifest.clips);
}
const files = manifest.clips.map((clip) => resolve(dirname(manifestPath), clip.file));
for (const file of files) {
  if (dirname(file) !== dirname(manifestPath) || !(await stat(file)).isFile())
    throw new Error("Every audio file must be beside the manifest.");
}

const website = fileURLToPath(new URL("../../", import.meta.url));
const source = resolve(process.env.EE_BENCH_SOURCE_ROOT ?? website);
const require = createRequire(join(source, "docs/experiment/threshold/package.json"));
const { chromium } = require("playwright");
const { RSVP_BENCH_ACCESS_CODE: _unused, ...browserEnv } = process.env;
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  env: browserEnv,
  args: ["--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
});
let interrupted = false;
const halt = () => { interrupted = true; };
process.once("SIGINT", halt);
process.once("SIGTERM", halt);
let page;
let started = false;
const delay = (ms) => new Promise((done) => setTimeout(done, ms));
async function checkpoint() {
  const button = page.locator("#file-export-json");
  if (!(await button.isEnabled())) return;
  const downloading = page.waitForEvent("download", { timeout: 15000 });
  await button.click();
  const download = await downloading;
  const tmp = output + "." + randomUUID() + ".tmp";
  try {
    await download.saveAs(tmp);
    const data = JSON.parse(await readFile(tmp, "utf8"));
    if (data.manifestKey !== key) throw new Error("Unexpected checkpoint manifest.");
    await rename(tmp, output);
  } finally {
    await unlink(tmp).catch((error) => { if (error.code !== "ENOENT") throw error; });
    await download.delete();
  }
}

try {
  page = await browser.newPage({ acceptDownloads: true });
  await page.goto(preview, { waitUntil: "domcontentloaded" });
  if (new URL(page.url()).origin !== new URL(preview).origin)
    throw new Error("The benchmark preview redirected to another site.");
  await page.locator("#show-files").click();
  await page.locator("#file-workers").waitFor({ state: "visible" });
  await page.locator("#file-manifest").setInputFiles(manifestPath);
  await page.locator("#file-audio").setInputFiles(files);
  await page.waitForFunction((count) =>
    document.getElementById("file-status").textContent.includes(`${count} matching audio files`), files.length);
  await page.locator("#file-ignore-order").setChecked(settingsOrder);
  if (saved?.results.length) {
    await page.locator("#file-results").setInputFiles(output);
    await page.locator("#file-export-json:not(:disabled)").waitFor();
  }
  await page.locator("#file-code").fill(accessCode);
  await page.locator("#file-workers").selectOption(values.workers);
  await page.locator("#file-batch-limit").selectOption(values.batch);
  await page.locator("#file-tail-test").setChecked(!!values["tail-test"]);
  await page.locator("#file-keyterms").selectOption(values.keyterms);
  for (const p of ["chirp3", "elevenlabs", "deepgram"])
    await page.locator(`input[name="file-provider"][value="${p}"]`).setChecked(providers.includes(p));
  await page.locator("#file-consent").check();
  await page.locator("#file-run").click();
  started = true;
  let previous = "";
  while (await page.locator("#file-cancel").isEnabled()) {
    if (interrupted) {
      await page.locator("#file-cancel").click();
      break;
    }
    const progress = await page.locator("#file-progress-counts").textContent();
    if (progress && progress !== previous) {
      console.log(progress);
      await checkpoint();
      previous = progress;
    }
    await delay(5000);
  }
  if (interrupted) await page.locator("#file-cancel:disabled").waitFor({ state: "attached", timeout: 30000 });
  const finalStatus = await page.locator("#file-status").textContent();
  console.log(finalStatus);
  if (finalStatus.includes("Paused providers:")) process.exitCode = 2;
} finally {
  try { if (started) await checkpoint(); }
  finally {
    process.removeListener("SIGINT", halt);
    process.removeListener("SIGTERM", halt);
    await browser.close();
  }
}
