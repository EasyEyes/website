import { readManifest, readResults, summarizeReviews, summarizeKeytermPairs } from "./fileMetrics.mjs";
import { replayClip, replayProviders, replayLabel } from "./fileReplay.js";
import { fileKeyterms, fileRsvpScorer, makeRsvpCases } from "./fileRsvpScore.js";
import { manifestKey, qualityLabels, readReviews } from "./fileReview.mjs";
import { csvMetricRows, node, renderFileReport, table } from "./fileReport.js";
import { createFileProgress } from "./fileProgress.js";

const keytermVariants = Object.entries(replayProviders).map(([key, provider]) => ({
  provider, off: replayLabel(key, false), on: replayLabel(key, true),
}));

const $ = (id) => document.getElementById(id);
function download(name, content, type) {
  const link = node("a");
  const url = URL.createObjectURL(new Blob([content], { type }));
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const json = (name, data) => download(name, JSON.stringify(data, null, 2), "application/json");
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

export function setupFileBenchmark() {
  let manifest;
  let clips = [];
  let files = new Map();
  let results = new Map();
  let reviews = new Map();
  let computed, selectedProvider, audioUrl, audioClip, audioFile, reviewedClip;
  let controller;
  const progress = createFileProgress();
  const status = (message) => { $("file-status").textContent = message; };
  const ignoreOrder = () => $("file-ignore-order").checked;
  const score = () => fileRsvpScorer(ignoreOrder());
  const showFiles = (show) => {
    if (show && !$("cancel").disabled) $("cancel").click();
    if (!show) {
      controller?.abort();
      $("file-player").pause();
    }
    $("show-files").setAttribute("aria-pressed", show);
    $("show-live").setAttribute("aria-pressed", !show);
    $("file-benchmark").hidden = !show;
    for (const id of ["settings", "arena", "live-results"]) $(id).hidden = show;
  };
  $("show-live").onclick = () => showFiles(false);
  $("show-files").onclick = () => showFiles(true);
  const resultRows = () => [...results.values()].flatMap((group) => [...group.values()]);

  function refreshReport() {
    if (!manifest) return;
    const scorer = score();
    const memo = new Map();
    const cachedScore = (targets, transcript) => {
      const key = JSON.stringify([targets, transcript]);
      if (!memo.has(key)) memo.set(key, scorer(targets, transcript));
      return memo.get(key);
    };
    computed = summarizeReviews(clips, results, cachedScore, reviews, ignoreOrder());
    for (const report of Object.values(computed.reports))
      report.keytermPairs = summarizeKeytermPairs(report.clips, report.details, keytermVariants);
    const hasResults = !!results.size;
    $("file-export-csv").disabled = !!controller || !hasResults;
    $("file-export-json").disabled = !hasResults && !reviews.size;
    $("file-scope-label").hidden = !hasResults;
    drawReport();
    refreshClipList(true);
  }

  const drawReport = () => renderFileReport($("file-summary"), computed, $("file-scope").value,
    selectedProvider, (value) => { selectedProvider = value; });

  function setAudio(clip) {
    const player = $("file-player");
    const file = clip && files.get(clip.file);
    if (audioClip === clip?.id && audioFile === file) return;
    player.pause();
    player.removeAttribute("src");
    player.load();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = file && URL.createObjectURL(file);
    audioClip = clip?.id;
    audioFile = file;
    player.hidden = !audioUrl;
    if (audioUrl) player.src = audioUrl;
    $("file-player-status").textContent = clip && !file ? "Select the matching audio file to listen here." : "";
  }

  function refreshClipList(keepCurrent = false) {
    const picker = $("file-clip");
    const previous = picker.value;
    const filter = $("file-review-filter").value;
    const errors = filter === "error" ? new Set(computed.reports.adjudicated.details
      .filter((row) => row.differences && !row.differences.exact).map((row) => row.clipId)) : null;
    const visible = clips.filter((clip) => {
      const quality = reviews.get(clip.id)?.quality ?? "unreviewed";
      if (filter === "diff") return quality === "unreviewed" &&
        (clip.referenceStatus === "needsReview" || clip.expected.includes(0));
      if (filter === "flagged") return ["difficult", "unclear", "invalid"].includes(quality);
      return !errors || errors.has(clip.id);
    });
    if (keepCurrent && previous && !visible.some((clip) => clip.id === previous)) {
      const clip = clips.find((clip) => clip.id === previous);
      if (clip) visible.unshift(clip);
    }
    picker.replaceChildren(...visible.map((clip) => {
      const tag = [clip.file, clip.speakerGroup, clip.referenceStatus === "needsReview" ? "check reference" : null].filter(Boolean);
      const option = node("option", tag.join(" · "));
      option.value = clip.id;
      return option;
    }));
    if (visible.some((clip) => clip.id === previous)) picker.value = previous;
    picker.disabled = !visible.length;
    refreshClip();
  }

  function saveReview(clip, review, message) {
    const updated = { clipId: clip.id, ...review };
    if (updated.quality === "unreviewed" && updated.reference === undefined && !updated.predictions.length)
      reviews.delete(clip.id);
    else reviews.set(clip.id, updated);
    refreshReport();
    $("file-review-status").textContent = message;
  }

  function refreshClip() {
    const picker = $("file-clip");
    const clip = clips.find(({ id }) => id === picker.value);
    const item = $("file-item-results");
    const sameClip = reviewedClip === clip?.id;
    const openProviders = new Set(sameClip
      ? [...item.querySelectorAll("details[open]")].map((section) => section.dataset.provider)
      : []);
    reviewedClip = clip?.id;
    item.replaceChildren();
    setAudio(clip);
    $("file-prev").disabled = picker.selectedIndex <= 0;
    $("file-next").disabled = !clip || picker.selectedIndex >= picker.length - 1;
    if (!clip) return item.append(node("p", "No clips match this filter."));
    const review = reviews.get(clip.id) ?? { quality: "unreviewed", predictions: [] };
    const reference = review.reference ?? clip.reference;
    const expected = review.reference === undefined ? clip.expected : score()(clip.targets, reference).vector;
    item.append(
      node("p", [clip.speakerGroup ?? "Participant not supplied", clip.session, clip.list && "Task " + clip.list].filter(Boolean).join(" · ")),
      node("p", "Targets: " + clip.targets.join(", ") + " · Expected: " + expected.join("")),
      node("p", "Original human transcript: " + (clip.reference || "(empty)")),
    );
    const form = node("form");
    form.className = "file-review-form";
    const quality = node("select");
    const qualityLabel = node("label", "Audio quality / review status");
    qualityLabel.append(quality);
    for (const [key, label] of Object.entries(qualityLabels)) {
      const option = node("option", label);
      option.value = key;
      quality.append(option);
    }
    quality.value = review.quality;
    const field = node("textarea");
    field.maxLength = 1500;
    field.value = reference;
    const correction = node("label", "Human transcript · edit only if the original is wrong");
    correction.append(field, node("small", "Leave empty only if no words were spoken. Targets do not change."));
    const save = node("button", "Save audio / reference review");
    save.type = "submit";
    form.append(qualityLabel);
    if (clip.targetSource === "explicit") form.append(correction);
    else form.append(node("p", "Supply explicit targets in the manifest to edit the reference or review individual target decisions."));
    form.append(save);
    form.onsubmit = (event) => {
      event.preventDefault();
      const text = field.value.trim();
      const changed = clip.targetSource === "explicit" && text !== clip.reference.trim();
      saveReview(clip, { ...review, quality: quality.value, reference: changed ? text : undefined }, "Audio / reference review saved.");
    };
    item.append(form);
    const raw = computed?.reports.original.details.filter((row) => row.clipId === clip.id) ?? [];
    const reviewed = new Map(computed?.reports.adjudicated.details.filter((row) => row.clipId === clip.id).map((row) => [row.provider, row]));
    if (!raw.length) return;
    item.append(node("h4", "Provider decisions by target"),
      node("p", "Judge whether the provider’s text contains the target, not whether the child said it. If the model actually missed a word, leave the error in place. Override only if the automatic text scorer misread the provider’s output."));
    for (const row of raw) {
      const section = node("details");
      section.dataset.provider = row.provider;
      section.open = openProviders.has(row.provider) || (!sameClip && raw.length === 1);
      const effective = reviewed.get(row.provider);
      const actual = effective ?? row;
      const result = actual.vector ? actual.vector.join("") : "not scored";
      section.append(node("summary", row.provider + " · " + result));
      if (!row.vector) section.append(node("p", row.error || "No result"));
      else {
        section.append(node("p", "Provider text: " + (row.transcript || "(empty)")),
          node("p", "Normalized: " + (row.normalized || "(empty)") +
            (effective ? "" : " · excluded from reviewed statistics")));
        const match = (d) => d.provider === row.provider && d.transcript === row.transcript && d.ignoreOrder === ignoreOrder();
        const stored = review.predictions.find(match);
        const controls = [];
        section.append(table(
          ["Target", "Human bit", "Automatic STT bit", "Effective STT bit", "Decision", "Scorer review"],
          clip.targets.map((target, i) => {
            const control = node("select");
            control.setAttribute("aria-label", "Review " + target + " for " + row.provider);
            for (const [key, label] of [["", "Automatic"], ["1", "Target present (1)"], ["0", "Target absent (0)"]]) {
              const option = node("option", label);
              option.value = key;
              control.append(option);
            }
            control.value = String(stored?.bits[i] ?? "");
            controls.push(control);
            const bit = actual.vector[i];
            return [target, expected[i], row.vector[i], bit,
              expected[i] === bit ? "Agrees" : expected[i] ? "Missed target" : "False credit",
              clip.targetSource === "explicit" && effective ? control : "—"];
          }),
        ));
        if (clip.targetSource === "explicit" && effective) {
          const button = node("button", "Save target decisions");
          button.type = "button";
          button.onclick = () => {
            const bits = controls.map((field) => field.value === "" ? null : Number(field.value));
            const predictions = review.predictions.filter((d) => !match(d) &&
              !(d.provider === row.provider && d.ignoreOrder === ignoreOrder()));
            if (bits.some((bit) => bit !== null))
              predictions.push({ provider: row.provider, transcript: row.transcript, ignoreOrder: ignoreOrder(), bits });
            saveReview(clip, { ...review, predictions }, "Target decisions saved. Provider text and the original report are unchanged.");
          };
          section.append(button);
        }
      }
      item.append(section);
    }
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
        { id: "example-001", file: "example.wav", reference: "boat lake morning", targets: ["boat", "lake", "morning"], speakerGroup: "participant-01" },
        { id: "example-002", file: "example-2.wav", reference: "boat lake money", targets: ["boat", "lake", "morning"], speakerGroup: "participant-01" },
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
      reviews = new Map();
      progress.reset();
      reviewedClip = undefined;
      $("file-review-filter").value = "all";
      $("file-clip").replaceChildren();
      $("file-review-status").textContent = "";
      $("file-results").value = "";
      $("file-consent").checked = false;
      $("file-policy").textContent = "Nothing is sent before you press Run dataset. With keyterms on, the selected providers also receive the target words, or words from the reference when targets are not supplied.";
      $("file-review").hidden = false;
      refreshReport();
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
    refreshClip();
    refreshStatus();
  };
  $("file-results").onchange = async () => {
    try {
      if (!manifest) throw new Error("Load the reference manifest first.");
      const data = await readJson($("file-results").files[0], 256);
      if (data.manifestKey !== undefined && data.manifestKey !== manifestKey(manifest.clips))
        throw new Error("These results do not match the loaded reference manifest.");
      const incoming = readResults(data, clips);
      const saved = readReviews(data, manifest.clips);
      merge(incoming);
      for (const [id, row] of saved) reviews.set(id, row);
      refreshReport();
      refreshStatus();
    } catch (error) { status(error.message); }
  };
  const navigate = () => {
    $("file-review-status").textContent = "";
    refreshClip();
  };
  $("file-clip").onchange = navigate;
  $("file-prev").onclick = () => { $("file-clip").selectedIndex--; navigate(); };
  $("file-next").onclick = () => { $("file-clip").selectedIndex++; navigate(); };
  $("file-review-filter").onchange = () => {
    $("file-review-status").textContent = "";
    refreshClipList();
  };
  $("file-scope").onchange = drawReport;
  $("file-ignore-order").onchange = () => {
    if (!manifest) return;
    clips = makeRsvpCases(manifest.clips, score());
    refreshReport();
  };
  $("file-export-json").onclick = () => json("rsvp-dataset-results.json", {
    version: 1,
    manifestKey: manifestKey(manifest.clips),
    settings: { ignoreOrder: ignoreOrder() },
    results: resultRows(),
    reviews: [...reviews.values()],
    quality: controller ? undefined : computed.quality,
    reports: controller ? undefined : Object.fromEntries(Object.entries(computed.reports).map(([key, report]) =>
      [key, { summary: report.summary, keytermPairs: report.keytermPairs,
        details: key === "unflagged" ? undefined : report.details }])),
  });
  $("file-export-csv").onclick = () => {
    download("rsvp-dataset-metrics.csv",
      csvMetricRows(computed).map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=UTF-8");
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
    const mode = $("file-keyterms").value;
    const variants = mode === "both" ? [false, true] : [mode === "on"];
    const missingResults = (clip, providers, enabled) => providers.filter((key) =>
      typeof results.get(replayLabel(key, enabled))?.get(clip.id)?.transcript !== "string");
    const remaining = clips.flatMap((clip) => variants
      .filter((enabled) => missingResults(clip, keys, enabled).length)
      .map((enabled) => ({ clip, enabled })));
    const attemptedBefore = ({ clip, enabled }) => missingResults(clip, keys, enabled).every((key) =>
      results.get(replayLabel(key, enabled))?.has(clip.id));
    remaining.sort((a, b) => Number(attemptedBefore(a)) - Number(attemptedBefore(b)));
    const limit = $("file-batch-limit").value;
    const pending = (limit === "all" ? remaining : remaining.slice(0, Number(limit)))
      .map((run) => ({ ...run, providers: missingResults(run.clip, keys, run.enabled) }));
    if (!pending.length) return status("All selected providers have results for this dataset.");
    const missingFiles = [...new Set(pending.map(({ clip }) => clip.file).filter((file) => !files.has(file)))];
    if (missingFiles.length) return status(
      missingFiles.length + " audio files missing. First missing file: " + missingFiles[0]
    );

    controller = new AbortController();
    const { signal } = controller;
    const controls = ["file-manifest", "file-audio", "file-results", "file-run", "file-ignore-order", "file-keyterms", "file-batch-limit"];
    for (const id of controls) $(id).disabled = true;
    $("file-cancel").disabled = false;
    $("file-export-csv").disabled = true;
    const byProvider = new Map(keys.map((key) => {
      const success = variants.reduce((sum, enabled) => sum +
        clips.filter((clip) => !missingResults(clip, [key], enabled).length).length, 0);
      return [key, { total: clips.length * variants.length, success, failed: 0 }];
    }));
    progress.start(pending.reduce((total, run) => total + run.providers.length, 0), byProvider);
    const stopped = new Set();
    let warning = false, attempted = 0;
    let batchState = "Batch finished";
    try {
      for (const [index, { clip, enabled, providers }] of pending.entries()) {
        if (signal.aborted || stopped.size === keys.length) break;
        const selected = providers.filter((key) => !stopped.has(key));
        if (!selected.length) continue;
        const terms = enabled ? fileKeyterms(clip.targets) : null;
        status(`Processing run ${index + 1} of ${pending.length} · ${clip.file}`);
        progress.clip(clip.file, enabled, selected, index + 1, pending.length);
        const output = await replayClip(files.get(clip.file), clip.id, selected, accessCode,
          signal, nextTicketAt, terms, (key, phase, row) => {
            if (row) {
              merge(readResults({ version: 1, results: [row] }, [clip]));
              $("file-export-json").disabled = false;
              if (/^Ticket HTTP (401|403|429|502|503)$/.test(row.error ?? "")) stopped.add(key);
            }
            progress.update(key, phase, row);
          });
        warning ||= output.warning;
        if (signal.aborted) break;
        attempted++;
      }
      const suffix = stopped.size ? " Paused providers: " + [...stopped].join(", ") + ". Check the error in the clip report and run again to resume." : "";
      const unit = mode === "both" ? " clip runs." : " clips.";
      const left = remaining.filter(({ clip, enabled }) => missingResults(clip, keys, enabled).length).length;
      if (signal.aborted) batchState = "Cancelled · finished results are saved in this tab";
      else if (stopped.size) batchState = "Batch paused for " + [...stopped].map((key) => replayProviders[key]).join(", ");
      status((signal.aborted ? "Cancelled after " : "Run ended after ") + attempted + unit +
        (left ? ` ${left} runs still need results. Export JSON to keep progress.` : " Results are kept in this tab.") + suffix);
    } catch (error) {
      batchState = "Batch stopped: " + error.message;
      status(error.message);
    }
    finally {
      progress.end(batchState);
      if (warning) $("file-policy").textContent = "ElevenLabs reported that zero retention was not applied.";
      controller = undefined;
      for (const id of controls) $(id).disabled = false;
      $("file-cancel").disabled = true;
      refreshReport();
    }
  };
}
