import { readFile } from "node:fs/promises";
import { validateReleaseManifest } from "./catalog-audit/contracts-v1.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const path = args.find((arg) => !arg.startsWith("--"));
if (!path) throw new Error("Usage: publish-easyeyes-release [--dry-run] manifest.json");

const manifest = JSON.parse(await readFile(path, "utf8"));
if (!validateReleaseManifest(manifest))
  throw new Error("RELEASE_MANIFEST_INVALID");

if (dryRun) {
  process.stdout.write(`Valid release manifest: ${manifest.releaseId}\n`);
  process.exit(0);
}

const endpoint =
  process.env.RELEASE_MANIFEST_URL ??
  "https://easyeyes.app/.netlify/functions/release-manifest";
const secret = process.env.RELEASE_MANIFEST_SECRET;
if (!secret) throw new Error("RELEASE_MANIFEST_SECRET is required");
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify(manifest),
});
const result = await response.json();
if (!response.ok) throw new Error(result.code ?? `HTTP_${response.status}`);
process.stdout.write(`${JSON.stringify(result)}\n`);
