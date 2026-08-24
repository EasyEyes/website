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

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("EasyEyes")
    .addItem("Update EasyEyes to use current Glossary", "pushGlossary")
    .addToUi();
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
