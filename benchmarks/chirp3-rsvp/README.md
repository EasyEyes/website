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
| `CHIRP3_TICKET_SECRET`   | Same ticket signing secret as the existing Chirp 3 relay   |

Treat the access code and signing secret as Netlify secrets. Access code example:
`node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"`.
Never pass the signing secret to a browser or commit it. Redeploy the preview
after the environment is set. No relay redeploy is required.

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

The preview build applies the repeated finish-phrase patch to a temporary copy
of the pinned Threshold source. JSON exports keep the raw final transcript
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
