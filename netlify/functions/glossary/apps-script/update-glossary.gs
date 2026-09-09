/**
 * Reads all rows from the "InputParameters" tab and POSTs them to the
 * Netlify glossary function as a raw 2D array.
 *
 * SECRET ROTATION:
 *   1. Generate a new secret (e.g. openssl rand -hex 32).
 *   2. Update GLOSSARY_SECRET in Script Properties (File > Project settings >
 *      Script properties) on this script.
 *   3. Update GLOSSARY_SECRET in Netlify environment variables for the
 *      EasyEyes website deployment.
 *   4. Verify a test push succeeds before discarding the old secret.
 *
 * ACCESS CONTROL:
 *   Share this Apps Script project with Editor-or-higher only
 *   (Share button in the Apps Script IDE). Viewers must not be able to run it.
 */

var NETLIFY_FUNCTION_URL =
  "https://easyeyes.app/.netlify/functions/glossary";
var CATALOG_USAGE_REPORT_URL =
  "https://easyeyes.app/.netlify/functions/catalog-usage-report?latest";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("EasyEyes")
    .addItem("Update EasyEyes to use current Glossary", "pushGlossary")
    .addItem("Audit parameter usage in EasyEyes sources", "auditParameterUsage")
    .addToUi();
}

function compareCatalogUsage(sheetKeys, usage) {
  var definitions = {};
  sheetKeys.forEach(function (key) { if (key) definitions[String(key).trim()] = true; });
  var used = {};
  Object.keys(usage.referencedKeys || {}).concat(Object.keys(usage.registeredDynamicKeys || {})).forEach(function (key) { used[key] = true; });
  return { missing: Object.keys(used).filter(function (key) { return !definitions[key]; }).sort(), unused: Object.keys(definitions).filter(function (key) { return !used[key]; }).sort(), uncertain: usage.uncertainReferences || [] };
}

function buildCatalogUsageAuditHtml(payload) {
  var safe = JSON.stringify(payload).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
  return '<!doctype html><html><body><h1>Parameter usage audit</h1><p id="freshness"></p><h2>Missing definitions</h2><pre id="missing"></pre><h2>Unused candidates</h2><p>Informational only. Never delete a definition based on this report alone.</p><pre id="unused"></pre><h2>Uncertain references</h2><pre id="uncertain"></pre><h2>Provenance</h2><pre id="provenance"></pre><script>var value=' + safe + ';document.getElementById("freshness").textContent="Freshness: "+value.freshness.status;document.getElementById("missing").textContent=value.comparison.missing.join("\\n")||"None";document.getElementById("unused").textContent=value.comparison.unused.join("\\n")||"None";document.getElementById("uncertain").textContent=JSON.stringify(value.comparison.uncertain,null,2);document.getElementById("provenance").textContent=JSON.stringify({publication:value.publication,repositories:value.report.repositories},null,2);</script></body></html>';
}

function auditParameterUsage() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("InputParameters");
    if (!sheet) throw new Error('Sheet "InputParameters" not found.');
    var response = UrlFetchApp.fetch(CATALOG_USAGE_REPORT_URL, { method: "get", muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) throw new Error("Catalog usage report is unavailable (" + response.getResponseCode() + ").");
    var rows = sheet.getDataRange().getDisplayValues();
    var heading = rows[0].map(function (value) { return String(value).trim().toUpperCase(); }).indexOf("INPUT PARAMETER");
    var payload = JSON.parse(response.getContentText());
    payload.comparison = compareCatalogUsage(rows.slice(1).map(function (row) { return row[heading < 0 ? 0 : heading]; }), payload.report.parameters);
    SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(buildCatalogUsageAuditHtml(payload)).setWidth(900).setHeight(700), "Parameter usage audit");
  } catch (error) { notify("Could not audit Parameter usage.\n\n" + error.message); }
}

function notify(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log("[glossary] " + message);
  }
}

function pushGlossary() {
  var secret = PropertiesService.getScriptProperties().getProperty(
    "GLOSSARY_SECRET",
  );
  if (!secret) {
    notify(
      "GLOSSARY_SECRET is not set in Script Properties. " +
        "Add it under File > Project settings > Script properties.",
    );
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    "InputParameters",
  );
  if (!sheet) {
    notify('Sheet "InputParameters" not found.');
    return;
  }

  var rows = sheet.getDataRange().getDisplayValues();
  console.log("[glossary] rows read from sheet: " + rows.length);

  var payload = buildPayload(rows);
  var payloadJson = JSON.stringify(payload);
  console.log("[glossary] payload size (chars): " + payloadJson.length);
  console.log("[glossary] payload preview (_about row): " + JSON.stringify({ rows: rows.slice(3, 4) }));

  var options = buildFetchOptions(NETLIFY_FUNCTION_URL, secret, payload);
  console.log("[glossary] POSTing to: " + NETLIFY_FUNCTION_URL);

  var response = UrlFetchApp.fetch(NETLIFY_FUNCTION_URL, options);
  var code = response.getResponseCode();
  var responseText = response.getContentText();
  console.log("[glossary] response code: " + code);
  console.log("[glossary] response body: " + responseText);

  if (code !== 200) {
    notify("Glossary push failed (" + code + "): " + responseText);
    return;
  }

  var version = JSON.parse(responseText).version;
  notify("Glossary pushed successfully. Version: " + version);
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

function buildPayload(rows) {
  return { rows: rows };
}

function buildFetchOptions(url, secret, payload) {
  return {
    method: "post",
    contentType: "application/json",
    headers: { "x-glossary-secret": secret },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
}
