import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("rejects locally declared readers and catalog-like objects", () => {
  const result = extractReferences(
    `
      const readi18nPhrases = value => value;
      const phrases = { NOT_A_CATALOG: true };
      const glossary = { notAParameter: true };
      readi18nPhrases("NOT_A_PHRASE");
      phrases.NOT_A_CATALOG;
      glossary.notAParameter;
    `,
    {
      repository: "threshold",
      commitSha: "abc123",
      file: "components/example.ts",
    },
  );

  assert.deepEqual(result, {
    phrases: emptyUsageCollection(),
    parameters: emptyUsageCollection(),
  });
});

test("expands bounded registrations and parameter aliases", () => {
  const result = applyDynamicRegistrations(
    { phrases: emptyUsageCollection(), parameters: emptyUsageCollection() },
    {
      phrases: [
        {
          sourceEvidence: "phrases.ts",
          patterns: [
            {
              prefix: "EE_Choice",
              range: { from: 1, to: 3 },
              width: 2,
            },
          ],
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
    "EE_Choice01",
    "EE_Choice02",
    "EE_Choice03",
  ]);
  assert.deepEqual(Object.keys(result.parameters.registeredDynamicKeys), [
    "target",
    "targetKind",
  ]);
});

test("production question registrations match the current two-digit families", () => {
  const registrations = JSON.parse(
    readFileSync(new URL("./catalog-audit.dynamic.json", import.meta.url)),
  );
  const result = applyDynamicRegistrations(
    { phrases: emptyUsageCollection(), parameters: emptyUsageCollection() },
    registrations,
    { repository: "threshold", commitSha: "abc123" },
    ["parameters"],
  );
  const keys = Object.keys(result.parameters.registeredDynamicKeys);

  assert.equal(keys.length, 198);
  assert.ok(keys.includes("questionAndAnswer01"));
  assert.ok(keys.includes("questionAndAnswer99"));
  assert.ok(keys.includes("questionAnswer01"));
  assert.ok(keys.includes("questionAnswer99"));
  assert.ok(!keys.includes("questionAndAnswer1"));
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
