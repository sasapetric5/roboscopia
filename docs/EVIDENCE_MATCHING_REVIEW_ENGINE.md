# ROBOSCOPIA Evidence Matching & Review Engine

## Purpose

`scripts/evidence-matching-review-engine.mjs` connects the read-only Data Quality Audit, Source Verification Engine and Technical Evidence Extraction Engine. It compares extracted evidence candidates with the catalog's source-verification claims. It is deterministic and read-only.

## Input and use

1. Generate the source claim report: `node scripts/source-verification-engine.mjs --json > data/source-verification-report.json`.
2. Extract text from a locally supplied, rights-cleared manufacturer document using the Technical Evidence Extraction Engine.
3. Run one or more evidence reports through the matcher:

```bash
node scripts/evidence-matching-review-engine.mjs --evidence ./evidence/spot-manual.json --json
```

The report reads `data/robots.json`, `data/source-verification-report.json`, and the optional local evidence JSON files. It never fetches a URL, crawls, scrapes or downloads a document. No evidence files are required for CI.

## Matching rules

- Compare normalized specification fields, then model identity and configuration scope.
- Compare numeric values and units exactly or through explicit, dimension-specific conversions for supported units. Original catalog and evidence values are preserved; conversions are comparison-only.
- Require compatible units even for non-scalar text values such as dimensions. Axis/joint labels are normalized as a count only for degrees-of-freedom comparisons.
- Ranges, approximate values and tolerances (for example `2–4 h`, `≈7–8 kg`, `±0.03 mm`) are never reduced to a single scalar; they receive a human-review status.
- Flag value, unit, model and configuration mismatches separately.
- Keep multiple plausible exact matches as ambiguous; never select one silently.
- Surface the extracted quote, document hash, revision/date, source URL, model/configuration hints and page/line/section locator.
- A document older than 365 days is marked as potentially stale evidence. This is a review trigger, not proof that the catalog is wrong.
- Missing evidence is explicitly reported for every unmatched catalog claim.

## Human review and catalog safety

Every comparison remains unverified until a reviewer decision is recorded in a separate decision store. Supported outcomes are `supported`, `partially_supported`, `contradicted` and `not_applicable`. A decision must include the exact match ID, evidence locator, note, reviewer and timestamp. The matcher can display such decisions but cannot modify `data/robots.json`.

Catalog changes remain a separate, manually authored and reviewed operation followed by the data-quality audit and source-verification report. The decision store is not an authenticated identity system; reviewer names are audit metadata only.

## Limits

- Matching is conservative and does not infer model applicability from a name mention.
- Unlabelled tables, OCR, split columns, unusual units and unsupported fields may not match.
- Same-host URLs are a hint only, not proof that the document is authoritative.
- The 365-day evidence age threshold is a configurable policy constant, not an industry validity standard.
- Unit conversion is implemented only for explicit compatible units; battery Ah/mAh cannot be compared without voltage.
- No confidence score or automatic factual verdict is generated.
