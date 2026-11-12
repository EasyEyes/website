// Adversarial tests for scripts/deadCode.mjs — each captures a bug found (or
// nearly found) during validation. Run: npm run test:dead-code
// Each test builds a miniature website repo in a temp dir and runs the tool
// against it via --root, then asserts on the purged files.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)("typescript");

// parse check via the REAL engine (TS's parser silently accepts `const a, ;`)
const assertParses = (file) => {
  const src = fs.readFileSync(file, "utf8");
  if (/\.tsx?$/.test(file)) {
    const sf = ts.createSourceFile(
      file,
      src,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    assert.equal(
      sf.parseDiagnostics.length,
      0,
      `must parse cleanly: ${sf.parseDiagnostics
        .slice(0, 3)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "))
        .join("; ")}`,
    );
    return;
  }
  const tmp = path.join(
    os.tmpdir(),
    `dc-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`,
  );
  fs.writeFileSync(tmp, src);
  try {
    execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
  } catch (e) {
    assert.fail(
      `${file} must parse as ESM: ${e.stderr.toString().split("\n")[0]}`,
    );
  } finally {
    fs.rmSync(tmp, { force: true });
  }
};

const SCRIPT = new URL("./deadCode.mjs", import.meta.url).pathname;

function fixture(build) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "deadcode-test-"));
  const web = path.join(root, "website");
  const th = path.join(web, "docs/experiment/threshold");
  fs.mkdirSync(path.join(th, "components"), { recursive: true });
  fs.mkdirSync(path.join(th, "tests"), { recursive: true });
  fs.mkdirSync(path.join(web, "docs/experiment/source"), { recursive: true });
  fs.writeFileSync(
    path.join(th, "package.json"),
    '{"name":"threshold","private":true}',
  );
  fs.writeFileSync(
    path.join(web, "package.json"),
    '{"name":"website","private":true}',
  );
  build({ web, th, root });
  return { web, th, root };
}
const run = (web, args = []) =>
  execFileSync(process.execPath, [SCRIPT, `--root=${web}`, "--json", ...args], {
    encoding: "utf8",
  });
const read = (th, rel) => fs.readFileSync(path.join(th, rel), "utf8");

test("purge of a multi-declarator export keeps the live sibling", () => {
  const { web, th } = fixture(({ th }) => {
    // deadA is unreferenced; liveB is imported AND used by the entry.
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const deadA = 1, liveB = 2;\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { liveB } from "./components/mod.js";\nconsole.log(liveB);\n',
    );
  });
  const report = JSON.parse(run(web));
  assert.equal(
    report.deadExports.length,
    1,
    "deadA should be the only dead export",
  );
  run(web, ["--purge"]);
  const mod = read(th, "components/mod.js");
  assert.match(mod, /liveB\s*=\s*2/, "live sibling must survive the purge");
  assert.doesNotMatch(mod, /deadA/, "deadA must be gone");
  assertParses(path.join(th, "components/mod.js")); // regex assertions alone masked corruption
});

test("export-list purge removes only the named entry (prefix-safety)", () => {
  const { web, th } = fixture(({ th }) => {
    // Purging `at` must not eat `atand` from the same export list.
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "const at = 1, atand = 2;\nexport { at, atand };\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { atand } from "./components/mod.js";\nconsole.log(atand);\n',
    );
  });
  run(web, ["--purge"]);
  const mod = read(th, "components/mod.js");
  assert.match(mod, /atand/, "atand must survive");
  const list = mod.match(/export\s*\{[^}]*\}/)[0];
  assert.ok(
    !/\bat\b/.test(list.replace("atand", "")),
    "at must be gone from the list",
  );
});

test("comment-mentioned export is reported, not purged", () => {
  const { web, th } = fixture(({ th }) => {
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "// TODO re-enable legacyThing\nexport const legacyThing = 1;\n",
    );
    fs.writeFileSync(path.join(th, "threshold.js"), "console.log(1);\n");
  });
  const report = JSON.parse(run(web));
  assert.equal(
    report.deadExports.length,
    0,
    "comment-mentioned export is not deletable",
  );
  run(web, ["--purge"]);
  assert.match(
    read(th, "components/mod.js"),
    /legacyThing/,
    "must survive purge",
  );
});

test("purge converges: deleting a dead export strands its import, both go", () => {
  const { web, th } = fixture(({ th }) => {
    // middle imports deadLeaf (unused in its own body) and nothing else.
    fs.writeFileSync(
      path.join(th, "components/deadleaf.js"),
      "export const deadLeaf = 1;\n",
    );
    fs.writeFileSync(
      path.join(th, "components/middle.js"),
      'import { deadLeaf } from "./deadleaf.js";\nexport const used = 2;\n',
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { used } from "./components/middle.js";\nconsole.log(used);\n',
    );
  });
  run(web, ["--purge"]);
  const middle = read(th, "components/middle.js");
  assert.doesNotMatch(
    middle,
    /deadLeaf/,
    "stranded import removed by converge rounds",
  );
  assert.match(middle, /used/, "live export intact");
});

test("type-only import counts as usage (PcmAudioChunk regression)", () => {
  const { web, th } = fixture(({ th }) => {
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export type Chunk = number;\nexport const usedValue = 1;\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { usedValue, type Chunk } from "./components/mod.js";\n' +
        "const x /*: Chunk */ = usedValue;\nconsole.log(String(x));\n",
    );
  });
  const report = JSON.parse(run(web));
  assert.equal(
    report.deadExports.filter((e) => e.name === "Chunk").length,
    0,
    "type-only-imported export must not be classified dead",
  );
});

test("multi-declarator purge, dead declarator FIRST, leaves parseable JS", () => {
  const { web, th } = fixture(({ th }) => {
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const deadA = 1, liveB = 2;\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { liveB } from "./components/mod.js";\nconsole.log(liveB);\n',
    );
  });
  run(web, ["--purge"]);
  const mod = path.join(th, "components/mod.js");
  assert.match(read(th, "components/mod.js"), /liveB\s*=\s*2/);
  assertParses(mod); // was: `export const , liveB = 2;` → SyntaxError, tool said "stable"
});

test("multi-declarator purge, dead declarator LAST with semicolon, leaves parseable JS", () => {
  const { web, th } = fixture(({ th }) => {
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const liveA = 7, deadB = 2;\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { liveA } from "./components/mod.js";\nconsole.log(liveA);\n',
    );
  });
  run(web, ["--purge"]);
  const mod = path.join(th, "components/mod.js");
  assert.match(read(th, "components/mod.js"), /liveA\s*=\s*7/);
  assertParses(mod); // was: `export const liveA = 7, ;` → SyntaxError
});

test("import of a module with nested-assignment side effects is never removed", () => {
  const { web, th } = fixture(({ th }) => {
    // object-literal initializer containing an ASSIGNMENT: evaluated at import
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const cfg = { zap: (globalThis.zapped = true) };\n",
    );
    // cfg imported but unused → tempting whole-statement removal
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { cfg } from "./components/mod.js";\nconsole.log(1);\n',
    );
  });
  run(web, ["--purge"]);
  const entry = read(th, "threshold.js");
  assert.match(
    entry,
    /import\s*\{\s*cfg\s*\}/,
    "side-effectful import must survive even when its binding is unused",
  );
});

test("aliased re-export purge removes the whole element and stays parseable", () => {
  const { web, th } = fixture(({ th }) => {
    // publicName is a dead ALIASED re-export; live keeps the file wired
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const live = 8;\nconst internal = 5;\nexport { internal as publicName };\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { live } from "./components/mod.js";\nconsole.log(live);\n',
    );
  });
  run(web, ["--purge"]);
  const mod = path.join(th, "components/mod.js");
  const out = read(th, "components/mod.js");
  assert.match(out, /live\s*=\s*8/, "live sibling must survive");
  assert.doesNotMatch(out, /publicName/, "dead alias must be gone");
  assertParses(mod); // was: `export { internal as}` → SyntaxError
});

test("`export { x as default }` list elements are never purged", () => {
  const { web, th } = fixture(({ th }) => {
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const live = 8;\nexport { live as default };\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import def from "./components/mod.js";\nconsole.log(def);\n',
    );
  });
  run(web, ["--purge"]);
  const out = read(th, "components/mod.js");
  assert.match(
    out,
    /live\s+as\s+default/,
    "default re-export element must survive — deleting it breaks importers",
  );
  assertParses(path.join(th, "components/mod.js"));
});

test("duplicate same-file imports of a side-effectful module are both kept", () => {
  const { web, th } = fixture(({ th }) => {
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const cfg = { zap: (globalThis.zapped = true) };\n",
    );
    // two statements, same file, same module — neither has another-file importer
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { a } from "./components/mod.js";\n' +
        'import { b } from "./components/mod.js";\nconsole.log(1);\n',
    );
  });
  run(web, ["--purge"]);
  const entry = read(th, "threshold.js");
  assert.match(entry, /import\s*\{\s*a\s*\}/, "first statement must survive");
  assert.match(entry, /import\s*\{\s*b\s*\}/, "second statement must survive");
});

test("TS `.js`-specifier imports resolve to `.ts` sources (no orphan deletion)", () => {
  const { web, th } = fixture(({ th }) => {
    // TS convention: "./mod.js" denotes the mod.ts source (NodeNext/bundler)
    fs.writeFileSync(
      path.join(th, "components/mod.ts"),
      "export interface A { x: number }\nexport const B = 3;\n",
    );
    fs.writeFileSync(
      path.join(th, "components/consumer.ts"),
      'import { type A, B } from "./mod.js";\nexport const c = B + 1;\n',
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import { c } from "./components/consumer.js";\nconsole.log(c);\n',
    );
  });
  run(web, ["--purge"]);
  assert.ok(
    fs.existsSync(path.join(th, "components/mod.ts")),
    "mod.ts must not be orphan-deleted (its .js specifier resolves to it)",
  );
  assert.ok(fs.existsSync(path.join(th, "components/consumer.ts")));
  const consumer = read(th, "components/consumer.ts");
  assert.doesNotMatch(
    consumer,
    /type\s+A/,
    "unused type specifier should be purged",
  );
  assert.match(consumer, /B\s*\+\s*1/, "used binding must survive");
});

test("named `export default function/class` is never classified dead", () => {
  const { web, th } = fixture(({ th }) => {
    // importers bind their own name — name-based usage cannot see this export
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export default function makeIt(x) { return x + 1; }\nexport const live = 2;\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'import make, { live } from "./components/mod.js";\nconsole.log(make(1), live);\n',
    );
  });
  const report = JSON.parse(run(web));
  assert.equal(
    report.deadExports.filter((e) => e.name === "makeIt").length,
    0,
    "default export must not be tracked by its declaration name",
  );
  run(web, ["--purge"]);
  const out = read(th, "components/mod.js");
  assert.match(out, /makeIt/, "default export must survive purge");
  assertParses(path.join(th, "components/mod.js"));
});

test("`export * from` keeps the re-exported module alive (no orphan deletion)", () => {
  const { web, th } = fixture(({ th }) => {
    fs.writeFileSync(
      path.join(th, "components/mod.js"),
      "export const helper = () => 41;\n",
    );
    fs.writeFileSync(
      path.join(th, "threshold.js"),
      'export * from "./components/mod.js";\n',
    );
  });
  run(web, ["--purge"]);
  assert.ok(
    fs.existsSync(path.join(th, "components/mod.js")),
    "star-re-exported module must not be orphan-deleted",
  );
  assert.ok(fs.existsSync(path.join(th, "threshold.js")));
});

test("exports of a keep-listed file are never purged", () => {
  const { web, th } = fixture(({ th }) => {
    // components/canvasContext.js is on the tool's KEEP_ORPHANS list (feature
    // deliberately disabled). Its exports are the implementation of that
    // feature, so they must survive a purge even though nothing imports them.
    fs.writeFileSync(
      path.join(th, "components/canvasContext.js"),
      "export const keepMe = () => 42;\nexport const alsoKeep = 7;\n",
    );
    fs.writeFileSync(path.join(th, "threshold.js"), "console.log(1);\n");
  });
  const report = JSON.parse(run(web));
  assert.equal(
    report.deadExports.filter((e) => ["keepMe", "alsoKeep"].includes(e.name))
      .length,
    0,
    "exports of a keep-listed file must not be classified dead",
  );
  run(web, ["--purge"]);
  const out = read(th, "components/canvasContext.js");
  assert.match(out, /keepMe/, "keep-listed export must survive");
  assert.match(out, /alsoKeep/, "keep-listed export must survive");
});

test("imports of a keep-listed file are left untouched", () => {
  const { web, th } = fixture(({ th }) => {
    // unwired feature file: its imports are scaffolding for future wiring
    fs.writeFileSync(
      path.join(th, "components/canvasContext.js"),
      'import { logger } from "./utils";\nexport const keepMe = () => logger;\n',
    );
    fs.writeFileSync(
      path.join(th, "components/utils.js"),
      "export const logger = () => {};\n",
    );
    fs.writeFileSync(path.join(th, "threshold.js"), "console.log(1);\n");
  });
  run(web, ["--purge"]);
  assert.match(
    read(th, "components/canvasContext.js"),
    /import\s*\{\s*logger\s*\}/,
    "keep-listed file must be left exactly as written",
  );
});
