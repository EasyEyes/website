import { GoogleChirp3Transcriber } from "@threshold/components/speech/googleChirp3Transcriber";
import { RsvpSpeechController } from "@threshold/components/rsvpSpeech/rsvpSpeechController";
import { SpeechSession } from "@threshold/components/speech/speechSession";
import { openMicrophone } from "@threshold/components/speech/microphone";
import { PcmMicrophoneCapture } from "@threshold/components/speech/audioCapture";
import {
  QuestCreate,
  QuestQuantile,
  QuestUpdate,
} from "@threshold/components/addons/jsQUEST.module.js";
import {
  defaults,
  scenarios as allScenarios,
  targetSets,
} from "./scenarios.mjs";
import { analyze, measurements, checkRun } from "./evidence.js";

const scenarios = Object.fromEntries(
  Object.entries(allScenarios).filter(([, value]) => !value.fixtureOnly),
);
const $ = (id) => document.getElementById(id);
const memory = [];
const quest = new Map();
let active;
let targetIndex = 0;
let targetPool = targetSets;
const appliedPreset = new Map();
const element = (tag, text) => {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  return node;
};
const providerSettings = () => ({
  ...Object.fromEntries(
    Object.keys(defaults).map((key) => {
      const input = $(key);
      return [
        key,
        ["keyterms", "ignoreOrder"].includes(key)
          ? input.value === "TRUE"
          : input.type === "number"
          ? input.valueAsNumber
          : input.value,
      ];
    }),
  ),
  provider: "chirp3",
  adaptive: $("adaptive").value === "TRUE",
  guess: $("quest-guess").valueAsNumber,
});
const targetsFromInput = () =>
  $("targets")
    .value.split(",")
    .map((word) => word.trim())
    .filter(Boolean);
for (const [key, scenario] of Object.entries(scenarios)) {
  const option = element("option", scenario.title);
  option.value = key;
  $("scenario").append(option);
}
function setupScenario() {
  const scenario = scenarios[$("scenario").value];
  for (const [key, { prior, suggested }] of appliedPreset) {
    if ($(key).value === suggested) $(key).value = prior;
  }
  appliedPreset.clear();
  for (const [key, value] of Object.entries(scenario.overrides ?? {})) {
    appliedPreset.set(key, { prior: $(key).value, suggested: String(value) });
    $(key).value = value;
  }
  updateCue();
}
function updateCue() {
  const scenario = scenarios[$("scenario").value];
  $("cue").textContent = scenario.cue;
  $("arena-cue").textContent = scenario.cue;
  const targets = targetsFromInput();
  $("script").textContent =
    targets.length === 3
      ? `Planned words to say: ${
          scenario.said(targets, $("phrase").value) || "(stay quiet)"
        }`
      : "Enter exactly three target words.";
}
$("scenario").addEventListener("change", setupScenario);
$("targets").addEventListener("input", updateCue);
$("phrase").addEventListener("input", updateCue);
for (const [key, value] of Object.entries(defaults))
  $(key).value =
    typeof value === "boolean" ? String(value).toUpperCase() : value;
setupScenario();
$("corpus").onchange = async () => {
  const file = $("corpus").files[0];
  try {
    if (active || !file) return;
    if (file.size > 1_000_000) throw Error("Choose a word list under 1 MB.");
    const words = [
      ...new Set((await file.text()).toLowerCase().match(/[a-z]{1,60}/g) ?? []),
    ];
    const groups = [];
    for (let i = 0; i + 2 < words.length; i += 3)
      groups.push(words.slice(i, i + 3));
    if (!groups.length)
      throw Error(
        "Choose a .txt file with at least three distinct English words.",
      );
    targetPool = groups;
    targetIndex = 0;
    $("targets").value = groups[0].join(", ");
    $(
      "availability",
    ).textContent = `Loaded ${groups.length} target sets from the corpus.`;
    updateCue();
  } catch (error) {
    $("availability").textContent = error.message;
  }
};
$("next-set").onclick = () => {
  if (active) return;
  targetIndex = (targetIndex + 1) % targetPool.length;
  $("targets").value = targetPool[targetIndex].join(", ");
  updateCue();
};

const pause = (ms, signal) =>
  new Promise((done) => {
    if (signal.aborted) return done(false);
    const end = () => {
      clearTimeout(timer);
      done(false);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", end);
      done(true);
    }, ms);
    signal.addEventListener("abort", end, { once: true });
  });

function instrument(transcriber, mark) {
  let firstAudio = true;
  transcriber.subscribe((event) => {
    if (event.type === "commit") {
      if (event.finalAcknowledgement === true) mark("provider-complete");
      else mark("segment", { text: event.text });
    } else if (event.type === "error")
      mark("provider-error", { code: event.error.code });
  });
  return new Proxy(transcriber, {
    get(target, key) {
      if (key === "connect")
        return async () => {
          mark("provider-connect");
          const info = await target.connect();
          mark("provider-ready");
          return info;
        };
      if (key === "sendAudio")
        return (id, chunk) => {
          target.sendAudio(id, chunk);
          if (firstAudio) {
            firstAudio = false;
            mark("first-audio");
          }
        };
      if (key === "requestCommit")
        return (...args) => {
          mark("finish");
          return target.requestCommit(...args);
        };
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

const observedMicrophone = async (mark) => {
  mark("microphone-request");
  const microphone = await openMicrophone({ permissionTimeoutMs: 8_000 });
  mark("microphone-open", { state: microphone.getHealth().state });
  return new Proxy(microphone, {
    get(target, key) {
      if (key === "close")
        return async () => {
          await target.close();
          mark("microphone-close");
        };
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
};

function benchQuest(settings) {
  if (!settings.adaptive) return;
  const key = JSON.stringify(settings);
  if (!quest.has(key))
    quest.set(key, {
      posterior: QuestCreate(
        Math.log10(settings.guess),
        0.25,
        0.82,
        2.3,
        0.01,
        0.25,
        0.01,
      ),
      count: 0,
      next: settings.guess,
    });
  return quest.get(key);
}

function updateQuest(track, run) {
  if (!track) return;
  const before = track.count;
  if (run.score) {
    for (const value of run.score.vector)
      track.posterior = QuestUpdate(
        track.posterior,
        Math.log10(run.durationSec),
        value,
      );
    track.count += 1;
    track.next = Math.min(
      3,
      Math.max(0.3, 10 ** QuestQuantile(track.posterior)),
    );
  }
  run.quest = {
    updated: !!run.score,
    before,
    after: track.count,
    nextDurationSec: track.next,
  };
}

const clickCross = (run, signal, mark) =>
  new Promise((done) => {
    const cross = $("cross");
    const deadline = performance.now() + run.settings.crossWait * 1000;
    const enable = () => {
      cross.disabled = false;
      $("stage").textContent = "Click the cross to show the words.";
    };
    const end = (clicked) => {
      clearInterval(tick);
      clearTimeout(enableTimer);
      cross.onclick = null;
      cross.hidden = true;
      cross.blur();
      signal.removeEventListener("abort", abort);
      done(clicked);
    };
    const abort = () => end(false);
    cross.hidden = false;
    cross.disabled = run.settings.crossWait > 0;
    const tick = setInterval(() => {
      const remaining = Math.max(0, (deadline - performance.now()) / 1000);
      if (remaining > 0)
        $("stage").textContent = `Wait on the cross: ${remaining.toFixed(1)} s`;
    }, 50);
    const enableTimer = setTimeout(enable, run.settings.crossWait * 1000);
    cross.onclick = () => {
      mark("cross-click");
      end(true);
    };
    signal.addEventListener("abort", abort, { once: true });
  });

async function play(run, signal, mark) {
  const configuration = {
    provider: "chirp3",
    utteranceId: run.id,
    targetWords: run.targets,
    languageCode: "en-US",
    targetKeytermBiasEnabled: run.settings.keyterms,
    ignoreWordOrder: run.settings.ignoreOrder,
    finishPhrase: run.settings.phrase,
    responseSilenceMs: run.settings.silence * 1000,
    maximumResponseDurationMs: run.settings.cap * 1000,
    finalizationTimeoutMs: run.settings.stt * 1000,
    requestTokenContext: () => {
      throw new Error("The benchmark does not use Pavlovia credentials.");
    },
  };
  const transcriber = new GoogleChirp3Transcriber({
    utteranceId: run.id,
    languageCode: configuration.languageCode,
    keyterms: run.targets,
    targetKeytermBiasEnabled: run.settings.keyterms,
    webSocketFactory: (url, protocols) => {
      const socket = new WebSocket(url, protocols);
      socket.addEventListener("open", () => mark("socket-open"), {
        once: true,
      });
      socket.addEventListener(
        "close",
        (event) => mark("socket-close", { code: event.code }),
        { once: true },
      );
      return socket;
    },
    credentialProvider: async () => {
      const response = await fetch(
        "/.netlify/functions/rsvp-benchmark-ticket",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessCode: $("access-code").value.trim() }),
          cache: "no-store",
          signal,
        },
      );
      mark("ticket", { status: response.status });
      if (!response.ok) {
        run.ticketStatus = response.status;
        throw new Error("Could not get a Preview credential.");
      }
      return response.json();
    },
  });
  const controller = new RsvpSpeechController(configuration, {
    openMicrophone: () => observedMicrophone(mark),
    createCapture: (microphone) =>
      new (class extends PcmMicrophoneCapture {
        stop() {
          super.stop();
          if (
            !run.events.some((e) => e.name === "capture-stop") &&
            run.events.some((e) => e.name === "capture-start")
          )
            mark("capture-stop");
        }
      })(microphone),
    createTranscriber: () => instrument(transcriber, mark),
    createSession: (observed, config) => {
      const session = new SpeechSession(observed, {
        maximumUtteranceDurationMs: config.maximumResponseDurationMs,
        finalizationTimeoutMs: config.finalizationTimeoutMs,
        externallyControlledEnd: true,
      });
      session.subscribe((event) => {
        if (event.type === "error") {
          run.sessionError = event.error.code;
          mark("session-error", { code: event.error.code });
        }
      });
      return session;
    },
  });
  const space = (event) => {
    if (event.code !== "Space" || event.repeat) return;
    const row = mark("space", { accepted: false, trusted: event.isTrusted });
    setTimeout(() => {
      row.accepted = event.defaultPrevented;
    }, 0);
  };
  window.addEventListener("keydown", space, true);
  const cancel = () => {
    void controller.close();
  };
  signal.addEventListener("abort", cancel, { once: true });
  let result;
  try {
    mark("prepare");
    $("stage").textContent = "Preparing microphone and transcriber…";
    await controller.prepare();
    if (signal.aborted) return;
    mark("cross-ready");
    if (!(await clickCross(run, signal, mark))) return;
    $("stage").textContent = "Words are being displayed";
    controller.startCapture();
    mark("capture-start");
    result = controller.waitForResult().then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
    for (const [index, word] of run.targets.entries()) {
      if (signal.aborted || controller.state === "failed") break;
      $("word-display").textContent = word;
      mark("word-on", { index, word });
      if (!(await pause(run.durationSec * 1000, signal))) break;
    }
    $("word-display").textContent = "";
    if (signal.aborted) return;
    if (controller.state === "capturing") {
      mark("last-word-off");
      controller.allowProviderFinalization();
      $("stage").textContent =
        "Response window open · waiting for speech or finish";
    }
    const outcome = await result;
    if (signal.aborted) return;
    if (outcome.error) throw outcome.error;
    run.score = analyze(run.targets, outcome.value.text, run.settings);
  } catch (error) {
    if (!signal.aborted)
      run.error = {
        code: typeof error?.code === "string" ? error.code : "unexpected",
        message: error instanceof Error ? error.message : "Trial failed.",
      };
  } finally {
    signal.removeEventListener("abort", cancel);
    window.removeEventListener("keydown", space, true);
    await controller.close();
  }
}

$("settings").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (active) return;
  const key = $("scenario").value;
  const scenario = scenarios[key];
  const settings = providerSettings();
  const targets = targetsFromInput();
  if (
    targets.length !== 3 ||
    targets.some((word) => !/^[a-z]+$/i.test(word) || word.length > 100)
  ) {
    $("stage").textContent =
      "Enter three single English words separated by commas.";
    return;
  }
  if (
    new Set(targets.map((word) => word.toLowerCase())).size !== targets.length
  ) {
    $("stage").textContent =
      "Use three distinct target words for the benchmark.";
    return;
  }
  if (
    ["substitution", "extras", "correction", "cap"].includes(key) &&
    targets.some((word) => /^(window|river)$/i.test(word))
  ) {
    $("stage").textContent =
      "This scenario uses window or river as an incorrect answer. Choose a different target set.";
    return;
  }
  if (scenario.check === "phrase" && !settings.phrase.trim()) {
    $("stage").textContent = "Enter a finish phrase for this scenario.";
    return;
  }
  const track = benchQuest(settings);
  const run = {
    id: `bench-${crypto.randomUUID()}`,
    scenario: key,
    mode: "live",
    targets,
    settings,
    intended: scenario.said(targets, settings.phrase),
    expected:
      typeof scenario.expected === "function"
        ? scenario.expected(settings.ignoreOrder)
        : scenario.expected,
    events: [],
    actuallySaid: null,
    error: null,
    score: null,
    durationSec: track?.next ?? settings.word,
  };
  const abort = new AbortController();
  active = abort;
  const start = performance.now();
  const mark = (name, extra) => {
    const row = { name, ms: performance.now() - start, ...extra };
    run.events.push(row);
    if (name === "finish")
      $("stage").textContent = "Waiting for final transcript…";
    $("trace").textContent = run.events
      .map((item) => `${item.ms.toFixed(1)} ms · ${item.name}`)
      .join("\n");
    return row;
  };
  $("options").disabled = true;
  $("prepare").disabled = true;
  $("cancel").disabled = false;
  $("next-set").disabled = true;
  $("arena").scrollIntoView({ block: "start" });
  const clock = setInterval(() => {
    const current = run.events.findLast((e) =>
      ["finish", "last-word-off", "word-on", "cross-ready", "prepare"].includes(
        e.name,
      ),
    );
    const phaseStart =
      current?.name === "word-on"
        ? run.events.find((e) => e.name === "word-on").ms
        : current?.ms ?? 0;
    const elapsed = Math.max(
      0,
      (performance.now() - start - phaseStart) / 1000,
    );
    const phase =
      {
        finish: "Provider wait",
        "last-word-off": "Response window",
        "word-on": "Displaying words",
        "cross-ready": "At the cross",
        prepare: "Preparing",
      }[current?.name] ?? "Preparing";
    const limit =
      current?.name === "finish"
        ? settings.stt
        : current?.name === "last-word-off"
        ? settings.cap
        : null;
    $("clock").textContent = `${phase} · ${elapsed.toFixed(2)} s${
      limit == null ? "" : ` / ${limit}s`
    }`;
  }, 70);
  try {
    await play(run, abort.signal, mark);
    if (!abort.signal.aborted) {
      updateQuest(track, run);
      run.timing = measurements(run.events);
      run.checks = checkRun(run, scenario);
      memory.push(run);
      addReport(run);
      $("stage").textContent = run.error
        ? "Technical outcome · see evidence"
        : "Trial finished · see evidence";
      if (
        key === "perfect" &&
        targets.join(", ") === targetPool[targetIndex].join(", ")
      ) {
        targetIndex = (targetIndex + 1) % targetPool.length;
        $("targets").value = targetPool[targetIndex].join(", ");
        updateCue();
      }
    } else $("stage").textContent = "Trial cancelled";
  } finally {
    clearInterval(clock);
    $("clock").textContent = `Trial ended · ${(
      (performance.now() - start) /
      1000
    ).toFixed(2)} s total`;
    abort.abort();
    active = undefined;
    $("options").disabled = false;
    $("prepare").disabled = false;
    $("cancel").disabled = true;
    $("next-set").disabled = false;
    $("word-display").textContent = "";
  }
});

$("cancel").onclick = () => active?.abort();

function summarize() {
  const groups = new Map();
  for (const run of memory.filter(
    (r) =>
      r.mode === "live" &&
      r.scenario === "perfect" &&
      r.actuallySaid != null &&
      r.actuallySaid.trim().toLowerCase() === r.intended.toLowerCase(),
  )) {
    const key = JSON.stringify(run.settings);
    const group = groups.get(key) ?? {
      settings: run.settings,
      eligible: 0,
      failed: 0,
      words: 0,
      literal: 0,
      normalized: 0,
      aligned: 0,
    };
    group.eligible++;
    if (!run.score) group.failed++;
    else {
      group.words += run.targets.length;
      for (const [field, vector] of [
        ["literal", run.score.literalPosition],
        ["normalized", run.score.normalizedPosition],
        ["aligned", run.score.vector],
      ])
        group[field] += vector.reduce((n, word) => n + word, 0);
    }
    groups.set(key, group);
  }
  return [...groups.values()];
}

function updateAggregate() {
  const groups = summarize();
  const pct = (n, size) => (size ? `${((100 * n) / size).toFixed(1)}%` : "—");
  $("aggregate").textContent = groups.length
    ? groups
        .map(
          (g) =>
            `Keyterms ${g.settings.keyterms ? "on" : "off"}, order ${
              g.settings.ignoreOrder ? "ignored" : "strict"
            }, ${g.settings.word}s/word: ${
              g.eligible
            } confirmed intended runs (${g.failed} technical failures); ${
              g.words
            } scored words. Literal positional ${pct(
              g.literal,
              g.words,
            )} → normalized positional ${pct(
              g.normalized,
              g.words,
            )} → EasyEyes aligned ${pct(g.aligned, g.words)}.`,
        )
        .join(" | ")
    : "Accuracy summary: run ‘All three correct’, then confirm what you actually said.";
}

function addReport(run) {
  const card = element("article");
  card.append(
    element(
      "h3",
      `${memory.length}. ${scenarios[run.scenario].title} · ${run.mode}`,
    ),
  );
  card.append(
    element(
      "p",
      `Chirp 3 · keyterms ${
        run.settings.keyterms ? "TRUE" : "FALSE"
      } · ignore order ${
        run.settings.ignoreOrder ? "TRUE" : "FALSE"
      } · ${run.durationSec.toFixed(3)} s/word · response cap ${
        run.settings.cap
      } s · provider wait ${run.settings.stt} s`,
    ),
  );
  card.append(
    element(
      "p",
      `Targets: ${run.targets.join(" · ")} | Planned: ${
        run.intended || "(silence)"
      }`,
    ),
  );
  const label = element(
    "label",
    "What I actually said (type this or confirm the plan)",
  );
  const actual = element("input");
  actual.placeholder = "Type what you said, including intentional mistakes";
  actual.onchange = () => {
    run.actuallySaid = actual.value;
    updateAggregate();
  };
  label.append(actual);
  const confirm = element("button", "I said exactly what was planned");
  confirm.onclick = () => {
    actual.value = run.intended;
    actual.onchange();
  };
  if (run.mode === "live") card.append(label, confirm);
  if (run.score) {
    for (const [name, value] of [
      ["Provider final", run.score.raw],
      ["Normalized answer", run.score.normalized],
    ]) {
      card.append(element("p", `${name}: ${value || "(empty)"}`));
    }
    const table = element("table");
    const header = element("tr");
    for (const title of ["Target", "Aligned text", "Outcome", "Score"])
      header.append(element("th", title));
    table.createTHead().append(header);
    const body = element("tbody");
    for (const item of run.score.alignment) {
      const row = element("tr");
      for (const value of [
        item.targetWord,
        item.responseText ?? "—",
        item.outcome,
        item.correct,
      ])
        row.append(element("td", value));
      body.append(row);
    }
    table.append(body);
    card.append(
      table,
      element("p", `Vector: [${run.score.vector.join(", ")}]`),
    );
  }
  if (run.error)
    card.append(
      element(
        "p",
        `Technical outcome: ${run.sessionError ?? run.error.code} · no score`,
      ),
    );
  if (run.ticketStatus) {
    const diagnosis =
      {
        401: "Incorrect access code.",
        403: "Open the configured Netlify Preview URL.",
        429: "Too many trials started; wait one minute.",
        503: "Preview ticket service is not configured.",
      }[run.ticketStatus] ?? "Ticket endpoint unavailable.";
    card.append(
      element("p", `Netlify ticket: HTTP ${run.ticketStatus} · ${diagnosis}`),
    );
  }
  if (run.quest)
    card.append(
      element(
        "p",
        `QUEST: ${
          run.quest.updated ? "updated" : "not updated"
        } · next word duration ${run.quest.nextDurationSec.toFixed(3)} s`,
      ),
    );
  const list = element("ul");
  for (const { label, status } of run.checks) {
    const item = element(
      "li",
      `${
        status === "not-observed" ? "NOT EXERCISED" : status.toUpperCase()
      } · ${label}`,
    );
    item.dataset.check = status;
    list.append(item);
  }
  card.append(list);
  const details = element("details");
  details.append(
    element("summary", "Settings, timing, and alignment events"),
    element(
      "pre",
      JSON.stringify(
        {
          settings: run.settings,
          timingMs: run.timing,
          events: run.events,
          alignment: run.score?.alignmentEvents,
        },
        null,
        2,
      ),
    ),
  );
  card.append(details);
  $("report").prepend(card);
  $("export").disabled = false;
  $("export-csv").disabled = false;
  updateAggregate();
}

function download(name, value, type) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const link = element("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("export").onclick = () =>
  download(
    "rsvp-benchmark.json",
    JSON.stringify({ accuracy: summarize(), trials: memory }, null, 2),
    "application/json",
  );
const cell = (value) => {
  const text = String(value ?? "");
  return `"${/^[\s]*[=+\-@]|^[\t\r]/.test(text) ? "'" : ""}${text.replaceAll(
    '"',
    '""',
  )}"`;
};
$("export-csv").onclick = () => {
  const columns = [
    "scenario",
    "mode",
    "targets",
    "intended",
    "actuallySaid",
    "raw",
    "normalized",
    "vector",
    "literal",
    "normalizedPositional",
    "error",
    "checks",
    "settings",
    "timing",
    "quest",
  ];
  const rows = memory.map((r) => [
    r.scenario,
    r.mode,
    r.targets.join(" "),
    r.intended,
    r.actuallySaid,
    r.score?.raw,
    r.score?.normalized,
    r.score?.vector.join(""),
    r.score?.literalPosition.join(""),
    r.score?.normalizedPosition.join(""),
    r.sessionError ?? r.error?.code,
    r.checks.map((c) => `${c.status.toUpperCase()}: ${c.label}`).join("; "),
    JSON.stringify(r.settings),
    JSON.stringify(r.timing),
    JSON.stringify(r.quest),
  ]);
  download(
    "rsvp-benchmark.csv",
    [columns, ...rows].map((row) => row.map(cell).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
};
updateAggregate();
