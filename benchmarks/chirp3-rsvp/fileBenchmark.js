import { excludeTrailingSDisagreements, readManifest, readResults, referenceCorrectionImpact, summarizeReviews, summarizeKeytermPairs } from "./fileMetrics.mjs";
import { replayClip, replayProviders, replayLabel } from "./fileReplay.js";
import { fileKeyterms, fileRsvpScorer, fileTranscriptWords, makeRsvpCases } from "./fileRsvpScore.js";
import { buildReviewQueue, manifestKey, providerReviewFor, qualityLabels, readReviews, reviewFilters } from "./fileReview.mjs";
import { csvMetricRows, node, pct, renderFileReport, table } from "./fileReport.js";
import { createFileProgress } from "./fileProgress.js";
import { byteAgreement, isTailLabel, summarizeTailPairs, tailLabel, tailVariants } from "./fileDiagnostics.mjs";

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
const providerDraftKey = (clip, row) => JSON.stringify([clip.id, row.provider, row.transcript]);

async function readJson(file, maxMB) {
  if (!file || file.size > maxMB * 1024 * 1024)
    throw new Error("Missing JSON file or file is too large.");
  return JSON.parse(await file.text());
}

function noteField(title, value) {
  const label = node("label", title);
  const input = node("textarea");
  input.maxLength = 2000;
  input.value = value ?? "";
  label.append(input);
  return { label, input };
}

export function setupFileBenchmark() {
  let manifest;
  let clips = [];
  let files = new Map();
  let results = new Map();
  let reviews = new Map();
  const drafts = new Map();
  const recentReviews = new Set();
  let visibleClips = [], navigationIds = [], clipOrder = new Map();
  let computed, filteredReports, queue, selectedProvider, overlap, audioUrl, audioClip, audioFile, reviewedClip;
  let correctionImpact = [];
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
  const tailReports = () => {
    const rows = [...results].filter(([label]) => isTailLabel(label)).flatMap(([, group]) => [...group.values()]);
    if (!rows.length) return [];
    const targets = new Map(clips.map((clip) => [clip.id, clip.targets.length]));
    return [false, true].map((keyterms) => ({ keyterms, ...summarizeTailPairs(rows, targets,
      ...tailVariants.map((ms) => tailLabel(replayLabel("chirp3", keyterms), ms))) }))
      .filter((report) => report.attempted);
  };

  function drawTailReport() {
    const output = $("file-tail-summary");
    const report = tailReports();
    output.hidden = !report.length;
    output.replaceChildren();
    for (const r of report) {
      output.append(node("h3", "Chirp 3 tail silence · keyterms " + (r.keyterms ? "on" : "off")),
        node("p", `Complete pairs: ${r.paired}/${r.attempted}. Fewer words than targets: ${r.beforeShort} at 0 ms → ${r.afterShort} at 800 ms (paired only). Recovered count: ${r.recovered}. New short outputs: ${r.regressed}. Word count does not prove accuracy.`),
        node("p", `Byte checks across both runs: ${r.byteMatches} matched, ${r.byteMismatches} mismatched, ${r.byteUnavailable} unavailable. A missing server trace means the relay may not have tracing enabled; browser data are still saved.`));
      const details = node("details");
      details.append(node("summary", "Compare file transcripts and byte counts"), table(
        ["File", "0 ms text", "800 ms text", "0 ms · bytes", "800 ms · bytes"],
        r.details.map(({ id, before, after }) => {
          const result = (row) => row?.error ?? row?.transcript ?? "—";
          const bytes = (row) => {
            const e = row?.evidence;
            return e ? [e.expectedPcmBytes, e.browserSentBytes, e.relay?.receivedBytes, e.relay?.writtenBytes]
              .map((n) => n ?? "—").join(" / ") + " · " + byteAgreement(e) : "—";
          };
          return [id, result(before), result(after), bytes(before), bytes(after)];
        }),
      ));
      output.append(node("p", "Bytes are shown as expected / browser sent / relay received / gRPC written. Full segments, offsets and timing are in the JSON export."), details);
    }
  }

  function refreshReport(navigation) {
    if (!manifest) return;
    const scorer = score();
    const memo = new Map();
    const cachedScore = (targets, transcript) => {
      const key = JSON.stringify([targets, transcript]);
      if (!memo.has(key)) memo.set(key, scorer(targets, transcript));
      return memo.get(key);
    };
    const normal = new Map([...results].filter(([label]) => !isTailLabel(label)));
    computed = summarizeReviews(clips, normal, cachedScore, reviews, ignoreOrder());
    filteredReports = undefined;
    correctionImpact = referenceCorrectionImpact(computed.reports.original, computed.reports.adjudicated, reviews);
    for (const report of Object.values(computed.reports))
      report.keytermPairs = summarizeKeytermPairs(report.clips, report.details, keytermVariants);
    const hasResults = !!results.size;
    $("file-export-csv").disabled = !!controller || !normal.size;
    $("file-export-json").disabled = !hasResults && !reviews.size;
    $("file-scope-label").hidden = !normal.size;
    $("file-s-only-label").hidden = !normal.size;
    drawReport();
    drawTailReport();
    refreshReviewQueue(navigation);
  }

  function reportWithTrailingSFilter() {
    if (!computed || !$("file-s-only").checked) return undefined;
    return filteredReports ??= Object.fromEntries(Object.entries(computed.reports).map(([scope, report]) => {
      const filtered = excludeTrailingSDisagreements(report, fileTranscriptWords);
      filtered.keytermPairs = summarizeKeytermPairs(filtered.clips, filtered.details, keytermVariants);
      return [scope, filtered];
    }));
  }

  const drawReport = () => renderFileReport($("file-summary"), computed, $("file-scope").value,
    selectedProvider, (value) => { selectedProvider = value; }, overlap, (pair) => { overlap = pair; },
    reportWithTrailingSFilter());

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

  function refreshReviewQueue(navigation) {
    const model = $("file-review-provider");
    const selected = model.value;
    const normal = [...results.keys()].filter((label) => !isTailLabel(label));
    if (model.options.length !== normal.length + 1 ||
        normal.some((label, index) => model.options[index + 1].value !== label)) {
      model.replaceChildren(...["", ...normal].map((label) => {
        const option = node("option", label || "All models");
        option.value = label;
        return option;
      }));
    }
    model.value = normal.includes(selected) ? selected : "";
    model.disabled = !normal.length;
    queue = buildReviewQueue(clips, results, computed.reports.adjudicated.details,
      reviews, model.value, fileTranscriptWords, $("file-review-mode").value);
    const coverage = $("file-review-coverage");
    coverage.replaceChildren(
      node("p", "Word shortfall sums only positive gaps from the current human reference. Human confirmation is separate. Unclear and invalid audio are excluded except from note counts."),
      ...(queue.summaries.length ? [table(["Model / setting", "Clips with text result", "Shorter output",
        "Word shortfall", "Deletion checked", "Deletion confirmed", "Notes saved"], queue.summaries.map((s) =>
        [s.provider, s.returned, s.shorter, `${s.wordGap}/${s.referenceWords} (${pct(s.wordGap, s.referenceWords)})`,
          s.checked, s.confirmed, s.noted]))] : []),
    );
    $("file-reference-impact").replaceChildren(
      node("h4", "Effect of correcting human transcripts"),
      ...(correctionImpact.length ? [
        node("p", "Only clips with a corrected reference and a model result. The model transcript and automatic target decisions stay the same."),
        table(["Model / setting", "Corrected clips", "Target bits", "Disagreements before", "Disagreements after", "Resolved", "New"],
          correctionImpact.map((s) => [s.provider, s.clips, s.bits, s.before, s.after, s.resolved, s.introduced])),
      ] : [node("p", "No scored human transcript corrections yet.")]),
    );
    $("file-export-annotations").disabled = !queue.annotations.length;
    refreshClipList(navigation);
  }

  function refreshClipList({ advanceFrom, focus, reset = false } = {}) {
    const picker = $("file-clip");
    const previous = focus ?? picker.value;
    const selector = $("file-review-filter");
    const filter = selector.value || "all";
    const model = $("file-review-provider").value;
    selector.replaceChildren(...Object.entries(reviewFilters).map(([key, label]) => {
      const option = node("option", `${label} (${queue.lists.get(key).length})`);
      option.value = key;
      option.disabled = key === "exclusive" && (!model || queue.providers.length < 2);
      return option;
    }));
    selector.value = selector.querySelector(`option[value="${filter}"]`)?.disabled ? "all" : filter;
    visibleClips = queue.lists.get(selector.value);
    const inList = visibleClips.some(({ id }) => id === previous);
    const next = advanceFrom ? visibleClips.find(({ id }) => clipOrder.get(id) > clipOrder.get(advanceFrom)) : null;
    const current = next?.id ?? ((inList || (!reset && clipOrder.has(previous))) ? previous : visibleClips[0]?.id);
    navigationIds = [...new Set([...visibleClips.map(({ id }) => id), ...recentReviews, ...(current ? [current] : [])])]
      .sort((a, b) => clipOrder.get(a) - clipOrder.get(b));
    const display = !current || visibleClips.some(({ id }) => id === current) ? visibleClips :
      [clips[clipOrder.get(current)], ...visibleClips];
    picker.replaceChildren(...display.map((clip) => {
      const tag = [clip.file, clip.speakerGroup, reviews.get(clip.id)?.reviewed ? "Reviewed" : null,
        clip.referenceStatus === "needsReview" ? "check reference" : null].filter(Boolean);
      const option = node("option", tag.join(" · "));
      option.value = clip.id;
      return option;
    }));
    if (current) picker.value = current;
    picker.disabled = !display.length;
    refreshClip();
  }

  function saveReview(clip, review, message, navigation) {
    const updated = { clipId: clip.id, ...review };
    const old = reviews.get(clip.id);
    if (updated.quality === "unreviewed" && updated.reference === undefined &&
        !updated.predictions.length && !updated.note && !updated.providerReviews?.length && !updated.reviewed)
      reviews.delete(clip.id);
    else reviews.set(clip.id, updated);
    if ((old?.quality ?? "unreviewed") !== updated.quality || old?.reference !== updated.reference ||
        JSON.stringify(old?.predictions ?? []) !== JSON.stringify(updated.predictions)) refreshReport(navigation);
    else {
      $("file-export-json").disabled = !results.size && !reviews.size;
      refreshReviewQueue(navigation);
    }
    $("file-review-status").textContent = message + " Export results JSON to keep it after closing the tab.";
  }

  function providerReviewFields(clip, row, annotation, edits) {
    const form = node("div");
    form.className = "file-review-form file-provider-review";
    const draftKey = providerDraftKey(clip, row);
    const initial = drafts.get(draftKey) ?? annotation;
    const note = noteField("Model note (optional)", initial?.note);
    const checked = node("input"), deleted = node("input");
    const hasTranscript = typeof row.transcript === "string";
    if (hasTranscript) {
      const deletionCheck = node("fieldset");
      deletionCheck.append(node("legend", "Listen for missing words"));
      for (const [control, labelText] of [[checked, "Checked against audio"], [deleted, "Confirmed that STT dropped a spoken word"]]) {
        control.type = "checkbox";
        const label = node("label");
        label.className = "check";
        label.append(control, document.createTextNode(" " + labelText));
        deletionCheck.append(label);
      }
      checked.checked = typeof initial?.deletion === "boolean";
      deleted.checked = initial?.deletion === true;
      checked.onchange = () => { if (!checked.checked) deleted.checked = false; };
      deleted.onchange = () => { if (deleted.checked) checked.checked = true; };
      deletionCheck.append(node("small", "Leave both unchecked if unsure. If you listened and found no deletion, check only the first box. A wrong replacement is not a deletion."));
      form.append(deletionCheck);
    }
    const getDraft = () => ({
      deletion: hasTranscript && (checked.checked || deleted.checked) ? deleted.checked : null,
      note: note.input.value,
    });
    form.oninput = form.onchange = () => drafts.set(draftKey, getDraft());
    form.append(note.label);
    edits.push((current) => {
      if (!drafts.has(draftKey)) return;
      const providerReviews = (current.providerReviews ?? []).filter((entry) => entry.provider !== row.provider);
      const { deletion, note } = getDraft();
      if (deletion !== null || note.trim())
        providerReviews.push({ provider: row.provider, transcript: row.transcript, deletion, note: note.trim() || undefined });
      drafts.delete(draftKey);
      current.providerReviews = providerReviews;
    });
    return form;
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
    const navigationIndex = navigationIds.indexOf(picker.value);
    const visibleIndex = visibleClips.findIndex(({ id }) => id === picker.value);
    $("file-prev").disabled = navigationIndex <= 0;
    $("file-next").disabled = navigationIndex < 0 || navigationIndex >= navigationIds.length - 1;
    const filter = $("file-review-filter").value;
    const note = filter === "transcript-disagreement" || filter === "pending-disagreement"
      ? ` · ${queue.compared} comparable (all selected results returned)`
      : filter === "model-disagreement" ? " · Requires results from all loaded models"
      : filter === "exclusive" ? " · All other loaded models must have a correct score"
      : filter === "short" || filter === "pending-short" ? " · Compared with the current human transcript" : "";
    $("file-review-count").textContent = `${visibleClips.length} of ${clips.length} clips` +
      (visibleIndex >= 0 ? ` · Clip ${visibleIndex + 1} of ${visibleClips.length}` :
        clip ? " · Viewing a clip outside this list" : "") + note +
      ` · ${queue.reviewedClips} reviewed overall`;
    $("file-review-completion").hidden = !clip;
    if (!clip) return item.append(node("p", "No clips match this filter."));
    const review = reviews.get(clip.id) ?? { quality: "unreviewed", predictions: [] };
    const reference = review.reference ?? clip.reference;
    const clipDraft = drafts.get(clip.id);
    const raw = computed?.reports.original.details.filter((row) => row.clipId === clip.id) ?? [];
    const badge = $("file-clip-review-badge");
    const toggle = $("file-review-toggle");
    badge.textContent = review.reviewed ? "Reviewed" : "Pending";
    badge.dataset.reviewed = String(!!review.reviewed);
    toggle.hidden = !review.reviewed;
    toggle.onclick = () => {
      const current = reviews.get(clip.id) ?? review;
      recentReviews.delete(clip.id);
      saveReview(clip, { ...current, reviewed: undefined }, `${clip.file} reopened in the pending lists.`);
    };
    const expected = review.reference === undefined ? clip.expected : score()(clip.targets, reference).vector;
    item.append(
      node("p", [clip.speakerGroup ?? "Participant not supplied", clip.session, clip.list && "Task " + clip.list].filter(Boolean).join(" · ")),
      node("p", "Targets: " + clip.targets.join(", ") + " · Expected: " + expected.join("")),
      node("p", "Original human transcript: " + (clip.reference || "(empty)")),
      node("p", `Word count: ${fileTranscriptWords(reference).length} in the current human transcript · ${clip.targets.length} targets`),
    );
    const form = node("form");
    form.id = "file-clip-form";
    const fields = node("div");
    fields.className = "file-review-form";
    const edits = [];
    const quality = node("select");
    const qualityLabel = node("label", "Audio quality / review status");
    qualityLabel.append(quality);
    for (const [key, label] of Object.entries(qualityLabels)) {
      const option = node("option", label);
      option.value = key;
      quality.append(option);
    }
    quality.value = clipDraft?.quality ?? review.quality;
    const field = node("textarea");
    field.maxLength = 1500;
    field.value = clipDraft?.reference ?? reference;
    const corrected = node("input");
    corrected.type = "checkbox";
    corrected.checked = clipDraft?.corrected ?? (review.reference !== undefined);
    field.readOnly = !corrected.checked;
    const correctionFlag = node("label");
    correctionFlag.className = "check";
    correctionFlag.append(corrected, document.createTextNode(" Corrected an error in the human transcript"));
    corrected.onchange = () => { field.readOnly = !corrected.checked; };
    const correction = node("label", "Human transcript");
    const correctionHint = node("small", "Leave empty only if no words were spoken. Targets do not change.");
    correctionHint.id = "file-reference-hint";
    field.setAttribute("aria-describedby", correctionHint.id);
    correction.append(field);
    const save = node("button", review.reviewed ? "Save review changes" : "Save review");
    save.type = "submit";
    fields.append(qualityLabel);
    if (clip.targetSource === "explicit") fields.append(correctionFlag, correction, correctionHint);
    else fields.append(node("p", "Supply explicit targets in the manifest to edit the reference or review individual target decisions."));
    const draftKey = clip.id;
    const clipNote = noteField("Clip note (optional)", clipDraft?.note ?? review.note);
    fields.oninput = fields.onchange = () => drafts.set(draftKey,
      { quality: quality.value, reference: field.value, corrected: corrected.checked, note: clipNote.input.value });
    fields.append(clipNote.label);
    form.append(fields);
    form.onsubmit = (event) => {
      event.preventDefault();
      const text = field.value.trim();
      const changed = clip.targetSource === "explicit" && corrected.checked;
      if (changed && text === clip.reference.trim()) {
        $("file-review-status").textContent = "Edit the human transcript or clear the correction checkbox.";
        field.focus();
        return;
      }
      const current = reviews.get(clip.id) ?? review;
      const updated = { ...current, quality: quality.value, reference: changed ? text : undefined,
        note: clipNote.input.value.trim() || undefined, reviewed: true };
      for (const apply of edits) apply(updated);
      drafts.delete(draftKey);
      const pending = $("file-review-mode").value === "pending";
      if (pending) recentReviews.add(clip.id);
      saveReview(clip, updated, `${clip.file}: review saved.`,
        pending ? { advanceFrom: clip.id } : undefined);
    };
    item.append(form);
    const reviewed = new Map(computed?.reports.adjudicated.details.filter((row) => row.clipId === clip.id).map((row) => [row.provider, row]));
    if (raw.length) form.append(node("h4", "Model results"),
      node("small", "Change a target decision only if the scorer misread the model’s text. Use the deletion check to report what the model missed in the audio."));
    const focusedModel = $("file-review-provider").value;
    const ordered = focusedModel ? [...raw.filter((r) => r.provider === focusedModel),
      ...raw.filter((r) => r.provider !== focusedModel)] : raw;
    for (const row of ordered) {
      const section = node("details");
      section.dataset.provider = row.provider;
      section.open = openProviders.has(row.provider) || row.provider === focusedModel || (!sameClip && raw.length === 1);
      const effective = reviewed.get(row.provider);
      const actual = effective ?? row;
      const result = actual.vector ? actual.vector.join("") : "not scored";
      const annotation = providerReviewFor(review, row.provider, row.transcript);
      const deletion = annotation?.deletion === true ? " · deletion confirmed" :
        annotation?.deletion === false ? " · no deletion found" : "";
      section.append(node("summary", row.provider + " · " + result + deletion));
      if (!row.vector) section.append(node("p", row.error || "No result"));
      else {
        section.append(node("p", "Provider text: " + (row.transcript || "(empty)")),
          node("p", `Output words: ${fileTranscriptWords(row.transcript).length} · Human words: ${fileTranscriptWords(reference).length}`),
          node("p", "Normalized: " + (row.normalized || "(empty)") +
            (effective ? "" : " · excluded from reviewed statistics")));
        const match = (d) => d.provider === row.provider && d.transcript === row.transcript && d.ignoreOrder === ignoreOrder();
        const stored = review.predictions.find(match);
        const scoreDraftKey = JSON.stringify([clip.id, row.provider, row.transcript, ignoreOrder()]);
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
            control.value = String((drafts.get(scoreDraftKey) ?? stored?.bits)?.[i] ?? "");
            control.onchange = () => drafts.set(scoreDraftKey,
              controls.map((select) => select.value === "" ? null : Number(select.value)));
            controls.push(control);
            const bit = actual.vector[i];
            return [target, expected[i], row.vector[i], bit,
              expected[i] === bit ? "Agrees" : expected[i] ? "Missed target" : "False credit",
              clip.targetSource === "explicit" && effective ? control : "—"];
          }),
        ));
        if (clip.targetSource === "explicit" && effective)
          edits.push((current) => {
            if (!drafts.has(scoreDraftKey)) return;
            const bits = drafts.get(scoreDraftKey);
            const predictions = current.predictions.filter((d) => !match(d) &&
              !(d.provider === row.provider && d.ignoreOrder === ignoreOrder()));
            if (bits.some((bit) => bit !== null))
              predictions.push({ provider: row.provider, transcript: row.transcript, ignoreOrder: ignoreOrder(), bits });
            drafts.delete(scoreDraftKey);
            current.predictions = predictions;
          });
      }
      section.append(providerReviewFields(clip, row, annotation, edits));
      form.append(section);
    }
    const footer = node("div");
    footer.className = "file-review-save actions";
    footer.append(save, node("small", "Saves quality, notes, and model decisions together."));
    form.append(footer);
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
      clipOrder = new Map(clips.map(({ id }, index) => [id, index]));
      results = new Map();
      reviews = new Map();
      drafts.clear();
      recentReviews.clear();
      progress.reset();
      reviewedClip = undefined;
      $("file-review-filter").value = "all";
      $("file-review-provider").value = "";
      $("file-review-mode").value = "pending";
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
      recentReviews.clear();
      refreshReport({ reset: true });
      refreshStatus();
    } catch (error) { status(error.message); }
  };
  const navigate = () => {
    $("file-review-status").textContent = "";
    refreshClip();
  };
  $("file-clip").onchange = navigate;
  const step = (offset) => {
    const id = navigationIds[navigationIds.indexOf($("file-clip").value) + offset];
    if (id) {
      $("file-review-status").textContent = "";
      refreshClipList({ focus: id });
    }
  };
  $("file-prev").onclick = () => step(-1);
  $("file-next").onclick = () => step(1);
  $("file-review-filter").onchange = () => {
    $("file-review-status").textContent = "";
    recentReviews.clear();
    refreshClipList({ reset: true });
  };
  $("file-review-provider").onchange = () => {
    $("file-review-status").textContent = "";
    recentReviews.clear();
    refreshReviewQueue({ reset: true });
  };
  $("file-review-mode").onchange = () => {
    $("file-review-status").textContent = "";
    recentReviews.clear();
    refreshReviewQueue({ reset: true });
  };
  $("file-export-annotations").onclick = () => {
    const rows = [["clip_id", "file", "participant", "quality", "included", "provider",
      "outcome", "human_transcript", "provider_transcript", "human_words", "provider_words",
      "deletion_review", "note", "clip_review_status", "human_reference_corrected", "original_human_transcript"]];
    for (const record of queue.annotations) {
      const { clip, quality, included, provider, outcome, reference, transcript,
        referenceWords, outputWords, annotation, reviewed, referenceCorrected } = record;
      const decision = annotation.deletion === true ? "confirmed" :
        annotation.deletion === false ? "not found" : provider ? "not checked" : "";
      rows.push([clip.id, clip.file, clip.speakerGroup, quality, included, provider, outcome,
        reference, transcript, referenceWords, outputWords, decision, annotation.note,
        reviewed ? "reviewed" : "pending", referenceCorrected, clip.reference]);
    }
    download("rsvp-review-annotations.csv", rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      "text/csv;charset=utf-8");
  };
  $("file-scope").onchange = drawReport;
  $("file-s-only").onchange = drawReport;
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
    annotationSummary: queue?.summaries,
    referenceCorrectionImpact: correctionImpact,
    tailDiagnostics: controller ? undefined : tailReports().map(({ details, ...summary }) => summary),
    quality: controller ? undefined : computed.quality,
    reports: controller ? undefined : Object.fromEntries(Object.entries(computed.reports).map(([key, report]) =>
      [key, { summary: report.summary, keytermPairs: report.keytermPairs,
        details: key === "unflagged" ? undefined : report.details }])),
  });
  $("file-export-csv").onclick = () => {
    download("rsvp-dataset-metrics.csv",
      csvMetricRows(computed, reportWithTrailingSFilter()).map((row) => row.map(csvCell).join(",")).join("\r\n"),
      "text/csv;charset=UTF-8");
  };
  $("file-cancel").onclick = () => controller?.abort();

  const nextTicketAt = new Map();
  $("file-run").onclick = async () => {
    if (controller) return;
    if (!manifest) return status("Load a reference manifest first.");
    const accessCode = $("file-code").value.trim() || $("access-code").value.trim();
    const diagnostic = $("file-tail-test").checked;
    const keys = diagnostic ? ["chirp3"] : [...document.querySelectorAll('input[name="file-provider"]:checked')].map((input) => input.value);
    if (!$("file-consent").checked || !/^[0-9a-f]{64}$/i.test(accessCode) || !keys.length)
      return status("Confirm you can send these files, enter the preview code, and choose providers.");
    const mode = $("file-keyterms").value;
    const variants = (mode === "both" ? [false, true] : [mode === "on"]).flatMap((enabled) =>
      (diagnostic ? tailVariants : [undefined]).map((tailMs) => ({ enabled, tailMs })));
    const label = (key, { enabled, tailMs }) =>
      tailMs === undefined ? replayLabel(key, enabled) : tailLabel(replayLabel(key, enabled), tailMs);
    const missingResults = ({ clip, ...variant }, providers) => providers.filter((key) =>
      typeof results.get(label(key, variant))?.get(clip.id)?.transcript !== "string");
    const remaining = clips.flatMap((clip) => variants
      .map((variant) => ({ clip, ...variant })).filter((run) => missingResults(run, keys).length));
    const attemptedBefore = (run) => missingResults(run, keys).every((key) =>
      results.get(label(key, run))?.has(run.clip.id));
    remaining.sort((a, b) => Number(attemptedBefore(a)) - Number(attemptedBefore(b)));
    const limit = $("file-batch-limit").value;
    const pending = (limit === "all" ? remaining : remaining.slice(0, Number(limit)))
      .map((run) => ({ ...run, providers: missingResults(run, keys) }));
    if (!pending.length) return status("All selected providers have results for this dataset.");
    const missingFiles = [...new Set(pending.map(({ clip }) => clip.file).filter((file) => !files.has(file)))];
    if (missingFiles.length) return status(
      missingFiles.length + " audio files missing. First missing file: " + missingFiles[0]
    );

    controller = new AbortController();
    const { signal } = controller;
    const controls = ["file-manifest", "file-audio", "file-results", "file-run", "file-ignore-order", "file-keyterms", "file-batch-limit", "file-workers", "file-tail-test"];
    for (const id of controls) $(id).disabled = true;
    $("file-cancel").disabled = false;
    $("file-export-csv").disabled = true;
    const byProvider = new Map(keys.map((key) => {
      const success = variants.reduce((sum, variant) => sum +
        clips.filter((clip) => !missingResults({ clip, ...variant }, [key]).length).length, 0);
      return [key, { total: clips.length * variants.length, success, failed: 0 }];
    }));
    progress.start(pending.reduce((total, run) => total + run.providers.length, 0), byProvider);
    const stopped = new Map();
    let warning = false, attempted = 0, cursor = 0;
    let batchState = "Batch finished";
    const worker = async () => {
      while (cursor < pending.length && !signal.aborted && stopped.size < keys.length) {
        const index = cursor++;
        const { clip, enabled, tailMs, providers } = pending[index];
        const selected = providers.filter((key) => !stopped.has(key));
        if (!selected.length) continue;
        const terms = enabled ? fileKeyterms(clip.targets) : null;
        status(`Processing run ${index + 1} of ${pending.length} · ${clip.file}`);
        progress.clip(clip.file, enabled, selected, index + 1, pending.length, tailMs);
        const output = await replayClip(files.get(clip.file), clip.id, selected, accessCode,
          signal, nextTicketAt, terms, (key, phase, row) => {
            if (row) {
              merge(readResults({ version: 1, results: [row] }, [clip]));
              $("file-export-json").disabled = false;
              if (/^Ticket HTTP (401|403|429|502|503)\b/.test(row.error ?? "")) stopped.set(key, row.error);
            }
            progress.update(index + 1, key, phase, row);
          }, tailMs);
        warning ||= output.warning;
        if (signal.aborted) break;
        attempted++;
        progress.finishClip(index + 1);
      }
    };
    try {
      const count = Math.min(Number($("file-workers").value), pending.length);
      const outcomes = await Promise.allSettled(Array.from({ length: count }, async () => {
        try { await worker(); }
        catch (error) { controller.abort(); throw error; }
      }));
      const failure = outcomes.find((outcome) => outcome.status === "rejected");
      if (failure) throw failure.reason;
      const suffix = stopped.size ? " Paused providers: " + [...stopped]
        .map(([key, error]) => replayProviders[key] + " (" + error + ")").join(", ") +
        ". Run again to resume." : "";
      const unit = mode === "both" || diagnostic ? " clip runs." : " clips.";
      const left = remaining.filter((run) => missingResults(run, keys).length).length;
      const jobsLeft = remaining.reduce((sum, run) => sum + missingResults(run, keys).length, 0);
      if (signal.aborted) batchState = "Cancelled · finished results are saved in this tab";
      else if (stopped.size) batchState = "Batch paused for " + [...stopped.keys()].map((key) => replayProviders[key]).join(", ");
      status((signal.aborted ? "Cancelled after " : "Run ended after ") + attempted + unit +
        (left ? ` ${left} runs still need results (${jobsLeft} provider jobs). Export JSON to keep progress.` : " Results are kept in this tab.") + suffix);
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
