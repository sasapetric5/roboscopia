# ROBOSCOPIA Data Quality Audit

## Status

Version: 1.0.0  
Implementation: `scripts/data-quality-audit.mjs`  
Tests: `tests/data-quality-audit.test.mjs`

This is a read-only local audit of the canonical `data/robots.json` file. It does not make network requests, crawl source websites, alter records, merge possible duplicates, or decide which conflicting value is correct.

## Run

Requires a modern Node.js release with ES modules and the built-in test runner.

```bash
node scripts/data-quality-audit.mjs
node scripts/data-quality-audit.mjs --json
node scripts/data-quality-audit.mjs --fail-on-warning
node --test tests/*.test.mjs
```

Exit codes:
- `0`: no errors (warnings may remain unless `--fail-on-warning` is used).
- `1`: data errors were found, or warnings were promoted to failure.
- `2`: the audit could not read or parse its input.

An optional first positional argument selects a different JSON file.

## Checks

- Required collections, unique IDs and schema version.
- Manufacturer, family and category references.
- Required model dossier identity and bilingual summaries.
- Field-level provenance and allowed verification statuses.
- Source registry references and consistency between source IDs.
- Configuration scope and contradictory verification states.
- HTTPS format for source and media URLs.
- Missing source metadata, unresolved domains and unreviewed sources.
- Potential duplicate model identities.
- Conflicting values for the same specification, unit and configuration scope.
- Verified values older than 365 days.
- Explicit media reuse-rights status.

## Severity

- **Error** — structural integrity or contradictory metadata that should block a clean audit.
- **Warning** — a human review is required; the audit does not infer a correction.
- **Info** — a policy reminder, such as media that has not been cleared for reuse.

A report status of `review_required` is not the same as a failed structural audit. It means the data still contains review work.

## Conservative rules

Potential duplicate models and conflicting specifications are flagged, never auto-merged or silently resolved. Different configurations are separate scopes. No numeric confidence score is generated. A source URL or manufacturer domain does not, by itself, prove that a technical claim is accurate.

The 365-day stale-value threshold is a review trigger, not proof that a specification changed. It can be revised through a documented policy change.

## Current limitations

- Does not fetch or verify the contents of external source pages.
- Does not detect every semantic duplicate or every conflict across differently named specifications.
- Does not prove that an HTTPS URL is reachable.
- Does not validate copyright ownership or grant media rights.
- Does not replace human technical review or future schema-level validation.
- The committed tests and the audit command passed in the latest GitHub Actions run.
