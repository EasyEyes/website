import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DIAGNOSTIC_SEVERITY,
  diagnostic,
  validateExperimentReleasePin,
  validateReleaseManifest,
  validateStudyCatalogRequirements,
} from "./contracts-v1.mjs";

const fixtures = JSON.parse(
  readFileSync(new URL("./fixtures/contracts-v1.json", import.meta.url)),
);

test("accepts unified valid fixtures without consulting current pointers", () => {
  assert.equal(validateReleaseManifest(fixtures.validManifest), true);
  assert.equal(
    validateStudyCatalogRequirements(fixtures.validRequirements),
    true,
  );
  assert.equal(validateExperimentReleasePin(fixtures.validPin), true);
  assert.ok(!JSON.stringify(fixtures).includes("currentVersion"));
});

test("rejects partial pins and nondeterministic requirements", () => {
  assert.equal(validateExperimentReleasePin(fixtures.partialPin), false);
  assert.equal(
    validateStudyCatalogRequirements({
      ...fixtures.validRequirements,
      phraseKeys: ["EE_OK", "EE_Cancel", "EE_OK"],
    }),
    false,
  );
});

test("keeps uncertain references advisory and safety failures blocking", () => {
  assert.equal(DIAGNOSTIC_SEVERITY.PHRASE_REFERENCE_UNCERTAIN, "warning");
  for (const code of [
    "CATALOG_AUDIT_STALE",
    "PHRASE_DEFINITION_MISSING",
    "PARAMETER_DEFINITION_MISSING",
    "RELEASE_PIN_MISMATCH",
    "RELEASE_ACTIVATION_FAILED",
  ]) {
    assert.equal(diagnostic(code).severity, "error");
  }
});

test("preserves legacy records without treating them as malformed pins", () => {
  assert.deepEqual(fixtures.legacyRecord, {
    phrasesVersion: "2.9",
    glossaryVersion: "30.1",
  });
  assert.equal(validateExperimentReleasePin(fixtures.legacyRecord), false);
});
