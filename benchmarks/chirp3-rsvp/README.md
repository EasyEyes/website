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

For file replay, enable **Chirp 3 diagnostic: compare 0 vs. 800 ms trailing
silence**. Each clip gets two Chirp streams under the selected keyterms
setting, one unmodified and one with 800 ms of zero-valued PCM appended.
The table compares raw transcripts and byte counts; the results JSON also
contains timing and final segments. A missing relay trace is reported as
unavailable, not as dropped audio. Use `--tail-test` for an unattended
run. Tail results are kept out of the ordinary provider score report.

`prepare-chirp-tail.mjs --manifest MANIFEST --results RESULTS --out DIRECTORY`
copies the original WAVs for all three-target cases where Chirp (keyterms on)
successfully returned fewer than three words, including unreviewed or
flagged clips. Run it with Node. The audit distinguishes the source
reference from any edited reference. No audio is uploaded by preparation.

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

Select a manifest with validated references and all matching audio files,
choose providers, and press **Run dataset** once. No per-clip approval is
needed. The example manifest on the page documents the format; only the
clip ID, filename, and spoken reference are required. This run sends audio
to the selected third-party providers; the operator is responsible for
authorization and retention requirements. Keyterms default to **Off**. With
**On**, each request receives the displayed target words if supplied, or
individual normalized reference words otherwise. This latter mode gives the
provider a known-answer hint and only measures recognition with those hints.
**Compare off and on** runs both variants with the same audio and reports each
provider's changes on clips for which both variants succeeded. Import an
earlier results JSON first to reuse completed baseline runs.

The benchmark runs the same EasyEyes RSVP normalizer and scorer on the
human reference and on each provider's transcript, using the same targets
and word-order policy. Without explicit `targets`, spoken reference words
become hypothetical RSVP targets, which measures missed correct answers
but cannot estimate false credit. To test false credit, include actual
displayed targets or declared challenge targets in the manifest. This is
file replay, not a measurement of adaptive reading speed.

The full dataset runs automatically, pacing requests to the preview ticket
limit. Individual clips must be at most 30 seconds. Results can be exported
and reimported to resume without rerunning providers that already succeeded.
For a large pack, use 25- or 100-run batches and keep the tab visible. The
progress panel shows the current file and provider stage, successful and
failed jobs, and each finished transcript or error. Export results JSON at
any point after a provider has returned to keep a resumable checkpoint.
The report scores individual targets. It shows all scored targets, agreement,
missed targets (1 → 0) and false credit (0 → 1). The latter two rates use
different denominators: human reference 1s and 0s, respectively. Compare
providers on common successful clips; use the available-clips table for each
provider's full coverage. The participant chart is available when the manifest
includes a pseudonymous `speakerGroup` on its clips.
The provider agreement panel compares any two provider/settings on their
jointly successful clips. An unequal target bit invalidates the whole clip in
this analysis. Both single-provider rates use the same baseline clips; the
agreement rates use only the retained clips.

For unattended runs on Windows, use the headless preview runner from the
website root. It requires Google Chrome and the benchmark workspace's
Playwright dependency (or set `EE_BENCH_SOURCE_ROOT` to the website checkout
that has it installed under Threshold).

```powershell
$code = Read-Host "Preview access code" -AsSecureString
$env:RSVP_BENCH_ACCESS_CODE = [System.Net.NetworkCredential]::new("", $code).Password
node benchmarks/chirp3-rsvp/run-dataset.mjs --manifest PATH_TO_manifest.json --output PATH_TO_results.json --allow-provider-upload
Remove-Item Env:RSVP_BENCH_ACCESS_CODE
```

The runner uses three concurrent clips by default; `--workers 1` or
`--workers 2` lowers concurrency. It
streams in real time and obeys ticket pacing. Add `--batch 25` or
`--batch 100` for a shorter run. The JSON is replaced atomically
as new outcomes arrive (checked every five seconds), and rerunning the same
command resumes it. Keep the computer awake; no visible browser tab is
needed. The JSON can be loaded into the Preview to score and review it.

In **Listen to and review individual clips**, playback uses the selected local
file. The original report stays fixed. A corrected human transcript changes
the expected decisions; it does not change the targets or provider text. A
provider-side override corrects an automatic scoring mistake, not a word the
provider genuinely misrecognized. The reviewed report excludes invalid and
unintelligible clips. The third view also excludes difficult-but-intelligible
audio; it still includes unreviewed clips. Pick a model or run setting to
filter its transcript differences, short outputs, missed targets, false
credit, or errors no other imported model made. Each filter displays the
number of matching clips. The short-output filter counts words against
the current human reference; it does not prove a word was dropped.
**Save review** saves the clip and model decisions together, completes the
clip, and advances through the pending list. Use **Previous** to revisit a
clip just saved, or **Reviewed only** to browse saved clips. To correct the
human transcript, check the correction box before editing. Review coverage
shows the scoring impact from changing the reference alone.

Export JSON to retain transcripts, the original and reviewed decisions and
the saved reviews. Import the JSON with the same manifest to resume. Clip and
model notes and model-specific deletion checks are saved separately from
score overrides. Export the review annotations CSV for those checks and notes,
or the metrics CSV for target counts and percentages across views and
participants. Neither export includes audio.

**Exclude trailing-s disagreements** is an optional sensitivity check on the
target metrics and metrics CSV. It removes the affected target decisions
from the error counts and denominators, model by model, without changing
the transcripts, saved reviews, or other target decisions in a clip.
Provider agreement stays strict: **Trials lost / eligible** reports both
disagreement and unavailable results on the selected report's eligible trials.

To prepare candidates from ACAD without any external requests:

```text
python benchmarks/chirp3-rsvp/prepare-acad.py --audio PATH_TO_ACAD-wav.zip --mapping PATH_TO_ACAD_EasyEyes_benchmark_mapping.zip --out PRIVATE_OUTPUT_DIRECTORY --limit 48
```

The script joins uniquely matched WAVs with transcript consensus and cuts
the annotated utterances. Output references are candidates, not listening
verified. Do not treat them as validated references without independent
review, or include the dataset files in a Git commit or deploy.

For the larger ACAD pack with explicit targets from task lists 23, 24 and 26,
run `prepare-acad-targets.py` with the same ZIP inputs, the original human
transcripts ZIP (`--transcripts`), and a different `--out` directory. It
checks the archived task templates and original transcript text, source
identity, WAV duration and segment bounds, and writes a source audit next to
the manifest. Use `--verify-existing` to compare a prepared pack to the
source archives without rewriting it. The pack stays local and is not served
by the preview.
Use `--longer-wordlists` for the separate ordinary-word lists. This mode
keeps one contiguous, annotated child segment per recording instead of
joining multiple segments.

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
