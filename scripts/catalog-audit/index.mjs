import { createHash } from "node:crypto";

import { parse } from "@babel/parser";

const EMPTY_COLLECTION = () => ({
  referencedKeys: {},
  registeredDynamicKeys: {},
  uncertainReferences: [],
});

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

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else if (value && typeof value === "object") walk(value, visit);
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

  walk(ast, (node) => {
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

    if (node.type !== "MemberExpression" || node.object.type !== "Identifier")
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
  const normalized = sortObject(index);
  const identityInput = JSON.stringify(sortObject(index, true));
  return {
    identity: createHash("sha256").update(identityInput).digest("hex"),
    json: `${JSON.stringify(normalized, null, 2)}\n`,
  };
}
