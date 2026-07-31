// Persist npm's content-addressed cache across builds.
// Speeds up the three nested `npm ci` runs (docs/experiment, threshold, psychojs)
// without weakening npm ci's clean-slate guarantee: node_modules are still
// wiped and rebuilt from the lockfile; only tarball downloads are cached.
const { execFileSync } = require("node:child_process");
const { rmSync, mkdirSync } = require("node:fs");
const NPM_CACACHE = `${process.env.HOME}/.npm/_cacache`;
// Cap the cache so the build cache doesn't grow unboundedly (npm never evicts).
// Above the cap, reset it: one cold build re-primes a lean cache.
const MAX_MB = 1000;

const sizeMb = () => {
  try {
    return parseInt(
      execFileSync("du", ["-sm", NPM_CACACHE], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).split("\t")[0],
      10,
    );
  } catch {
    return 0; // cache dir missing or du failed; treat as small, never fail the build
  }
};

module.exports = {
  onPreBuild: async ({ utils }) => {
    const restored = await utils.cache.restore(NPM_CACACHE);
    console.log(`[npm-cache] restore ${NPM_CACACHE}: ${restored}`);
  },
  onPostBuild: async ({ utils }) => {
    try {
      const mb = sizeMb();
      if (mb > MAX_MB) {
        console.log(
          `[npm-cache] ${mb}MB exceeds ${MAX_MB}MB cap; resetting cache`,
        );
        rmSync(NPM_CACACHE, { recursive: true, force: true });
        mkdirSync(NPM_CACACHE, { recursive: true }); // save an empty dir, not a missing one
      }
      const saved = await utils.cache.save(NPM_CACACHE);
      console.log(`[npm-cache] save ${NPM_CACACHE} (${mb}MB): ${saved}`);
    } catch (error) {
      // caching is an optimization; never fail a build over it
      console.log(`[npm-cache] save failed (non-fatal): ${error.message}`);
    }
  },
};
