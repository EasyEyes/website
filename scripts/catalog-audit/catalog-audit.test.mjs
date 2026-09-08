import assert from "node:assert/strict";
import test from "node:test";

import {
  compareCatalog,
  extractReferences,
  serializeIndex,
  validateRegistry,
} from "./index.mjs";

test("extracts supported phrase and parameter references without counting comments", () => {
  const source = `
    // readi18nPhrases("COMMENT_ONLY")
    readi18nPhrases("EE_Welcome", language);
    phrases.EE_Proceed;
    phrases["EE_Cancel"];
    ParamReader.read("targetKind", condition);
    glossary["fontSize"];
  `;
  const result = extractReferences(source, {
    repository: "threshold",
    commitSha: "abc123",
    file: "components/example.ts",
  });

  assert.deepEqual(Object.keys(result.phrases.referencedKeys), [
    "EE_Cancel",
    "EE_Proceed",
    "EE_Welcome",
  ]);
  assert.deepEqual(Object.keys(result.parameters.referencedKeys), [
    "fontSize",
    "targetKind",
  ]);
});

test("reports unsupported dynamic access as uncertain", () => {
  const result = extractReferences(`phrases[prefix + suffix]`, {
    repository: "threshold",
    commitSha: "abc123",
    file: "components/example.ts",
  });

  assert.equal(result.phrases.uncertainReferences.length, 1);
  assert.equal(
    result.phrases.uncertainReferences[0].accessKind,
    "property-dynamic",
  );
});

test("catalog comparison blocks missing definitions but treats unused and uncertain as advisory", () => {
  const result = compareCatalog(["EE_Welcome", "EE_Unused"], {
    referencedKeys: { EE_Welcome: [], EE_Missing: [] },
    registeredDynamicKeys: { EE_Dynamic: [] },
    uncertainReferences: [{ file: "x.ts", line: 1 }],
  });

  assert.deepEqual(result.missingDefinitions, ["EE_Dynamic", "EE_Missing"]);
  assert.deepEqual(result.unusedCandidates, ["EE_Unused"]);
  assert.equal(result.blocking, true);
  assert.equal(result.uncertainReferences.length, 1);
  assert.match(result.deletionSafetyWarning, /never authorizes deletion/i);
});

test("serialization is byte-stable and excludes generatedAt from identity", () => {
  const base = {
    schemaVersion: 1,
    generatedAt: "2026-01-01T00:00:00.000Z",
    scanner: { version: "1.0.0", configurationDigest: "def" },
    repositories: [],
    phrases: {
      referencedKeys: {},
      registeredDynamicKeys: {},
      uncertainReferences: [],
    },
    parameters: {
      referencedKeys: {},
      registeredDynamicKeys: {},
      uncertainReferences: [],
    },
  };
  const first = serializeIndex(base);
  const second = serializeIndex({
    ...base,
    generatedAt: "2026-02-01T00:00:00.000Z",
  });

  assert.equal(first.identity, second.identity);
  assert.notEqual(first.json, second.json);
  assert.equal(first.json, serializeIndex(base).json);
});

test("registry rejects duplicate and unsafe entries", () => {
  const entry = {
    name: "threshold",
    url: "https://github.com/EasyEyes/threshold",
    defaultBranch: "master",
    catalogKinds: ["phrases"],
    sourceRoots: ["components"],
    excludeRoots: ["node_modules", "dist"],
    readers: [],
    dynamicRegistrations: [],
    status: "included",
  };

  assert.throws(() => validateRegistry([entry, entry]), /duplicate/i);
  assert.throws(
    () => validateRegistry([{ ...entry, sourceRoots: ["."] }]),
    /broad/i,
  );
});
