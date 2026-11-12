#!/usr/bin/env node
/**
 * deadCode.mjs — dead-code audit & purge for the EasyEyes website repo.
 *
 *   npm run dead-code          # report only (default)
 *   npm run dead-code:purge    # delete verified-dead code (same rules)
 *   node scripts/deadCode.mjs --root /path/to/website [--purge] [--json]
 *
 * SCOPE: analyzes imports/exports of the threshold runtime sources
 * (docs/experiment/threshold/{components,parameters,preprocess,server},
 * threshold.js, first.js). The REFERENCING UNIVERSE is the whole website
 * repo — the compiler UI above threshold/ (docs/experiment/source) imports
 * directly into threshold, so threshold-only scans produce false positives.
 *
 * RULES (each from a real incident):
 *  1. An import-statement mention is NOT usage (body identifiers count).
 *     But TYPE-only imports (import type {X} / import {type X}) ARE usage
 *     (PcmAudioChunk incident).
 *  2. A file that DECLARES the same name locally doesn't reference ours
 *     (atand re-defined in source/studio/assistant/feasibilitySkill.ts).
 *  3. Generated artifacts are not references (studio-code-index.json,
 *     source-index.json) nor are e2e stub fixtures
 *     (docs/experiment/tests/e2e/fixtures) nor .md files.
 *  4. Unused imports: AST-precise; names mentioned in ANY comment are KEPT
 *     (conservative); an import statement is only removed whole if the
 *     target module has another importer (side-effect safety).
 *  5. PURGE deletes only: unused imports, exports unreferenced anywhere
 *     (not even tests), and unwired orphan files. Test-only exports and
 *     internal-only exports (export-keyword-dead) are REPORTED, kept.
 *  6. Orphan-file wiring counts npm scripts, html <script src>, tsconfig
 *     includes; *.d.ts and *.type-test.ts are never orphans.
 *
 * Purge never edits files outside docs/experiment/threshold/.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const PURGE = process.argv.includes("--purge");
const JSON_OUT = process.argv.includes("--json");
const rootArg = process.argv.find((a) => a.startsWith("--root="))?.slice(7);
const WEBSITE = rootArg
  ? path.resolve(rootArg)
  : path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TH = path.join(WEBSITE, "docs", "experiment", "threshold");

const require = createRequire(import.meta.url);
const ts = require("typescript");

// ── configuration ───────────────────────────────────────────────────────────
const ANALYZED_DIRS = ["components", "parameters", "preprocess", "server"];
const ANALYZED_ROOT_FILES = ["threshold.js", "first.js"];
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".jj",
  "dist",
  "build",
  ".vite",
  "coverage",
  "__pycache__",
  ".cache",
  ".netlify",
  "notes",
  "js",
]);
const SKIP_FILE = (rel) =>
  /(^|\/)(.*code-index.*\.json|source-index\.json)$/.test(rel) || // generated
  rel.endsWith(".md") ||
  rel.startsWith("docs/experiment/tests/e2e/fixtures/") ||
  rel.includes("/.git/") ||
  rel.endsWith(".min.js");

// never purge (report-only) even if unreferenced:
const KEEP_ORPHANS = new Set([
  // manual dev tool, not scripted (confirm before ever deleting):
  "server/fontPixiMetricsString-bruteforce.mjs",
  // imported only by a commented-out line in threshold.js (pixel-read feature
  // deliberately disabled; delete when that feature is retired):
  "components/canvasContext.js",
  // implements the glossary-specified _calibrateTimingNumberAndSecs parameter
  // (the spec is still published; the code is unwired, not dead)
  "components/calibrateTiming.ts",
]);
const KEEP_EXPORTS = new Set([]); // none needed once require() counted

const CODE_EXT = /\.(js|ts|tsx|jsx|mjs|cjs)$/;
const IDENT = /[A-Za-z_$][\w$]*/g;

// ── helpers ─────────────────────────────────────────────────────────────────
const relTh = (f) => path.relative(TH, f);
const relWeb = (f) => path.relative(WEBSITE, f);
function* walk(dir, keepGoing = true) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
const ctxOf = (file) => {
  const rel = relWeb(file);
  if (rel.startsWith("docs/experiment/threshold/")) {
    return rel.startsWith("docs/experiment/threshold/tests/") ||
      rel.includes("__tests__") ||
      /\.(test|spec)\.[jt]sx?$/.test(rel)
      ? "th-test"
      : "th-prod";
  }
  if (/__tests__|\/tests\/|\.(test|spec)\.[jt]sx?$/.test(rel))
    return "ext-test";
  return "ext-prod";
};

// ── phase A: AST analysis of threshold sources ─────────────────────────────
const analyzedFiles = [];
for (const d of ANALYZED_DIRS)
  for (const f of walk(path.join(TH, d))) {
    const rel = relTh(f);
    if (rel.startsWith("components/addons/") || !CODE_EXT.test(f)) continue;
    analyzedFiles.push(f);
  }
for (const f of ANALYZED_ROOT_FILES) {
  const p = path.join(TH, f);
  if (fs.existsSync(p)) analyzedFiles.push(p);
}

const astInfo = new Map(); // file -> {exports, imports, bodyUses, declared, sf, src}
const astImportModules = []; // EVERY import declaration (incl. namespace/default/side-effect)
for (const file of analyzedFiles) {
  const src = fs.readFileSync(file, "utf8");
  const kind = /\.tsx?$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  const imports = []; // {node, specifiers:[{local,start,end,typeOnly}], module, line, commentStartsLine}
  const exports = []; // {name, node, jsDocStart}
  const bodyUses = new Map();
  const declared = new Set();
  const clauseNodes = new Set();
  const collectClause = (n) => {
    clauseNodes.add(n);
    ts.forEachChild(n, collectClause);
  };

  const visit = (n) => {
    if (ts.isImportDeclaration(n))
      astImportModules.push([
        file,
        n.moduleSpecifier.text,
        !!n.importClause?.isTypeOnly, // type imports vanish in emitted JS — not runtime importers
      ]);
    // `export * from` / `export { x } from` ARE runtime imports of the target
    if (ts.isExportDeclaration(n) && n.moduleSpecifier)
      astImportModules.push([file, n.moduleSpecifier.text, false]);
    if (
      ts.isImportDeclaration(n) &&
      n.importClause?.namedBindings &&
      ts.isNamedImports(n.importClause.namedBindings)
    ) {
      collectClause(n.importClause);
      const lineStart = src.lastIndexOf("\n", n.getStart()) + 1;
      imports.push({
        node: n,
        module: n.moduleSpecifier.text,
        typeWhole: !!n.importClause.isTypeOnly,
        commentedOut: /^\s*\/\//.test(src.slice(lineStart, n.getStart())),
        specifiers: n.importClause.namedBindings.elements.map((el) => ({
          local: el.name.text,
          typeOnly: !!n.importClause?.isTypeOnly || !!el.isTypeOnly,
          start: el.getStart(sf),
          end: el.getEnd(),
        })),
      });
      return;
    }
    if (
      ts.isExportDeclaration(n) &&
      n.exportClause &&
      ts.isNamedExports(n.exportClause)
    ) {
      collectClause(n);
      for (const el of n.exportClause.elements)
        if (el.name.text === "default")
          // untrackable by name — sentinel post-pass marks the local binding used
          exports.push({
            name: "__default_binding__",
            localBinding: el.propertyName?.text,
            node: n,
            listElement: true,
          });
        else exports.push({ name: el.name.text, node: n, listElement: true });
      return;
    }
    if (ts.isExportDeclaration(n) && n.exportClause) {
      collectClause(n);
      return;
    }
    let name = null;
    let declNode = null;
    if (
      ts.isVariableStatement(n) &&
      n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      // EVERY declarator is its own export: `export const a = 1, b = 2;`
      let any = false;
      for (const d of n.declarationList.declarations)
        if (ts.isIdentifier(d.name)) {
          exports.push({ name: d.name.text, node: n, decl: d });
          declared.add(d.name.text);
          any = true;
        }
      if (any) return; // do not count decl identifiers as body use
    } else if (
      (ts.isFunctionDeclaration(n) ||
        ts.isClassDeclaration(n) ||
        ts.isTypeAliasDeclaration(n) ||
        ts.isInterfaceDeclaration(n)) &&
      n.name &&
      n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
      // `export default function foo` — importers bind their own name; the
      // declaration name can never match usage, so never track it as dead
      !n.modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
      name = n.name.text;
    }
    if (name) {
      exports.push({
        name,
        node: n,
        decl: null,
        jsDocStart: n.jsDoc?.[0]?.getStart(sf) ?? n.getStart(sf),
      });
      declared.add(name);
      return; // do not count decl identifiers as body use
    }
    if (
      (ts.isFunctionDeclaration(n) ||
        ts.isClassDeclaration(n) ||
        ts.isTypeAliasDeclaration(n) ||
        ts.isInterfaceDeclaration(n)) &&
      n.name
    ) {
      declared.add(n.name.text); // internal decl: same-name-local guard
    }
    if (
      (ts.isVariableDeclaration(n) || ts.isBindingElement?.(n)) &&
      ts.isIdentifier(n.name)
    )
      declared.add(n.name.text);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  const countUses = (n) => {
    if (clauseNodes.has(n)) return;
    if (ts.isIdentifier(n))
      bodyUses.set(n.text, (bodyUses.get(n.text) ?? 0) + 1);
    ts.forEachChild(n, countUses);
  };
  countUses(sf);
  // `export { x as default }`: the element is untrackable by name, so force its
  // local binding `x` to look internally used — keeps both declaration & element
  for (const exd of exports)
    if (exd.listElement && exd.name === "__default_binding__")
      bodyUses.set(exd.localBinding, 2);
  astInfo.set(file, { src, sf, imports, exports, bodyUses, declared });
}

// unused-import candidates (analyzed files)
const commentsOf = (src) =>
  src.match(/\/\*[\s\S]*?\*\/|\/\/.*/g)?.join("\n") ?? "";
const unusedImports = []; // {file, module, local, typeOnly, statementAllUnused, removeStatement}
for (const [file, info] of astInfo) {
  const commentText = commentsOf(info.src);
  // keep-listed files are left exactly as written (unwired feature code)
  if (KEEP_ORPHANS.has(relTh(file))) continue;
  for (const imp of info.imports) {
    if (imp.commentedOut) continue;
    const keep = [],
      drop = [];
    for (const sp of imp.specifiers) {
      const used = (info.bodyUses.get(sp.local) ?? 0) > 0;
      if (!used && commentText.includes(sp.local)) keep.push(sp);
      else if (!used) drop.push(sp);
      else keep.push(sp);
    }
    if (drop.length) {
      unusedImports.push({
        file,
        module: imp.module,
        names: drop.map((d) => d.local),
        specifiers: drop,
        removeStatement: keep.length === 0,
        nodeStart: imp.node.getStart(info.sf),
        nodeEnd: imp.node.getEnd(),
      });
    }
  }
}

// importers-by-module (for full-statement side-effect safety).
// EVERY import form counts: from-statements, dynamic import(), require() —
// harfbuzzLoader/nodeLocal are dynamic-imported; psychojs is a live vendored
// submodule (imports components/addons/jsQUEST).
const allFromStatements = [...astImportModules];
// dynamic import() / require() inside ANALYZED files (text scan skips them):
for (const [file, info] of astInfo)
  for (const m of info.src.matchAll(
    /(?:import\s*\(\s*|require\(\s*)["']([^"']+)["']/g,
  ))
    allFromStatements.push([file, m[1]]);
for (const f of walk(WEBSITE)) {
  if (!CODE_EXT.test(f) || SKIP_FILE(relWeb(f)) || astInfo.has(f)) continue;
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(
    /(?:from\s*|import\s*\(\s*|require\(\s*)["']([^"']+)["']/g,
  ))
    allFromStatements.push([f, m[1]]);
}
function resolveModule(importer, spec) {
  if (!spec.startsWith(".")) return spec;
  const base = path.normalize(path.join(path.dirname(importer), spec));
  const exists = (c) => fs.existsSync(c) && fs.statSync(c).isFile();
  // TypeScript convention: "./x.js" denotes the x.ts source (NodeNext/bundler)
  const tsAlt = base.endsWith(".js")
    ? [base.slice(0, -3) + ".ts", base.slice(0, -3) + ".tsx"]
    : [];
  for (const c of [
    base,
    ...tsAlt,
    base + ".js",
    base + ".ts",
    base + ".tsx",
    base + ".mjs",
    path.join(base, "index.js"),
    path.join(base, "index.ts"),
  ])
    if (exists(c)) return c;
  return base;
}
const importerCount = new Map();
for (const [f, spec] of allFromStatements) {
  const t = resolveModule(f, spec);
  importerCount.set(t, (importerCount.get(t) ?? 0) + 1);
}

// ── phase B: reference scan over the whole website repo ────────────────────
// usage: name -> { th-prod:Set, th-test:Set, ext-prod:Set, ext-test:Set }
const usage = new Map();
const addUse = (name, file, ctx) => {
  if (!usage.has(name))
    usage.set(name, {
      "th-prod": new Set(),
      "th-test": new Set(),
      "ext-prod": new Set(),
      "ext-test": new Set(),
    });
  usage.get(name)[ctx].add(file);
};
for (const f of walk(WEBSITE)) {
  if (!fs.statSync(f).isFile()) continue;
  const rel = relWeb(f);
  if (SKIP_FILE(rel)) continue;
  if (!CODE_EXT.test(f) && !/\.html$/.test(f)) continue;
  const src = fs.readFileSync(f, "utf8");
  const ctx = ctxOf(f);
  if (astInfo.has(f)) {
    // analyzed: body uses minus own decls feed cross-file usage of OTHER analyzed files
    const info = astInfo.get(f);
    for (const [name, count] of info.bodyUses)
      if (count > 0 && !info.declared.has(name)) addUse(name, f, ctx);
    continue;
  }
  // type-only imports and require() destructures count as usage:
  for (const m of src.matchAll(/import\s+type\s*\{([^}]*)\}/g))
    for (const p of m[1].split(",")) {
      const n = p
        .trim()
        .split(/\s+as\s+/)
        .pop();
      if (n) addUse(n, f, ctx);
    }
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from/g))
    for (const p of m[1].split(",")) {
      if (/^\s*type\s+/.test(p)) {
        const n = p
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)
          .pop();
        if (n) addUse(n, f, ctx);
      }
    }
  for (const m of src.matchAll(
    /([\w$,\s{}]+)=\s*require\(\s*["'][^"']+["']\s*\)/g,
  ))
    for (const p of m[1].replace(/[{}]/g, "").split(",")) {
      const n = p.trim();
      if (n) addUse(n, f, ctx);
    }
  // declared names in this file (same-name-local guard)
  const declaredHere = new Set();
  for (const m of src.matchAll(
    /(?:export\s+)?(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g,
  ))
    declaredHere.add(m[1]);
  // body identifiers (imports/exports stripped)
  const body = src
    .replace(/import\s+type\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, " ")
    .replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, " ")
    .replace(/import\s+[^\n;]*?from\s*["'][^"']+["'];?/g, " ")
    .replace(/export\s*\{[^}]*\}(\s*from\s*["'][^"']+["'])?;?/g, " ");
  for (const m of body.matchAll(IDENT))
    if (!declaredHere.has(m[0])) addUse(m[0], f, ctx);
}

// ── phase C: classify exports ───────────────────────────────────────────────
const commentMentions = new Set(); // identifiers named in comments (disabled-feature retention signal)
for (const [file, info] of astInfo)
  for (const m of commentsOf(info.src).matchAll(IDENT))
    commentMentions.add(m[0]);

const deadExports = [],
  testOnly = [],
  exportKwDead = [],
  prodUsed = [],
  commentKept = [],
  keepListed = [],
  sideEffectful = [];
for (const [file, info] of astInfo) {
  const typeTestFile = /\.type-test\.ts$/.test(file); // wired via tsconfig; exports are test scaffolding
  // keep-listed files are unwired-but-wanted (e.g. a glossary-specified feature
  // awaiting implementation): report their exports, never purge them
  const keepListedFile = KEEP_ORPHANS.has(relTh(file));
  for (const ex of info.exports) {
    if (ex.name === "__default_binding__") continue; // sentinel, not a real export
    if (keepListedFile) {
      keepListed.push({ file, name: ex.name });
      continue;
    }
    const u = usage.get(ex.name);
    const hasThProd =
      u?.["th-prod"].size > 0 && [...u["th-prod"]].some((f) => f !== file);
    const hasExtProd = u?.["ext-prod"].size > 0;
    const hasTest =
      (u?.["th-test"].size ?? 0) + (u?.["ext-test"].size ?? 0) > 0;
    const internal = (info.bodyUses.get(ex.name) ?? 0) >= 2; // 1 = own declaration; ≥2 = real internal use
    if (hasThProd || hasExtProd) prodUsed.push({ file, name: ex.name });
    else if (hasTest || typeTestFile) testOnly.push({ file, name: ex.name });
    else if (commentMentions.has(ex.name))
      commentKept.push({ file, name: ex.name });
    else if (
      ex.decl &&
      ex.decl.initializer &&
      containsCall(ex.decl.initializer)
    )
      // `export const cfg = f()` — deleting the declaration (or its import)
      // would skip evaluated side effects. Keep; surface for manual review.
      sideEffectful.push({ file, name: ex.name });
    else if (internal) exportKwDead.push({ file, name: ex.name });
    else
      deadExports.push({
        file,
        name: ex.name,
        node: ex.node,
        jsDocStart: ex.jsDocStart,
        src: info.src,
        sf: info.sf,
      });
  }
}

// ── phase D: orphan files ───────────────────────────────────────────────────
const npmScriptText = [
  "package.json",
  "docs/experiment/package.json",
  "docs/experiment/threshold/package.json",
]
  .map((p) => {
    try {
      return fs.readFileSync(path.join(WEBSITE, p), "utf8");
    } catch {
      return "";
    }
  })
  .join("\n");
const htmlText = [...walk(WEBSITE)]
  .filter((f) => f.endsWith(".html") && !SKIP_FILE(relWeb(f)))
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");
const tsconfigText = [...walk(TH)]
  .filter((f) => /tsconfig.*\.json$/.test(f))
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");

const orphanFiles = [],
  wiredOrphans = [];
const commentKeptFiles = new Set(commentKept.map((e) => e.file));
for (const file of analyzedFiles) {
  const rel = relTh(file);
  if (ANALYZED_ROOT_FILES.includes(rel)) continue; // entry points: wired via vite inputs / html, not imports
  const isImported = [...importerCount.entries()].some(
    ([target, n]) => target === file && n > 0,
  );
  if (isImported) continue;
  if (commentKeptFiles.has(file)) {
    wiredOrphans.push({
      rel,
      why: "comment-mentioned exports (retention signal)",
    });
    continue;
  }
  if (/\.d\.ts$/.test(rel) || /\.type-test\.ts$/.test(rel)) {
    wiredOrphans.push({ rel, why: "ambient/type-test declaration" });
    continue;
  }
  const base = path.basename(rel);
  if (npmScriptText.includes(base)) {
    wiredOrphans.push({ rel, why: "npm script" });
    continue;
  }
  if (
    new RegExp(
      `src=["'][^"']*${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    ).test(htmlText)
  ) {
    wiredOrphans.push({ rel, why: "html <script>" });
    continue;
  }
  if (tsconfigText.includes(base)) {
    wiredOrphans.push({ rel, why: "tsconfig" });
    continue;
  }
  if (KEEP_ORPHANS.has(rel)) {
    wiredOrphans.push({ rel, why: "keep-list" });
    continue;
  }
  orphanFiles.push({ file, rel });
}

// ── report / purge ──────────────────────────────────────────────────────────
const deadExportsFiltered = deadExports.filter(
  (e) => !KEEP_EXPORTS.has(e.name),
);
const result = {
  unusedImports: unusedImports.map((u) => ({
    file: relTh(u.file),
    module: u.module,
    names: u.names,
    removeStatement: u.removeStatement,
  })),
  deadExports: deadExportsFiltered.map((e) => ({
    file: relTh(e.file),
    name: e.name,
  })),
  orphanFiles: orphanFiles.map((o) => o.rel),
  kept: {
    testOnlyExports: testOnly.length,
    sideEffectfulExports: sideEffectful.length,
    exportKeywordDead: exportKwDead.length,
    commentMentionedExports: commentKept.length,
    wiredOrphans: wiredOrphans,
  },
};

const cleanOnce = (m) =>
  m
    .replace(/\{\s*,/, "{")
    .replace(/,\s*\}/, "}")
    .replace(/,\s*,/g, ",");
// loop until stable: a 3-comma run survives a single pairwise collapse pass
const cleanCommas = (s) => {
  let prev;
  let out = s;
  while (prev !== out) {
    prev = out;
    out = out
      .replace(/import\s*\{[^}]*\}\s*from/g, cleanOnce)
      .replace(/import\s+type\s*\{[^}]*\}\s*from/g, cleanOnce)
      .replace(/import\s*[\w$]+\s*,\s*\{[^}]*\}\s*from/g, cleanOnce) // import x, { a, b }
      .replace(/export\s+(?:type\s+)?\{[^}]*\}(\s*from)?/g, cleanOnce);
    // empty re-export husks (kept bare `export {}` — that marks a module ESM)
    out = out.replace(
      /export\s+(?:type\s+)?\{\s*\}\s*from\s*["'][^"']*["']\s*;?\n?/g,
      "",
    );
  }
  return out;
};

// ── human-readable report ───────────────────────────────────────────────────
const useColor =
  process.env.NO_COLOR === undefined &&
  (process.stdout.isTTY === true || !!process.env.FORCE_COLOR);
const S = (open, s) => (useColor ? `\x1b[${open}m${s}\x1b[0m` : s);
const c = {
  bold: (s) => S("1", s),
  dim: (s) => S("2", s),
  red: (s) => S("31", s),
  boldRed: (s) => S("1;31", s),
  green: (s) => S("32", s),
  boldGreen: (s) => S("1;32", s),
  yellow: (s) => S("33", s),
  boldYellow: (s) => S("1;33", s),
  blue: (s) => S("36", s),
};
// deletable count: red/yellow when there is work to do, green at zero (clean)
const tally = (k) => (k > 0 ? c.boldRed(String(k)) : c.green("0"));
// count: number → coloured tally; string → pre-rendered value; undefined → none
const header = (title, count) => {
  const value =
    count === undefined
      ? ""
      : ` ${c.dim("·")} ${typeof count === "number" ? tally(count) : count}`;
  return "\n" + c.bold("── " + title) + value;
};
// column padding must measure VISIBLE width — colour escapes have no width
const vlen = (s) => s.replace(/\x1b\[[0-9;]*m/g, "").length;
const pad = (rows) => {
  const w = Math.max(...rows.map(([l]) => vlen(l)), 0);
  return rows.map(([l, r]) => `   ${l}${" ".repeat(w - vlen(l))}  ${r}`);
};
const fileList = (items) =>
  pad(items.map((it) => [c.blue(relTh(it.file)), c.yellow(it.name)]));

if (JSON_OUT) {
  console.log(JSON.stringify(result, null, 1));
} else {
  const n = (x) => x.length;
  const totalUnused = unusedImports.reduce((a, u) => a + u.names.length, 0);
  const deletable = totalUnused + n(deadExportsFiltered) + n(orphanFiles);

  const rnd = parseInt(process.env.DEADCODE_ROUND ?? "1", 10);
  console.log(
    `\n${c.bold("dead-code audit")} ${c.dim("—")} ${WEBSITE}${
      rnd > 1 ? " " + c.dim(`(converge round ${rnd - 1})`) : ""
    }`,
  );
  console.log(
    c.dim(
      `analyzed ${analyzedFiles.length} threshold source files; references from the whole website repo`,
    ),
  );

  // deletable findings: only non-empty sections are shown at all
  if (deletable) {
    console.log(header("DELETABLE", deletable));
    if (totalUnused) {
      console.log(
        header("unused imports", totalUnused) +
          " " +
          c.dim(
            `(${n(unusedImports)} statement${
              n(unusedImports) === 1 ? "" : "s"
            })`,
          ),
      );
      console.log(
        pad(
          unusedImports.map((u) => [
            c.blue(relTh(u.file)),
            `${c.dim("←")} ${u.module} ${c.dim(":")} ${c.yellow(
              u.names.join(", "),
            )}`,
          ]),
        ).join("\n"),
      );
    }
    if (n(deadExportsFiltered)) {
      console.log(header("dead exports", n(deadExportsFiltered)));
      console.log(fileList(deadExportsFiltered).join("\n"));
    }
    if (n(orphanFiles)) {
      console.log(header("orphan files", n(orphanFiles)));
      for (const o of orphanFiles) console.log(`   ${c.blue(o.rel)}`);
    }
  }

  console.log(header("KEPT", c.dim("report only")));
  const keptRow = (label, k, extra) =>
    console.log(
      `   ${c.dim(label.padEnd(46))} ${String(k).padStart(3)}${
        extra ? `  ${c.dim(extra)}` : ""
      }`,
    );
  keptRow("test-only exports", testOnly.length);
  keptRow("comment-mentioned (disabled-feature retention)", commentKept.length);
  keptRow("side-effectful dead exports (manual review)", sideEffectful.length);
  for (const e of sideEffectful)
    console.log(`       ${c.blue(relTh(e.file))}  ${c.yellow(e.name)}`);
  keptRow("export-keyword-dead (internal use only)", exportKwDead.length);
  keptRow("keep-listed file exports (unwired feature)", keepListed.length);
  for (const w of wiredOrphans)
    console.log(
      `   ${c.dim("wired/kept orphan")} ${c.blue(w.rel)} ${c.dim(
        `(${w.why})`,
      )}`,
    );

  console.log(
    deletable === 0
      ? `\n${c.boldGreen("✓ clean")} ${c.dim("— nothing deletable")}`
      : `\n${c.boldYellow(`→ ${deletable} deletable`)} ${c.dim(
          "— run: npm run dead-code:purge",
        )}`,
  );
}

// a module is side-effect-free when every top-level statement is a
// declaration — safe to stop importing even if we are its last importer
function containsCall(n) {
  // "effects evaluated when n itself is evaluated" — do NOT descend into
  // function/arrow bodies (called later ≠ module-init effect) or class members
  if (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) return false;
  if (ts.isClassExpression(n)) {
    if (n.decorators?.length) return true; // legacy decorators evaluate at definition
    return (n.heritageClauses ?? []).some((hc) => containsCall(hc)); // extends evaluates
  }
  if (
    ts.isCallExpression(n) ||
    ts.isNewExpression(n) ||
    ts.isTaggedTemplateExpression?.(n)
  )
    return true;
  // assignments / increments / delete / spread all execute at module init when
  // nested inside evaluated initializers (object literals, arrays, defaults)
  if (
    ts.isBinaryExpression(n) &&
    n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
    n.operatorToken.kind <= ts.SyntaxKind.LastAssignment
  )
    return true;
  if (
    (ts.isPrefixUnaryExpression?.(n) || ts.isPostfixUnaryExpression?.(n)) &&
    (n.operator === ts.SyntaxKind.PlusPlusToken ||
      n.operator === ts.SyntaxKind.MinusMinusToken)
  )
    return true;
  if (ts.isDeleteExpression?.(n) || ts.isSpreadElement?.(n)) return true;
  let bad = false;
  ts.forEachChild(n, (c) => {
    if (!bad && containsCall(c)) bad = true;
  });
  return bad;
}
function sideEffectFree(file) {
  try {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
    const src = fs.readFileSync(file, "utf8");
    const sf = ts.createSourceFile(
      file,
      src,
      ts.ScriptTarget.Latest,
      true,
      /\.tsx?$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.JS,
    );
    for (const st of sf.statements) {
      if (
        ts.isImportDeclaration(st) ||
        ts.isExportDeclaration(st) ||
        ts.isEmptyStatement(st) ||
        ts.isFunctionDeclaration(st) ||
        ts.isClassDeclaration(st) ||
        ts.isInterfaceDeclaration(st) ||
        ts.isTypeAliasDeclaration(st) ||
        ts.isModuleDeclaration?.(st)
      )
        continue;
      if (ts.isVariableStatement(st)) {
        let inert = true;
        for (const d of st.declarationList.declarations) {
          const i = d.initializer;
          if (
            !i ||
            containsCall(i) ||
            ts.isAwaitExpression?.(i) ||
            ts.isBinaryExpression?.(i)
          ) {
            inert = false;
            break;
          }
        }
        if (inert) continue;
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

if (PURGE) {
  if (!process.env.DEADCODE_ROUND) process.env.DEADCODE_ROUND = "1";
  let round = parseInt(process.env.DEADCODE_ROUND, 10);
  if (round > 8) {
    console.error(
      `deadCode: ${c.red("exceeded 8 converge rounds")} — stopping.`,
    );
    process.exit(1);
  }
  let touchedFiles = 0,
    removedNames = 0,
    removedStmts = 0,
    removedExports = 0,
    removedFiles = 0;
  // 1) unused imports
  const byFile = new Map();
  for (const u of unusedImports) {
    if (!byFile.has(u.file)) byFile.set(u.file, []);
    byFile.get(u.file).push(u);
  }
  for (const [file, list] of byFile) {
    let src = fs.readFileSync(file, "utf8");
    const edits = [];
    for (const u of list) {
      const target = resolveModule(file, u.module);
      // OTHER FILES with value imports of the module — same-file duplicate
      // statements can't vouch for each other (both may be removed this pass)
      const others = [
        ...new Set(
          astImportModules
            .filter(([f, , tOnly]) => !tOnly)
            .filter(([f, spec]) => resolveModule(f, spec) === target)
            .map(([f]) => f),
        ),
      ].filter((f) => f !== file).length;
      if (u.removeStatement && (others >= 1 || sideEffectFree(target))) {
        // remove the WHOLE statement — never also its inner specifier ranges
        // (overlapping edits splice twice and eat following text)
        let end = u.nodeEnd;
        const nl = src.indexOf("\n", end);
        if (nl !== -1 && src.slice(end, nl).trim() === "") end = nl + 1;
        edits.push([u.nodeStart, end]);
        removedStmts++;
      } else if (u.removeStatement) {
        console.log(
          `${c.yellow("   kept statement")} ${c.dim(
            "(no other importer, not side-effect-free)",
          )} ${c.blue(relTh(file))} ${c.dim("←")} ${u.module}`,
        );
      } else {
        for (const sp of u.specifiers) {
          edits.push([sp.start, sp.end]);
          removedNames++;
        }
      }
    }
    if (!edits.length) continue;
    edits.sort((a, b) => b[0] - a[0]);
    for (const [s, e] of edits) src = src.slice(0, s) + src.slice(e);
    fs.writeFileSync(file, cleanCommas(src));
    touchedFiles++;
  }
  // 2) dead exports
  for (const ex of deadExportsFiltered) {
    const originalSrc = fs.readFileSync(ex.file, "utf8"); // re-read (imports may have shifted)
    let src = originalSrc;
    const sf = ts.createSourceFile(
      ex.file,
      src,
      ts.ScriptTarget.Latest,
      true,
      /\.tsx?$/.test(ex.file) ? ts.ScriptKind.TS : ts.ScriptKind.JS,
    );
    let found = false;
    sf.forEachChild(function find(n) {
      if (found) return;
      let name = null;
      let matchedDecl = null;
      if (
        ts.isVariableStatement(n) &&
        n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        for (const d of n.declarationList.declarations)
          if (ts.isIdentifier(d.name) && d.name.text === ex.name) {
            name = ex.name;
            matchedDecl = d;
            break;
          }
      } else if (
        (ts.isFunctionDeclaration(n) ||
          ts.isClassDeclaration(n) ||
          ts.isTypeAliasDeclaration(n) ||
          ts.isInterfaceDeclaration(n)) &&
        n.name &&
        n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      )
        name = n.name.text;
      if (name === ex.name) {
        found = true;
        if (
          ts.isVariableStatement(n) &&
          n.declarationList.declarations.length > 1 &&
          matchedDecl
        ) {
          // multi-declarator: REBUILD the list from surviving declarators —
          // comma-string surgery produced `export const , x;` / `const x, ;`
          const list = n.declarationList;
          const survivors = list.declarations.filter((d) => d !== matchedDecl);
          const kw =
            list.getText(sf).match(/^(const|let|var)\b/)?.[1] ?? "const";
          const prefix = src.slice(n.getStart(sf), list.getStart(sf)).trim(); // `export` (+modifiers)
          const rebuilt = `${prefix} ${kw} ${survivors
            .map((d) => d.getText(sf))
            .join(", ")};`;
          src = src.slice(0, n.getStart(sf)) + rebuilt + src.slice(n.getEnd());
        } else {
          let start = n.jsDoc?.[0]?.getStart(sf) ?? n.getStart(sf);
          let end = n.getEnd();
          const nl = src.indexOf("\n", end);
          if (nl !== -1 && src.slice(end, nl).trim() === "") end = nl + 1;
          src = src.slice(0, start) + src.slice(end);
        }
      } else ts.forEachChild(n, find);
    });
    // export { name } / export type { name } lists — element-wise: drop the
    // whole element (incl. `x as name` prefixes); bare `export {}` kept (ESM marker)
    src = src.replace(
      /export\s+(type\s+)?\{([^}]*)\}(\s*from\s*["'][^"']*["'])?/g,
      (m, to, body, from) => {
        const parts = body
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const kept = parts.filter((p) => {
          const ids = p
            .replace(/^type\s+/, "")
            .trim()
            .split(/\s+as\s+/);
          return ids[ids.length - 1] !== ex.name; // exported name is the LAST id
        });
        if (kept.length === parts.length) return m;
        if (!kept.length) return from ? "" : `export ${to ?? ""}{}`;
        return `export ${to ?? ""}{ ${kept.join(", ")} }${from ?? ""}`;
      },
    );
    if (src !== originalSrc) {
      fs.writeFileSync(ex.file, cleanCommas(src));
      removedExports++;
      touchedFiles++;
    }
  }
  // 3) orphan files
  for (const o of orphanFiles) {
    fs.rmSync(o.file);
    removedFiles++;
    console.log(`${c.red("   deleted file")} ${c.blue(o.rel)}`);
  }

  const total = removedNames + removedStmts + removedExports + removedFiles;
  console.log(
    `\n${c.bold("purge")} ${c.dim("·")} ${
      total ? c.boldRed(`${total} deletions`) : c.green("0 deletions")
    } ${c.dim(
      `(${removedNames} import names, ${removedStmts} statements, ${removedExports} exports, ${removedFiles} files; ${touchedFiles} files touched)`,
    )}`,
  );
  if (total > 0) {
    // converge: deleting code exposes newly-dead code — re-run until stable
    console.log(c.dim(`converge round ${round}: re-scanning…`));
    const { spawnSync } = await import("node:child_process");
    const env = { ...process.env, DEADCODE_ROUND: String(round + 1) };
    const args = [new URL(import.meta.url).pathname, ...process.argv.slice(2)];
    const r = spawnSync(process.execPath, args, { env, stdio: "inherit" });
    process.exit(r.status ?? 0);
  }
  console.log(
    `${c.boldGreen("✓ stable")} ${c.dim("— no further deletions. Verify:")}`,
  );
  console.log(
    c.dim(
      `  cd docs/experiment/threshold && npm run check:ts && npm test && npx vite build --mode production`,
    ),
  );
  console.log(c.dim(`  then: npx prettier --write <touched files>`));
}
