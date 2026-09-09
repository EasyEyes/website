import assert from "node:assert/strict";
import test from "node:test";

import {
  applyDynamicRegistrations,
  compareCatalog,
  emptyUsageCollection,
  filterCollectionsByKinds,
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
  assert.equal(first.json, second.json);
  assert.doesNotMatch(first.json, /generatedAt/);
  assert.equal(first.json, serializeIndex(base).json);
});

test("only configured bindings are treated as catalog readers", () => {
  const result = extractReferences(
    `
      import { readi18nPhrases } from "./i18n";
      function unrelated(readi18nPhrases) {
        readi18nPhrases("SHADOWED");
      }
      readi18nPhrases("REAL");
    `,
    {
      repository: "threshold",
      commitSha: "abc123",
      file: "components/example.ts",
    },
    {
      phraseReaders: [
        { name: "readi18nPhrases", keyArgument: 0, module: "./i18n" },
      ],
    },
  );

  assert.deepEqual(Object.keys(result.phrases.referencedKeys), ["REAL"]);
});

test("expands bounded registrations and parameter aliases", () => {
  const result = applyDynamicRegistrations(
    { phrases: emptyUsageCollection(), parameters: emptyUsageCollection() },
    {
      phrases: [
        {
          sourceEvidence: "phrases.ts",
          pattern: { prefix: "EE_Choice", range: { from: 1, to: 3 } },
        },
      ],
      parameters: [
        {
          sourceEvidence: "parameter.ts",
          keys: ["targetKind"],
          aliases: { target: "targetKind" },
        },
      ],
    },
    { repository: "threshold", commitSha: "abc123" },
  );

  assert.deepEqual(Object.keys(result.phrases.registeredDynamicKeys), [
    "EE_Choice1",
    "EE_Choice2",
    "EE_Choice3",
  ]);
  assert.deepEqual(Object.keys(result.parameters.registeredDynamicKeys), [
    "target",
    "targetKind",
  ]);
});

test("drops findings for catalog kinds a repository does not own", () => {
  const result = filterCollectionsByKinds(
    {
      phrases: {
        referencedKeys: { EE_OK: [] },
        registeredDynamicKeys: {},
        uncertainReferences: [],
      },
      parameters: {
        referencedKeys: { targetKind: [] },
        registeredDynamicKeys: {},
        uncertainReferences: [],
      },
    },
    ["phrases"],
  );

  assert.deepEqual(Object.keys(result.phrases.referencedKeys), ["EE_OK"]);
  assert.deepEqual(result.parameters, emptyUsageCollection());
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
