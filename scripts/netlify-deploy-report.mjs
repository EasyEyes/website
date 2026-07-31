// Report (or watch) the latest Netlify deploy for this site.
// Usage:
//   node scripts/netlify-deploy-report.mjs           # latest deploy, one-shot
//   node scripts/netlify-deploy-report.mjs --watch   # poll until build finishes
// Compare deploy_time (seconds) against baseline: 269s (2026-07-31 build 6a6cc533).
import { execFileSync } from "node:child_process";

const SITE_ID = "7ef5bb5a-2b97-4af2-9868-d3e9c7ca2287"; // easyeyes / EasyEyes/website
const watch = process.argv.includes("--watch");

const api = (endpoint, data) =>
  JSON.parse(
    execFileSync("netlify", ["api", endpoint, "--data", JSON.stringify(data)], {
      encoding: "utf8",
    }),
  );

const latest = () =>
  api("listSiteDeploys", { site_id: SITE_ID, per_page: 1 })[0];

const fmt = (d) => ({
  id: d.id,
  state: d.state,
  title: d.title,
  created_at: d.created_at,
  deploy_time_s: d.deploy_time ?? null,
  error: d.error_message || null,
  log: d.links?.log || `https://app.netlify.com/projects/easyeyes/deploys/${d.id}`,
});

const d = latest();
console.log(JSON.stringify(fmt(d), null, 2));

if (watch && (d.state === "building" || d.state === "enqueued" || d.state === "processing")) {
  const t0 = Date.now();
  const poll = () => {
    const cur = api("getSiteDeploy", { site_id: SITE_ID, deploy_id: d.id });
    if (cur.state === "ready" || cur.state === "error") {
      console.log(JSON.stringify(fmt(cur), null, 2));
      process.exit(cur.state === "ready" ? 0 : 1);
    }
    if (Date.now() - t0 > 15 * 60 * 1000) {
      console.error("Timed out watching deploy", d.id);
      process.exit(2);
    }
    setTimeout(poll, 15000);
  };
  poll();
}
