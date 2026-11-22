# RSVP speech benchmark

Netlify preview for the `benchmark/chirp3-rsvp` branch. Keep the branch out of
main. This is a standalone live harness for the production microphone capture,
RSVP speech controller, Chirp 3 adapter, scoring, and optional jsQUEST.
It does not start a Pavlovia session or exercise the PsychoJS renderer.

## Preview setup

Set these in Netlify with the **Functions** scope, restricted to the benchmark
branch or preview. Do not change the values for Production.

| Variable                 | Value                                                      |
| ------------------------ | ---------------------------------------------------------- |
| `RSVP_BENCH_ORIGIN`      | Exact preview origin, without a trailing slash             |
| `RSVP_BENCH_ACCESS_CODE` | Random 64-character hex code; share privately with testers |
| `CHIRP3_RELAY_URL`       | Existing `wss://…/v1/stream` endpoint                      |
| `CHIRP3_TICKET_SECRET`   | Signing secret for the relay named by `CHIRP3_RELAY_URL` |
| `RSVP_BENCH_DEEPGRAM_API_KEY` | Optional for paired trials; dedicated Deepgram key with permission to mint temporary tokens |
| `RSVP_BENCH_ELEVENLABS_API_KEY` | Optional for paired trials; ElevenLabs key with Speech-to-Text access |

Treat the access code and signing secret as Netlify secrets. Access code example:
`node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"`.
Never pass the signing secret to a browser or commit it. Redeploy the preview
after the environment is set. The current relay still works without tracing.

## Trace the last audio and Google results

Deploy `services/chirp3-stream` from this branch to a **separate** Cloud Run
service. Keep the production relay unchanged. Set
`CHIRP3_BENCH_TRACE_ORIGIN=https://deploy-preview-169--easyeyes.netlify.app`
on the new service along with its normal project, location, relay URL, and
ticket secret settings. This service only accepts the exact preview origin
and still requires a signed ticket. Set the matching relay URL and secret as
branch-specific Netlify overrides for the benchmark and redeploy the preview.

Run a trial using team test speech. Its details and JSON export show browser
PCM bytes, relay receipt and gRPC write counts, finish times relative to each
side's clock, and Google's original final segments with offsets when present.
These counts verify the path through the relay, not Google's internal decoder.
The relay does not persist this trace or write the transcript to Cloud Logging.

## Run a trial

1. Enter the preview code. Select a scenario, set keyterms and order, and
   choose the timing. Enter three words or load a plain-text English corpus.
2. Read the on-screen instructions, click **Prepare trial**, grant microphone
   permission, then click the cross. Follow the scenario and watch the timer.
3. Check the result card and confirm what you said. Repeat with the same words
   and different keyterm or order settings to compare. Export JSON or CSV.

Use developer test speech only. Exports may contain test transcripts, but
never audio, tickets, or credentials. Nothing is kept by the page after
reload unless it is exported.

## Audio files + references

This mode checks what the speaker said, independently of RSVP targets. It
accepts a version 1 JSON manifest and separate browser-decodable audio files
with unique filenames. Download the example on the page for the file format.
Play the matching audio, correct the human reference as needed, and mark it
reviewed. Export the reviewed manifest so the next session can reuse it.

Local-only is the default. Review or import a version 1 results file with rows
such as `{ "clipId": "example-001", "provider": "Engine / condition", "transcript": "boat lake" }`.
Use `error` instead of `transcript` for a failed request. Successful empty
transcripts use `"transcript": ""`. The table and graphs compare only the same
reviewed clips on which all imported providers succeeded; coverage, errors
and missing results are reported separately. JSON includes word alignment;
CSV contains aggregate counts. The audio itself is not exported.

Only for consenting team test voices, a separate manifest with
`"audioPolicy": "team-test"` can use the preview's live adapters. After explicit
confirmation, the browser sends the same audio to the selected providers,
without the reference or keyterms. Clips are limited to 30 seconds and replay
in batches of up to 20. This mode sends speech to third parties; do not use
it to bypass any dataset restrictions.

To prepare candidates from ACAD without any external requests:

```text
python benchmarks/chirp3-rsvp/prepare-acad.py --audio PATH_TO_ACAD-wav.zip --mapping PATH_TO_ACAD_EasyEyes_benchmark_mapping.zip --out PRIVATE_OUTPUT_DIRECTORY --limit 48
```

The script joins uniquely matched WAVs with transcript consensus and cuts
the annotated utterances. Output references are candidates, not listening
verified. Keep these recordings local; do not commit, deploy, or distribute
them. Only process them externally if the applicable TalkBank data-use and
non-retention conditions have been verified.

## Same-audio provider comparison

In **Compare with**, choose **Both** to test all three engines together, or
pick a single comparison provider. Select **Provider comparison: all three
correct**, and read the three words. Select **Provider comparison: only word 1
wrong**, keep the same targets and settings, and use the displayed replacement
(for example, say **cold, ducks, stone** for **coat, ducks, stone**). Confirm
what you said on each report. Repeat on more target sets and, if needed, with
keyterms off. Durations are fixed in these scenarios.

All selected providers receive the same microphone PCM chunks. Chirp 3 still
controls the recording window; comparison providers finalize at the same finish
request and never feed QUEST. ElevenLabs uses one explicit commit in this
benchmark. The paired summary counts correct targets on the all-correct
runs, false credit on word 1, and missed correct words at positions 2–3.
Runs without all selected results and matching audio counts are excluded from
combined metrics, but their available individual results are still shown.
No audio is saved or exported by this harness. Deepgram requests opt
out of model improvement. ElevenLabs requests logging off; if ElevenLabs
reports that zero retention was not applied, the Preview continues and
records a warning. Use only consenting developer test speech.

The preview build applies the repeated finish-phrase and audio-drain patches
to temporary copies of the pinned Threshold source. It waits for the last
AudioWorklet frame before requesting the final transcript. JSON exports keep the raw final transcript
and a bounded interim transcript history for diagnosis.

The timeline separates permission/device open, capture start, first outgoing
audio, DOM display, capture stop, commit, final result, and teardown. The DOM
display timestamp is not a physical pixel measurement. Relay readiness does
not establish when Google first received audio. The deadline scenario can
report **NOT EXERCISED** if Google finishes before expiry.

The accuracy summary groups confirmed all-correct trials by settings and
separates raw positional matching, normalized positional matching, and
EasyEyes alignment. These are benchmark target accuracy metrics, not generic
word error rate. When adaptive duration is enabled, each condition has its
own jsQUEST state and technical failures are not scored.
