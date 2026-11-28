import { scopes, summarizeProviderAgreement, summarizeSpeakers } from "./fileMetrics.mjs";
import { qualityLabels } from "./fileReview.mjs";

export function node(tag, text) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  return el;
}

export const pct = (n, d) => d ? (100 * n / d).toFixed(1) + "%" : "—";
const fraction = (n, d) => d ? `${n}/${d} (${pct(n, d)})` : "—";
const size = (s) => s.positives + s.negatives;
const errors = (s) => s.falseNeg + s.falsePos;

export function table(headers, rows) {
  const wrap = node("div");
  wrap.className = "file-table";
  const t = node("table");
  const head = t.createTHead().insertRow();
  for (const heading of headers) {
    const th = node("th", heading);
    th.scope = "col";
    head.append(th);
  }
  const body = t.createTBody();
  for (const values of rows) {
    const row = body.insertRow();
    for (const value of values) {
      const cell = row.insertCell();
      if (value instanceof Node) cell.append(value);
      else cell.textContent = value;
    }
  }
  wrap.append(t);
  return wrap;
}

const metrics = (s) => [
  size(s), fraction(errors(s), size(s)), fraction(s.truePos + s.trueNeg, size(s)),
  fraction(s.truePos, s.positives), fraction(s.falseNeg, s.positives), fraction(s.falsePos, s.negatives),
];
const metricLabels = ["Scored targets", "Target error rate", "Target agreement", "Correct target heard", "Missed target (1 → 0)", "False credit (0 → 1)"];

function matrix(s) {
  const tile = (n, d, error) => {
    const cell = node("div", d ? fraction(n, d) : "Not measured");
    cell.className = error ? "matrix-error" : "matrix-correct";
    if (d) cell.style.setProperty("--share", Math.round(100 * n / d) + "%");
    return cell;
  };
  const result = table(["Human reference", "STT gave 1", "STT gave 0"], [
    ["1 · child said target", tile(s.truePos, s.positives, false), tile(s.falseNeg, s.positives, true)],
    ["0 · child did not say target", tile(s.falsePos, s.negatives, true), tile(s.trueNeg, s.negatives, false)],
  ]);
  result.classList.add("file-matrix");
  return result;
}

function scatter(rows) {
  const ns = "http://www.w3.org/2000/svg";
  const add = (tag, attrs, text, parent) => {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    if (text !== undefined) el.textContent = text;
    parent?.append(el);
    return el;
  };
  const svg = add("svg", { viewBox: "0 0 640 260", role: "img",
    "aria-label": "Participant error rates by number of scored targets. See table for exact values." });
  svg.classList.add("file-scatter");
  const max = Math.max(1, ...rows.map(size));
  for (const tick of [0, 25, 50, 75, 100]) {
    const y = 215 - tick * 1.9;
    add("line", { x1: 50, y1: y, x2: 615, y2: y, stroke: "#d4e0ea" }, undefined, svg);
    add("text", { x: 43, y: y + 4, "text-anchor": "end" }, tick + "%", svg);
  }
  for (const n of new Set([0, Math.round(max / 2), max])) {
    add("text", { x: 50 + 565 * n / max, y: 233, "text-anchor": "middle" }, n, svg);
  }
  add("text", { x: 330, y: 254, "text-anchor": "middle" }, "Scored targets per participant", svg);
  for (const row of rows.filter(size)) {
    const dot = add("circle", { cx: 50 + 565 * size(row) / max, cy: 215 - 190 * errors(row) / size(row),
      r: 5, fill: "#175e88", opacity: ".65" }, undefined, svg);
    add("title", {}, `${row.speaker}: ${fraction(errors(row), size(row))}`, dot);
  }
  return svg;
}

function participantReport(container, report, provider) {
  const rows = summarizeSpeakers(report.clips, report.details, [provider]);
  if (!rows.length) return;
  rows.sort((a, b) => (size(b) ? errors(b) / size(b) : -1) - (size(a) ? errors(a) / size(a) : -1) || a.speaker.localeCompare(b.speaker));
  const scored = rows.filter(size);
  const macro = scored.reduce((sum, row) => sum + errors(row) / size(row), 0);
  const detail = node("details");
  detail.append(node("summary", "Participant counts and rates"), table(
    ["Participant", "Returned / eligible clips", ...metricLabels],
    rows.map((s) => [s.speaker, s.returned + "/" + s.clips, ...metrics(s)]),
  ));
  container.append(node("h4", "Participant variation"), node("p",
    `Each dot is one participant, using this provider’s successful clips. The unweighted mean error rate is ${pct(macro, scored.length)} across ${scored.length} scored participants. A high rate based on a few targets is less informative.`),
  scatter(rows), detail);
}

function agreementReport(report, choices, onChange) {
  const labels = report.summary.map((s) => s.provider);
  if (labels.length < 2) return node("p", "Add results from a second provider to measure agreement.");
  const section = node("section");
  section.className = "file-chart-panel";
  const selectors = node("div");
  selectors.className = "file-review-controls";
  const select = (label, id) => {
    const wrap = node("label", label);
    const input = node("select");
    input.id = id;
    for (const name of labels) {
      const option = node("option", name);
      option.value = name;
      input.append(option);
    }
    wrap.append(input);
    selectors.append(wrap);
    return input;
  };
  const first = select("First provider / setting", "file-overlap-first");
  const second = select("Second provider / setting", "file-overlap-second");
  if (labels.includes(choices?.[0]) && labels.includes(choices?.[1]) && choices[0] !== choices[1]) {
    [first.value, second.value] = choices;
  } else {
    const identity = (label) => label.split(" · ")[0];
    const matchingMode = (label) => label.split(" · ")[1];
    second.value = labels.find((label) => identity(label) !== identity(first.value) &&
      matchingMode(label) === matchingMode(first.value)) ??
      labels.find((label) => identity(label) !== identity(first.value)) ?? labels[1];
  }
  const output = node("div");
  output.id = "file-overlap-result";
  const percentage = (n, d) => d ? `${n}/${d} (${(100 * n / d).toFixed(2)}%)` : "—";
  const delta = (before, after) => {
    const rates = (s) => [[errors(s), size(s)], [s.falseNeg, s.positives], [s.falsePos, s.negatives]];
    const b = rates(before), a = rates(after);
    return a.map(([n, d], i) => {
      if (!d || !b[i][1]) return "—";
      const pp = (n / d - b[i][0] / b[i][1]) * 100;
      return `${pp > 0 ? "+" : ""}${pp.toFixed(2)} pp`;
    }).join(" / ");
  };
  function draw() {
    for (const item of first.options) item.disabled = item.value === second.value;
    for (const item of second.options) item.disabled = item.value === first.value;
    onChange([first.value, second.value]);
    const { eligible, paired, rejected, rejectedTargets, acceptedTrials, unavailableTrials, lostTrials,
      first: a, second: b, accepted } =
      summarizeProviderAgreement(report.clips, report.details, first.value, second.value);
    const row = (name, n, s, lost = "—") => [name, n, lost, percentage(errors(s), size(s)),
      percentage(s.falseNeg, s.positives), percentage(s.falsePos, s.negatives)];
    output.replaceChildren(
      node("p", `Successful for both: ${paired}/${eligible} trials. Failed or missing for either: ${percentage(unavailableTrials, eligible)}.`),
      node("p", `Invalidated by disagreement: ${percentage(rejected, paired)} of trials with two results (${rejectedTargets} targets). Trials lost under full agreement: ${percentage(lostTrials, eligible)} of all eligible trials, including failed or missing results.`),
      table(["Policy", "Scored trials", "Trials lost / eligible", "Target error rate", "Missed target (1 → 0)", "False credit (0 → 1)"], [
        row(first.value + " alone", paired, a), row(second.value + " alone", paired, b),
        row("Only accept full agreement", acceptedTrials, accepted, percentage(lostTrials, eligible)),
      ]),
      node("p", `Change after filtering (overall / missed / false credit): vs. first ${delta(a, accepted)}; vs. second ${delta(b, accepted)}.`),
      node("p", "A lower error rate applies only to the retained clips. This filter does not correct mistakes, and both providers can agree on the wrong bit."),
    );
  }
  first.onchange = second.onchange = draw;
  section.append(node("h4", "Provider agreement · reject a trial if any target differs"), selectors, output);
  draw();
  return section;
}

export function renderFileReport(container, computed, scope, preferredProvider, onProvider, overlap, onOverlap, filteredReports) {
  container.replaceChildren();
  if (!computed) return;
  const { reports, quality } = computed;
  const all = reports.original.clips.length;
  const shownReports = filteredReports ?? reports;
  const report = shownReports[scope];
  const { summary, keytermPairs } = report;
  const qualityRows = Object.entries(qualityLabels).map(([key, label]) => [label, fraction(quality[key], all)]);
  container.append(
    node("h3", "Review coverage"),
    table(["Audio review status", "Clips"], [...qualityRows, ["Reference text corrected (overlaps the statuses above)", fraction(quality.corrected, all)]]),
    node("p", "After review excludes unintelligible audio and invalid recordings. The third view also excludes audio marked Difficult but intelligible. Both include clips whose audio quality was not rated."),
  );
  if (!summary.length) return;
  container.append(
    node("h3", "Target-level comparison · " + scopes[scope]),
    node("p", "Each target counts once. Target error rate = all incorrect decisions ÷ scored targets. Missed target = expected 1, got 0, out of expected 1s. False credit = expected 0, got 1, out of expected 0s. A dash means no eligible targets. Provider failures and missing results are not scored."),
    node("h4", "Common successful clips"),
    node("p", filteredReports
      ? "All models use the same clips. Only matching trailing-s discrepancies (for example, pet vs. pets) are excluded from both errors and scored targets, separately for each model. Other target errors in the same clip still count."
      : "The same clips are used for every provider and keyterms setting in this table."),
    table(["Provider", "Returned / eligible", "Failed / missing", "Common clips",
      ...(filteredReports ? ["S-only targets excluded"] : []), ...metricLabels],
      summary.map((s) => [s.provider, s.returned + "/" + s.clips, s.failed + "/" + s.missing, s.paired,
        ...(filteredReports ? [s.excludedTrailingS] : []), ...metrics(s)])),
    ...(filteredReports ? [node("p", "Provider agreement below is strict and uses the unfiltered target decisions. It does not use the human transcript to waive disagreements.")] : []),
    agreementReport(reports[scope], overlap, onOverlap),
    node("h4", "Effect of review · each provider’s available clips"),
    table(["View", "Provider", "Scored / eligible clips", ...metricLabels],
      Object.entries(shownReports).flatMap(([key, r]) => r.summary.map((s) =>
        [scopes[key], s.provider, s.returned + "/" + s.clips, ...metrics(s.allReturned)]))),
  );
  if (keytermPairs.length) {
    const change = (a, b, numerator, denominator) => fraction(numerator(a), denominator(a)) + " → " + fraction(numerator(b), denominator(b));
    container.append(node("h4", "Keyterms effect · Off → On"), table(
      ["Provider", "Same clips", "Target error rate", "Missed target", "False credit"],
      keytermPairs.map(({ provider, paired, without: a, withTerms: b }) => [provider, paired, change(a, b, errors, size),
        change(a, b, (s) => s.falseNeg, (s) => s.positives), change(a, b, (s) => s.falsePos, (s) => s.negatives)]),
    ));
  }
  const selector = node("select");
  for (const s of summary) {
    const option = node("option", s.provider);
    option.value = s.provider;
    selector.append(option);
  }
  const label = node("label", "Provider for matrix and participant analysis");
  label.append(selector);
  const panel = node("div");
  panel.className = "file-chart-panel";
  selector.value = summary.find(({ provider }) => provider === preferredProvider)?.provider ?? summary[0].provider;
  const draw = () => {
    const s = summary.find(({ provider }) => provider === selector.value);
    panel.replaceChildren(node("h4", "Target decision matrix · available clips"), matrix(s.allReturned));
    participantReport(panel, report, s.provider);
  };
  selector.onchange = () => { onProvider(selector.value); draw(); };
  draw();
  container.append(label, panel);
}

export function csvMetricRows(computed, filteredReports) {
  const header = ["scope", "subset", "provider", "participant", "eligible_clips", "returned_clips", "failed_clips", "missing_clips",
    "scored_targets", "expected_ones", "expected_zeros", "true_positive", "true_negative", "false_negative", "false_positive",
    "error_pct", "agreement_pct", "false_negative_pct", "false_positive_pct",
    "trailing_s_filter", "excluded_trailing_s_targets"];
  const row = (scope, subset, s, score) => [scope, subset, s.provider, s.speaker, s.clips, s.returned, s.failed, s.missing,
    size(score), score.positives, score.negatives, score.truePos, score.trueNeg, score.falseNeg, score.falsePos,
    pct(errors(score), size(score)), pct(score.truePos + score.trueNeg, size(score)),
    pct(score.falseNeg, score.positives), pct(score.falsePos, score.negatives),
    Boolean(filteredReports), subset === "available" ? (s.excludedTrailingSAvailable ?? 0) : (s.excludedTrailingS ?? 0)];
  return [header, ...Object.entries(filteredReports ?? computed.reports).flatMap(([key, r]) => [
    ...r.summary.flatMap((s) => [
      row(key, "available", s, s.allReturned),
      row(key, "common", { ...s, returned: s.paired, failed: null, missing: null }, s),
    ]),
    ...summarizeSpeakers(r.clips, r.details, r.summary.map((s) => s.provider)).map((s) => row(key, "participant", s, s)),
  ])];
}
