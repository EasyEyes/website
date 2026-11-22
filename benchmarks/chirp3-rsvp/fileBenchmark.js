import { readManifest, readResults, summarizeFiles } from "./fileMetrics.mjs";
import { replayClip, replayProviders } from "./fileReplay.js";
import { fileRsvpScorer, makeRsvpCases } from "./fileRsvpScore.js";

const $ = (id) => document.getElementById(id);
function node(tag, text) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  return element;
}

function download(name, content, type) {
  const link = node("a");
  const url = URL.createObjectURL(new Blob([content], { type }));
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const json = (name, data) => download(name, JSON.stringify(data, null, 2), "application/json");
const pct = (n, d) => d ? (100 * n / d).toFixed(1) + "%" : "—";
const csvCell = (value) => {
  const text = String(value ?? "");
  const safe = typeof value === "string" && /^\s*[=+\-@]|^[\t\r\n]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
};

async function readJson(file, maxMB) {
  if (!file || file.size > maxMB * 1024 * 1024)
    throw new Error("Missing JSON file or file is too large.");
  return JSON.parse(await file.text());
}

const table = (headers, rows) => {
  const wrap = node("div");
  wrap.className = "file-table";
  const t = node("table");
  const head = t.createTHead().insertRow();
  for (const heading of headers) head.append(node("th", heading));
  const body = t.createTBody();
  for (const row of rows) {
    const tr = body.insertRow();
    for (const value of row) tr.append(node("td", value));
  }
  wrap.append(t);
  return wrap;
};

export function setupFileBenchmark() {
  let manifest;
  let clips = [];
  let files = new Map();
  let results = new Map();
  let computed;
  let controller;
  const status = (message) => { $("file-status").textContent = message; };
  const score = () => fileRsvpScorer($("file-ignore-order").checked);
  const showFiles = (show) => {
    if (show && !$("cancel").disabled) $("cancel").click();
    if (!show) controller?.abort();
    $("show-files").setAttribute("aria-pressed", show);
    $("show-live").setAttribute("aria-pressed", !show);
    $("file-benchmark").hidden = !show;
    for (const id of ["settings", "arena", "live-results"]) $(id).hidden = show;
  };
  $("show-live").onclick = () => showFiles(false);
  $("show-files").onclick = () => showFiles(true);
  const resultRows = () => [...results.values()].flatMap((group) => [...group.values()]);

  function refreshReport() {
    computed = manifest && summarizeFiles(clips, results, score());
    const hasResults = !!computed?.summary.length;
    $("file-export-csv").disabled = !hasResults;
    $("file-export-json").disabled = !hasResults;
    const output = $("file-summary");
    output.replaceChildren();
    if (!hasResults) return;
    const { summary } = computed;
    output.append(
      node("h3", "RSVP score comparison · common successful clips"),
      node("p", "Missed correct = expected 1, got 0. False credit = expected 0, got 1. When no targets are supplied, reference-derived targets only test missed correct answers. Failed or missing results are reported separately."),
      table(
        ["Provider", "Returned / clips", "Failed / missing", "Paired clips", "Exact vectors", "Missed correct", "False credit", "Last target agreement"],
        summary.map((s) => [
          s.provider, s.returned + "/" + s.clips, s.failed + "/" + s.missing, s.paired,
          pct(s.exact, s.paired), pct(s.falseNeg, s.positives), pct(s.falsePos, s.negatives),
          pct(s.paired - s.lastErrors, s.paired),
        ]),
      ),
    );
    if (summary.some((s) => s.returned > s.paired)) output.append(
      node("h3", "Each provider's available clips"),
      node("p", "These sets may differ. Use the common-clips table for a paired comparison."),
      table(["Provider", "Clips", "Exact vectors", "Missed correct", "False credit"],
        summary.map(({ provider, returned, allReturned: s }) => [
          provider, returned, pct(s.exact, returned), pct(s.falseNeg, s.positives), pct(s.falsePos, s.negatives),
        ])),
    );
    for (const [title, values] of [
      ["Exact RSVP score vectors", (s) => [s.exact, s.paired]],
      ["Missed correct targets · lower is better", (s) => [s.falseNeg, s.positives]],
      ["False credit · lower is better", (s) => [s.falsePos, s.negatives]],
    ]) {
      const chart = node("div");
      chart.className = "file-bars";
      chart.append(node("h3", title));
      for (const s of summary) {
        const [count, total] = values(s);
        const label = node("label", s.provider);
        const value = node("span", total ? count + "/" + total + " · " + pct(count, total) : "Not measured");
        const bar = node("meter");
        bar.max = total || 1;
        bar.value = count;
        label.append(total ? bar : node("span"), value);
        chart.append(label);
      }
      output.append(chart);
    }
    refreshClip();
  }

  function refreshClip() {
    const clip = clips.find(({ id }) => id === $("file-clip").value);
    const item = $("file-item-results");
    item.replaceChildren();
    if (!clip) return;
    item.append(
      node("p", "Reference: " + (clip.reference || "(empty)")),
      node("p", "Targets: " + clip.targets.join(", ") + " · Expected: " + clip.expected.join("")),
    );
    const scores = computed?.details.filter((row) => row.clipId === clip.id);
    if (scores?.length) item.append(table(
      ["Provider", "Recognized", "Normalized", "RSVP vector", "Missed / false credit"],
      scores.map((row) => [
        row.provider,
        row.error || (row.transcript === "" ? "(empty transcript)" : row.transcript),
        row.normalized ?? "—", row.vector?.join("") ?? "—",
        row.differences
          ? row.differences.falseNeg.length + " / " + row.differences.falsePos.length : "—",
      ]),
    ));
  }

  const refreshStatus = () => {
    if (!manifest) return;
    const matched = clips.filter((clip) => files.has(clip.file));
    status(clips.length + " clips · " + matched.length + " matching audio files.");
  };
  function merge(incoming) {
    for (const [provider, entries] of incoming) {
      const existing = results.get(provider) ?? new Map();
      for (const [id, row] of entries) existing.set(id, row);
      results.set(provider, existing);
    }
  }

  $("file-template").onclick = (event) => {
    event.preventDefault();
    json("rsvp-dataset-manifest.example.json", {
      version: 1,
      clips: [
        { id: "example-001", file: "example.wav", reference: "boat lake morning" },
        { id: "example-002", file: "example-2.wav", reference: "boat lake money", targets: ["boat", "lake", "morning"] },
      ],
    });
  };
  $("file-manifest").onchange = async () => {
    try {
      const next = readManifest(await readJson($("file-manifest").files[0], 16));
      const cases = makeRsvpCases(next.clips, score());
      manifest = next;
      clips = cases;
      results = new Map();
      $("file-clip").replaceChildren(...clips.map((clip) => {
        const option = node("option", clip.file);
        option.value = clip.id;
        return option;
      }));
      $("file-results").value = "";
      $("file-consent").checked = false;
      $("file-policy").textContent = "No files are sent before you press Run dataset. References and targets are used for scoring only, never sent as keyterms.";
      $("file-review").hidden = false;
      refreshReport();
      refreshClip();
      refreshStatus();
    } catch (error) { status(error.message); }
  };
  $("file-audio").onchange = () => {
    const selected = new Map();
    for (const file of $("file-audio").files) {
      if (selected.has(file.name)) {
        status("Duplicate filename: " + file.name + ". Select files with unique names.");
        return;
      }
      selected.set(file.name, file);
    }
    files = selected;
    refreshStatus();
  };
  $("file-results").onchange = async () => {
    try {
      if (!manifest) throw new Error("Load the reference manifest first.");
      const data = await readJson($("file-results").files[0], 256);
      merge(readResults(data, clips));
      refreshReport();
      refreshStatus();
    } catch (error) { status(error.message); }
  };
  $("file-clip").onchange = refreshClip;
  $("file-ignore-order").onchange = () => {
    if (!manifest) return;
    clips = makeRsvpCases(manifest.clips, score());
    refreshReport();
    refreshClip();
  };
  $("file-export-json").onclick = () => json("rsvp-dataset-results.json", {
    version: 1,
    settings: { ignoreOrder: $("file-ignore-order").checked, targetHintsSent: false },
    results: resultRows(),
    summary: computed.summary,
    details: computed.details,
  });
  $("file-export-csv").onclick = () => {
    const header = ["provider", "clips", "returned", "failed", "missing", "paired", "exact_vectors", "exact_vectors_pct", "expected_ones", "missed_correct", "missed_correct_pct", "expected_zeros", "false_credit", "false_credit_pct", "last_target_errors", "explicit_target_clips", "reference_target_clips", "all_returned_exact_pct", "all_returned_missed_correct_pct", "all_returned_false_credit_pct"];
    const rows = computed.summary.map((s) => [
      s.provider, s.clips, s.returned, s.failed, s.missing, s.paired,
      s.exact, pct(s.exact, s.paired), s.positives, s.falseNeg, pct(s.falseNeg, s.positives),
      s.negatives, s.falsePos, pct(s.falsePos, s.negatives), s.lastErrors, s.explicitClips, s.referenceClips,
      pct(s.allReturned.exact, s.returned),
      pct(s.allReturned.falseNeg, s.allReturned.positives),
      pct(s.allReturned.falsePos, s.allReturned.negatives),
    ]);
    download("rsvp-dataset-metrics.csv", [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv");
  };
  $("file-cancel").onclick = () => controller?.abort();

  const nextTicketAt = new Map();
  $("file-run").onclick = async () => {
    if (controller) return;
    if (!manifest) return status("Load a reference manifest first.");
    const accessCode = $("file-code").value.trim() || $("access-code").value.trim();
    const keys = [...document.querySelectorAll('input[name="file-provider"]:checked')].map((input) => input.value);
    if (!$("file-consent").checked || !/^[0-9a-f]{64}$/i.test(accessCode) || !keys.length)
      return status("Confirm you can send these files, enter the preview code, and choose providers.");
    const missingResults = (clip, providers) => providers.filter((key) =>
      typeof results.get(replayProviders[key])?.get(clip.id)?.transcript !== "string");
    const pending = clips.filter((clip) => missingResults(clip, keys).length);
    if (!pending.length) return status("All selected providers have results for this dataset.");
    const missingFiles = pending.filter((clip) => !files.has(clip.file));
    if (missingFiles.length) return status(
      missingFiles.length + " audio files missing. First missing file: " + missingFiles[0].file
    );

    controller = new AbortController();
    const { signal } = controller;
    const controls = ["file-manifest", "file-audio", "file-results", "file-run", "file-ignore-order"];
    for (const id of controls) $(id).disabled = true;
    $("file-cancel").disabled = false;
    const stopped = new Set();
    let warning = false, attempted = 0;
    try {
      for (const [index, clip] of pending.entries()) {
        const selected = missingResults(clip, keys).filter((key) => !stopped.has(key));
        if (signal.aborted || stopped.size === keys.length) break;
        if (!selected.length) continue;
        status("Processing " + (index + 1) + " of " + pending.length + " pending clips. Leave this tab open.");
        const output = await replayClip(files.get(clip.file), clip.id, selected, accessCode, signal, nextTicketAt);
        if (signal.aborted) break;
        attempted++;
        warning ||= output.warning;
        merge(readResults({ version: 1, results: output.rows }, [clip]));
        for (const row of output.rows) {
          if (/^Ticket HTTP (401|403|429|502|503)$/.test(row.error ?? "")) {
            const key = selected.find((item) => replayProviders[item] === row.provider);
            if (key) stopped.add(key);
          }
        }
      }
      const suffix = stopped.size ? " Paused providers: " + [...stopped].join(", ") + ". Check the error in the clip report and run again to resume." : "";
      status((signal.aborted ? "Cancelled after " : "Run ended after ") + attempted + " clips. Results are kept in this tab." + suffix);
    } catch (error) { status(error.message); }
    finally {
      if (warning) $("file-policy").textContent = "ElevenLabs reported that zero retention was not applied.";
      controller = undefined;
      for (const id of controls) $(id).disabled = false;
      $("file-cancel").disabled = true;
      refreshReport();
    }
  };
}
