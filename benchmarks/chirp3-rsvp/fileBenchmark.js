import { readManifest, readResults, summarizeFiles, tokenize } from "./fileMetrics.mjs";
import { replayClip, replayProviders } from "./fileReplay.js";

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
const pct = (n, d) => d ? `${(100 * n / d).toFixed(1)}%` : "—";
const csvCell = (value) => {
  const text = String(value ?? "");
  const safe = typeof value === "string" && /^[\s]*[=+\-@]|^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};

async function readJson(file, maxBytes) {
  if (!file || file.size > maxBytes) throw new Error("Missing JSON file or file is too large.");
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
  let files = new Map();
  let results = new Map();
  let computed;
  let playerUrl;
  let controller;
  const status = (message) => { $("file-status").textContent = message; };
  const activeClip = () => manifest?.clips.find(({ id }) => id === $("file-clip").value);
  const showFiles = (show) => {
    if (show && !$("cancel").disabled) $("cancel").click();
    if (!show) {
      $("file-player").pause();
      controller?.abort();
    }
    $("show-files").setAttribute("aria-pressed", show);
    $("show-live").setAttribute("aria-pressed", !show);
    $("file-benchmark").hidden = !show;
    for (const id of ["settings", "arena", "live-results"]) $(id).hidden = show;
  };
  $("show-live").onclick = () => showFiles(false);
  $("show-files").onclick = () => showFiles(true);

  const resultRows = () => [...results.values()].flatMap((group) => [...group.values()]);
  const reviewed = () => manifest.clips.filter((clip) => clip.referenceStatus === "reviewed");

  function refreshReport() {
    computed = manifest && summarizeFiles(manifest.clips, results);
    const hasResults = !!computed?.summary.length;
    $("file-export-csv").disabled = !hasResults;
    $("file-export-json").disabled = !hasResults;
    const output = $("file-summary");
    output.replaceChildren();
    if (!hasResults) return;
    const { summary } = computed;
    output.append(
      node("h3", "Provider comparison · common successful clips"),
      node("p", "Failed or missing results are counted separately. A successful empty transcript counts as missed speech."),
      table(
        ["Provider", "Returned / reviewed", "Failed / missing", "Paired clips", "Words correct", "Last word correct", "Exact clips", "WER", "Sub / omitted / extra"],
        summary.map((s) => [
          s.provider, `${s.returned}/${s.reviewed}`, `${s.failed}/${s.missing}`, s.paired,
          pct(s.match, s.words),
          pct(s.byPosition.last.count - s.byPosition.last.errors, s.byPosition.last.count),
          pct(s.exact, s.paired), pct(s.substitute + s.delete + s.insert, s.words),
          `${s.substitute} / ${s.delete} / ${s.insert}`,
        ]),
      ),
    );
    for (const [title, values] of [
      ["Spoken words recognized exactly", (s) => [s.match, s.words]],
      ["Last spoken word recognized exactly", (s) => [
        s.byPosition.last.count - s.byPosition.last.errors, s.byPosition.last.count,
      ]],
    ]) {
      const chart = node("div");
      chart.className = "file-bars";
      chart.append(node("h3", title));
      for (const s of summary) {
        const [correct, total] = values(s);
        if (!total) continue;
        const label = node("label", s.provider);
        const bar = node("meter");
        bar.max = total;
        bar.value = correct;
        label.append(bar, node("span", `${correct}/${total} · ${pct(correct, total)}`));
        chart.append(label);
      }
      output.append(chart);
    }
  }

  function refreshClip(keepPlayback = false) {
    const clip = activeClip();
    const player = $("file-player");
    if (!clip) return;
    const file = files.get(clip.file);
    if (!keepPlayback) {
      player.removeAttribute("src");
      if (playerUrl) URL.revokeObjectURL(playerUrl);
      playerUrl = file ? URL.createObjectURL(file) : undefined;
      if (playerUrl) player.src = playerUrl;
      player.hidden = !playerUrl;
      $("file-reference").value = clip.reference;
    }
    const item = $("file-item-results");
    item.replaceChildren();
    const mark = clip.referenceStatus === "reviewed" ? "Reviewed" : "Candidate · needs listening";
    item.append(node("p", `${mark} · ${file ? "Audio matched" : "Audio file not selected"}`));
    const scores = computed?.details.filter((row) => row.clipId === clip.id);
    if (scores?.length)
      item.append(table(["Provider", "Recognized", "Word differences"], scores.map((row) => [
        row.provider,
        row.error || (row.transcript === "" ? "(empty transcript)" : row.transcript) || "(missing)",
        row.score?.alignment.filter(({ op }) => op !== "match")
          .map(({ op, expected, heard }) => `${op}: ${expected ?? "∅"} → ${heard ?? "∅"}`).join("; ") || "—",
      ])));
  }

  const refreshStatus = () => {
    if (!manifest) return;
    const matched = manifest.clips.filter((clip) => files.has(clip.file));
    status(`${manifest.clips.length} clips · ${matched.length} matching audio files · ${reviewed().length} reviewed references.`);
  };

  $("file-template").onclick = (event) => {
    event.preventDefault();
    json("audio-benchmark-manifest.example.json", {
      version: 1,
      audioPolicy: "local-only",
      clips: [{ id: "example-001", file: "example.wav", reference: "boat lake morning", referenceStatus: "candidate" }],
    });
  };
  $("file-manifest").onchange = async () => {
    try {
      const next = readManifest(await readJson($("file-manifest").files[0], 2 * 1024 * 1024));
      manifest = next;
      results = new Map();
      $("file-clip").replaceChildren(...manifest.clips.map((clip) => {
        const option = node("option", clip.file);
        option.value = clip.id;
        return option;
      }));
      $("file-results").value = "";
      $("file-cloud").hidden = manifest.audioPolicy !== "team-test";
      $("file-consent").checked = false;
      $("file-policy").textContent = manifest.audioPolicy === "team-test"
        ? "Selecting files does not send them. Only the explicit transcription action sends audio."
        : "Local-only: browse and review audio here, or import results from an authorized transcription run. This page will not send these audio files.";
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
        status(`Duplicate filename: ${file.name}. Select files with unique names.`);
        return;
      }
      selected.set(file.name, file);
    }
    files = selected;
    refreshClip();
    refreshStatus();
  };
  $("file-results").onchange = async () => {
    try {
      if (!manifest) throw new Error("Load the reference manifest first.");
      const incoming = readResults(await readJson($("file-results").files[0], 20 * 1024 * 1024), manifest.clips);
      for (const [provider, entries] of incoming)
        results.set(provider, new Map([...results.get(provider) ?? [], ...entries]));
      refreshReport();
      refreshClip(true);
      refreshStatus();
    } catch (error) { status(error.message); }
  };
  $("file-clip").onchange = () => refreshClip();
  $("file-confirm").onclick = () => {
    const clip = activeClip();
    const reference = $("file-reference").value.trim();
    if (!clip || !files.has(clip.file)) return status("Select the corresponding audio before reviewing a reference.");
    if (tokenize(reference).length > 160) return status("Reference exceeds 160 words.");
    if (!reference && !window.confirm("Confirm there is no spoken response in this clip?")) return;
    if (reference !== clip.reference)
      clip.previousReference ??= clip.reference;
    clip.reference = reference;
    clip.referenceStatus = "reviewed";
    refreshReport();
    refreshClip(true);
    refreshStatus();
  };
  $("file-save-manifest").onclick = () => json("audio-benchmark-manifest.json", manifest);
  $("file-export-json").onclick = () => json("audio-benchmark-results.json", {
    version: 1,
    results: resultRows(),
    summary: computed.summary,
    details: computed.details,
  });
  $("file-export-csv").onclick = () => {
    const header = ["provider", "reviewed", "returned", "failed", "missing", "paired", "reference_words", "matched_words", "substitutions", "omissions", "insertions", "exact_clips", "first_words", "first_errors", "middle_words", "middle_errors", "last_words", "last_errors", "last_omissions"];
    const rows = computed.summary.map((s) => [
      s.provider, s.reviewed, s.returned, s.failed, s.missing, s.paired, s.words, s.match, s.substitute, s.delete, s.insert, s.exact,
      s.byPosition.first.count, s.byPosition.first.errors, s.byPosition.middle.count, s.byPosition.middle.errors,
      s.byPosition.last.count, s.byPosition.last.errors, s.byPosition.last.omitted,
    ]);
    download("audio-benchmark-metrics.csv", [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv");
  };
  $("file-cancel").onclick = () => controller?.abort();
  $("file-run").onclick = async () => {
    if (controller || manifest?.audioPolicy !== "team-test") return;
    const accessCode = $("file-code").value.trim();
    const keys = [...document.querySelectorAll('input[name="file-provider"]:checked')].map((input) => input.value);
    if (!$("file-consent").checked || !/^[0-9a-f]{64}$/i.test(accessCode) || !keys.length)
      return status("Confirm team-audio permission, enter the preview code, and choose providers.");
    const pending = reviewed().filter((clip) => files.has(clip.file) && keys.some((key) =>
      typeof results.get(replayProviders[key])?.get(clip.id)?.transcript !== "string"));
    const unattempted = (clip) => keys.some((key) => !results.get(replayProviders[key])?.has(clip.id));
    pending.sort((a, b) => Number(unattempted(b)) - Number(unattempted(a)));
    if (!pending.length) return status("No pending reviewed clips with matching audio.");
    controller = new AbortController();
    const { signal } = controller;
    for (const id of ["file-manifest", "file-audio", "file-results", "file-run", "file-confirm"])
      $(id).disabled = true;
    $("file-cancel").disabled = false;
    let warning = false;
    try {
      const batch = pending.slice(0, 20);
      for (const [index, clip] of batch.entries()) {
        if (signal.aborted) break;
        status(`Transcribing clip ${index + 1} of ${batch.length}. Leave this tab open.`);
        const missing = keys.filter((key) => typeof results.get(replayProviders[key])?.get(clip.id)?.transcript !== "string");
        const output = await replayClip(files.get(clip.file), clip.id, missing, accessCode, signal);
        warning ||= output.warning;
        const incoming = readResults({ version: 1, results: output.rows }, manifest.clips);
        for (const [provider, entries] of incoming)
          results.set(provider, new Map([...results.get(provider) ?? [], ...entries]));
        refreshReport();
        refreshClip(true);
      }
      status(signal.aborted ? "Cancelled. Completed results are kept in this tab."
        : "Batch complete. You can export results or transcribe the next batch.");
    } catch (error) { status(error.message); }
    finally {
      if (warning) $("file-policy").textContent = "ElevenLabs reported that zero retention was not applied to a team test clip.";
      controller = undefined;
      for (const id of ["file-manifest", "file-audio", "file-results", "file-run", "file-confirm"])
        $(id).disabled = false;
      $("file-cancel").disabled = true;
    }
  };
}
