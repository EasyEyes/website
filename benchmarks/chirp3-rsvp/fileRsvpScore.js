import { tokenizeSpeechTranscript } from "@threshold/components/speech/textNormalization";
import { analyze } from "./evidence.js";

export const fileKeyterms = (targets) => [...new Set(targets.flatMap((target) =>
  tokenizeSpeechTranscript(target, "en-US").tokens.map(({ normalized }) => normalized)))];

export const fileTranscriptWords = (text) =>
  tokenizeSpeechTranscript(text, "en-US").tokens.map(({ comparisonKey }) => comparisonKey);

// Keep files out of the live trial controller and QUEST; reuse only its scoring.
export const fileRsvpScorer = (ignoreOrder) => (targets, transcript) =>
  analyze(targets, transcript, { ignoreOrder, phrase: "" });

export function makeRsvpCases(clips, score) {
  return clips.map((clip) => {
    const words = tokenizeSpeechTranscript(clip.reference, "en-US").tokens;
    const targets = clip.targets ?? words.map(({ original }) => original);
    if (words.length > 160)
      throw new Error(`Clip ${clip.id}: split references longer than 160 words.`);
    if (!targets.length)
      throw new Error(`Clip ${clip.id}: give explicit targets for an empty reference.`);
    if (clip.targets?.some((target) =>
      tokenizeSpeechTranscript(target, "en-US").tokens.length !== 1))
      throw new Error(`Clip ${clip.id}: targets must be individual words.`);
    return {
      ...clip,
      targets,
      targetSource: clip.targets ? "explicit" : "reference",
      expected: score(targets, clip.reference).vector,
    };
  });
}
