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

var NETLIFY_FUNCTION_URL = "https://easyeyes.app/.netlify/functions/glossary";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("EasyEyes")
    .addItem("Update EasyEyes to use current Glossary", "pushGlossary")
    .addItem("Run Glossary audit", "runGlossaryAudit")
    .addItem("View Glossary audit report", "showGlossaryAuditReport")
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
  var secret =
    PropertiesService.getScriptProperties().getProperty("GLOSSARY_SECRET");
  if (!secret) {
    notify(
      "GLOSSARY_SECRET is not set in Script Properties. " +
        "Add it under File > Project settings > Script properties.",
    );
    return;
  }

  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("InputParameters");
  if (!sheet) {
    notify('Sheet "InputParameters" not found.');
    return;
  }

  var rows = sheet.getDataRange().getDisplayValues();
  console.log("[glossary] rows read from sheet: " + rows.length);

  var payload = buildPayload(rows);
  var payloadJson = JSON.stringify(payload);
  console.log("[glossary] payload size (chars): " + payloadJson.length);
  console.log(
    "[glossary] payload preview (_about row): " +
      JSON.stringify({ rows: rows.slice(3, 4) }),
  );

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
  try {
    var audit = requestGlossaryAudit();
    notify(
      "Glossary pushed successfully. Version: " +
        version +
        "\n\n" +
        (audit.alreadyRunning
          ? "A glossary audit is already running."
          : "Glossary audit requested.") +
        " Run ID: " +
        audit.id +
        "\nUse View Glossary audit report to review the result.",
    );
  } catch (error) {
    notify(
      "Glossary pushed successfully. Version: " +
        version +
        "\n\nThe audit could not be started: " +
        error.message,
    );
  }
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

function glossaryAuditUrl(action) {
  return (
    NETLIFY_FUNCTION_URL.replace(/\/glossary\/?$/, "/glossary-audit") +
    "?action=" +
    action
  );
}

function callGlossaryAudit(action, payload) {
  var secret =
    PropertiesService.getScriptProperties().getProperty("GLOSSARY_SECRET");
  if (!secret)
    throw new Error("GLOSSARY_SECRET is not set in Script Properties.");
  var response = UrlFetchApp.fetch(glossaryAuditUrl(action), {
    method: "post",
    contentType: "application/json",
    headers: { "x-glossary-secret": secret },
    payload: JSON.stringify(payload || {}),
    muteHttpExceptions: true,
  });
  var code = response.getResponseCode();
  var result;
  try {
    result = JSON.parse(response.getContentText());
  } catch (error) {
    throw new Error(
      "The glossary audit service returned an invalid response (HTTP " +
        code +
        ").",
    );
  }
  if (code === 409 && result.code === "audit_in_progress") {
    return { id: result.id, status: result.status, alreadyRunning: true };
  }
  if (code !== 200 && code !== 202) {
    throw new Error(
      result.error || "Glossary audit request failed (HTTP " + code + ").",
    );
  }
  return result;
}

function requestGlossaryAudit() {
  var result = callGlossaryAudit("start");
  if (!result.id)
    throw new Error("The glossary audit service returned no run ID.");
  return result;
}

function runGlossaryAudit() {
  try {
    var audit = requestGlossaryAudit();
    notify(
      (audit.alreadyRunning
        ? "A glossary audit is already running."
        : "Glossary audit requested.") +
        " Run ID: " +
        audit.id +
        "\nUse View Glossary audit report to review the result.",
    );
  } catch (error) {
    notify("The audit could not be started: " + error.message);
  }
}

function listGlossaryAuditRuns() {
  return callGlossaryAudit("review", { operation: "list" });
}

function getGlossaryAuditRun(runId) {
  return callGlossaryAudit("review", { operation: "get", id: runId });
}

function showGlossaryAuditReport() {
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(buildGlossaryAuditReportHtml())
      .setWidth(1000)
      .setHeight(700),
    "Glossary audit report",
  );
}

function buildGlossaryAuditReportHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; color: #172b4d; background: #f5f7fb; font: 14px/1.5 Arial, sans-serif; }
    main { padding: 24px; }
    h1 { margin: 0 0 6px; font-size: 24px; }
    h2 { margin: 0; font-size: 18px; }
    p { margin: 6px 0 16px; }
    .toolbar { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; margin: 20px 0 12px; }
    .control { flex: 1; min-width: 200px; }
    label { display: block; font-weight: 600; margin-bottom: 5px; }
    input, select, button { font: inherit; border: 1px solid #a9b7cb; border-radius: 6px; padding: 8px 10px; }
    input, select { width: 100%; background: white; }
    button { cursor: pointer; background: white; color: #172b4d; }
    button:disabled { cursor: wait; opacity: .6; }
    :focus-visible { outline: 3px solid #2375c9; outline-offset: 2px; }
    #status { margin: 12px 0; min-height: 22px; }
    .error { color: #a12622; }
    .counts { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }
    .count { border: 1px solid #d6deeb; border-radius: 6px; background: white; padding: 8px 12px; }
    section { margin: 16px 0; padding: 16px; border: 1px solid #d6deeb; border-radius: 8px; background: white; }
    .key { border-top: 1px solid #e1e6ef; padding: 10px 0; }
    summary { cursor: pointer; font-weight: 600; overflow-wrap: anywhere; }
    .references { padding: 10px 0 0 20px; }
    .reference { margin: 8px 0; overflow-wrap: anywhere; }
    .source { color: #405571; }
    a { color: #1758a0; margin-right: 8px; }
    .empty { color: #405571; margin-top: 12px; }
  </style>
</head>
<body>
<main>
  <h1>Glossary audit report</h1>
  <p>Review obsolete keys still referenced, keys without detected references, and current source references. Links open the scanned GitHub revision.</p>
  <div class="toolbar">
    <div class="control"><label for="run-select">Audit run</label><select id="run-select" disabled></select></div>
    <div class="control"><label for="key-search">Find a key</label><input id="key-search" type="search" placeholder="Parameter name"></div>
    <button id="refresh" type="button">Refresh</button>
  </div>
  <div id="status" role="status" aria-live="polite">Loading saved runs…</div>
  <div id="counts" class="counts" aria-label="Key counts"></div>
  <div id="groups"></div>
</main>
<script>
(function () {
  var select = document.getElementById("run-select");
  var search = document.getElementById("key-search");
  var refresh = document.getElementById("refresh");
  var status = document.getElementById("status");
  var groups = document.getElementById("groups");
  var counts = document.getElementById("counts");
  var findings = null;
  var requestNumber = 0;
  var timer = null;
  function setStatus(text, error) { status.textContent = text; status.className = error ? "error" : ""; }
  function date(value) { return value ? new Date(value).toLocaleString() : ""; }
  function link(parent, text, url) {
    if (String(url || "").indexOf("https://github.com/EasyEyes/") !== 0) {
      var span = document.createElement("span"); span.textContent = text + " "; parent.appendChild(span); return;
    }
    var anchor = document.createElement("a"); anchor.textContent = text; anchor.href = url;
    anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; parent.appendChild(anchor);
  }
  function source(parent, reference) {
    var row = document.createElement("div"); row.className = "reference";
    var label = document.createElement("div"); label.className = "source";
    label.textContent = reference.repository + " / " + reference.path; row.appendChild(label);
    (reference.lines || []).forEach(function (entry) { link(row, "Line " + entry.line, entry.url); });
    if (reference.commitUrl) link(row, "Removal commit · " + date(reference.removedAt), reference.commitUrl);
    parent.appendChild(row);
  }
  function detail(entry, section) {
    var node = document.createElement("details"); node.className = "key";
    var summary = document.createElement("summary"); summary.textContent = entry.key; node.appendChild(summary);
    var body = document.createElement("div"); body.className = "references"; node.appendChild(body);
    var populated = false;
    node.addEventListener("toggle", function () {
      if (!node.open || populated) return;
      populated = true;
      if (section === "unused") {
        [ ["Source comments", entry.comments || []], ["Historical removals", entry.removals || []] ].forEach(function (group) {
          if (!group[1].length) return;
          var heading = document.createElement("strong"); heading.textContent = group[0]; body.appendChild(heading);
          group[1].forEach(function (reference) { source(body, reference); });
        });
        if (!(entry.comments || []).length && !(entry.removals || []).length) {
          body.textContent = "No source comment or verified removal evidence was found.";
        }
      } else (entry.references || []).forEach(function (reference) { source(body, reference); });
    });
    return node;
  }
  function render() {
    groups.replaceChildren(); counts.replaceChildren();
    if (!findings) return;
    [ ["total", "Total"], ["obsoleteUsed", "Obsolete, referenced"], ["unused", "Without detected references"], ["used", "Used"] ].forEach(function (pair) {
      var node = document.createElement("div"); node.className = "count";
      node.textContent = pair[1] + ": " + findings.counts[pair[0]]; counts.appendChild(node);
    });
    var query = search.value.toLowerCase().trim();
    [ ["obsoleteUsed", "Obsolete keys still referenced"], ["unused", "Keys without detected references"], ["used", "Used keys"] ].forEach(function (pair) {
      var section = document.createElement("section");
      var entries = (findings[pair[0]] || []).filter(function (entry) { return entry.key.toLowerCase().indexOf(query) !== -1; });
      var heading = document.createElement("h2"); heading.textContent = pair[1] + " (" + entries.length + ")"; section.appendChild(heading);
      entries.forEach(function (entry) { section.appendChild(detail(entry, pair[0])); });
      if (!entries.length) { var empty = document.createElement("div"); empty.className = "empty"; empty.textContent = query ? "No matching keys." : "No keys in this group."; section.appendChild(empty); }
      groups.appendChild(section);
    });
  }
  function fail(error) { refresh.disabled = false; setStatus(error.message || String(error), true); }
  function loadSelected() {
    clearTimeout(timer);
    var number = ++requestNumber;
    var id = select.value;
    if (!id) return;
    findings = null; render(); refresh.disabled = true; setStatus("Loading selected report…");
    google.script.run.withSuccessHandler(function (result) {
      if (number !== requestNumber) return;
      refresh.disabled = false;
      findings = result.findings; render();
      if (findings) setStatus("Glossary " + findings.version + " · Report generated " + date(result.run.generatedAt));
      else if (result.run.status === "failed") setStatus(result.run.error || "This audit failed.", true);
      else { setStatus("This audit is " + result.run.status + ". The report will appear when it finishes."); timer = setTimeout(loadSelected, 15000); }
    }).withFailureHandler(function (error) { if (number === requestNumber) fail(error); }).getGlossaryAuditRun(id);
  }
  function loadRuns() {
    clearTimeout(timer); ++requestNumber;
    var selected = select.value;
    refresh.disabled = true;
    google.script.run.withSuccessHandler(function (result) {
      select.replaceChildren();
      var runs = result.runs || [];
      runs.forEach(function (run) { var option = document.createElement("option"); option.value = run.id; option.textContent = date(run.requestedAt) + " · " + run.status; select.appendChild(option); });
      select.disabled = !runs.length; refresh.disabled = false;
      if (!runs.length) { findings = null; render(); setStatus("No saved audits yet. Use the glossary update menu to publish and request an audit."); return; }
      if (runs.some(function (run) { return run.id === selected; })) select.value = selected;
      loadSelected();
    }).withFailureHandler(fail).listGlossaryAuditRuns();
  }
  select.addEventListener("change", loadSelected);
  search.addEventListener("input", render);
  refresh.addEventListener("click", loadRuns);
  loadRuns();
})();
</script>
</body>
</html>`;
}
