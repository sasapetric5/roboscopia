# Automated verification implementation — evaluation record

Date: 2026-11-21  
Branch: main

## Candidate comparison

The current upstream OpenDataLoader benchmark reports (scores are project-published, not independently reproduced by ROBOSCOPIA):

| Parser/mode | Overall | Reading order | Tables | Headings | Speed (s/page) |
|---|---:|---:|---:|---:|---:|
| OpenDataLoader hybrid | 0.907 | 0.934 | 0.928 | 0.821 | 0.463 |
| Docling | 0.882 | 0.898 | 0.887 | 0.824 | 0.762 |
| OpenDataLoader default | 0.831 | 0.902 | 0.489 | 0.739 | 0.015 |

These are upstream-reported scores, not a ROBOSCOPIA benchmark. Hybrid mode's table score is promising, but local-only operation, models, licensing, dependencies and resource limits still require verification.

## ROBOSCOPIA decision

1. OpenDataLoader default is the first parser candidate for digitally generated PDFs.
2. OpenDataLoader hybrid is a conditional second pass for table-heavy pages after its local runtime and resource requirements are audited.
3. Docling remains an independent fallback/benchmark candidate.
4. PaddleOCR is not enabled; model-weight licensing and resource requirements remain open.
5. Ajv is not installed. The repository still needs a reproducible dependency-management baseline before a new runtime dependency is introduced.
6. Splink is deferred to a later isolated evaluation. Probabilistic matching must never auto-merge catalog records.

## Canonical Source Registry enforcement

The automated evidence gate now requires the canonical `db.sources` array as an explicit input. An evidence package cannot grant itself source authority or processing rights.

For every evidence package, the gate requires:
- exactly one matching source ID in the canonical registry;
- exact canonical HTTPS URL match (credentials and non-standard ports rejected);
- registry authority tier of `manufacturer_primary` or `independent_primary`, matching the package;
- registry `reviewStatus: "verified"` and a valid source review timestamp;
- explicit registry processing permission, named reviewer, review timestamp and documented basis;
- package-level processing permission assertion;
- exact model/configuration, value and unit match;
- SHA-256, document revision/capture date, exact quote, page/selector locator and allowlisted parser/version.

Duplicate registry IDs, missing or unreviewed sources, URL/authority mismatches, incomplete rights records and ambiguous evidence are quarantined. The acceptance rule remains one qualifying manufacturer-primary source OR two qualifying independent-primary sources on distinct hosts. No evidence decision mutates the catalog.

The current 15 source records are all unreviewed and lack the required rights-review metadata. Therefore, existing evidence cannot qualify for automatic ingestion until a real source review is completed. This is an intentional fail-closed result, not a CI failure.

## What is tested versus what is not

CI runs deterministic Node.js tests for source-registry binding, source ID duplication, URL and authority spoofing, review status, rights metadata, evidence identity, exact values/units/quotes, hashes, locators, parser allowlisting, insufficient corroboration, malformed input and read-only behavior.

Parser adapters are currently syntax-compiled in CI; their third-party runtimes are not installed or executed. The parser benchmark corpus is empty. No claim is made that PDF extraction quality or live source acquisition has been validated on a ROBOSCOPIA corpus.

## Safety boundary and remaining work

The gate emits an eligibility report only. It does not change `data/robots.json`, fetch live pages, prove manufacturer ownership, or establish legal permission by itself. Rights review must be based on actual permission or a documented legal basis—not an inferred assumption from a public URL.

Production readiness still requires a representative rights-cleared gold corpus, reproducible pinned parser runtimes, structured page/table/locator outputs, resource isolation, robust source acquisition controls (including SSRF/DNS rebinding protection, redirect validation, persistent rate limits and robots policy), and independent end-to-end validation. These items remain in Phase 1; Phase 2 must not begin until they are complete and tested.
