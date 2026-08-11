# Hardcoded English strings that need phrases

**For:** Denis (phrases sheet)
**What to do:** Add each string below as a new row in the phrases Google Sheet (key + English text) and run "Push phrases". Translations are now automatic (server-side DeepL; Google Translate for Kannada), so **only the English column is needed** — no manual translation. Human-curated cells stay non-white as usual.

**Why:** These participant-facing strings are hardcoded in the threshold runtime and therefore always appear in English, ignoring `_language`. Once keys exist, the dev team will replace the literals with `readi18nPhrases(...)` calls.

Suggested key names follow the existing `EE_` convention; feel free to rename.

---

## Priority 1 — Fatal error dialog (PsychoJS GUI)

Every uncaught runtime error shows this dialog. Currently 100% English.

| Suggested key                 | English text                     | Source                           |
| ----------------------------- | -------------------------------- | -------------------------------- |
| EE_errorDialogTitle           | Error                            | psychojs/src/core/GUI.js:461     |
| EE_warningDialogTitle         | Warning                          | GUI.js:486                       |
| EE_studyEndedWithError        | The study ended with this error: | GUI.js:462                       |
| EE_unspecifiedJavascriptError | Unspecified JavaScript error     | GUI.js:364, 562                  |
| EE_ok                         | OK _(may already exist)_         | GUI.js:81, 340, 606              |
| EE_cancel                     | Cancel _(may already exist)_     | GUI.js:80                        |
| EE_allResourcesDownloaded     | All resources downloaded.        | GUI.js:667                       |
| EE_downloadedNofM             | Downloaded [[N]] / [[M]]         | GUI.js:684                       |
| EE_downloadingNofM            | Downloading [[N]] / [[M]]        | GUI.js:688                       |
| EE_compilerUpdated            | Compiler updated [[TIME]]        | GUI.js:436; errorHandling.js:158 |

Error-context labels shown inside the dialog (errorHandling.js:141–155, GUI.js:401–406).
_Checked against phrases v30.9: none of these terms exist as standalone translated phrases — "Trial"/"Block" are only translated inside the counter sentences (`T_counterTrialBlock`, `T_counterBlock`), and "where"/"condition"/"experiment"/"current time" have no label-like phrase at all. So these are all new keys (alternatively, the dev team could reuse `T_counterTrialBlock` for the block/trial line). "conditionName" refers to the spreadsheet column and can stay in English:_

| Suggested key                      | English text                                                 |
| ---------------------------------- | ------------------------------------------------------------ |
| EE_errorContextWhere               | where: [[WHERE]]                                             |
| EE_errorContextBlockConditionTrial | block: [[BLOCK]], condition: [[CONDITION]], trial: [[TRIAL]] |
| EE_errorContextConditionName       | conditionName: [[NAME]]                                      |
| EE_errorContextExperiment          | experiment: [[EXPERIMENT]]                                   |
| EE_errorContextCurrentTime         | current time: [[TIME]]                                       |
| EE_errorContextUnavailable         | Context unavailable: [[REASON]]                              |
| EE_unknownError                    | Unknown error                                                |

## Priority 2 — Pavlovia status/license warnings (GUI.js `_userFriendlyError`, lines 771–878)

Shown when an experiment can't run (inactive, deleted, no credit, expired license, bad pilot token, server/database error).

| Suggested key                  | English text                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| EE_pavloviaInternalServerError | Oops we encountered an internal server error.                                                                               |
| EE_pavloviaDatabaseError       | Oops we encountered a database error.                                                                                       |
| EE_pavloviaReportFooter        | Click the REPORT button to report the error to the EasyEyes team. We will try to fix it. Thank you for your help.           |
| EE_pavloviaNoStatus            | [[EXPERIMENT]] does not have any status and cannot be run.                                                                  |
| EE_pavloviaInactive            | [[EXPERIMENT]] is currently inactive and cannot be run.                                                                     |
| EE_pavloviaDeleted             | [[EXPERIMENT]] has been deleted and cannot be run.                                                                          |
| EE_pavloviaArchived            | [[EXPERIMENT]] has been archived and cannot be run.                                                                         |
| EE_pavloviaPilotTokenMissing   | [[EXPERIMENT]] is currently in PILOTING mode but the pilot token is missing from the URL.                                   |
| EE_pavloviaPilotTokenInvalid   | [[EXPERIMENT]] cannot be run because the pilot token in the URL is invalid, possibly because it has expired.                |
| EE_pavloviaLicenseExpired      | [[EXPERIMENT]] is covered by a license that has expired.                                                                    |
| EE_pavloviaLicenseDocsNeeded   | [[EXPERIMENT]] is covered by a license that requires one or more documents to be approved before the experiment can be run. |
| EE_pavloviaNoCredit            | [[EXPERIMENT]] does not have any assigned credit left and cannot be run.                                                    |
| EE_pavloviaUnspecifiedError    | Unfortunately we encountered an unspecified error (error code: [[CODE]]).                                                   |

(Each warning case also has 1–2 sentences of "if you are the designer… / if you are a participant…" instructions; dev team can extract exact wording from GUI.js when wiring up.)

## Priority 3 — Experiment end / data saving (PsychoJS.js, ServerManager.js, forms.js, lifetime.js)

| Suggested key           | English text                                                                                                                                                                                                                                | Source                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| EE_safeToClose          | Thank you. It's now safe to close this browser tab.                                                                                                                                                                                         | PsychoJS.js:490                   |
| EE_doNotCloseDataSaving | **Thank you. You're done. DO NOT CLOSE THIS WINDOW.** It will close once your data are safely saved. Closing this window will prevent saving of your data, and they will be lost. This may take a few minutes. Thank you for your patience. | PsychoJS.js:491                   |
| EE_dataUploading        | Please wait a few moments while the data is uploading to the server                                                                                                                                                                         | ServerManager.js:853              |
| EE_cameraInitializing   | Please wait a few moments while the camera initialises                                                                                                                                                                                      | Camera.js:41                      |
| EE_experimentEnded      | Thank you. The experiment has ended.                                                                                                                                                                                                        | forms.js:601 (has `// TODO i18n`) |
| EE_goToProlific         | Please go to Prolific to complete the experiment.                                                                                                                                                                                           | lifetime.js:189                   |
| EE_submit               | Submit                                                                                                                                                                                                                                      | forms.js:417                      |

## Priority 4 — Email verification (threshold.js:1364–1546, microphone calibration flow)

| Suggested key                        | English text                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| EE_emailErrorTitle                   | Email Error                                                                             |
| EE_emailSendFailed                   | Failed to send verification email. Please check your internet connection and try again. |
| EE_emailVerificationRequired         | Email Verification Required                                                             |
| EE_emailVerificationAttempt          | Email Verification Required (Attempt [[N]]/[[MAX]])                                     |
| EE_incorrectCode                     | **Incorrect code entered.** Please try again.                                           |
| EE_remainingAttempts                 | Remaining attempts: [[N]]                                                               |
| EE_enterSixDigitCode                 | Enter 6-digit code                                                                      |
| EE_proceed                           | Proceed                                                                                 |
| EE_verificationCancelledTitle        | Verification Cancelled                                                                  |
| EE_verificationCancelledText         | Microphone calibration requires email verification. Experiment will end.                |
| EE_authorshipVerified                | Authorship verified                                                                     |
| EE_authorshipVerificationFailedTitle | Authorship Verification Failed                                                          |
| EE_authorshipVerificationFailedText  | Maximum verification attempts ([[MAX]]) exceeded. Experiment will end.                  |

## Priority 5 — Sound output & calibration popups

| Suggested key               | English text                                                                          | Source                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| EE_playTestSound            | Play a test sound.                                                                    | soundOutput.ts:75, 84                                                        |
| EE_playing                  | Playing!                                                                              | soundOutput.ts:81                                                            |
| EE_browserNotSupported      | Browser not supported.                                                                | soundOutput.ts:112                                                           |
| EE_browserNotSupportedText  | Due to technical limitations you will not be able to complete this experiment.        | soundOutput.ts:113                                                           |
| EE_selectAudioOutput        | Select audio output                                                                   | soundOutput.ts:153                                                           |
| EE_pleaseSelectAudioOutput  | Please select an audio output option.                                                 | soundOutput.ts:171                                                           |
| EE_loading                  | Loading ...                                                                           | useSoundCalibration.js:1043+; compatibilityCheck.js:2705+; soundTest.js:1496 |
| EE_fillAllFields            | Please fill out all the fields                                                        | useSoundCalibration.js:1049+; compatibilityCheck.js:3354                     |
| EE_enterDeviceModel         | Please enter the model number and name of the device                                  | compatibilityCheck.js:2709                                                   |
| EE_loudspeakerNotInDatabase | The loudspeaker is not in the database                                                | compatibilityCheck.js:3389                                                   |
| EE_impulseResponseLoadError | There was an error loading the impulse response. Please try calibrating again.        | soundTest.js:973, 985                                                        |
| EE_mobileIncompatible       | Your Mobile Device is incompatible with this test _(source has typo "incompatiable")_ | useCalibration.js:829                                                        |
| EE_stepWentWrong            | Something went wrong during this step                                                 | useCalibration.js:833                                                        |
| EE_errorPrintingLabel       | Error printing label: [[MESSAGE]]                                                     | useSoundCalibration.js:2196                                                  |
| EE_or                       | OR                                                                                    | compatibilityCheck.js:3515                                                   |

## Priority 6 — Cross-session EasyEyes ID upload (crossSession.js)

| Suggested key           | English text                                                                                                       | Source |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| EE_IDInvalid            | The EasyEyes ID is invalid.                                                                                        | :309   |
| EE_IDInvalidCharacters  | The EasyEyes ID contains invalid characters. Only letters and numbers are allowed.                                 | :313   |
| EE_IDUploadTitle        | Upload EasyEyes ID File                                                                                            | :332   |
| EE_IDUploadInstructions | Please upload the file downloaded when the last session ended. It's a .txt file, named starting with EasyEyesID\_. | :333   |
| EE_IDCantFindFile       | I can't find the file                                                                                              | :346   |
| EE_IDMustUpload         | You must upload a file. Otherwise, please press "I can't find the file".                                           | :364   |

## Priority 7 — Multiple displays flow (multipleDisplay.tsx)

| Suggested key                  | English text                                                                                                                                                                                                                                                                                                              | Source |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| EE_multipleMonitorsRequired    | Multiple Monitors Required                                                                                                                                                                                                                                                                                                | :229   |
| EE_multipleMonitorsExplanation | This experiment needs multiple monitors. For that, we need to open multiple browser windows as popups. Click on the Test button to make sure popups are allowed on your browser for this site. _(source has typo "monotirs")_                                                                                             | :230   |
| EE_popupsAllowedProceed        | It appears popups are allowed on your browser. Once you click on the Proceed button, the experiment will automatically open several new windows. Each of these windows is intended to be displayed on a different monitor. Please follow the instructions on each of the windows to drag them to the appropriate monitor. | :247   |
| EE_test                        | Test                                                                                                                                                                                                                                                                                                                      | :297   |
| EE_popupsAllowed               | Popups are allowed in your browser.                                                                                                                                                                                                                                                                                       | :314   |
| EE_popupsBlocked               | Popups are blocked in your browser. Please enable them and try again.                                                                                                                                                                                                                                                     | :318   |
| EE_fillAllFieldsValid          | Please fill out all fields with valid values.                                                                                                                                                                                                                                                                             | :641   |
| EE_dragToMonitor               | Drag me to monitor [[N]]                                                                                                                                                                                                                                                                                                  | :801   |

## Lower priority / possibly skip

These are visible in the browser but are mostly scientist/debug-facing (sound-test panel, calibration plots) rather than participant instructions. Decide whether they're worth translating:

- **soundTest.js** panel UI: "Generated Tones", "Masker Sounds", "Target Sounds", "Record", "Stop Recording", "Download", "Fetch Microphone Profile", "Microphone Name" / "Microphone Manufacturer" / "Serial Number" placeholders, "Please enter the microphone name, manufacturer, and serial number.", "Microphone profile found: …", "No microphone profile found. Please calibrate the microphone.", device-info labels (Target, Device Kind, OS, Make(OEM), Hardware Family, Model name, Model specifier, Calibration Date), "Loudspeaker", "Microphone".
- **soundTestPlots.js** chart axis labels: "Frequency (Hz)", "Power spectral density (dB)", "Gain (dB)", "Time (s)", "Power (dB)", "Input level …", "Output level …", "Estimated sound level (dB SPL)", "Power Variation in Wideband Recordings", "Power Variation in 1000 Hz Recordings".
- **compatibilityCheck.js:1877, 2269**: "Study URL: [[URL]]".
- **GUI.js:78–79**: "Participant", "Session" (default PsychoJS dialog fields; likely unused in the EasyEyes flow).
- **compatibilityCheck.js:3548** and **titlePage.js:55**: English fallbacks used only when an existing phrase key is missing ("My computer is custom-built, not a standard product.", "Proceed") — fix is code-side, not new phrases.

---

_Generated from a code audit of `website/docs/experiment/threshold/` on Aug 9, 2026. Excluded: console output, developer-only thrown errors, compiler/preprocessor messages (scientist-facing English by design), and strings already using `readi18nPhrases`._
