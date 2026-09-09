#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";

const reportPath = path.resolve(process.argv[2] ?? "catalog-usage-index.json");
const endpoint = process.env.CATALOG_USAGE_REPORT_URL;
const secret = process.env.CATALOG_USAGE_REPORT_SECRET;
if (!endpoint || !secret)
  throw new Error(
    "CATALOG_USAGE_REPORT_URL and CATALOG_USAGE_REPORT_SECRET are required",
  );

const report = JSON.parse(await readFile(reportPath, "utf8"));
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    authorization: `Bearer ${secret}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({ report, generatedAt: new Date().toISOString() }),
});
if (!response.ok)
  throw new Error(`Catalog report publication failed: ${response.status}`);
process.stdout.write(`${await response.text()}\n`);
