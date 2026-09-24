import { createHash } from "node:crypto";

import { parse } from "@babel/parser";

export const emptyUsageCollection = () => ({
  referencedKeys: {},
  registeredDynamicKeys: {},
  uncertainReferences: [],
});

const EMPTY_COLLECTION = emptyUsageCollection;

const evidenceFor = (location, node, accessKind) => ({
  repository: location.repository,
  commitSha: location.commitSha,
  file: location.file,
  line: node.loc?.start.line ?? 1,
  accessKind,
});

const literalString = (node) =>
  node?.type === "StringLiteral" ||
  (node?.type === "TemplateLiteral" && node.expressions.length === 0)
    ? node.type === "StringLiteral"
      ? node.value
      : node.quasis[0].value.cooked
    : null;

function addReference(collection, key, evidence) {
  collection.referencedKeys[key] ??= [];
  collection.referencedKeys[key].push(evidence);
}

function addPatternBindings(pattern, names) {
  if (!pattern) return;
  if (pattern.type === "Identifier") names.add(pattern.name);
  if (pattern.type === "RestElement")
    addPatternBindings(pattern.argument, names);
  if (pattern.type === "AssignmentPattern")
    addPatternBindings(pattern.left, names);
  for (const property of pattern.properties ?? [])
    addPatternBindings(property.value ?? property.argument, names);
  for (const element of pattern.elements ?? [])
    addPatternBindings(element, names);
}

function declarationsIn(statements) {
  const names = new Set();
  for (const statement of statements ?? []) {
    if (statement.type === "VariableDeclaration")
      for (const declaration of statement.declarations)
        addPatternBindings(declaration.id, names);
    if (
      (statement.type === "FunctionDeclaration" ||
        statement.type === "ClassDeclaration") &&
      statement.id
    )
      names.add(statement.id.name);
  }
  return names;
}

function walk(node, visit, shadowed = new Set()) {
  if (!node || typeof node !== "object") return;
  let localShadowed = shadowed;
  if (node.type === "Program" || node.type === "BlockStatement") {
    localShadowed = new Set(shadowed);
    for (const name of declarationsIn(node.body)) localShadowed.add(name);
  }
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    localShadowed = new Set(shadowed);
    for (const parameter of node.params ?? []) {
      if (parameter.type === "Identifier") localShadowed.add(parameter.name);
    }
  }
  if (typeof node.type === "string") visit(node, localShadowed);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (Array.isArray(value))
      value.forEach((child) => walk(child, visit, localShadowed));
    else if (value && typeof value === "object")
      walk(value, visit, localShadowed);
  }
}

export function extractReferences(source, location, configuration = {}) {
  const result = {
    phrases: EMPTY_COLLECTION(),
    parameters: EMPTY_COLLECTION(),
  };
  const phraseReaders = new Map([
    ["readi18nPhrases", 0],
    ...(configuration.phraseReaders ?? []).map(({ name, keyArgument = 0 }) => [
      name,
      keyArgument,
    ]),
  ]);
  const parameterReaders = new Map(
    (configuration.parameterReaders ?? []).map(({ name, keyArgument = 0 }) => [
      name,
      keyArgument,
    ]),
  );
  const isTypeScript = /\.tsx?$/.test(location.file);
  const isJsx = !isTypeScript || /\.tsx$/.test(location.file);
  const ast = parse(source, {
    sourceType: "unambiguous",
    plugins: [
      ...(isTypeScript ? ["typescript"] : []),
      ...(isJsx ? ["jsx"] : []),
      "decorators-legacy",
      "classProperties",
    ],
    errorRecovery: false,
  });

  const moduleReaders = new Set();
  for (const node of ast.program.body) {
    if (node.type !== "ImportDeclaration") continue;
    for (const reader of [
      ...(configuration.phraseReaders ?? []),
      ...(configuration.parameterReaders ?? []),
    ]) {
      if (
        reader.module === node.source.value &&
        node.specifiers.some(
          (specifier) => specifier.local?.name === reader.name,
        )
      ) {
        moduleReaders.add(reader.name);
      }
    }
  }

  walk(ast, (node, shadowed) => {
    if (node.type === "CallExpression") {
      let readerName = null;
      if (node.callee.type === "Identifier") readerName = node.callee.name;
      if (
        node.callee.type === "MemberExpression" &&
        !node.callee.computed &&
        node.callee.object.type === "Identifier" &&
        node.callee.property.type === "Identifier"
      ) {
        readerName = `${node.callee.object.name}.${node.callee.property.name}`;
      }
      if (
        node.callee.type === "Identifier" &&
        (shadowed.has(readerName) ||
          ((configuration.phraseReaders ?? []).some(
            (reader) => reader.name === readerName && reader.module,
          ) &&
            !moduleReaders.has(readerName)))
      ) {
        readerName = null;
      }
      const collection = phraseReaders.has(readerName)
        ? result.phrases
        : readerName === "ParamReader.read" || parameterReaders.has(readerName)
        ? result.parameters
        : null;
      if (collection) {
        const keyArgument =
          phraseReaders.get(readerName) ??
          parameterReaders.get(readerName) ??
          0;
        const key = literalString(node.arguments[keyArgument]);
        if (key)
          addReference(
            collection,
            key,
            evidenceFor(location, node, "reader-call"),
          );
        else
          collection.uncertainReferences.push(
            evidenceFor(location, node, "reader-dynamic"),
          );
      }
    }

    if (
      node.type !== "MemberExpression" ||
      node.object.type !== "Identifier" ||
      shadowed.has(node.object.name)
    )
      return;
    const collection =
      node.object.name === "phrases"
        ? result.phrases
        : node.object.name === "glossary"
        ? result.parameters
        : null;
    if (!collection) return;
    const key = node.computed
      ? literalString(node.property)
      : node.property.type === "Identifier"
      ? node.property.name
      : null;
    if (key)
      addReference(
        collection,
        key,
        evidenceFor(location, node, "property-static"),
      );
    else
      collection.uncertainReferences.push(
        evidenceFor(location, node, "property-dynamic"),
      );
  });

  return normalizeCollections(result);
}

export function compareCatalog(definitions, usage) {
  const defined = new Set(definitions);
  const used = new Set([
    ...Object.keys(usage.referencedKeys),
    ...Object.keys(usage.registeredDynamicKeys),
  ]);
  const missingDefinitions = [...used]
    .filter((key) => !defined.has(key))
    .sort();
  const unusedCandidates = [...defined].filter((key) => !used.has(key)).sort();
  return {
    missingDefinitions,
    unusedCandidates,
    uncertainReferences: usage.uncertainReferences,
    blocking: missingDefinitions.length > 0,
    deletionSafetyWarning:
      "An unused candidate is informational and never authorizes deletion.",
  };
}

export function validateRegistry(entries) {
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.name))
      throw new Error(`Duplicate repository: ${entry.name}`);
    seen.add(entry.name);
    for (const field of ["name", "url", "defaultBranch", "status"]) {
      if (!entry[field])
        throw new Error(`${entry.name ?? "Repository"} is missing ${field}`);
    }
    if (entry.status === "included") {
      if (!entry.catalogKinds?.length || !entry.sourceRoots?.length)
        throw new Error(
          `${entry.name} has an incomplete included configuration`,
        );
      if (entry.sourceRoots.includes("."))
        throw new Error(`${entry.name} uses an unsafe broad source root`);
    } else if (!entry.reason) {
      throw new Error(`${entry.name} exclusion is missing a reason`);
    }
  }
  return entries;
}

export function compareRegistryInventory(entries, repositories) {
  const registered = new Map(entries.map((entry) => [entry.name, entry]));
  const discovered = new Map(repositories.map((entry) => [entry.name, entry]));
  return {
    unaccounted: [...discovered.keys()]
      .filter((name) => !registered.has(name))
      .sort(),
    removed: [...registered.keys()]
      .filter((name) => !discovered.has(name))
      .sort(),
    defaultBranchChanges: [...discovered.values()]
      .filter(
        (entry) =>
          registered.has(entry.name) &&
          registered.get(entry.name).defaultBranch !== entry.defaultBranch,
      )
      .map((entry) => ({
        name: entry.name,
        registered: registered.get(entry.name).defaultBranch,
        discovered: entry.defaultBranch,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function applyDynamicRegistrations(
  result,
  registrations,
  location,
  catalogKinds = ["phrases", "parameters"],
) {
  const allowed = new Set(catalogKinds);
  for (const kind of ["phrases", "parameters"]) {
    if (!allowed.has(kind)) continue;
    for (const registration of registrations[kind] ?? []) {
      const keys = new Set(registration.keys ?? []);
      for (const alias of Object.keys(registration.aliases ?? {}))
        keys.add(alias);
      for (const canonical of Object.values(registration.aliases ?? {}))
        keys.add(canonical);
      for (const pattern of registration.patterns ?? []) {
        const range = pattern.range;
        if (
          !Number.isInteger(range.from) ||
          !Number.isInteger(range.to) ||
          range.to < range.from ||
          range.to - range.from > 1000
        )
          throw new Error("Dynamic registration range must be bounded");
        for (let value = range.from; value <= range.to; value += 1) {
          const suffix = String(value).padStart(pattern.width ?? 0, "0");
          keys.add(`${pattern.prefix}${suffix}`);
        }
      }
      for (const key of [...keys].sort()) {
        result[kind].registeredDynamicKeys[key] ??= [];
        result[kind].registeredDynamicKeys[key].push({
          ...location,
          file: registration.sourceEvidence,
          line: 1,
          accessKind: "registered-dynamic",
        });
      }
    }
  }
  return normalizeCollections(result);
}

export function filterCollectionsByKinds(result, catalogKinds) {
  const allowed = new Set(catalogKinds);
  return {
    phrases: allowed.has("phrases") ? result.phrases : EMPTY_COLLECTION(),
    parameters: allowed.has("parameters")
      ? result.parameters
      : EMPTY_COLLECTION(),
  };
}

const compareJson = (a, b) =>
  JSON.stringify(a).localeCompare(JSON.stringify(b));

function sortObject(value, omitGeneratedAt = false) {
  if (Array.isArray(value))
    return value
      .map((item) => sortObject(item, omitGeneratedAt))
      .sort(compareJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => !(omitGeneratedAt && key === "generatedAt"))
      .sort()
      .map((key) => [key, sortObject(value[key], omitGeneratedAt)]),
  );
}

function normalizeCollections(result) {
  return sortObject(result);
}

export function serializeIndex(index) {
  const normalized = sortObject(index, true);
  const identityInput = JSON.stringify(sortObject(index, true));
  return {
    identity: createHash("sha256").update(identityInput).digest("hex"),
    json: `${JSON.stringify(normalized, null, 2)}\n`,
  };
}
