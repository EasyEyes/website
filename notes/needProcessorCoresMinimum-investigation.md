# \_needProcessorCoresMinimum Investigation

## Status (2026-05-07)

The check IS implemented but appears buggy — user set it to 1000 cores, has 10, yet device is deemed compatible.

## Code Flow

1. **Glossary**: `_needProcessorCoresMinimum` defined in `parameters/glossary.ts` with type `integer`, default `"6"`
2. **Preprocessing**: `preprocess/main.ts` → `normalizeExperimentDfShape()` → `populateUnderscoreValues()` copies first value to all rows → `dropFirstColumn()` → `populateDefaultValues()` → `splitIntoBlockFiles()` creates per-block CSVs
3. **ParamReader**: `parameters/paramReader.js` loads per-block CSVs; `read()` checks `has(name)` → if found, reads from CSV; if not found, falls back to `_getParamGlossary()` which returns the glossary default (6)
4. **Compatibility check**: `components/compatibilityCheck.js` → `getCompatibilityRequirements()` reads value, compares `hardwareConcurrency >= compatibleProcessorCoresMinimum`
5. **Check is at line ~1280** of compatibilityCheck.js

## Likely Root Cause

If `reader.has("_needProcessorCoresMinimum")` returns `false`, ParamReader falls back to glossary default of `6`. Since `10 >= 6` is `true`, device passes. The user's value of 1000 may not be making it into the per-block CSV files.

## Fixes Applied

1. Changed `const needsUnmet = []` to `let needsUnmet = []` and added `needsUnmet = []` reset at top of `checkSystemCompatibility()`
2. Added diagnostic `console.log` in `paramReader.js` to trace whether value comes from CSV or glossary default
3. Added diagnostic `console.log` in `compatibilityCheck.js` to trace the comparison

## Key Files

- `docs/experiment/threshold/components/compatibilityCheck.js` — compatibility check logic
- `docs/experiment/threshold/parameters/paramReader.js` — parameter reader
- `docs/experiment/threshold/parameters/glossary.ts` — parameter definitions + defaults
- `docs/experiment/threshold/preprocess/transformExperimentTable.ts` — CSV preprocessing
- `docs/experiment/threshold/preprocess/blockGen.ts` — per-block CSV generation
