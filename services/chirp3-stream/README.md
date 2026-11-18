# Chirp 3 streaming relay

This service bridges a browser WebSocket to Cloud Speech-to-Text V2's
bidirectional gRPC stream. It uses `chirp_3`, mono 16 kHz LINEAR16 PCM, the
condition's `fontLanguage`, and optional inline phrase hints containing only
that trial's targets. Google interim results are provisional; final segments
accumulate in the existing `SpeechSession`. Only a successful stream end after
the client sends `finish` acknowledges the complete response.

Use a Chirp-supported locale in `fontLanguage`. The runtime maps bare `en` to
`en-US` and `fa` to `fa-IR` for Google only; explicit regional locales are kept.
Google currently lists Persian support as Preview. Do not use instruction
language or automatic language detection to select the corpus language.

The existing RSVP controller owns recording onset, response-ending rules, and
`rsvpReadingSTTMaxSec`. The relay does not score answers, update QUEST, detect
trial completion from word counts, or turn transport errors into empty answers.
Every trial has its own stream. There is no mid-trial fallback to another model.

## Configuration

Use Node 24.22.1 or later within the Node 24 release line. Install with `npm ci`
in this directory. The service uses Application Default Credentials (ADC):
locally, `gcloud auth application-default login`; on Cloud Run, an attached
service account with `roles/speech.client`. Do not download a service-account
key or send Google credentials to the browser.

| Variable                 | Location          | Meaning                                                             |
| ------------------------ | ----------------- | ------------------------------------------------------------------- |
| `GOOGLE_CLOUD_PROJECT`   | Relay             | Project **ID**, not project number or billing ID                    |
| `CHIRP3_LOCATION`        | Relay             | `us` or `eu`; also selects the regional Speech API endpoint         |
| `CHIRP3_RELAY_URL`       | Relay and Netlify | Identical public `wss://…/v1/stream` address                        |
| `CHIRP3_TICKET_SECRET`   | Relay and Netlify | Identical random server-only signing secret, at least 32 characters |
| `CHIRP3_MAX_CONNECTIONS` | Relay             | Per-process concurrent connection cap; default 80                   |
| `PORT`                   | Relay             | HTTP/WebSocket listener; default 8080                               |

`npm start` does not load an `.env` file automatically. For local testing, copy
`.env.example` to `.env`, fill it privately, and use `node --env-file=.env start.mjs`.
Local WebSockets may use `ws://localhost:8080/v1/stream`; deployed endpoints must
use `wss`. A valid ticket still requires the existing Netlify speech-token
endpoint and its experiment-session verification.

## Cloud Run deployment

Deployment is separate from the Netlify build. These are operator steps, not
operations performed by application startup.

1. Confirm the project ID, processing region, billing, and study privacy approval.
   A US deployment can use Cloud Run `us-central1` with `CHIRP3_LOCATION=us`.
   Speech's `us` and `eu` locations are multi-regions, not Cloud Run region names.
2. Enable Speech-to-Text, Cloud Run, Cloud Build, Artifact Registry, and Secret
   Manager APIs. Create a dedicated runtime service account, grant it
   `roles/speech.client`, and grant access to the specific ticket secret only.
   Do not grant project Editor/Owner to the runtime identity.
3. Create an Artifact Registry Docker repository named `speech` in the deployment
   region. Build from the **website repository root**:

   ```powershell
   gcloud builds submit . --project=PROJECT_ID --config=services/chirp3-stream/cloudbuild.yaml --ignore-file=services/chirp3-stream/.gcloudignore --substitutions=_REGION=us-central1,_REPOSITORY=speech
   ```

   The upload and Docker build allowlists exclude `.env`, Git history,
   credentials, dependencies, and the experiment submodule. The build prints
   the image address containing its build ID.

4. Create a random signing secret in Secret Manager and set the same value in
   Netlify's `CHIRP3_TICKET_SECRET`. Do not commit or print it. Determine the relay
   address before deployment using Cloud Run's deterministic service URL:
   `wss://SERVICE_NAME-PROJECT_NUMBER.us-central1.run.app/v1/stream`.
5. Deploy the built image with the dedicated service account. A starting pilot
   configuration is 1 CPU, 512 MiB memory, concurrency 80, request timeout 300
   seconds, and a small explicit maximum instance count within the project's
   Speech quota. Set the non-secret variables above and mount the signing
   secret as `CHIRP3_TICKET_SECRET`. Browser WebSockets require a publicly
   invokable Cloud Run service; the application authenticates each connection
   using the signed ticket before allocating a Google stream. A warm minimum
   instance can reduce cold starts but incurs idle cost; choose it deliberately.
6. Set Netlify's `CHIRP3_RELAY_URL` to the identical URL, deploy the updated token
   function and runtime, then run a private compiled experiment with
   `rsvpReadingSTTProvider=chirp3`. Do not silently override conditions selecting
   ElevenLabs or Deepgram. Changing the Glossary default is a separate decision.

## Security and privacy boundaries

Tickets expire after 60 seconds and bind the allowed browser origin and relay
address. They are sent in the first WebSocket message, not in its URL. Netlify
verifies the existing Pavlovia experiment session; no per-study allowlist or
participant login is introduced. The relay receives only a session hash, not
the Pavlovia session token. Ticket replay detection is per process, not global
across replicas; origin checks are not a replacement for authentication.

The service forwards audio in memory without writing audio, transcripts, or
credentials to disk or application logs. Cloud Run can still record request
metadata. This code does not attest the Google account's retention or data-use
policy: verify that Speech data-logging opt-in is disabled, review Google terms
and processing location, and use the approved participant consent procedure.

Per connection: 5 seconds to authenticate, a 290-second total lifetime, 24 KB
maximum input messages, bounded transport buffers, and near-realtime audio
rate checks. Google finalization waits are normally cut short by the client's
`rsvpReadingSTTMaxSec`; the relay's total-lifetime limit is a separate transport
guard. Quotas, maximum instances, and billing alerts must be configured in the
project. None of these controls guarantees a spending ceiling against abuse.

## Verification

`npm test` runs loopback WebSocket and real Google SDK/protobuf tests against a
local fake gRPC server. No Google API request or bill is generated by these
tests. They do not measure real recognition quality, Cloud Run cold starts, or
participant-network latency.

Before participant use, test the deployed route with microphone audio: normal
speech, silence, partial answers, finish phrase, Space, provider timeout,
network disconnect, and consecutive conditions with different targets/locales.
Confirm the existing response arrays and QUEST handoff, and measure preparation
and finalization latency on US and European connections. Re-run matrix and
experimenter regressions; do not enable a study from unit-test results alone.

References: [Chirp 3](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3),
[Cloud Run WebSockets](https://docs.cloud.google.com/run/docs/triggering/websockets),
[service identity](https://docs.cloud.google.com/run/docs/securing/service-identity),
[Cloud Run URLs](https://docs.cloud.google.com/run/docs/custom-urls).
