export const DIAGNOSTIC_SEVERITY = Object.freeze({
  CATALOG_AUDIT_STALE: "error",
  CATALOG_AUDIT_FAILED: "error",
  PHRASE_DEFINITION_MISSING: "error",
  PHRASE_REFERENCE_UNCERTAIN: "warning",
  PARAMETER_DEFINITION_MISSING: "error",
  RELEASE_MANIFEST_INVALID: "error",
  RELEASE_COMPONENT_MISMATCH: "error",
  RELEASE_PIN_MISMATCH: "error",
  RELEASE_ACTIVATION_FAILED: "error",
});

const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const string = (value) => typeof value === "string" && value.length > 0;
const strings = (value) => Array.isArray(value) && value.every(string);
const sortedUnique = (value) =>
  strings(value) &&
  value.every((item, index) => index === 0 || value[index - 1] < item);
const digest = (value) =>
  string(value) && /^(sha256-)?[A-Za-z0-9+/=_-]{32,}$/.test(value);

export function validateReleaseManifest(value) {
  return (
    object(value) &&
    value.schemaVersion === 1 &&
    /^\d{4}-\d{2}-\d{2}(\.\d+)?$/.test(value.releaseId ?? "") &&
    Number.isInteger(value.contractVersion) &&
    object(value.engine) &&
    string(value.engine.package) &&
    string(value.engine.version) &&
    digest(value.engine.integrity) &&
    object(value.phrases) &&
    string(value.phrases.version) &&
    digest(value.phrases.digest) &&
    object(value.glossary) &&
    string(value.glossary.version) &&
    digest(value.glossary.digest) &&
    string(value.catalogUsageReportId) &&
    string(value.publishedAt)
  );
}

export function validateStudyCatalogRequirements(value) {
  return (
    object(value) &&
    value.schemaVersion === 1 &&
    sortedUnique(value.phraseKeys) &&
    sortedUnique(value.phraseFamilies) &&
    sortedUnique(value.parameterNames) &&
    sortedUnique(value.languages) &&
    sortedUnique(value.customPhraseKeys)
  );
}

export function validateExperimentReleasePin(value) {
  return (
    object(value) &&
    /^\d{4}-\d{2}-\d{2}(\.\d+)?$/.test(value.releaseId ?? "") &&
    digest(value.manifestDigest) &&
    string(value.artifactRevision) &&
    string(value.pinnedAt)
  );
}

export function diagnostic(code, details = {}) {
  const severity = DIAGNOSTIC_SEVERITY[code];
  if (!severity) throw new Error(`Unknown diagnostic code: ${code}`);
  return { schemaVersion: 1, code, severity, ...details };
}
