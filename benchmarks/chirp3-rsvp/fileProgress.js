import { node, table } from "./fileReport.js";
import { replayProviders } from "./fileReplay.js";

const phases = {
  decoding: "Reading audio file",
  connecting: "Connecting",
  ready: "Ready to stream",
  streaming: "Sending audio",
  finalizing: "Waiting for final transcript",
  done: "Transcribed",
  failed: "Failed",
  cancelled: "Cancelled · can retry",
  interrupted: "Interrupted · can retry",
};
const logPageSize = 15;
const shortTime = (ms) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
const terms = (enabled) => enabled ? "On" : "Off";

export function createFileProgress() {
  const get = (id) => document.getElementById(`file-progress-${id}`);
  const panel = get("panel"), bar = get("bar"), counts = get("counts"), clock = get("clock");
  const activity = get("activity"), active = get("active"), providers = get("providers");
  const log = get("log"), older = get("older"), newer = get("newer"), pageLabel = get("page");
  let batch, current, latest = [], page = 0, timer;
  const stopClock = () => { clearInterval(timer); timer = undefined; };

  function renderClock() {
    const now = batch.endedAt ?? Date.now();
    const visibility = !batch.endedAt && document.hidden ? " · browser may slow background tabs" : "";
    clock.textContent = `Elapsed ${shortTime(now - batch.startedAt)} · last update ${shortTime(now - batch.lastUpdate)} ago${visibility}`;
  }

  function renderCounts() {
    const finished = batch.success + batch.failed;
    bar.value = finished;
    counts.textContent = `${finished} / ${batch.total} provider jobs finished · ${batch.success} transcribed · ${batch.failed} failed · ${batch.total - finished} not finished`;
    providers.replaceChildren(...[...batch.providers].map(([key, stats]) =>
      node("li", `${replayProviders[key]}: ${stats.success} / ${stats.total} successful across this dataset · ${stats.failed} failed in this batch`)));
    renderClock();
  }

  function renderActive() {
    active.replaceChildren(...[...current.states].map(([key, phase]) => {
      const row = node("li");
      row.dataset.phase = phase;
      row.append(node("strong", replayProviders[key]), node("span", phases[phase]));
      return row;
    }));
  }

  function renderLog() {
    const start = Math.max(0, latest.length - (page + 1) * logPageSize);
    const end = latest.length - page * logPageSize;
    log.replaceChildren(latest.length ? table(
      ["Time", "File", "Keyterms", "Provider", "Outcome", "Final transcript / error"],
      latest.slice(start, end).reverse().map((item) => [
        item.time, item.file, terms(item.enabled), replayProviders[item.key],
        item.row.error ? "Failed" : "Transcribed",
        item.row.error ?? (item.row.transcript || "(empty transcript)"),
      ]),
    ) : node("p", "No provider has finished in this batch yet."));
    older.disabled = start === 0;
    newer.disabled = page === 0;
    pageLabel.textContent = latest.length ? `Showing ${start + 1}–${end} of ${latest.length} outcomes` : "No outcomes yet";
  }
  older.onclick = () => { page++; renderLog(); };
  newer.onclick = () => { page--; renderLog(); };

  return {
    reset() {
      stopClock();
      panel.hidden = true;
      batch = current = undefined;
      latest = [];
    },
    start(total, byProvider) {
      stopClock();
      const now = Date.now();
      batch = { total, providers: byProvider, success: 0, failed: 0, startedAt: now, lastUpdate: now };
      page = 0;
      latest = [];
      bar.max = total;
      active.replaceChildren();
      activity.textContent = "Starting batch…";
      renderCounts();
      renderLog();
      panel.hidden = false;
      timer = setInterval(renderClock, 1000);
    },
    clip(file, enabled, keys, index, total) {
      current = { file, enabled, states: new Map(keys.map((key) => [key, "decoding"])) };
      batch.lastUpdate = Date.now();
      activity.textContent = `Run ${index} of ${total} · ${file} · keyterms ${terms(enabled).toLowerCase()}`;
      renderActive();
      renderClock();
    },
    update(key, phase, row) {
      batch.lastUpdate = Date.now();
      current.states.set(key, phase);
      renderActive();
      if (row) {
        const field = row.error ? "failed" : "success";
        batch[field]++;
        batch.providers.get(key)[field]++;
        latest.push({ file: current.file, enabled: current.enabled, key, row,
          time: shortTime(batch.lastUpdate - batch.startedAt) });
        renderLog();
      }
      renderCounts();
    },
    end(state) {
      stopClock();
      batch.endedAt = Date.now();
      activity.textContent = state;
      if (current) {
        for (const [key, phase] of current.states) {
          if (phase !== "done" && phase !== "failed")
            current.states.set(key, state.startsWith("Cancelled") ? "cancelled" : "interrupted");
        }
        renderActive();
      }
      current = undefined;
      renderCounts();
    },
  };
}
