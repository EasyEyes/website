# remote-calibrator `0.8.881` — `stepperBool=FALSE` phrases-API compatibility patch

**Status:** Published to npm (9 June 2026)
**Package:** `remote-calibrator@0.8.881` (built from tag `v0.8.88`, branch `release/0.8.881`)
**Consumers updated:** `threshold` — `index-stepper-bool.html`, `examples/buildExamples.ts`
**Audience:** EasyEyes dev team

> **Why this exists in one line.** When `_stepperBool=FALSE`, the compiler pins the
> experiment to an _old_ remote-calibrator (the only build with the non-stepper distance
> flow). The current `threshold.min.js` feeds RC phrases via the new phrases API, which
> the old `0.8.88` couldn't consume correctly. `0.8.881` is `0.8.88` taught to speak the
> new phrases API — and nothing else.

---

## 1. TL;DR

- `_stepperBool=FALSE` requires the old RC `0.8.88` because the **new RC removed the
  non-stepper distance-calibration UI**. Phrases breakage was collateral, not the cause.
- Old `0.8.88` loaded its base phrase table by runtime-fetching
  `remote-calibrator@latest/src/i18n/phrases.js`, then overlaying the experiment's phrases.
  Against the **new phrases arch** this base layer is both **stale** (lowercase `[[xxx]]`
  token) and **wrong-keyed** (`en-US`/`en-UK`/`zh-HK` vs the API's `en`/`zh-CN`/`zh-TW`),
  so it **collides** with the API overlay → blank/`xxx` strings.
- **`0.8.881` = `0.8.88` + two edits:**
  1. `loadPhrases.js` → **overlay-only** (no `@latest` base fetch). The API table is complete.
  2. `screenSize.js` → token `[[xxx]]` → `[[XXX]]` (match the new data) at both call sites.
- The standalone `src/i18n/phrases.js` file **stays in the RC repo** (Path X) — `0.8.881`
  no longer fetches it, but already-deployed older RCs (`0.8.50`–`0.9.139`) still do.

---

## 2. Background — how the pieces fit at runtime

```
threshold compiler ──compiles──▶ experiment on Pavlovia
   │                                 │
   │ picks index*.html               │ at run time loads, from jsDelivr:
   │  by _stepperBool                ▼
   │                          remote-calibrator (pinned version)
   ▼                                 │
 index.html           → RC @0.9.140-beta.0   (stepperBool=TRUE,  new stepper UI)
 index-stepper-bool   → RC @0.8.881          (stepperBool=FALSE, old non-stepper UI)
                                       │
 phrases come from: /.netlify/functions/phrases?pinned=<user>/<exp>  (Firebase, per-experiment)
 passed into RC via: rc.init({ languagePhrasesJSON })
```

Key facts that drove the design:

- **The same `threshold.min.js` ships in both HTML templates.** Only the RC version differs.
  So we cannot fix `stepperBool=FALSE` by serving an older `threshold.min.js` — that would
  freeze those experiments on stale threshold code forever.
- **`_stepperBool=FALSE` is only allowed when `_calibrateDistance ∈ {object, blindspot}`**
  (`threshold/preprocess/main.ts`). There is **no** rule coupling `_stepperBool` to
  `calibrateScreenSizeBool`, and the `object` distance method pairs naturally with
  screen-size calibration — so the `RC_screenSizeHave` screen-size path **is** reachable on
  this path. (This is why edit #2 is required, not optional.)

---

## 3. The bug in detail

### 3a. The `@latest` base-fetch (root failure mode)

Old `0.8.88` `src/i18n/loadPhrases.js`:

```js
const PHRASES_URL =
  "https://cdn.jsdelivr.net/gh/EasyEyes/remote-calibrator@latest/src/i18n/phrases.js";

const loadPhrases = async (customizedLanguagePhrasesJSON = null) => {
  const { remoteCalibratorPhrases } = await import(PHRASES_URL); // base table
  Object.assign(phrases, remoteCalibratorPhrases);
  if (customizedLanguagePhrasesJSON)
    // experiment overlay
    Object.assign(phrases, customizedLanguagePhrasesJSON);
};
```

Every released RC `0.8.50`–`0.9.139` fetches that `@latest` file at run time. Two problems
when paired with the new phrases arch:

1. If `phrases.js` is ever **deleted** from `@latest`, the `import()` 404s → `loadPhrases`
   throws → RC init dies → **every already-deployed experiment breaks retroactively.**
2. The base table uses the **old scheme** (`en-US`/`en-UK`/`zh-HK`, stale `[[xxx]]`), which
   **collides** with the new API overlay (`en`/`zh-CN`/`zh-TW`, `[[XXX]]`).

### 3b. Language-key scheme change (the `en` vs `en-US` issue)

|                              | English          | Chinese          | Portuguese    | UK English |
| ---------------------------- | ---------------- | ---------------- | ------------- | ---------- |
| **New phrases API**          | `en`             | `zh-CN`, `zh-TW` | `pt`, `pt-pt` | _(none)_   |
| **Old RC base `phrases.js`** | `en-US`, `en-UK` | `zh-CN`, `zh-HK` | `pt`          | `en-UK`    |

`looseSetLanguage` resolves the display language `L` from the loaded `EE_languageNameNative`
keys; `readi18nPhrases` (threshold) and RC then index `phrases[key][L]` **strictly** (throws
on miss). Mixing the two schemes (base + overlay) leaves `L` in one scheme while some phrase
values are keyed in the other → blank strings or thrown phrase errors.

### 3c. Token-case change (`[[xxx]]` → `[[XXX]]`)

- New RC + new API: `screenSize` dropdown uses `replacePhraseToken` → `.replace('[[XXX]]', …)`,
  and the data carries `[[XXX]]` (export: `[[XXX]]` ×1246, `[[xxx]]` ×0).
- Old `0.8.88`: `screenSize()` does `.replace('[[xxx]]', …)` (lowercase) at two sites.
- Result on the unpatched `0.8.88` path: the `<select>` is never injected → participant sees
  the raw `RC_screenSizeHave` text (the `xxx` symptom).

---

## 4. The two edits in `0.8.881`

Built from a `v0.8.88` worktree; `package.json` version → `0.8.881`.

### Edit 1 — `src/i18n/loadPhrases.js`: overlay-only

```js
import { phrases } from "./schema";

// 0.8.881: Phrases come solely from the EasyEyes phrases API, passed in via
// rc.init({ languagePhrasesJSON }). The legacy base-table fetch from
// remote-calibrator@latest/src/i18n/phrases.js has been removed (stale tokens +
// old en-US key scheme collide with the new API). The API table is complete.
const loadPhrases = async (customizedLanguagePhrasesJSON = null) => {
  if (customizedLanguagePhrasesJSON)
    Object.assign(phrases, customizedLanguagePhrasesJSON);
};

export { loadPhrases };
```

`schema.js` still exports `export const phrases = {}`, so `phrases` is defined and filled
entirely from the API overlay. This also eliminates the `@latest` 404 risk for the patched
build.

### Edit 2 — `src/screenSize.js`: token case (2 sites)

```diff
-    '[[xxx]]',
+    '[[XXX]]',
```

at `screenSize.js:150` (initial render) and `:239` (continue/repeat render). These were the
**only** lowercase-token replacements in the whole `0.8.88` source; every other token
(`[[N1]]`, `[[N11]]`, `[[IN1]]`, `[[UUU]]`, `[[CM1]]`, …) was already uppercase and matches.

---

## 5. Path X vs Path Y — why both halves matter

|                                        | Serves                                                             | Mechanism                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Path X** (keep `phrases.js` in repo) | **already-deployed** experiments running old RC `0.8.50`–`0.9.139` | their frozen RC still runtime-fetches `@latest/.../phrases.js`; the file (old `en-US` scheme) matches their old `en-US` overlays |
| **Path Y** (`0.8.881`, this note)      | **newly-compiled** `stepperBool=FALSE` experiments                 | overlay-only build consumes the new `en`-scheme API directly; no base, no collision                                              |

A **single `phrases.js` cannot serve both schemes** — old overlays are `en-US`, new overlays
are `en`. That's why new compiles get a patched RC (Path Y) while old experiments keep the
unmodified `0.8.88` + the retained base file (Path X). **Do not delete
`remote-calibrator/src/i18n/phrases.js`** while any deployed experiment runs an
`@latest`-fetching RC version.

---

## 6. Consumer references (threshold)

All `stepperBool=FALSE` references point at the patched build; `stepperBool=TRUE` is unchanged.

| File                                                     | `stepperBool=FALSE`                    | `stepperBool=TRUE`                            |
| -------------------------------------------------------- | -------------------------------------- | --------------------------------------------- |
| `index-stepper-bool.html:109`                            | `@0.8.881/lib/RemoteCalibrator.min.js` | —                                             |
| `examples/buildExamples.ts` (`rcVersion`, ~L138–141)     | `@0.8.881/lib/RemoteCalibrator.min.js` | `@latest`                                     |
| `index.html:110`                                         | —                                      | `@0.9.140-beta.0/lib/RemoteCalibrator.min.js` |
| `components/multiple-displays/peripheralDisplay.html:10` | —                                      | `@0.9.140-beta.0/lib/RemoteCalibrator.min.js` |

---

## 7. Things to consider / gotchas

- **Don't let `0.8.881` become npm `latest`.** Publish under a dist-tag
  (e.g. `--tag stepperbool-compat`). It's a `0.8.x` line, so jsDelivr `@latest` (tracking
  `0.9.x`) won't move regardless, but tag it explicitly to be safe.
- **jsDelivr propagation lag.** First request to
  `cdn.jsdelivr.net/npm/remote-calibrator@0.8.881/lib/RemoteCalibrator.min.js` triggers the
  npm fetch; allow a few minutes. Sanity check the served bundle contains `[[XXX]]`, **not**
  `[[xxx]]`, and does **not** reference `remote-calibrator@latest/src/i18n/phrases.js`.
- **Recompile to re-pin.** An existing `stepperBool=FALSE` experiment that showed the bug
  won't self-heal — its uploaded HTML names the old version and its pinned phrases are frozen.
  Recompile so it adopts the `0.8.881` template and corrected pinned phrases.
- **Overlay completeness is a hard dependency.** Overlay-only `0.8.881` assumes every `RC_*`
  phrase exists in the `?pinned=` API response. This holds (the new RC `0.9.x` runs overlay-
  only and works), but if the phrases function is ever changed to return a used-subset, the
  non-stepper RC UI would get missing keys.
- **Latent `looseSetLanguage` fallback.** RC's hardcoded `constructLangData('en')` fallback
  now resolves against the API (which has `en`), but it does **not** exist in the old base
  scheme. Low priority, but worth hardening to `'en-US'`-or-first-available so an unmatched
  language degrades gracefully on both paths.
- **`en-UK` / `zh-HK` are gone in the new API** (replaced by `en`/`zh-TW`). New experiments
  can't select them; old experiments keep their own frozen overlays, so they're unaffected.

---

## 8. Verification checklist

- [ ] `https://cdn.jsdelivr.net/npm/remote-calibrator@0.8.881/lib/RemoteCalibrator.min.js`
      resolves and contains `[[XXX]]`, no `[[xxx]]`, no `@latest` phrases fetch.
- [ ] Compile a `stepperBool=FALSE` + `calibrateScreenSizeBool=TRUE` experiment; the screen-
      size step shows the USB-A/USB-C/card **dropdown**, not literal `xxx`.
- [ ] Non-English language renders RC calibration strings (no blanks / no "Phrase … not
      defined" errors).
- [ ] An already-deployed _old_ experiment still loads (Path X: `phrases.js` present at
      `@latest`).

---

## 9. Related

- `remote-calibrator/src/i18n/phrases.js` — frozen compatibility ballast (see its header
  comment; do not delete).
- `notes/GLOSSARY_VERSIONED_API_ARCHITECTURE.md` — sibling "single source of truth" API for
  the glossary (parallel pattern; confirmed **not** subject to the `@latest` retroactive risk).
