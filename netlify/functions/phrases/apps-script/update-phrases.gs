/**
 * Two-phase push of the Phrases sheet to the Netlify phrases function.
 *
 * SECRET ROTATION:
 *   1. Generate a new secret (e.g. openssl rand -hex 32).
 *   2. Update PHRASES_SECRET in Script Properties (File > Project settings >
 *      Script properties) on this script.
 *   3. Update PHRASES_SECRET in Netlify environment variables for the
 *      EasyEyes website deployment.
 *   4. Verify a test push succeeds before discarding the old secret.
 *
 * ACCESS CONTROL:
 *   Share this Apps Script project with Editor-or-higher only
 *   (Share button in the Apps Script IDE). Viewers must not be able to run it.
 */

var PHRASES_FUNCTION_URL = "https://easyeyes.app/.netlify/functions/phrases";
var TRANSLATABLE_BACKGROUND = "#ffffff";
var FIRST_TRANSLATION_ROW_INDEX = 9;
var PHRASES_CHECKPOINT_KEY = "phrasesRetranslationCheckpoint";
var PHRASES_IMPORT_CHECKPOINT_KEY = "phrasesTranslationImportCheckpoint";

function escapeNotificationHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildNotificationMessageHtml(message, linkUrl) {
  var text = String(message);
  var trustedUrl = String(linkUrl || "");
  if (
    !/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(
      trustedUrl,
    ) ||
    text.indexOf(trustedUrl) === -1
  ) {
    return escapeNotificationHtml(text);
  }
  var urlIndex = text.indexOf(trustedUrl);
  return (
    escapeNotificationHtml(text.slice(0, urlIndex)) +
    '<a href="' +
    escapeNotificationHtml(trustedUrl) +
    '" target="_blank" rel="noopener noreferrer">' +
    escapeNotificationHtml(trustedUrl) +
    "</a>" +
    escapeNotificationHtml(text.slice(urlIndex + trustedUrl.length))
  );
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("EasyEyes")
    .addItem(
      "Retranslate all white cells derived from changed English cells. Then update EasyEyes.",
      "updatePhrases",
    )
    .addItem(
      "Retranslate the selected white cells. Then update EasyEyes.",
      "retranslateSelectedCells",
    )
    .addItem("Check all cells. No update.", "checkPhraseKeys")
    .addItem("Color stale translation text red", "colorStaleTranslationTextRed")
    .addItem("Tabulate needed translations", "tabulateNeededTranslations")
    .addItem("Read new translations", "readNewTranslations")
    .addItem(
      "Compare latest EasyEyes copy with this spreadsheet",
      "compareLatestEasyEyesCopy",
    )
    .addToUi();
}

function notify(message, type, options) {
  type = type || "warning";
  options = options || {};
  var isSuccess = type === "success";
  var isError = type === "error";

  // Modern color palette
  var colors = isSuccess
    ? {
        bg: "#f0fdf4",
        accent: "#16a34a",
        text: "#166534",
        border: "#dcfce7",
        hoverDark: "#15803d",
      }
    : isError
    ? {
        bg: "#fef2f2",
        accent: "#dc2626",
        text: "#991b1b",
        border: "#fecaca",
        hoverDark: "#b91c1c",
      }
    : {
        bg: "#fffbeb",
        accent: "#d97706",
        text: "#92400e",
        border: "#fef3c7",
        hoverDark: "#b45309",
      };

  var title = isSuccess ? "Success" : isError ? "Fatal error" : "Warning";
  var safeMsg = buildNotificationMessageHtml(message, options.linkUrl);
  var billingAction = options.showDeepLBillingAction
    ? `
        <div class="billing-guidance">
          DeepL rejected the API key. An inactive subscription or billing issue
          is a possible cause. Sign in as <strong>denis.pelli@gmail.com</strong>.
        </div>
        <a
          class="button billing-button"
          href="https://www.deepl.com/en/your-account/billing"
          target="_blank"
          rel="noopener noreferrer"
        >Check DeepL billing</a>
  `
    : "";

  var html =
    `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
      }
      .container {
        width: 100%;
        padding: 16px;
      }
      .card {
        background: ` +
    colors.bg +
    `;
        border: 1.5px solid ` +
    colors.border +
    `;
        border-radius: 12px;
        padding: 8px 24px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
        text-align: center;
        animation: slideUp 0.3s ease-out;
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .icon-wrapper {
        width: 56px;
        height: 56px;
        margin: 0 auto 16px;
        color: ` +
    colors.accent +
    `;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: bold;
      }
      .title {
        font-size: 18px;
        font-weight: 600;
        color: ` +
    colors.accent +
    `;
        margin-bottom: 10px;
        letter-spacing: -0.3px;
      }
      .message {
        font-size: 14px;
        color: ` +
    colors.text +
    `;
        line-height: 1.6;
        margin-bottom: 20px;
        word-break: break-word;
        white-space: pre-wrap;
      }
      .message a {
        color: inherit;
        text-decoration: underline;
      }
      .button {
        background: ` +
    colors.accent +
    `;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 28px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        letter-spacing: 0.3px;
      }
      .button:hover {
        background: ` +
    colors.hoverDark +
    `;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
      .button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .billing-guidance {
        color: ` +
    colors.text +
    `;
        font-size: 14px;
        line-height: 1.5;
        margin: 0 0 16px;
      }
      .billing-button {
        display: inline-block;
        margin: 0 8px 12px;
        text-decoration: none;
      }
    </style>
    <div class="container">
      <div class="card">
        <div class="icon-wrapper">` +
    (isSuccess ? "✅" : isError ? "⛔" : "⚠️") +
    `</div>
        <div class="message">` +
    safeMsg +
    `</div>
        ` +
    billingAction +
    `
        <button class="button" onclick="google.script.host.close()">OK</button>
      </div>
    </div>
  `;

  try {
    SpreadsheetApp.getUi().showModelessDialog(
      HtmlService.createHtmlOutput(html),
      title,
    );
  } catch (e) {
    Logger.log("[phrases] " + message);
  }
}

function fetchPhraseAuditJson(url, description) {
  var response = UrlFetchApp.fetch(url, {
    method: "get",
    muteHttpExceptions: true,
  });
  var responseCode = response.getResponseCode();
  if (responseCode !== 200) {
    throw new Error(
      "Failed to fetch " + description + " (" + responseCode + ").",
    );
  }
  return JSON.parse(response.getContentText());
}

function compareLatestEasyEyesCopy() {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("Translations");
    if (!sheet) {
      notify('Sheet "Translations" not found.');
      return;
    }

    var rows = sheet.getDataRange().getDisplayValues();
    if (rows.length < 2 || rows[0].indexOf("EE_LanguageCode") === -1) {
      notify('No phrase data or required column "EE_LanguageCode" was found.');
      return;
    }

    // Resolve the latest version first, then request that immutable version so
    // the data and publication date always describe the same Firebase copy.
    var metadata = fetchPhraseAuditJson(
      PHRASES_FUNCTION_URL + "?versionOnly=1&audit=" + Date.now(),
      "the latest Firebase phrases version",
    );
    if (!metadata.version)
      throw new Error("Firebase has no current phrases version.");

    var firebaseCopy = fetchPhraseAuditJson(
      PHRASES_FUNCTION_URL + "?v=" + encodeURIComponent(metadata.version),
      "Firebase phrases version " + metadata.version,
    );
    if (!firebaseCopy.phrases) {
      throw new Error("The Firebase phrases response did not contain phrases.");
    }

    var differences = comparePhraseCells(rows, firebaseCopy.phrases);
    var sheetModifiedAt = DriveApp.getFileById(spreadsheet.getId())
      .getLastUpdated()
      .toISOString();
    var html = buildPhraseAuditHtml({
      firebasePublishedAt: metadata.publishedAt || null,
      sheetModifiedAt: sheetModifiedAt,
      sheetUrl: spreadsheet.getUrl(),
      sheetId: sheet.getSheetId(),
      differences: differences,
    });

    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createHtmlOutput(html).setWidth(1000).setHeight(700),
      "International Phrases audit",
    );
  } catch (error) {
    notify(
      "Could not compare International Phrases with Firebase.\n\n" +
        (error && error.message ? error.message : String(error)),
      "error",
    );
  }
}

function buildPhraseAuditHtml(audit) {
  var safeAuditJson = JSON.stringify(audit)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  var differenceCount = audit.differences.length;

  return (
    `
    <!doctype html>
    <html>
      <head>
        <base target="_blank">
        <style>
          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body {
            margin: 0;
            color: #202124;
            background: #fff;
            font: 14px/1.45 Arial, sans-serif;
          }
          button, a { font: inherit; }
          .audit {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            gap: 16px;
            height: 100%;
            padding: 20px;
          }
          .dates {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .date {
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 12px;
          }
          .date strong { display: block; margin-bottom: 4px; }
          .date time { color: #3c4043; }
          .view {
            min-height: 0;
            border-top: 1px solid #dadce0;
            padding-top: 16px;
          }
          .summary, .detail { height: 100%; }
          .summary { display: grid; grid-template-rows: auto minmax(0, 1fr); }
          h1 { margin: 0 0 12px; font-size: 18px; }
          .cell-list {
            align-content: start;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            overflow: auto;
            padding: 2px 4px 16px 2px;
          }
          .cell-button, .back-button {
            border: 1px solid #1a73e8;
            border-radius: 4px;
            color: #1967d2;
            background: #fff;
            cursor: pointer;
            padding: 6px 10px;
          }
          .cell-button:hover, .back-button:hover { background: #e8f0fe; }
          .cell-button:focus-visible, .back-button:focus-visible,
          .sheet-value:focus-visible { outline: 3px solid #8ab4f8; outline-offset: 2px; }
          .empty { color: #5f6368; font-size: 16px; }
          .detail { display: none; grid-template-rows: auto minmax(0, 1fr); gap: 12px; }
          .detail-header { display: flex; align-items: center; gap: 12px; }
          .detail-header h1 { margin: 0; }
          .values {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            min-height: 0;
          }
          .value-panel {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            min-width: 0;
            min-height: 0;
            border: 1px solid #dadce0;
            border-radius: 8px;
            overflow: hidden;
          }
          .value-panel h2 {
            margin: 0;
            padding: 12px;
            border-bottom: 1px solid #dadce0;
            font-size: 15px;
          }
          .value {
            margin: 0;
            overflow: auto;
            padding: 12px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            font: 14px/1.5 Arial, sans-serif;
          }
          .sheet-value { color: inherit; text-decoration-color: #1a73e8; }
          @media (max-width: 700px) {
            .dates, .values { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <main class="audit">
          <section class="dates" aria-label="Source dates">
            <div class="date">
              <strong>Firebase copy</strong>
              <time id="firebase-date"></time>
            </div>
            <div class="date">
              <strong>International Phrases spreadsheet</strong>
              <time id="sheet-date"></time>
            </div>
          </section>
          <section class="view">
            <div class="summary" id="summary">
              <h1>Differing cells: ` +
    differenceCount +
    `</h1>
              <div class="cell-list" id="cell-list"></div>
            </div>
            <div class="detail" id="detail">
              <div class="detail-header">
                <button class="back-button" id="back" type="button">Back to list</button>
                <h1 id="detail-title"></h1>
              </div>
              <div class="values">
                <section class="value-panel">
                  <h2>Firebase copy</h2>
                  <pre class="value" id="firebase-value"></pre>
                </section>
                <section class="value-panel">
                  <h2>International Phrases spreadsheet — click to edit</h2>
                  <a class="value sheet-value" id="sheet-value" target="_blank" rel="noopener noreferrer"></a>
                </section>
              </div>
            </div>
          </section>
        </main>
        <script>
          var audit = ` +
    safeAuditJson +
    `;

          function formatLocalDate(iso) {
            if (!iso) return "Unavailable";
            var date = new Date(iso);
            if (isNaN(date.getTime())) return "Unavailable";
            var offsetMinutes = -date.getTimezoneOffset();
            var sign = offsetMinutes >= 0 ? "+" : "-";
            var absolute = Math.abs(offsetMinutes);
            var offset = sign + String(Math.floor(absolute / 60)).padStart(2, "0") +
              ":" + String(absolute % 60).padStart(2, "0");
            return date.toLocaleString() + " (UTC" + offset + ")";
          }

          document.getElementById("firebase-date").textContent =
            formatLocalDate(audit.firebasePublishedAt);
          document.getElementById("sheet-date").textContent =
            formatLocalDate(audit.sheetModifiedAt);

          var list = document.getElementById("cell-list");
          if (audit.differences.length === 0) {
            var empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "The Firebase copy and spreadsheet have no differing cells.";
            list.appendChild(empty);
          } else {
            var fragment = document.createDocumentFragment();
            audit.differences.forEach(function (difference, index) {
              var button = document.createElement("button");
              button.className = "cell-button";
              button.type = "button";
              button.textContent = difference.coordinate;
              button.setAttribute("aria-label", "Inspect differing cell " + difference.coordinate);
              button.addEventListener("click", function () { showDetail(index); });
              fragment.appendChild(button);
            });
            list.appendChild(fragment);
          }

          function showDetail(index) {
            var difference = audit.differences[index];
            document.getElementById("detail-title").textContent =
              "Differing cell: " + difference.coordinate;
            document.getElementById("firebase-value").textContent = difference.firebaseValue;
            var sheetValue = document.getElementById("sheet-value");
            sheetValue.textContent = difference.sheetValue;
            sheetValue.href = audit.sheetUrl.split("#")[0] + "#gid=" + audit.sheetId +
              "&range=" + encodeURIComponent(difference.coordinate);
            document.getElementById("summary").style.display = "none";
            document.getElementById("detail").style.display = "grid";
            document.getElementById("back").focus();
          }

          document.getElementById("back").addEventListener("click", function () {
            document.getElementById("detail").style.display = "none";
            document.getElementById("summary").style.display = "grid";
          });
        </script>
      </body>
    </html>`
  );
}

function showSpinner(label, title) {
  label = label || "Translating…";
  title = title || "Translating …";
  CacheService.getUserCache().remove("spinnerProgress");
  var html = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        background: transparent;
      }
      .container { position: relative; width: 100%; height: 100%; text-align: center; }
      .spinner-position {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .spinner {
        width: 44px;
        height: 44px;
        border: 4px solid #e5e7eb;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 0.75s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .status {
        position: absolute;
        top: calc(50% + 31px);
        left: 16px;
        right: 16px;
      }
      .label { font-size: 14px; color: #374151; letter-spacing: 0.1px; }
      .progress { font-size: 12px; color: #6b7280; margin-top: 6px; min-height: 18px; }
    </style>
    <div class="container">
      <div class="spinner-position"><div class="spinner"></div></div>
      <div class="status">
        <div class="label">${label}</div>
        <div class="progress" id="progress"></div>
      </div>
    </div>
    <script>
      function poll() {
        google.script.run
          .withSuccessHandler(function(text) {
            document.getElementById('progress').textContent = text || '';
            setTimeout(poll, 500);
          })
          .withFailureHandler(function() { setTimeout(poll, 500); })
          .getSpinnerProgress();
      }
      poll();
    </script>
  `;
  try {
    SpreadsheetApp.getUi().showModelessDialog(
      HtmlService.createHtmlOutput(html).setHeight(155).setWidth(280),
      title,
    );
  } catch (e) {
    Logger.log("[phrases] showSpinner");
  }
}

function getSpinnerProgress() {
  return CacheService.getUserCache().get("spinnerProgress") || "";
}

function shouldShowPhrasesSuccess(options) {
  return !(options && options.suppressSuccessNotification);
}

function updatePhrases(options) {
  pushPhrases(false, options);
}

// Install this function as an authorized spreadsheet "On edit" trigger.
function handleInternationalPhrasesEdit(e) {
  if (!e || !e.range || e.range.getSheet().getName() !== "Translations") {
    return;
  }

  showSpinner("Updating phrases…", "Updating phrases …");
  updatePhrases({ suppressSuccessNotification: true });
  var latestVersion = fetchLatestPublishedPhrasesVersion();
  colorStaleTranslationTextRed(
    "Translation freshness colors updated. Latest phrases version: " +
      latestVersion +
      ".",
  );
}

function fullResyncPhrases() {
  pushPhrases(true);
}

function pushPhrases(isFullResync, options) {
  var secret =
    PropertiesService.getScriptProperties().getProperty("PHRASES_SECRET");
  if (!secret) {
    notify(
      "PHRASES_SECRET is not set in Script Properties. " +
        "Add it under File > Project settings > Script properties.",
    );
    return;
  }

  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Translations");
  if (!sheet) {
    notify('Sheet "Translations" not found.');
    return;
  }

  var dataRange = sheet.getDataRange();
  var rows = dataRange.getDisplayValues();
  var backgrounds = dataRange.getBackgrounds();
  var activeLanguages = extractActiveLanguages(rows);

  // Pre-flight: refuse to update if any phrase key is duplicated.
  var duplicateKeys = findDuplicateKeys(rows);
  if (duplicateKeys.length > 0) {
    notify(
      "EasyEyes was NOT updated.\n\n" +
        "The International Phrases has duplicate phrase keys. Each key must be " +
        "unique. Please remove or rename the following duplicate key(s) and " +
        "try again:\n\n" +
        duplicateKeys.join("\n"),
    );
    return;
  }

  // Phase 1: diff (English changes only)
  var english = extractEnglishMap(rows);
  var diffPayload = buildDiffPayload(english);
  var diffOptions = buildFetchOptions(secret, diffPayload);

  console.log("[phrases] Phase 1: POSTing diff to: " + PHRASES_FUNCTION_URL);
  var diffResponse = fetchPhrasesWithRetry(PHRASES_FUNCTION_URL, diffOptions);
  var diffCode = diffResponse.getResponseCode();
  var diffText = diffResponse.getContentText();
  console.log("[phrases] Phase 1 response code: " + diffCode);

  if (diffCode !== 200) {
    notify("Phrases diff failed (" + diffCode + "): " + diffText);
    return;
  }

  var diffResult = JSON.parse(diffText);
  var changedKeys = diffResult.changed;
  var removedKeys = diffResult.removed || [];
  var currentVersion = diffResult.currentVersion;

  // Non-white step: send all non-white cell values once; the API stores any that
  // differ from what is already in Firebase.
  var nonWhitePhrases = extractNonTranslatableValues(rows, backgrounds);
  var nonWhiteChanged = false;

  if (
    Object.keys(nonWhitePhrases).length > 0 ||
    removedKeys.length > 0 ||
    activeLanguages.length > 0
  ) {
    var nonWhitePayload = {
      action: "translate",
      changedPhrases: {},
      removedKeys: removedKeys,
      colorMask: {},
      sentValues: {},
      // Keep the legacy field name for compatibility with the phrases API.
      nonCyanPhrases: nonWhitePhrases,
      activeLanguages: activeLanguages,
      currentVersion: currentVersion,
    };
    console.log(
      "[phrases] Non-white step: POSTing to: " + PHRASES_FUNCTION_URL,
    );
    var nonWhiteResponse = fetchPhrasesWithRetry(
      PHRASES_FUNCTION_URL,
      buildFetchOptions(secret, nonWhitePayload),
    );
    var nonWhiteCode = nonWhiteResponse.getResponseCode();
    var nonWhiteText = nonWhiteResponse.getContentText();
    console.log("[phrases] Non-white step response code: " + nonWhiteCode);

    if (nonWhiteCode === 409) {
      var retryVersionResponse = fetchPhrasesWithRetry(
        PHRASES_FUNCTION_URL + "?versionOnly",
        {
          method: "get",
          muteHttpExceptions: true,
        },
      );
      if (retryVersionResponse.getResponseCode() !== 200) {
        notify(
          "Non-white update had a version conflict and the version re-fetch failed. Please try again.",
        );
        return;
      }
      currentVersion = JSON.parse(
        retryVersionResponse.getContentText(),
      ).version;
      nonWhitePayload.currentVersion = currentVersion;
      nonWhiteResponse = fetchPhrasesWithRetry(
        PHRASES_FUNCTION_URL,
        buildFetchOptions(secret, nonWhitePayload),
      );
      nonWhiteCode = nonWhiteResponse.getResponseCode();
      nonWhiteText = nonWhiteResponse.getContentText();
      console.log(
        "[phrases] Non-white step retry response code: " + nonWhiteCode,
      );
    }

    if (nonWhiteCode !== 200) {
      notify(
        "Non-white values update failed (" +
          nonWhiteCode +
          "): " +
          nonWhiteText,
      );
      return;
    }

    var nonWhiteResult;
    try {
      nonWhiteResult = parseVerifiedPhrasesResult(nonWhiteText);
    } catch (e) {
      notify(
        "Fatal error: the phrases API did not verify the non-white update.\n\n" +
          e.message,
        "error",
      );
      return;
    }
    if (nonWhiteResult.newVersion !== currentVersion) {
      nonWhiteChanged = true;
      currentVersion = nonWhiteResult.newVersion;
    }
  }

  if (!changedKeys || changedKeys.length === 0) {
    if (shouldShowPhrasesSuccess(options)) {
      if (nonWhiteChanged) {
        notify("Phrases updated. New version: " + currentVersion, "success");
      } else {
        notify("Phrases are up to date. No changes detected.", "success");
      }
    }
    return;
  }

  // Phase 2: translate / fullResync (batched)
  var translatePayload = buildTranslatePayload(
    rows,
    backgrounds,
    changedKeys,
    currentVersion,
    isFullResync,
  );

  var action = translatePayload.action;
  var changedPhrases = translatePayload.changedPhrases;
  var colorMask = translatePayload.colorMask;
  var sentValues = translatePayload.sentValues;
  var activeLanguages = translatePayload.activeLanguages;

  var BATCH_SIZE = 50;
  var allKeys = Object.keys(changedPhrases);
  var totalBatches = Math.ceil(allKeys.length / BATCH_SIZE);
  var checkpointFingerprint = buildPhrasesCheckpointFingerprint({
    operation: action,
    keys: allKeys,
    changedPhrases: changedPhrases,
    colorMask: colorMask,
  });
  var checkpoint = loadPhrasesCheckpoint(checkpointFingerprint);
  var totalCellCount = checkpoint ? checkpoint.completedCells : 0;
  var totalTargetCellCount = countTranslatableCells(colorMask);
  var newVersion = checkpoint ? checkpoint.currentVersion : currentVersion;
  var operationId = checkpoint ? checkpoint.operationId : Utilities.getUuid();
  var startBatch = checkpoint ? checkpoint.nextBatchIndex : 0;
  if (!checkpoint) {
    savePhrasesCheckpoint({
      fingerprint: checkpointFingerprint,
      operationId: operationId,
      nextBatchIndex: 0,
      completedCells: 0,
      currentVersion: newVersion,
    });
  }

  showSpinner();
  for (var b = startBatch; b < totalBatches; b++) {
    if (totalBatches > 1) {
      CacheService.getUserCache().put(
        "spinnerProgress",
        b * BATCH_SIZE + " of " + allKeys.length + " phrases done",
        60,
      );
    }
    var batchKeys = allKeys.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);

    var batchChangedPhrases = {};
    var batchColorMask = {};
    var batchSentValues = {};
    for (var ki = 0; ki < batchKeys.length; ki++) {
      var bk = batchKeys[ki];
      batchChangedPhrases[bk] = changedPhrases[bk];
      batchColorMask[bk] = colorMask[bk];
      batchSentValues[bk] = sentValues[bk];
    }

    var batchPayload = {
      action: action,
      changedPhrases: batchChangedPhrases,
      colorMask: batchColorMask,
      sentValues: batchSentValues,
      activeLanguages: activeLanguages,
      currentVersion: newVersion,
      operationId: operationId,
      batchNumber: b + 1,
      totalBatches: totalBatches,
      cellCount: countTranslatableCells(batchColorMask),
    };

    console.log(
      "[phrases] Phase 2 batch " +
        (b + 1) +
        "/" +
        totalBatches +
        ": POSTing to: " +
        PHRASES_FUNCTION_URL,
    );
    var translateResponse = fetchPhrasesWithRetry(
      PHRASES_FUNCTION_URL,
      buildFetchOptions(secret, batchPayload),
    );
    var translateCode = translateResponse.getResponseCode();
    var translateText = translateResponse.getContentText();
    console.log(
      "[phrases] Phase 2 batch " + (b + 1) + " response code: " + translateCode,
    );

    if (translateCode === 409) {
      var retryVersion = fetchPhrasesWithRetry(
        PHRASES_FUNCTION_URL + "?versionOnly",
        {
          method: "get",
          muteHttpExceptions: true,
        },
      );
      if (retryVersion.getResponseCode() !== 200) {
        notify(
          "Batch " +
            (b + 1) +
            " of " +
            totalBatches +
            " had a version conflict and the version re-fetch failed.\n\n" +
            "Completed " +
            totalCellCount +
            " cell(s). Please try again.",
        );
        return;
      }
      newVersion = JSON.parse(retryVersion.getContentText()).version;
      batchPayload.currentVersion = newVersion;
      translateResponse = fetchPhrasesWithRetry(
        PHRASES_FUNCTION_URL,
        buildFetchOptions(secret, batchPayload),
      );
      translateCode = translateResponse.getResponseCode();
      translateText = translateResponse.getContentText();
      console.log(
        "[phrases] Phase 2 batch " +
          (b + 1) +
          " retry response code: " +
          translateCode,
      );
    }

    if (translateCode === 400) {
      var errMsg = "";
      try {
        errMsg = JSON.parse(translateText).error || translateText;
      } catch (e) {
        errMsg = translateText;
      }
      var latestVersion = fetchLatestPublishedPhrasesVersion(newVersion);
      notify(
        formatPhrasesBatchFailure({
          batchNumber: b + 1,
          totalBatches: totalBatches,
          statusCode: translateCode,
          failureMessage: "Phrases push rejected: " + errMsg,
          completedCells: totalCellCount,
          totalCells: totalTargetCellCount,
          latestVersion: latestVersion,
        }),
        "error",
      );
      return;
    }

    if (translateCode !== 200) {
      var translateFailure = classifyPhrasesApiFailure(translateText);
      var latestVersion = fetchLatestPublishedPhrasesVersion(newVersion);
      notify(
        formatPhrasesBatchFailure({
          batchNumber: b + 1,
          totalBatches: totalBatches,
          statusCode: translateCode,
          failureMessage: translateFailure.message,
          completedCells: totalCellCount,
          totalCells: totalTargetCellCount,
          latestVersion: latestVersion,
        }),
        translateFailure.isFatal ? "error" : "warning",
        { showDeepLBillingAction: translateFailure.showDeepLBillingAction },
      );
      return;
    }

    var translateResult;
    try {
      translateResult = parseVerifiedPhrasesResult(translateText);
    } catch (e) {
      notify(
        "Fatal error: the phrases API did not verify batch " +
          (b + 1) +
          ".\n\n" +
          e.message,
        "error",
      );
      return;
    }
    newVersion = translateResult.newVersion;

    // Write-back: update target-language cells only
    var writes = planWriteBack(translateResult.translatedRows || {}, rows);
    try {
      writeAndVerifySheetValues(sheet, writes);
    } catch (e) {
      notify(
        "Fatal error: EasyEyes saved the phrase version, but the spreadsheet write-back could not be verified.\n\n" +
          e.message +
          "\n\nVerified partial writes were left in place. Retry the operation safely.",
        "error",
      );
      return;
    }
    totalCellCount += writes.length;
    savePhrasesCheckpoint({
      fingerprint: checkpointFingerprint,
      operationId: operationId,
      nextBatchIndex: b + 1,
      completedCells: totalCellCount,
      currentVersion: newVersion,
    });
  }

  clearPhrasesCheckpoint();
  // Warning: keys with no translatable target cells
  var missingKeys = findMissingTranslatableKeys(colorMask, changedKeys);
  if (missingKeys.length > 0) {
    notify(
      "Warning: the following phrase keys have no translatable (white) " +
        "target-language cells and were not translated:\n" +
        missingKeys.join(", "),
    );
  } else if (shouldShowPhrasesSuccess(options)) {
    var label = isFullResync ? "Full Resync" : "update";
    notify(
      "Phrases " + label + " complete. New version: " + newVersion,
      "success",
    );
  }
}

function retranslateSelectedCells() {
  var secret =
    PropertiesService.getScriptProperties().getProperty("PHRASES_SECRET");
  if (!secret) {
    notify(
      "PHRASES_SECRET is not set in Script Properties. " +
        "Add it under File > Project settings > Script properties.",
    );
    return;
  }

  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Translations");
  if (!sheet) {
    notify('Sheet "Translations" not found.');
    return;
  }

  var dataRange = sheet.getDataRange();
  var rows = dataRange.getDisplayValues();
  var backgrounds = dataRange.getBackgrounds();
  var activeLanguages = extractActiveLanguages(rows);

  if (rows.length < 2) {
    notify("No data found in the International Phrases.");
    return;
  }

  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  var enIdx = header.indexOf("en");
  if (keyIdx === -1 || enIdx === -1) {
    notify(
      'Required columns "EE_LanguageCode" and "en" not found in header row.',
    );
    return;
  }

  var rangeList = sheet.getActiveRangeList();
  if (!rangeList) {
    notify("No cells selected.");
    return;
  }
  var ranges = rangeList.getRanges();

  var nonWhiteCells = [];
  var whiteCells = [];

  for (var r = 0; r < ranges.length; r++) {
    var range = ranges[r];
    var startRow = range.getRow();
    var startCol = range.getColumn();
    var numRows = range.getNumRows();
    var numCols = range.getNumColumns();

    for (var dr = 0; dr < numRows; dr++) {
      var rowIdx = startRow + dr - 1;
      if (rowIdx === 0) continue; // header
      if (rowIdx >= rows.length) continue;
      var key = (rows[rowIdx][keyIdx] || "").trim();

      for (var dc = 0; dc < numCols; dc++) {
        var colIdx = startCol + dc - 1;
        if (colIdx === keyIdx || colIdx === enIdx) continue; // non-target columns
        if (colIdx >= header.length) continue;
        var lang = header[colIdx];
        if (!lang) continue;
        if (!isAutomaticallyTranslatedLanguage(lang)) continue;
        if (!key) continue;

        var bg = backgrounds[rowIdx][colIdx];
        if (isTranslatableBackground(bg)) {
          whiteCells.push({
            rowIdx: rowIdx,
            colIdx: colIdx,
            key: key,
            lang: lang,
            engText: rows[rowIdx][enIdx] || "",
            currentValue: rows[rowIdx][colIdx] || "",
          });
        } else {
          nonWhiteCells.push({ sheetRow: startRow + dr, lang: lang });
        }
      }
    }
  }

  var nonWhiteWarning =
    nonWhiteCells.length > 0
      ? "Skipped " +
        nonWhiteCells.length +
        " non-white cells. Change their background to white to include them."
      : "";

  if (whiteCells.length === 0) {
    notify(
      "No translatable cells found in selection." +
        (nonWhiteWarning ? "\n\n" + nonWhiteWarning : ""),
    );
    return;
  }

  var versionResponse = fetchPhrasesWithRetry(
    PHRASES_FUNCTION_URL + "?versionOnly",
    {
      method: "get",
      muteHttpExceptions: true,
    },
  );
  if (versionResponse.getResponseCode() !== 200) {
    notify("Failed to fetch current phrase version. Please try again.");
    return;
  }
  var currentVersion = JSON.parse(versionResponse.getContentText()).version;

  var changedPhrases = {};
  var colorMask = {};
  var sentValues = {};

  for (var i = 0; i < whiteCells.length; i++) {
    var cell = whiteCells[i];
    if (!changedPhrases[cell.key]) {
      changedPhrases[cell.key] = cell.engText;
      colorMask[cell.key] = {};
      sentValues[cell.key] = {};
    }
    colorMask[cell.key][cell.lang] = TRANSLATABLE_BACKGROUND;
    sentValues[cell.key][cell.lang] = cell.currentValue;
  }

  var BATCH_SIZE = 50;
  var allKeys = Object.keys(changedPhrases);
  var totalBatches = Math.ceil(allKeys.length / BATCH_SIZE);
  var checkpointFingerprint = buildPhrasesCheckpointFingerprint({
    operation: "retranslate",
    keys: allKeys,
    changedPhrases: changedPhrases,
    colorMask: colorMask,
  });
  var checkpoint = loadPhrasesCheckpoint(checkpointFingerprint);
  var totalCellCount = checkpoint ? checkpoint.completedCells : 0;
  var operationId = checkpoint ? checkpoint.operationId : Utilities.getUuid();
  var startBatch = checkpoint ? checkpoint.nextBatchIndex : 0;
  if (checkpoint) currentVersion = checkpoint.currentVersion;
  if (!checkpoint) {
    savePhrasesCheckpoint({
      fingerprint: checkpointFingerprint,
      operationId: operationId,
      nextBatchIndex: 0,
      completedCells: 0,
      currentVersion: currentVersion,
    });
  }

  showSpinner();
  for (var b = startBatch; b < totalBatches; b++) {
    if (totalBatches > 1) {
      CacheService.getUserCache().put(
        "spinnerProgress",
        b * BATCH_SIZE + " of " + allKeys.length + " phrases done",
        60,
      );
    }
    var batchKeys = allKeys.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);

    var batchChangedPhrases = {};
    var batchColorMask = {};
    var batchSentValues = {};
    for (var ki = 0; ki < batchKeys.length; ki++) {
      var bk = batchKeys[ki];
      batchChangedPhrases[bk] = changedPhrases[bk];
      batchColorMask[bk] = colorMask[bk];
      batchSentValues[bk] = sentValues[bk];
    }

    var payload = {
      action: "translate",
      changedPhrases: batchChangedPhrases,
      colorMask: batchColorMask,
      sentValues: batchSentValues,
      activeLanguages: activeLanguages,
      currentVersion: currentVersion,
      operationId: operationId,
      batchNumber: b + 1,
      totalBatches: totalBatches,
      cellCount: countTranslatableCells(batchColorMask),
    };

    console.log(
      "[phrases] Re-translate batch " +
        (b + 1) +
        "/" +
        totalBatches +
        ": POSTing to: " +
        PHRASES_FUNCTION_URL,
    );
    var response = fetchPhrasesWithRetry(
      PHRASES_FUNCTION_URL,
      buildFetchOptions(secret, payload),
    );
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    console.log(
      "[phrases] Re-translate batch " +
        (b + 1) +
        " response code: " +
        responseCode,
    );

    if (responseCode === 409) {
      var retryVersion = fetchPhrasesWithRetry(
        PHRASES_FUNCTION_URL + "?versionOnly",
        {
          method: "get",
          muteHttpExceptions: true,
        },
      );
      if (retryVersion.getResponseCode() !== 200) {
        notify(
          "Batch " +
            (b + 1) +
            " of " +
            totalBatches +
            " had a version conflict and the version re-fetch failed.\n\n" +
            "Completed " +
            totalCellCount +
            " of " +
            whiteCells.length +
            " cells. Please retry the remaining selection.",
        );
        return;
      }
      currentVersion = JSON.parse(retryVersion.getContentText()).version;
      payload.currentVersion = currentVersion;
      response = fetchPhrasesWithRetry(
        PHRASES_FUNCTION_URL,
        buildFetchOptions(secret, payload),
      );
      responseCode = response.getResponseCode();
      responseText = response.getContentText();
      console.log(
        "[phrases] Re-translate batch " +
          (b + 1) +
          " retry response code: " +
          responseCode,
      );
    }

    if (responseCode !== 200) {
      var responseFailure = classifyPhrasesApiFailure(responseText);
      var latestVersion = fetchLatestPublishedPhrasesVersion(currentVersion);
      notify(
        formatPhrasesBatchFailure({
          batchNumber: b + 1,
          totalBatches: totalBatches,
          statusCode: responseCode,
          failureMessage: responseFailure.message,
          completedCells: totalCellCount,
          totalCells: whiteCells.length,
          latestVersion: latestVersion,
        }),
        responseFailure.isFatal ? "error" : "warning",
        { showDeepLBillingAction: responseFailure.showDeepLBillingAction },
      );
      return;
    }

    var result;
    try {
      result = parseVerifiedPhrasesResult(responseText);
    } catch (e) {
      notify(
        "Fatal error: the phrases API did not verify batch " +
          (b + 1) +
          ".\n\n" +
          e.message,
        "error",
      );
      return;
    }
    currentVersion = result.newVersion;

    var writes = planWriteBack(result.translatedRows || {}, rows);
    try {
      writeAndVerifySheetValues(sheet, writes);
    } catch (e) {
      notify(
        "Fatal error: EasyEyes saved the phrase version, but the spreadsheet write-back could not be verified.\n\n" +
          e.message +
          "\n\nVerified partial writes were left in place. Retry the operation safely.",
        "error",
      );
      return;
    }
    totalCellCount += writes.length;
    savePhrasesCheckpoint({
      fingerprint: checkpointFingerprint,
      operationId: operationId,
      nextBatchIndex: b + 1,
      completedCells: totalCellCount,
      currentVersion: currentVersion,
    });
  }

  clearPhrasesCheckpoint();
  notify(
    "Translated " +
      totalCellCount +
      " cell(s). New version: " +
      currentVersion +
      (nonWhiteWarning ? "\n\n⚠️ " + nonWhiteWarning : ""),
    "success",
  );
}

function extractPhrasesApiError(responseText) {
  try {
    return JSON.parse(responseText).error || responseText;
  } catch (e) {
    return responseText;
  }
}

function buildPhrasesCheckpointFingerprint(value) {
  var stableValue = {
    operation: value.operation,
    keys: value.keys,
    changedPhrases: value.changedPhrases,
    colorMask: value.colorMask,
  };
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify(stableValue),
  );
  return Utilities.base64EncodeWebSafe(digest);
}

function buildTranslationImportCheckpointFingerprint(value) {
  var canonicalIncoming = value.incoming.slice().sort(function (left, right) {
    return (
      left.phraseName.localeCompare(right.phraseName) ||
      left.languageCode.localeCompare(right.languageCode)
    );
  });
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify({
      operation: "translationImport",
      returnedSpreadsheetId: value.returnedSpreadsheetId,
      destinationSpreadsheetId: value.destinationSpreadsheetId,
      destinationSheetId: value.destinationSheetId,
      incoming: canonicalIncoming,
    }),
  );
  return Utilities.base64EncodeWebSafe(digest);
}

function savePhrasesCheckpoint(checkpoint) {
  PropertiesService.getUserProperties().setProperty(
    PHRASES_CHECKPOINT_KEY,
    JSON.stringify(checkpoint),
  );
}

function loadPhrasesCheckpoint(fingerprint) {
  var raw = PropertiesService.getUserProperties().getProperty(
    PHRASES_CHECKPOINT_KEY,
  );
  if (!raw) return null;
  try {
    var checkpoint = JSON.parse(raw);
    if (
      checkpoint &&
      checkpoint.fingerprint === fingerprint &&
      typeof checkpoint.operationId === "string" &&
      Number.isInteger(checkpoint.nextBatchIndex) &&
      Number.isInteger(checkpoint.completedCells) &&
      typeof checkpoint.currentVersion === "string"
    ) {
      return checkpoint;
    }
  } catch (e) {
    console.warn("[phrases] Ignoring invalid retranslation checkpoint", e);
  }
  return null;
}

function clearPhrasesCheckpoint() {
  PropertiesService.getUserProperties().deleteProperty(PHRASES_CHECKPOINT_KEY);
}

function countTranslatableCells(colorMask) {
  var count = 0;
  Object.keys(colorMask || {}).forEach(function (key) {
    Object.keys(colorMask[key] || {}).forEach(function (language) {
      if (isTranslatableBackground(colorMask[key][language])) count++;
    });
  });
  return count;
}

function fetchLatestPublishedPhrasesVersion(fallbackVersion) {
  try {
    var response = fetchPhrasesWithRetry(
      PHRASES_FUNCTION_URL + "?versionOnly",
      { method: "get", muteHttpExceptions: true },
    );
    if (response.getResponseCode() === 200) {
      var result = JSON.parse(response.getContentText());
      if (result && result.version) return result.version;
    }
  } catch (e) {
    console.warn("[phrases] Failed to fetch authoritative version", e);
  }
  return fallbackVersion || "unavailable";
}

function formatPhrasesBatchFailure(details) {
  var completed = details.completedCells || 0;
  var total = details.totalCells || 0;
  var remaining = Math.max(0, total - completed);
  var publicationStatus =
    completed > 0
      ? "Batches 1–" +
        (details.batchNumber - 1) +
        " were published successfully."
      : "No cells were published by this operation.";
  return (
    publicationStatus +
    "\n\nBatch " +
    details.batchNumber +
    " of " +
    details.totalBatches +
    " failed (" +
    details.statusCode +
    "): " +
    details.failureMessage +
    "\n\nLatest published version: " +
    details.latestVersion +
    "\nCompleted " +
    completed +
    " of " +
    total +
    " cells; " +
    remaining +
    " cells remain."
  );
}

function fetchPhrasesWithRetry(url, options) {
  var response;
  var lastError;
  for (var attempt = 0; attempt < 3; attempt++) {
    try {
      response = UrlFetchApp.fetch(url, options);
      var code = response.getResponseCode();
      if (code !== 429 && code < 500) return response;
      lastError = new Error("Phrases API returned HTTP " + code + ".");
    } catch (e) {
      lastError = e;
    }
    if (attempt < 2) Utilities.sleep(250 * (attempt + 1));
  }
  if (response) return response;
  throw lastError;
}

function fetchPhrasesBatchWithRetry(url, optionsList) {
  var responses = new Array(optionsList.length);
  var pending = optionsList.map(function (_, index) {
    return index;
  });
  var lastError;

  for (var attempt = 0; attempt < 3 && pending.length > 0; attempt++) {
    var requests = pending.map(function (index) {
      var request = { url: url };
      Object.keys(optionsList[index]).forEach(function (key) {
        request[key] = optionsList[index][key];
      });
      return request;
    });
    try {
      var batchResponses = UrlFetchApp.fetchAll(requests);
      var retry = [];
      pending.forEach(function (originalIndex, responseIndex) {
        var response = batchResponses[responseIndex];
        if (!response) {
          lastError = new Error("Phrases API returned no response.");
          retry.push(originalIndex);
          return;
        }
        responses[originalIndex] = response;
        var code = response.getResponseCode();
        if (code === 429 || code >= 500) retry.push(originalIndex);
      });
      pending = retry;
    } catch (e) {
      lastError = e;
    }
    if (pending.length > 0 && attempt < 2) {
      Utilities.sleep(250 * (attempt + 1));
    }
  }

  if (
    pending.some(function (index) {
      return !responses[index];
    })
  ) {
    throw lastError || new Error("Phrases API batch failed.");
  }
  return responses;
}

function parseVerifiedPhrasesResult(responseText) {
  var parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (e) {
    throw new Error("The phrases API returned invalid JSON.");
  }
  if (!parsed || parsed.verified !== true) {
    throw new Error("The phrases API did not confirm persisted data.");
  }
  return parsed;
}

function findUnverifiedSheetWrites(sheet, writes) {
  var failures = [];
  for (var i = 0; i < writes.length; i++) {
    var write = writes[i];
    var range = sheet.getRange(write.rowIndex + 1, write.colIndex + 1);
    var actual = String(range.getDisplayValue());
    var expected = String(write.value);
    if (actual !== expected) {
      failures.push({
        coordinate: toA1Coordinate(write.colIndex + 1, write.rowIndex + 1),
        expected: expected,
        actual: actual,
      });
    }
  }
  return failures;
}

function writeAndVerifySheetValues(sheet, writes) {
  var remaining = writes.slice();
  for (var attempt = 0; attempt < 3 && remaining.length > 0; attempt++) {
    for (var i = 0; i < remaining.length; i++) {
      var write = remaining[i];
      try {
        sheet
          .getRange(write.rowIndex + 1, write.colIndex + 1)
          .setValue(write.value);
      } catch (e) {
        Logger.log(
          "[phrases] Spreadsheet write attempt " +
            (attempt + 1) +
            " failed at " +
            toA1Coordinate(write.colIndex + 1, write.rowIndex + 1) +
            ": " +
            e,
        );
      }
    }
    SpreadsheetApp.flush();
    var failures = findUnverifiedSheetWrites(sheet, remaining);
    var failedCoordinates = {};
    for (var f = 0; f < failures.length; f++) {
      failedCoordinates[failures[f].coordinate] = true;
    }
    remaining = remaining.filter(function (write) {
      return failedCoordinates[
        toA1Coordinate(write.colIndex + 1, write.rowIndex + 1)
      ];
    });
    if (remaining.length > 0 && attempt < 2)
      Utilities.sleep(200 * (attempt + 1));
  }
  var unverified = findUnverifiedSheetWrites(sheet, remaining);
  if (unverified.length > 0) {
    throw new Error(
      "Unverified spreadsheet cells:\n" +
        unverified
          .map(function (failure) {
            return (
              failure.coordinate +
              ': expected "' +
              failure.expected +
              '", read back "' +
              failure.actual +
              '"'
            );
          })
          .join("\n"),
    );
  }
}

function classifyPhrasesApiFailure(responseText) {
  var parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (e) {
    parsed = null;
  }

  var isFatalFailure = parsed && parsed.fatal === true;
  var isDeepLFailure =
    isFatalFailure && parsed.code === "DEEPL_TRANSLATION_FAILED";

  return {
    message:
      (parsed && parsed.error ? parsed.error : responseText) +
      (parsed && parsed.technicalDetail
        ? "\n\nTechnical detail: " + parsed.technicalDetail
        : ""),
    isFatal: Boolean(isFatalFailure),
    showDeepLBillingAction:
      Boolean(isDeepLFailure) && parsed.deeplStatus === 403,
  };
}

function checkPhraseKeys() {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Translations");
  if (!sheet) {
    notify('Sheet "Translations" not found.');
    return;
  }

  var dataRange = sheet.getDataRange();
  var rows = dataRange.getDisplayValues();
  var backgrounds = dataRange.getBackgrounds();
  if (rows.length < 2) {
    notify("No data found in the International Phrases.");
    return;
  }

  if (rows[0].indexOf("EE_LanguageCode") === -1) {
    notify('Required column "EE_LanguageCode" not found in header row.');
    return;
  }

  // Each check returns a report section, or "" when it finds nothing.
  // Comment out any line below to disable that individual check.
  var sections = [];
  sections.push(checkExactDuplicateKeys(rows));
  sections.push(checkKeyLeadingTrailingSpaces(rows));
  sections.push(checkKeyInvisibleChars(rows));
  sections.push(checkKeyInteriorSpaces(rows));
  sections.push(checkDuplicateLanguageColumns(rows));
  sections.push(checkKeyNamingConvention(rows));
  sections.push(checkMissingEnglishSource(rows));
  sections.push(checkEmptyTranslationCells(rows, backgrounds));
  sections.push(checkOrphanRows(rows));
  sections.push(checkDuplicateEnglishText(rows));

  sections = sections.filter(function (s) {
    return s;
  });

  if (sections.length === 0) {
    notify(
      "No potential problems found in the International Phrases.",
      "success",
    );
    return;
  }

  notify(
    "Found potential problems in the International Phrases:\n\n" +
      sections.join("\n\n"),
  );
}

// ─── Individual phrase-key checks (each returns a report section, or "") ──────

// Same trimmed key in more than one row. Only one row gets the translation;
// the others are left blank.
function checkExactDuplicateKeys(rows) {
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  if (keyIdx === -1) return "";
  var rowsByKey = {};
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    if (!rowsByKey[key]) rowsByKey[key] = [];
    rowsByKey[key].push(i + 1);
  }
  var lines = [];
  Object.keys(rowsByKey).forEach(function (k) {
    if (rowsByKey[k].length > 1) lines.push(k);
  });
  if (!lines.length) return "";
  return (
    "Duplicate keys (exact). Only one row receives the translation; the " +
    "others are left blank:\n" +
    lines.sort().join("\n")
  );
}

// Returns the sorted list of trimmed keys that appear in more than one row.
// Used as a hard pre-flight gate before pushing phrases to EasyEyes.
function findDuplicateKeys(rows) {
  if (rows.length < 2) return [];
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  if (keyIdx === -1) return [];
  var counts = {};
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  var dups = [];
  Object.keys(counts).forEach(function (k) {
    if (counts[k] > 1) dups.push(k);
  });
  return dups.sort();
}

// Keys with leading/trailing spaces. Trimmed before use, so they silently
// collide with the un-spaced spelling.
function checkKeyLeadingTrailingSpaces(rows) {
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  if (keyIdx === -1) return "";
  var lines = [];
  for (var i = 1; i < rows.length; i++) {
    var raw = rows[i][keyIdx] || "";
    var key = raw.trim();
    if (!key) continue;
    if (raw !== key) lines.push('"' + raw + '"');
  }
  if (!lines.length) return "";
  return (
    "Keys with leading/trailing spaces (trimmed before use, so they collide " +
    "with the un-spaced spelling):\n" +
    lines.sort().join("\n")
  );
}

// Keys containing invisible / look-alike characters that survive .trim() and
// make a key look identical to another while never matching it.
function checkKeyInvisibleChars(rows) {
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  if (keyIdx === -1) return "";
  var suspects = [
    { name: "non-breaking space", re: /\u00A0/ },
    { name: "zero-width space", re: /[\u200B-\u200D\uFEFF]/ },
    { name: "tab", re: /\t/ },
  ];
  var lines = [];
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    var found = [];
    for (var s = 0; s < suspects.length; s++) {
      if (suspects[s].re.test(key)) found.push(suspects[s].name);
    }
    if (found.length) lines.push(key + " (" + found.join(", ") + ")");
  }
  if (!lines.length) return "";
  return (
    "Keys containing invisible/look-alike characters (they never match the " +
    "visually identical key):\n" +
    lines.sort().join("\n")
  );
}

// Keys with a regular space somewhere inside the trimmed key (e.g. "my key").
function checkKeyInteriorSpaces(rows) {
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  if (keyIdx === -1) return "";
  var lines = [];
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    if (key.indexOf(" ") !== -1) lines.push(key);
  }
  if (!lines.length) return "";
  return (
    "Keys containing interior spaces (almost always a typo):\n" +
    lines.sort().join("\n")
  );
}

// Two or more target columns sharing the same header. Write-back uses
// header.indexOf(lang), so only the first such column is ever written.
function checkDuplicateLanguageColumns(rows) {
  var header = rows[0];
  var firstSeen = {}; // name -> first column number
  var dups = {}; // name -> [column numbers]
  for (var h = 0; h < header.length; h++) {
    var name = (header[h] || "").trim();
    if (!name) continue;
    if (firstSeen[name] !== undefined) {
      if (!dups[name]) dups[name] = [firstSeen[name]];
      dups[name].push(h + 1);
    } else {
      firstSeen[name] = h + 1;
    }
  }
  var lines = [];
  Object.keys(dups).forEach(function (n) {
    lines.push(n + " — columns " + dups[n].join(", "));
  });
  if (!lines.length) return "";
  return (
    "Duplicate column headers. Only the first column is written; the rest are " +
    "ignored on write-back:\n" +
    lines.sort().join("\n")
  );
}

// Keys that do not start with one of the project's expected prefixes.
function checkKeyNamingConvention(rows) {
  var ALLOWED_PREFIXES = [
    "EE_",
    "RC_",
    "T_",
    "x",
    "_DOCUMENTATION_OF_THIS_TABLE",
  ]; // edit to match the project's key prefixes
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  if (keyIdx === -1) return "";
  var lines = [];
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    var ok = ALLOWED_PREFIXES.some(function (p) {
      return key.indexOf(p) === 0;
    });
    if (!ok) lines.push(key);
  }
  if (!lines.length) return "";
  return (
    "Keys not starting with an expected prefix (" +
    ALLOWED_PREFIXES.join(", ") +
    "):\n" +
    lines.sort().join("\n")
  );
}

// Keys whose English (en) source cell is empty — nothing to translate.
function checkMissingEnglishSource(rows) {
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  var enIdx = rows[0].indexOf("en");
  if (keyIdx === -1 || enIdx === -1) return "";
  var lines = [];
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    if (!(rows[i][enIdx] || "").trim()) lines.push(key);
  }
  if (!lines.length) return "";
  return (
    "Keys with an empty English (en) source cell (nothing to translate):\n" +
    lines.sort().join("\n")
  );
}

// Empty white target-language cells may indicate that translation failed.
// Non-white cells are excluded because they are intentionally not translated.
function checkEmptyTranslationCells(rows, backgrounds) {
  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  var enIdx = header.indexOf("en");
  if (keyIdx === -1 || enIdx === -1) return "";
  var lines = [];
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    for (var h = 0; h < header.length; h++) {
      var language = (header[h] || "").trim();
      if (!language || h === keyIdx || h === enIdx) continue;
      if (!isTranslatableBackground(backgrounds[i] && backgrounds[i][h]))
        continue;
      if ((rows[i][h] || "").trim()) continue;

      lines.push(key + " — " + language);
    }
  }
  if (!lines.length) return "";
  return (
    "Empty translatable cells (possible failed translations):\n" +
    lines.sort().join("\n")
  );
}

// Rows that have content in some column but no key — silently skipped on every
// push, so their text never reaches the app.
function checkOrphanRows(rows) {
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  if (keyIdx === -1) return "";
  var lines = [];
  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][keyIdx] || "").trim()) continue;
    var hasContent = false;
    for (var h = 0; h < rows[i].length; h++) {
      if (h === keyIdx) continue;
      if ((rows[i][h] || "").trim()) {
        hasContent = true;
        break;
      }
    }
    if (hasContent) lines.push("row " + (i + 1));
  }
  if (!lines.length) return "";
  return (
    "Rows with content but no key in the EE_LanguageCode column (silently skipped on " +
    "every push):\n" +
    lines.join("\n")
  );
}

// Identical English source text under different keys — possible redundancy.
function checkDuplicateEnglishText(rows) {
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  var enIdx = rows[0].indexOf("en");
  if (keyIdx === -1 || enIdx === -1) return "";
  var keysByText = {}; // en text -> { key: true }
  var rowsByText = {}; // en text -> [rows]
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    var text = (rows[i][enIdx] || "").trim();
    if (!text) continue;
    if (!keysByText[text]) {
      keysByText[text] = {};
      rowsByText[text] = [];
    }
    keysByText[text][key] = true;
    rowsByText[text].push(i + 1);
  }
  var lines = [];
  Object.keys(keysByText).forEach(function (t) {
    var keys = Object.keys(keysByText[t]);
    if (keys.length > 1) {
      lines.push(keys.join(", "));
    }
  });
  if (!lines.length) return "";
  return (
    "Identical English text under different keys (possible redundancy):\n" +
    lines.sort().join("\n\n")
  );
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

function extractEnglishMap(rows) {
  if (rows.length < 2) return {};
  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  var enIdx = header.indexOf("en");
  if (keyIdx === -1 || enIdx === -1) return {};
  var result = {};
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (key) result[key] = rows[i][enIdx] || "";
  }
  return result;
}

function buildPhraseSheetIndex(rows) {
  if (!rows.length) throw new Error("Translations sheet is empty.");
  var keyIdx = rows[0].indexOf("EE_LanguageCode");
  var enIdx = rows[0].indexOf("en");
  if (keyIdx === -1 || enIdx === -1) {
    throw new Error(
      'Required columns "EE_LanguageCode" and "en" were not found.',
    );
  }
  var columnsByLanguage = {};
  for (var column = 0; column < rows[0].length; column++) {
    var language = String(rows[0][column] || "").trim();
    if (!language || column === keyIdx) continue;
    if (columnsByLanguage[language] !== undefined) {
      throw new Error("Duplicate languageCode: " + language);
    }
    columnsByLanguage[language] = column;
  }
  var rowsByPhrase = {};
  for (var row = 1; row < rows.length; row++) {
    var phraseName = String(rows[row][keyIdx] || "").trim();
    if (!phraseName) continue;
    if (rowsByPhrase[phraseName] !== undefined) {
      throw new Error("Duplicate phraseName: " + phraseName);
    }
    rowsByPhrase[phraseName] = row;
  }
  return {
    keyIdx: keyIdx,
    enIdx: enIdx,
    rowsByPhrase: rowsByPhrase,
    columnsByLanguage: columnsByLanguage,
  };
}

function buildFreshnessBatches(rows, batchSize) {
  var index = buildPhraseSheetIndex(rows);
  var languageCodes = Object.keys(index.columnsByLanguage).filter(
    function (lang) {
      return lang !== "en";
    },
  );
  var records = Object.keys(index.rowsByPhrase)
    .filter(function (phraseName) {
      return index.rowsByPhrase[phraseName] >= FIRST_TRANSLATION_ROW_INDEX;
    })
    .map(function (phraseName) {
      return {
        phraseName: phraseName,
        englishText: rows[index.rowsByPhrase[phraseName]][index.enIdx] || "",
        languageCodes: languageCodes,
      };
    });
  var batches = [];
  for (var offset = 0; offset < records.length; offset += batchSize || 50) {
    batches.push({
      action: "checkFreshness",
      phrases: records.slice(offset, offset + (batchSize || 50)),
    });
  }
  return batches;
}

function freshnessLookup(results) {
  var lookup = {};
  (results || []).forEach(function (result) {
    lookup[result.phraseName + "\u0000" + result.languageCode] = Boolean(
      result.fresh,
    );
  });
  return lookup;
}

function planFreshnessFontColors(rows, currentColors, freshnessResults) {
  var index = buildPhraseSheetIndex(rows);
  var planned = currentColors.map(function (row) {
    return row.slice();
  });
  var lookup = freshnessLookup(freshnessResults);
  Object.keys(index.rowsByPhrase).forEach(function (phraseName) {
    var row = index.rowsByPhrase[phraseName];
    if (row < FIRST_TRANSLATION_ROW_INDEX) return;
    Object.keys(index.columnsByLanguage).forEach(function (language) {
      if (language === "en") return;
      var column = index.columnsByLanguage[language];
      var nonblank = String(rows[row][column] || "").length > 0;
      planned[row][column] =
        nonblank && lookup[phraseName + "\u0000" + language]
          ? "#000000"
          : "#ff0000";
    });
  });
  return planned;
}

function fetchFreshness(rows, secret) {
  var results = [];
  var batches = buildFreshnessBatches(rows, 50);
  var concurrency = 4;
  for (var offset = 0; offset < batches.length; offset += concurrency) {
    var group = batches.slice(offset, offset + concurrency);
    var responses = fetchPhrasesBatchWithRetry(
      PHRASES_FUNCTION_URL,
      group.map(function (payload) {
        return buildFetchOptions(secret, payload);
      }),
    );
    responses.forEach(function (response) {
      if (response.getResponseCode() !== 200) {
        throw new Error(
          "Freshness check failed (" +
            response.getResponseCode() +
            "): " +
            extractPhrasesApiError(response.getContentText()),
        );
      }
      var parsed = JSON.parse(response.getContentText());
      if (!Array.isArray(parsed.freshness))
        throw new Error("Freshness response was malformed.");
      results = results.concat(parsed.freshness);
    });
  }
  return results;
}

function colorStaleTranslationTextRed(successMessage) {
  try {
    var secret =
      PropertiesService.getScriptProperties().getProperty("PHRASES_SECRET");
    if (!secret)
      throw new Error("PHRASES_SECRET is not set in Script Properties.");
    var sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Translations");
    if (!sheet) throw new Error('Sheet "Translations" not found.');
    var range = sheet.getDataRange();
    var rows = range.getDisplayValues();
    showSpinner("Checking translation freshness…", "Checking freshness …");
    var colors = planFreshnessFontColors(
      rows,
      range.getFontColors(),
      fetchFreshness(rows, secret),
    );
    range.setFontColors(colors);
    notify(
      successMessage || "Translation freshness colors updated.",
      "success",
    );
  } catch (e) {
    notify(e.message, "error");
  }
}

function planCompactTranslationRequest(rows, backgrounds, freshnessResults) {
  var index = buildPhraseSheetIndex(rows);
  var fresh = freshnessLookup(freshnessResults);
  var retained = {};
  var clears = [];
  Object.keys(index.rowsByPhrase).forEach(function (phraseName) {
    var row = index.rowsByPhrase[phraseName];
    Object.keys(index.columnsByLanguage).forEach(function (language) {
      if (language === "en") return;
      var column = index.columnsByLanguage[language];
      var keep =
        !isTranslatableBackground(backgrounds[row][column]) &&
        !fresh[phraseName + "\u0000" + language];
      if (keep) retained[row + "\u0000" + column] = true;
      else clears.push({ rowIndex: row, colIndex: column });
    });
  });
  var rowsToDelete = [];
  for (var row = rows.length - 1; row >= FIRST_TRANSLATION_ROW_INDEX; row--) {
    var keepRow = Object.keys(index.columnsByLanguage).some(
      function (language) {
        return (
          language !== "en" &&
          retained[row + "\u0000" + index.columnsByLanguage[language]]
        );
      },
    );
    if (!keepRow) rowsToDelete.push(row);
  }
  var columnsToDelete = [];
  for (var column = rows[0].length - 1; column >= 0; column--) {
    if (column === index.keyIdx || column === index.enIdx) continue;
    var keepColumn = Object.keys(index.rowsByPhrase).some(
      function (phraseName) {
        return retained[index.rowsByPhrase[phraseName] + "\u0000" + column];
      },
    );
    if (!keepColumn) columnsToDelete.push(column);
  }
  return {
    clears: clears,
    rowsToDelete: rowsToDelete,
    columnsToDelete: columnsToDelete,
  };
}

function columnIndexToA1(columnIndex) {
  var label = "";
  for (
    var column = columnIndex + 1;
    column > 0;
    column = Math.floor((column - 1) / 26)
  ) {
    label = String.fromCharCode(((column - 1) % 26) + 65) + label;
  }
  return label;
}

function buildCompactClearRanges(clears) {
  var sorted = clears.slice().sort(function (a, b) {
    return a.rowIndex - b.rowIndex || a.colIndex - b.colIndex;
  });
  var ranges = [];
  var start = null;
  var end = null;
  sorted.forEach(function (cell) {
    if (
      start &&
      cell.rowIndex === end.rowIndex &&
      cell.colIndex === end.colIndex + 1
    ) {
      end = cell;
      return;
    }
    if (start) ranges.push(compactClearRangeA1(start, end));
    start = cell;
    end = cell;
  });
  if (start) ranges.push(compactClearRangeA1(start, end));
  return ranges;
}

function compactClearRangeA1(start, end) {
  var first = columnIndexToA1(start.colIndex) + (start.rowIndex + 1);
  var last = columnIndexToA1(end.colIndex) + (end.rowIndex + 1);
  return first === last ? first : first + ":" + last;
}

function groupDescendingIndices(indices) {
  var groups = [];
  indices.forEach(function (index) {
    var last = groups[groups.length - 1];
    if (last && index === last.startIndex - 1) {
      last.startIndex = index;
      last.count += 1;
    } else {
      groups.push({ startIndex: index, count: 1 });
    }
  });
  return groups;
}

function applyCompactTranslationPlan(sheet, plan) {
  var clearRanges = buildCompactClearRanges(plan.clears);
  if (clearRanges.length) {
    sheet
      .getRangeList(clearRanges)
      .clearContent()
      .setBackground(TRANSLATABLE_BACKGROUND);
  }
  groupDescendingIndices(plan.rowsToDelete).forEach(function (group) {
    sheet.deleteRows(group.startIndex + 1, group.count);
  });
  groupDescendingIndices(plan.columnsToDelete).forEach(function (group) {
    sheet.deleteColumns(group.startIndex + 1, group.count);
  });
}

function tabulateNeededTranslations() {
  try {
    var secret =
      PropertiesService.getScriptProperties().getProperty("PHRASES_SECRET");
    if (!secret)
      throw new Error("PHRASES_SECRET is not set in Script Properties.");
    var source = SpreadsheetApp.getActiveSpreadsheet();
    var sourceSheet = source.getSheetByName("Translations");
    if (!sourceSheet) throw new Error('Sheet "Translations" not found.');
    showSpinner(
      "Creating translation request…",
      "Creating translation request …",
    );
    var sourceRange = sourceSheet.getDataRange();
    var rows = sourceRange.getDisplayValues();
    var backgrounds = sourceRange.getBackgrounds();
    var plan = planCompactTranslationRequest(
      rows,
      backgrounds,
      fetchFreshness(rows, secret),
    );
    var copy = SpreadsheetApp.create(
      source.getName() + " - needed translations",
    );
    var defaultSheets = copy.getSheets();
    var copySheet = null;
    source.getSheets().forEach(function (sheet) {
      var copiedSheet = sheet.copyTo(copy).setName(sheet.getName());
      if (sheet.getSheetId() === sourceSheet.getSheetId()) {
        copySheet = copiedSheet;
      }
    });
    defaultSheets.forEach(function (sheet) {
      copy.deleteSheet(sheet);
    });
    if (!copySheet)
      throw new Error('Copied spreadsheet has no "Translations" sheet.');
    applyCompactTranslationPlan(copySheet, plan);
    var copyUrl = copy.getUrl();
    notify("Translation request created: " + copyUrl, "success", {
      linkUrl: copyUrl,
    });
  } catch (e) {
    notify(e.message, "error");
  }
}

function validateTranslationImport(
  compactRows,
  compactBackgrounds,
  currentRows,
) {
  var compact = buildPhraseSheetIndex(compactRows);
  var current = buildPhraseSheetIndex(currentRows);
  var incoming = [];
  Object.keys(compact.rowsByPhrase).forEach(function (phraseName) {
    var row = compact.rowsByPhrase[phraseName];
    if (row < FIRST_TRANSLATION_ROW_INDEX) return;
    if (current.rowsByPhrase[phraseName] === undefined) {
      throw new Error("Unknown phraseName in returned sheet: " + phraseName);
    }
    Object.keys(compact.columnsByLanguage).forEach(function (language) {
      if (language === "en") return;
      if (current.columnsByLanguage[language] === undefined) {
        throw new Error("Unknown languageCode in returned sheet: " + language);
      }
      var column = compact.columnsByLanguage[language];
      if (!isTranslatableBackground(compactBackgrounds[row][column])) {
        incoming.push({
          phraseName: phraseName,
          languageCode: language,
          englishText: compactRows[row][compact.enIdx] || "",
          value: compactRows[row][column] || "",
          background: compactBackgrounds[row][column],
        });
      }
    });
  });
  var included = {};
  incoming.forEach(function (cell) {
    included[cell.phraseName] = cell.englishText;
  });
  var conflicts = Object.keys(included).reduce(function (all, phraseName) {
    var currentEnglish =
      currentRows[current.rowsByPhrase[phraseName]][current.enIdx] || "";
    if (included[phraseName] !== currentEnglish) {
      all.push({
        phraseName: phraseName,
        compactEnglish: included[phraseName],
        currentEnglish: currentEnglish,
      });
    }
    return all;
  }, []);
  return { incoming: incoming, conflicts: conflicts };
}

function formatEnglishConflicts(conflicts) {
  return conflicts
    .map(function (conflict) {
      return (
        conflict.phraseName +
        "\nReturned: " +
        conflict.compactEnglish +
        "\nInternational: " +
        conflict.currentEnglish
      );
    })
    .join("\n\n");
}

function saveImportCheckpoint(checkpoint) {
  PropertiesService.getUserProperties().setProperty(
    PHRASES_IMPORT_CHECKPOINT_KEY,
    JSON.stringify(checkpoint),
  );
}

function loadImportCheckpoint(fingerprint) {
  var raw = PropertiesService.getUserProperties().getProperty(
    PHRASES_IMPORT_CHECKPOINT_KEY,
  );
  if (!raw) return null;
  try {
    var checkpoint = JSON.parse(raw);
    return checkpoint.fingerprint === fingerprint ? checkpoint : null;
  } catch (e) {
    return null;
  }
}

function clearImportCheckpoint() {
  PropertiesService.getUserProperties().deleteProperty(
    PHRASES_IMPORT_CHECKPOINT_KEY,
  );
}

function writeAndVerifyImportedCells(sheet, writes) {
  writes.forEach(function (write) {
    var range = sheet.getRange(write.rowIndex + 1, write.colIndex + 1);
    range.setValue(write.value);
    range.setBackground(write.background);
  });
  var failures = writes.filter(function (write) {
    var range = sheet.getRange(write.rowIndex + 1, write.colIndex + 1);
    return (
      range.getDisplayValue() !== String(write.value) ||
      range.getBackground().toLowerCase() !==
        String(write.background).toLowerCase()
    );
  });
  if (failures.length) {
    throw new Error(
      "Imported spreadsheet cells did not read back correctly: " +
        failures
          .map(function (write) {
            return toA1Coordinate(write.colIndex + 1, write.rowIndex + 1);
          })
          .join(", "),
    );
  }
}

function readNewTranslations() {
  try {
    var ui = SpreadsheetApp.getUi();
    var prompt = ui.prompt(
      "Read new translations",
      "Paste the returned Google Sheets URL.",
      ui.ButtonSet.OK_CANCEL,
    );
    if (prompt.getSelectedButton() !== ui.Button.OK) return;
    var returned = SpreadsheetApp.openByUrl(prompt.getResponseText().trim());
    var compactSheet = returned.getSheetByName("Translations");
    if (!compactSheet)
      throw new Error('Returned spreadsheet has no "Translations" sheet.');
    var destinationSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Translations");
    if (!destinationSheet)
      throw new Error('International Phrases has no "Translations" sheet.');
    var compactRange = compactSheet.getDataRange();
    var currentRange = destinationSheet.getDataRange();
    var validation = validateTranslationImport(
      compactRange.getDisplayValues(),
      compactRange.getBackgrounds(),
      currentRange.getDisplayValues(),
    );
    if (validation.conflicts.length) {
      notify(
        "English sources differ. No translations were imported.\n\n" +
          formatEnglishConflicts(validation.conflicts),
        "error",
      );
      return;
    }
    if (!validation.incoming.length) {
      notify("No non-white translations were found in the returned sheet.");
      return;
    }
    importValidatedTranslations(
      returned.getId(),
      destinationSheet,
      validation.incoming,
    );
  } catch (e) {
    notify("Translation import failed: " + e.message, "error");
  }
}

function buildTranslationImportPayload(
  changedPhrases,
  colorMask,
  sentValues,
  activeLanguages,
  currentVersion,
  operationId,
  batchNumber,
  totalBatches,
  cellCount,
) {
  return {
    action: "translate",
    translationImport: true,
    changedPhrases: changedPhrases,
    colorMask: colorMask,
    sentValues: sentValues,
    activeLanguages: activeLanguages,
    currentVersion: currentVersion,
    operationId: operationId,
    batchNumber: batchNumber,
    totalBatches: totalBatches,
    cellCount: cellCount,
  };
}

function importValidatedTranslations(spreadsheetId, sheet, incoming) {
  var secret =
    PropertiesService.getScriptProperties().getProperty("PHRASES_SECRET");
  if (!secret)
    throw new Error("PHRASES_SECRET is not set in Script Properties.");
  var rows = sheet.getDataRange().getDisplayValues();
  var index = buildPhraseSheetIndex(rows);
  var grouped = {};
  incoming.forEach(function (cell) {
    if (!grouped[cell.phraseName]) grouped[cell.phraseName] = [];
    grouped[cell.phraseName].push(cell);
  });
  var phraseNames = Object.keys(grouped).sort();
  var fingerprint = buildTranslationImportCheckpointFingerprint({
    returnedSpreadsheetId: spreadsheetId,
    destinationSpreadsheetId: sheet.getParent().getId(),
    destinationSheetId: sheet.getSheetId(),
    incoming: incoming,
  });
  var checkpoint = loadImportCheckpoint(fingerprint);
  var operationId = checkpoint ? checkpoint.operationId : Utilities.getUuid();
  var nextBatchIndex = checkpoint ? checkpoint.nextBatchIndex : 0;
  var versionResponse = fetchPhrasesWithRetry(
    PHRASES_FUNCTION_URL + "?versionOnly",
    { method: "get", muteHttpExceptions: true },
  );
  if (versionResponse.getResponseCode() !== 200)
    throw new Error("Could not read the current phrases version.");
  var currentVersion = checkpoint
    ? checkpoint.currentVersion
    : JSON.parse(versionResponse.getContentText()).version;
  if (!checkpoint)
    saveImportCheckpoint({
      fingerprint: fingerprint,
      operationId: operationId,
      nextBatchIndex: 0,
      currentVersion: currentVersion,
    });
  var totalBatches = Math.ceil(phraseNames.length / 50);
  for (
    var batchIndex = nextBatchIndex;
    batchIndex < totalBatches;
    batchIndex++
  ) {
    rows = sheet.getDataRange().getDisplayValues();
    index = buildPhraseSheetIndex(rows);
    var batchNames = phraseNames.slice(batchIndex * 50, (batchIndex + 1) * 50);
    var changedPhrases = {};
    var colorMask = {};
    var sentValues = {};
    batchNames.forEach(function (phraseName) {
      var expectedEnglish = grouped[phraseName][0].englishText;
      var currentEnglish =
        rows[index.rowsByPhrase[phraseName]][index.enIdx] || "";
      if (currentEnglish !== expectedEnglish)
        throw new Error(
          "English changed during import for " +
            phraseName +
            ". No later batches were imported.",
        );
      changedPhrases[phraseName] = expectedEnglish;
      colorMask[phraseName] = {};
      sentValues[phraseName] = {};
      grouped[phraseName].forEach(function (cell) {
        colorMask[phraseName][cell.languageCode] = cell.background;
        sentValues[phraseName][cell.languageCode] = cell.value;
      });
    });
    var payload = buildTranslationImportPayload(
      changedPhrases,
      colorMask,
      sentValues,
      extractActiveLanguages(rows),
      currentVersion,
      operationId,
      batchIndex + 1,
      totalBatches,
      incoming.length,
    );
    var response = fetchPhrasesWithRetry(
      PHRASES_FUNCTION_URL,
      buildFetchOptions(secret, payload),
    );
    if (response.getResponseCode() !== 200)
      throw new Error(
        "Import batch " +
          (batchIndex + 1) +
          " failed: " +
          extractPhrasesApiError(response.getContentText()),
      );
    var result = parseVerifiedPhrasesResult(response.getContentText());
    currentVersion = result.newVersion;
    var writes = [];
    batchNames.forEach(function (phraseName) {
      grouped[phraseName].forEach(function (cell) {
        writes.push({
          rowIndex: index.rowsByPhrase[phraseName],
          colIndex: index.columnsByLanguage[cell.languageCode],
          value: result.translatedRows[phraseName][cell.languageCode],
          background: cell.background,
        });
      });
    });
    writeAndVerifyImportedCells(sheet, writes);
    saveImportCheckpoint({
      fingerprint: fingerprint,
      operationId: operationId,
      nextBatchIndex: batchIndex + 1,
      currentVersion: currentVersion,
    });
  }
  clearImportCheckpoint();
  notify(
    "Imported " +
      incoming.length +
      " translation cell(s). New version: " +
      currentVersion,
    "success",
  );
}

function buildDiffPayload(english) {
  return { action: "diff", english: english };
}

function toA1Coordinate(column, row) {
  var letters = "";
  var current = column;
  while (current > 0) {
    var remainder = (current - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    current = Math.floor((current - 1) / 26);
  }
  return letters + row;
}

function comparePhraseCells(rows, firebasePhrases) {
  if (rows.length < 2) return [];
  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  if (keyIdx === -1) return [];
  var phrases = firebasePhrases || {};
  var differences = [];

  for (var rowIdx = 1; rowIdx < rows.length; rowIdx++) {
    var rawKey = rows[rowIdx][keyIdx] || "";
    var key = rawKey.trim();
    if (!key) continue;
    var firebaseRow = phrases[key];

    for (var colIdx = 0; colIdx < header.length; colIdx++) {
      var sheetValue = rows[rowIdx][colIdx] || "";
      var firebaseValue = "";

      if (firebaseRow) {
        if (colIdx === keyIdx) firebaseValue = key;
        else if (header[colIdx])
          firebaseValue = firebaseRow[header[colIdx]] || "";
      }

      if (sheetValue !== firebaseValue) {
        differences.push({
          coordinate: toA1Coordinate(colIdx + 1, rowIdx + 1),
          firebaseValue: firebaseValue,
          sheetValue: sheetValue,
        });
      }
    }
  }

  return differences;
}

function extractActiveLanguages(rows) {
  if (rows.length === 0) return [];
  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  var result = [];
  for (var h = 0; h < header.length; h++) {
    var language = (header[h] || "").trim();
    if (language && h !== keyIdx) result.push(language);
  }
  return result;
}

function extractNonTranslatableValues(rows, backgrounds) {
  if (rows.length < 2) return {};
  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  var enIdx = header.indexOf("en");
  if (keyIdx === -1 || enIdx === -1) return {};
  var result = {};
  for (var i = 1; i < rows.length; i++) {
    var key = (rows[i][keyIdx] || "").trim();
    if (!key) continue;
    var bgRow = backgrounds[i];
    var rowVals = {};
    for (var h = 0; h < header.length; h++) {
      if (!header[h] || h === keyIdx || h === enIdx) continue;
      if (!isTranslatableBackground(bgRow[h])) {
        rowVals[header[h]] = rows[i][h] || "";
      }
    }
    if (Object.keys(rowVals).length > 0) result[key] = rowVals;
  }
  return result;
}

function isTranslatableBackground(hex) {
  if (!hex) return false;
  return hex.toLowerCase().trim() === TRANSLATABLE_BACKGROUND;
}

function isAutomaticallyTranslatedLanguage(language) {
  return (
    String(language || "")
      .trim()
      .toLowerCase() !== "pcm"
  );
}

function buildTranslatePayload(
  rows,
  backgrounds,
  changedKeys,
  currentVersion,
  isFullResync,
) {
  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  var enIdx = header.indexOf("en");
  var targetLangs = [];
  var targetIdxs = [];
  for (var h = 0; h < header.length; h++) {
    if (
      header[h] &&
      h !== keyIdx &&
      h !== enIdx &&
      isAutomaticallyTranslatedLanguage(header[h])
    ) {
      targetLangs.push(header[h]);
      targetIdxs.push(h);
    }
  }

  var keyToRowIdx = {};
  for (var i = 1; i < rows.length; i++) {
    var k = (rows[i][keyIdx] || "").trim();
    if (k) keyToRowIdx[k] = i;
  }

  var changedPhrases = {};
  var colorMask = {};
  var sentValues = {};

  for (var c = 0; c < changedKeys.length; c++) {
    var key = changedKeys[c];
    var ri = keyToRowIdx[key];
    if (ri === undefined) continue;
    var row = rows[ri];
    var bgRow = backgrounds[ri];
    changedPhrases[key] = row[enIdx] || "";
    colorMask[key] = {};
    sentValues[key] = {};
    for (var j = 0; j < targetLangs.length; j++) {
      var lang = targetLangs[j];
      var ci = targetIdxs[j];
      colorMask[key][lang] = bgRow[ci];
      sentValues[key][lang] = row[ci] || "";
    }
  }

  return {
    action: isFullResync ? "fullResync" : "translate",
    changedPhrases: changedPhrases,
    colorMask: colorMask,
    sentValues: sentValues,
    activeLanguages: extractActiveLanguages(rows),
    currentVersion: currentVersion,
  };
}

function findMissingTranslatableKeys(colorMask, changedKeys) {
  var result = [];
  for (var i = 0; i < changedKeys.length; i++) {
    var key = changedKeys[i];
    var mask = colorMask[key];
    if (!mask) {
      result.push(key);
      continue;
    }
    var values = Object.values(mask);
    if (
      values.every(function (v) {
        return !isTranslatableBackground(v);
      })
    )
      result.push(key);
  }
  return result;
}

function planWriteBack(translatedRows, rows) {
  var header = rows[0];
  var keyIdx = header.indexOf("EE_LanguageCode");
  var enIdx = header.indexOf("en");

  var keyToRowIdx = {};
  for (var i = 1; i < rows.length; i++) {
    var k = (rows[i][keyIdx] || "").trim();
    if (k) keyToRowIdx[k] = i;
  }

  var writes = [];
  var keys = Object.keys(translatedRows);
  for (var ki = 0; ki < keys.length; ki++) {
    var key = keys[ki];
    var ri = keyToRowIdx[key];
    if (ri === undefined) continue;
    var langValues = translatedRows[key];
    var langs = Object.keys(langValues);
    for (var li = 0; li < langs.length; li++) {
      var lang = langs[li];
      var ci = header.indexOf(lang);
      if (ci === -1 || ci === keyIdx || ci === enIdx) continue;
      writes.push({ rowIndex: ri, colIndex: ci, value: langValues[lang] });
    }
  }
  return writes;
}

function buildFetchOptions(secret, payload) {
  return {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-phrases-secret": secret,
      "x-request-id": payload.operationId || Utilities.getUuid(),
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
}
