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

Sources: official OpenDataLoader benchmark and its comparison notes. The hybrid mode's table advantage is material, but it has a much higher runtime cost than the default local parser. The project says the hybrid path uses a local backend; this still needs a dependency, model and resource audit before adoption.

## ROBOSCOPIA decision

1. OpenDataLoader default is the first parser to trial for digitally generated PDFs because it preserves structured elements and page bounding boxes.
2. OpenDataLoader hybrid is a conditional second pass for table-heavy pages only after local-only operation, model licensing, dependency and memory requirements are verified.
3. Docling remains the independent fallback/benchmark parser for complex documents and tables.
4. PaddleOCR is not enabled yet; scanned-document OCR requires a separate model-weight/license and CPU/GPU resource assessment.
5. Ajv is not installed yet. The repository has no package manifest or lockfile, so adding a runtime dependency without a reproducible dependency-management baseline would be unsafe. A versioned JSON Schema contract is added; dependency adoption is deferred until package management is established and CI can pin it.
6. Splink is deferred to a later isolated batch evaluation. No probabilistic entity matching is allowed to auto-merge records.

## What was actually tested

- The automated verification gate has deterministic Node.js tests in CI.
- Tests cover manufacturer-primary acceptance, two independent primary sources, insufficient corroboration, value/unit conflicts, exact model/configuration, rights, hashes, source URLs, locators, duplicate source identities, approximate values, malformed claims and non-mutation.
- Numeric quote matching uses complete numeric tokens and accepts decimal comma or decimal point; it rejects a value that appears only as a substring of a larger number.
- Evidence packages are indexed by claim ID once and each package is validated once. The source-verification report groups claims by source ID once, avoiding repeated full-array scans.
- Real PDF parser quality has NOT yet been benchmarked on a ROBOSCOPIA sample corpus. The public leaderboard is not a substitute for that test. The current repository does not contain a representative, rights-cleared PDF fixture corpus, and this change does not download or redistribute manufacturer documents.

## Safety boundary

The gate creates decisions only; it never changes \`data/robots.json\`. Existing records without sufficient, rights-cleared evidence remain quarantined. A single exact manufacturer primary source may qualify; otherwise two matching independent primary sources on distinct hosts are required. Human review is reserved for quarantined exceptions, calibration samples and periodic audits—not every ordinary record.

The gate is a deterministic evidence-eligibility check, not proof of factual correctness. It does not yet fetch pages, extract automatically from live sources or semantically verify that a source genuinely belongs to the stated manufacturer/model.
