import { scoreRsvpSpeechResponse } from "@threshold/components/rsvpSpeech/rsvpSpeechScoring";
import { stripRsvpSpeechFinishPhrase } from "@threshold/components/rsvpSpeech/rsvpSpeechFinish";
import {
  normalizeSpeechToken,
  tokenizeSpeechTranscript,
} from "@threshold/components/speech/textNormalization";

export function analyze(targets, raw, settings) {
  const language = "en-US";
  const answer = stripRsvpSpeechFinishPhrase(raw, language, settings.phrase);
  const result = scoreRsvpSpeechResponse({
    targetWords: targets,
    transcript: answer.text,
    languageCode: language,
    policy: {
      wordOrder: settings.ignoreOrder ? "anyOrder" : "strict",
      repetition: "ignore",
      selfCorrection: "accept",
    },
  });
  const literalWords = raw.trim().split(/\s+/);
  const normalizedWords = tokenizeSpeechTranscript(
    answer.text,
    language,
  ).tokens.map((token) => token.normalized);
  return {
    raw,
    withoutFinishPhrase: answer.text,
    finishPhraseInTranscript: answer.finished,
    normalized: result.diagnostics.normalizedTranscript,
    alignment: result.targetResults,
    alignmentEvents: result.diagnostics.events,
    vector: result.responseVector,
    literalPosition: targets.map((word, i) => Number(word === literalWords[i])),
    normalizedPosition: targets.map((word, i) =>
      Number(normalizeSpeechToken(word, language) === normalizedWords[i]),
    ),
    scoringVersion: result.diagnostics.scoringVersion,
  };
}

export function measurements(events) {
  const at = (name) => events.find((event) => event.name === name)?.ms;
  const elapsed = (from, to) =>
    at(from) == null || at(to) == null ? null : Math.round(at(to) - at(from));
  const accepted = events.find(
    (event) => event.name === "space" && event.accepted,
  );
  const finish = at("finish");
  return {
    providerReadyMs: elapsed("provider-connect", "provider-ready"),
    prepareMs: elapsed("prepare", "cross-ready"),
    crossWaitMs: elapsed("cross-ready", "cross-click"),
    firstAudioVsWordMs: elapsed("word-on", "first-audio"),
    afterLastWordToFinishMs: elapsed("last-word-off", "finish"),
    finishToAckMs: elapsed("finish", "provider-complete"),
    finishToErrorMs: elapsed("finish", "session-error"),
    spaceToFinishMs:
      !accepted || finish == null ? null : Math.round(finish - accepted.ms),
    durationOfCaptureMs: elapsed("capture-start", "capture-stop"),
    durationOfMicrophoneMs: elapsed("microphone-open", "microphone-close"),
    clickToFirstWordMs: elapsed("cross-click", "word-on"),
  };
}

export function checkRun(run, scenario) {
  const checks = [];
  const add = (label, ok) =>
    checks.push({
      label,
      ok,
      status: ok == null ? "not-observed" : ok ? "pass" : "review",
    });
  const clock = run.timing;
  const { settings, events } = run;
  const at = (name) => events.find((event) => event.name === name)?.ms;
  const finish = at("finish");
  const offset = at("last-word-off");
  if (scenario.check === "timeout") {
    if (run.score && at("provider-complete") != null) {
      add("Google finished before the deadline; timeout not exercised", null);
      return checks;
    }
    add(
      "Final-result timeout, no score",
      run.sessionError === "finalizationTimeout" && !run.score,
    );
    add(
      "Timeout starts at finish",
      clock.finishToErrorMs !== null &&
        clock.finishToErrorMs >= settings.stt * 1000 - 40 &&
        clock.finishToErrorMs <= settings.stt * 1000 + 500,
    );
    return checks;
  }
  if (scenario.check === "technicalFailure") {
    if (run.score && at("provider-complete") != null) {
      add("Stream completed; network failure was not observed", null);
      return checks;
    }
    add(
      "Provider error after first word, no score",
      at("word-on") != null && !!run.sessionError && !run.score,
    );
    return checks;
  }
  add(
    "Healthy final completion",
    !!run.score && at("provider-complete") != null,
  );
  add(
    "No audio sent while waiting on the cross",
    at("first-audio") != null &&
      at("cross-click") != null &&
      at("first-audio") >= at("cross-click"),
  );
  add(
    "Finish did not precede last-word offset",
    finish != null && offset != null && finish >= offset,
  );
  if (run.score && run.expected != null)
    add(
      `Expected score ${run.expected}; observed ${run.score.vector.join("")}`,
      run.score.vector.join("") === run.expected,
    );
  if (scenario.check === "space") {
    add(
      "Space was accepted and requested finish",
      clock.spaceToFinishMs !== null &&
        clock.spaceToFinishMs >= 0 &&
        clock.spaceToFinishMs < 250,
    );
  }
  if (scenario.check === "earlySpace") {
    add(
      "Space during display was not accepted",
      events.some(
        (event) =>
          event.name === "space" &&
          !event.accepted &&
          offset != null &&
          event.ms < offset,
      ),
    );
  }
  if (scenario.check === "phrase") {
    const command = [...events]
      .reverse()
      .find(
        (event) =>
          event.name === "segment" &&
          stripRsvpSpeechFinishPhrase(event.text, "en-US", settings.phrase)
            .finished,
      );
    add(
      "Finish phrase found and removed in final scoring",
      run.score?.finishPhraseInTranscript === true,
    );
    add(
      "Finish followed a settled phrase (not just final cleanup)",
      command == null
        ? null
        : finish != null &&
            offset != null &&
            finish >= command.ms &&
            finish - Math.max(command.ms, offset) < 300,
    );
  }
  if (scenario.check === "allCorrect") {
    add(
      "Finished before the silence/cap window (early completion)",
      clock.afterLastWordToFinishMs != null &&
        clock.afterLastWordToFinishMs <
          Math.min(settings.silence, settings.cap) * 1000 - 100,
    );
  }
  if (scenario.check === "silence" || scenario.check === "cap") {
    const window =
      (scenario.check === "cap"
        ? settings.cap
        : Math.min(settings.cap, settings.silence)) * 1000;
    add(
      `Finish timing vs ${window / 1000}s window`,
      clock.afterLastWordToFinishMs != null &&
        clock.afterLastWordToFinishMs >= window - 80 &&
        clock.afterLastWordToFinishMs <=
          window + (scenario.check === "cap" ? 350 : 950),
    );
  }
  if (scenario.check === "pause")
    add(
      "Kept capturing long enough for the planned 3s pause",
      clock.afterLastWordToFinishMs != null &&
        clock.afterLastWordToFinishMs >= 3000,
    );
  if (scenario.check === "waitCross")
    add(
      "Completed after the configured cross wait",
      !!run.score &&
        clock.crossWaitMs != null &&
        clock.crossWaitMs >= settings.crossWait * 1000 - 80,
    );
  return checks;
}
