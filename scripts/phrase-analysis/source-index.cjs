// Conservative source index. Unknown expressions stay unknown; no eval of source.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
const { createRequire } = require("module");
const deps = createRequire(path.resolve(__dirname, "../../package.json"));
const root = path.resolve(__dirname, "../..");
const roots = ["docs/experiment/threshold/components"];
const files = [path.join(root, "docs/experiment/threshold/threshold.js")];
function list(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", "dist", "tests", "__tests__"].includes(entry.name))
        list(p);
    } else if (/\.(js|ts|jsx|tsx)$/.test(p) && !p.endsWith(".d.ts"))
      files.push(p);
  }
}
roots.forEach((r) => list(path.join(root, r)));
const inventory = [...new Set(files)].sort().map((absolute) => ({
  absolute,
  source: fs.readFileSync(absolute, "utf8"),
}));
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const manifest = {
  schemaVersion: 2,
  analyserSha256: hash(fs.readFileSync(__filename)),
  dependencies: ["@babel/parser", "@babel/traverse"].map((name) => ({
    name,
    sha256: hash(fs.readFileSync(deps.resolve(name + "/package.json"))),
  })),
  lockfiles: [
    "package-lock.json",
    "docs/experiment/package-lock.json",
    "docs/experiment/threshold/package-lock.json",
  ].map((file) => ({
    path: file,
    sha256: fs.existsSync(path.join(root, file))
      ? hash(fs.readFileSync(path.join(root, file)))
      : null,
  })),
  importTargets: inventory
    .flatMap(({ absolute, source }) =>
      [...source.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)].map(
        (match) => {
          const base = path.resolve(path.dirname(absolute), match[1]);
          return [
            base,
            base + ".js",
            base + ".ts",
            base + "/index.js",
            base + "/index.ts",
          ].map((candidate) => ({
            path: path.relative(root, candidate),
            isFile: fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
          }));
        },
      ),
    )
    .flat(),
  snapshots: inventory.map(({ absolute, source }) => ({
    path: path.relative(root, absolute),
    sha256: hash(source),
  })),
};
const fingerprint = hash(JSON.stringify(manifest));
if (process.argv.includes("--fingerprint")) {
  fs.writeFileSync(1, JSON.stringify({ fingerprint, manifest }) + "\n");
  process.exit(0);
}
const parser = deps("@babel/parser"),
  traverse = deps("@babel/traverse").default;

const sites = [],
  edges = [],
  failures = [],
  snapshots = [];
function nameOf(p) {
  if (!p) return "<module>";
  if (p.node.id?.name) return p.node.id.name;
  if (p.parentPath?.isVariableDeclarator()) return p.parentPath.node.id.name;
  return `<callback:${p.node.loc.start.line}>`;
}
function owner(p, file) {
  return file + "#" + nameOf(p.getFunctionParent());
}
function paramExpr(n) {
  if (!n) return null;
  if (
    n.type === "CallExpression" &&
    n.callee.type === "MemberExpression" &&
    n.callee.object.type === "Identifier" &&
    n.callee.object.name === "paramReader" &&
    n.callee.property.name === "read" &&
    n.arguments[0]?.type === "StringLiteral"
  )
    return { kind: "parameter", name: n.arguments[0].value };
  if (
    n.type === "MemberExpression" &&
    n.computed &&
    n.property.type === "NumericLiteral" &&
    n.property.value === 0
  )
    return paramExpr(n.object);
  return null;
}
function expr(n, p, seen = new Set()) {
  if (!n) return { kind: "unknown" };
  const par = paramExpr(n);
  if (par) return par;
  if (
    [
      "StringLiteral",
      "BooleanLiteral",
      "NumericLiteral",
      "NullLiteral",
    ].includes(n.type)
  )
    return {
      kind: "literal",
      value: n.type === "NullLiteral" ? null : n.value,
    };
  if (n.type === "Identifier") {
    if (seen.has(n.name)) return { kind: "unknown" };
    seen = new Set([...seen, n.name]);
    const b = p.scope.getBinding(n.name);
    if (b?.path.isVariableDeclarator() && b.constant)
      return expr(b.path.node.init, b.path, seen);
    return { kind: "unknown", identifier: n.name };
  }
  if (n.type === "UnaryExpression" && n.operator === "!")
    return { kind: "not", argument: expr(n.argument, p, seen) };
  if (n.type === "BinaryExpression" || n.type === "LogicalExpression")
    return {
      kind: n.operator,
      left: expr(n.left, p, new Set(seen)),
      right: expr(n.right, p, new Set(seen)),
    };
  return { kind: "unknown" };
}
function keys(n, p, seen = new Set()) {
  if (!n) return [];
  if (n.type === "StringLiteral")
    return /^(EE|RC|T)_/.test(n.value) ? [n.value] : [];
  if (n.type === "ConditionalExpression")
    return [
      ...keys(n.consequent, p, new Set(seen)),
      ...keys(n.alternate, p, new Set(seen)),
    ];
  if (n.type === "Identifier") {
    if (seen.has(n.name)) return [];
    seen = new Set([...seen, n.name]);
    const b = p.scope.getBinding(n.name);
    if (!b) return [];
    let out = b.path.isVariableDeclarator()
      ? keys(b.path.node.init, b.path, new Set(seen))
      : [];
    for (const v of b.constantViolations)
      if (v.isAssignmentExpression())
        out.push(...keys(v.node.right, v, new Set(seen)));
    return out;
  }
  if (n.type === "MemberExpression") {
    const b =
      n.object.type === "Identifier" ? p.scope.getBinding(n.object.name) : null;
    const obj = b?.path.node.init;
    if (obj?.type === "ObjectExpression")
      return obj.properties.flatMap((prop) =>
        keys(prop.value, p, new Set(seen)),
      );
  }
  return [];
}
for (const { absolute, source } of inventory) {
  const file = path.relative(root, absolute);
  let ast;
  snapshots.push({
    path: file,
    sha256: crypto.createHash("sha256").update(source).digest("hex"),
  });
  try {
    ast = parser.parse(source, {
      sourceType: "unambiguous",
      plugins: ["typescript", "jsx"],
    });
  } catch (e) {
    failures.push({ file, message: e.message });
    continue;
  }
  const imports = {};
  for (const n of ast.program.body)
    if (n.type === "ImportDeclaration")
      for (const s of n.specifiers)
        imports[s.local.name] = {
          source: n.source.value,
          name: s.imported?.name ?? "default",
        };
  traverse(ast, {
    CallExpression(p) {
      const n = p.node;
      const fn = n.callee.name;
      if (fn) {
        const imp = imports[fn];
        let target = file + "#" + fn;
        if (imp?.source.startsWith(".")) {
          let base = path.resolve(path.dirname(absolute), imp.source);
          const match = [
            base,
            base + ".js",
            base + ".ts",
            base + "/index.js",
            base + "/index.ts",
          ].find((x) => fs.existsSync(x) && fs.statSync(x).isFile());
          if (match) target = path.relative(root, match) + "#" + imp.name;
        }
        edges.push({
          from: owner(p, file),
          to: target,
          line: n.loc.start.line,
        });
      }
      if (fn !== "readi18nPhrases") return;
      const guards = [];
      for (let q = p.parentPath; q; q = q.parentPath) {
        if (q.isFunction()) break;
        if (q.isIfStatement()) {
          const branch = p.findParent((x) => x.parentPath === q);
          if (branch)
            guards.push({
              truth: branch.key === "consequent",
              expression: expr(q.node.test, q),
              text: source.slice(q.node.test.start, q.node.test.end),
            });
        }
      }
      sites.push({
        id: file + ":" + n.loc.start.line + ":" + n.start,
        file,
        line: n.loc.start.line,
        function: owner(p, file),
        keys: [...new Set(keys(n.arguments[0], p))],
        argument: source.slice(
          n.arguments[0]?.start ?? n.start,
          n.arguments[0]?.end ?? n.end,
        ),
        guards,
      });
    },
  });
}
const callers = {};
for (const e of edges) (callers[e.to] ??= []).push(e);
for (const s of sites) s.callers = callers[s.function] ?? [];
process.stdout.write(
  JSON.stringify(
    {
      schemaVersion: 2,
      fingerprint,
      manifest,
      scope: "deployed-threshold-direct-phrase-readers",
      sites,
      snapshots,
      parseFailures: failures,
      coverage: {
        files: snapshots.length,
        directReaderSites: sites.length,
        dynamicUnresolvedSites: sites.filter((s) => !s.keys.length).length,
        limitations: [
          "Wrapper forwarding and direct phrases object reads are not fully indexed.",
          "Separately hosted calibration bundles are outside this index.",
          "Caller graph includes direct named calls only; callbacks and scheduling remain unresolved.",
          "Local guard exclusion is not whole-program key exclusion.",
        ],
      },
    },
    null,
    2,
  ) + "\n",
);
