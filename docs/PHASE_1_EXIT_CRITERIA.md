# Phase 1 — Exit Criteria and Completion Gate

**Status:** IN PROGRESS — NOT APPROVED FOR PHASE 2  
**Scope:** Establish a reliable, traceable, rights-aware technical data and evidence pipeline for the initial Roboscopia catalogue.  
**Current baseline:** 7 catalogue models, 39 technical claims, 15 registered manufacturer source URLs, and 7 evidence-document records.

This document is the operational acceptance checklist for Phase 1. A green CI run proves that automated checks passed; it does not prove that manufacturer documents were reviewed or that catalogue claims are factually verified.

## 1. Non-negotiable exit conditions

Phase 1 may be closed only when every applicable condition below is satisfied:

- [ ] **Source identity and authority:** Every source URL resolves to the correct manufacturer-controlled source or an explicitly documented official delivery host. Manufacturer-controlled material is classified as `manufacturer_primary`; domain classification alone is not treated as page review or claim verification.
- [ ] **Source review:** Each source used for a claim has a recorded human review, exact page/document title, model and variant applicability, revision/date where available, review timestamp, reviewer and review note.
- [ ] **Document provenance:** Every processed document/page capture has a stable evidence-document ID, canonical source mapping, capture/acquisition timestamp, SHA-256, content type, and document revision or an explicit live-page capture identifier.
- [ ] **Rights gate:** Processing permission has an explicit, recorded basis and reviewer in the canonical Source Registry. Redistribution, public display, quotation, image/video reuse and document hosting are tracked separately. Unknown rights never imply permission.
- [ ] **Evidence extraction:** Each claim intended for verification has an exact excerpt, value, original unit, model/variant/configuration identity, document hash and precise locator (PDF page/section or stable HTML locator). Automated extraction remains a candidate, not an approval.
- [ ] **Claim review:** All 39 initial claims have a human-reviewed outcome: supported, partially supported, contradicted or not applicable. Conflicts, ranges, variant ambiguity and unit differences are explicitly resolved or remain quarantined.
- [ ] **Catalog integrity:** No unreviewed candidate or automated result mutates `data/robots.json`. Only an explicit, validated human-approved change can update catalogue facts. Original values and provenance remain auditable.
- [ ] **End-to-end proof:** At least one real, lawfully processed manufacturer document completes the full pipeline; additionally, all 39 claims receive the appropriate evidence/review disposition before Phase 1 closure.
- [ ] **Quality and security:** All tests, data-integrity checks, source-mapping checks, parser benchmarks and CI workflows pass. No unresolved critical/high severity defects remain.
- [ ] **Delivery record:** A final Phase 1 report records counts, unresolved exceptions (which must be zero for blocking exceptions), evidence coverage, review decisions, rights status, test run links and the exact main-branch commit.

## 2. Current work inventory

| Workstream | Baseline | Exit requirement |
|---|---:|---|
| Catalogue | 7 models | Exact model/variant identity and coherent provenance |
| Technical claims | 39 | 39 explicit human-reviewed dispositions |
| Source Registry | 15 URLs | Review every source actually used; document unused/duplicate/historical sources |
| Evidence document registry | 7 records | Validate all mappings and process applicable documents/pages |
| Rights review | Pending for registered documents | Explicit processing basis; separate redistribution decision |
| Extraction | Engine and tests implemented | Real-document evidence with precise locators |
| Matching and verification | Engines implemented | Resolve all claim matches and quarantine unresolved cases |
| CI | Automated workflow | Green on the final Phase 1 commit |

The seven evidence-document records cover the initial claim groups across Boston Dynamics Spot, Unitree Go2 and H1, Universal Robots UR5e and UR20, ABB GoFa, and KUKA KR 6. Some records point to HTML product/support pages and others to PDFs. The workflow must support both document types without mislabelling a webpage capture as a PDF.

## 3. Efficient execution order

### Workstream A — Registry integrity
- Validate all evidence-document IDs, canonical source IDs, exact URLs/hosts, model IDs and claim links.
- Flag duplicate, historical, superseded and variant-ambiguous sources.
- Keep manufacturer authority, review status, claim verification and reuse rights as separate fields.

### Workstream B — Source and rights review
- Review sources in manufacturer batches rather than claim-by-claim.
- Capture one source review once, then reuse it for every applicable claim.
- Do not infer permission from public accessibility, robots.txt, a manufacturer domain, or a downloadable PDF.
- Where written permission is unavailable, use only a legally permissible review route and keep processing blocked until its basis is documented.

### Workstream C — Evidence acquisition and extraction
- Process PDFs with hash, revision, page count and exact page locators.
- Process HTML pages with a reproducible capture method, capture timestamp/hash and stable section/table/row locators.
- Preserve variant columns and footnotes. Never merge configuration-specific values into a single generic specification.
- Treat OCR, inferred values and ambiguous table associations as lower-confidence candidates requiring explicit human review.

### Workstream D — Claim resolution
- Batch-review candidates by manufacturer document.
- Verify value, unit, field meaning, exact model, configuration, document revision and applicable footnotes.
- Record supported, partially supported, contradicted or not-applicable decisions with reviewer, timestamp, note and locator.
- Keep unresolved claims quarantined; do not lower the acceptance bar to improve completion percentages.

### Workstream E — Final verification and release gate
- Run the complete test suite, parser benchmark, data audit, source verification, evidence matching and automated verification.
- Confirm that no automated path can approve evidence or mutate catalogue data.
- Publish the final Phase 1 report and obtain explicit approval before beginning Phase 2.

## 4. Current blockers

At the latest reviewed baseline:
- The evidence-document records are not yet acquired/processed; their rights reviews are pending.
- The 39 catalogue claims do not yet have a complete set of human-reviewed evidence dispositions.
- The current source registry records identify manufacturer-controlled domains, but the individual page/document reviews remain outstanding.
- The real-document end-to-end workflow has not yet been demonstrated across the initial source set.
- HTML evidence capture needs a traceable workflow alongside PDF processing.

These are completion blockers, not evidence that the existing catalogue values are necessarily wrong.

## 5. Rules for declaring completion

- A passing CI run is necessary, never sufficient.
- A source being official is not equivalent to a claim being verified.
- An extracted candidate is not evidence approval.
- Processing permission is not redistribution permission.
- A source or claim may be marked not applicable only with a documented human rationale.
- If an item cannot lawfully or reliably be verified, it must remain explicitly unresolved/quarantined and Phase 1 cannot be declared fully complete while it is a blocking catalogue claim.
- No Phase 2 implementation or production deployment is authorized by this checklist.

**Final decision:** Phase 1 remains open until all exit conditions are met and the final report is reviewed.


## 6. Approved policy clarification — manufacturer-first and scalable review (21 November 2026)

This section supersedes any earlier wording in this checklist that requires independent verification or a separate manual review of every manufacturer-stated value. It does not weaken source traceability, factual attribution, rights controls or data integrity.

- Official manufacturer documentation is the primary source for the manufacturer's own specifications.
- A value may be published with the attribution **“According to official manufacturer documentation”** when it is linked to the exact official source, document/page, applicable model/configuration and available revision/date and locator.
- Independent laboratory verification is not a prerequisite for every manufacturer-stated specification. Do not describe manufacturer-published values as independently tested.
- Review sources in manufacturer/document batches. One reviewed document may support many extracted values; do not repeat the same source-level review for every claim.
- Automated extraction may populate a candidate queue at scale, but must preserve exact source provenance, original units, footnotes, model/variant association and extraction status. It must not silently approve ambiguous or conflicting values.
- Human review is targeted to unresolved source identity, uncertain OCR/table association, model or configuration ambiguity, conflicting document versions, safety-critical interpretation, suspicious values and sampled quality-control checks.
- If official manufacturer documents conflict, preserve each value with its document revision/date and flag the discrepancy. Do not silently select or merge values.
- The 39 initial claims need a traceable source-backed disposition; they do not all require independent laboratory testing. A clear manufacturer-attributed value can be publishable without independent corroboration once its official source and exact applicability are established.
- Rights are separate from source authority: permission to inspect/process a document does not automatically permit public redistribution of that document, its images, CAD files or video.
- Phase 1 remains open until the scalable manufacturer-document pipeline is demonstrated on a representative set of real, lawfully processable documents, with provenance, extraction quality, rights status and exception handling recorded.
- Planning and documenting Phase 2 requirements is allowed while Phase 1 is open. Phase 2 feature implementation and production release remain subject to the agreed Phase 1 readiness decision and explicit owner approval.

The complete product direction and detailed requirements are maintained in [PRODUCT_REQUIREMENTS_PHASE_2.md](PRODUCT_REQUIREMENTS_PHASE_2.md).

## 5. Governing source standard

The source-authority, claim-specific evidence, accreditation, certification, research, rights and selective-acquisition rules for Phase 1 are defined in [Technical Data Source Standard](TECHNICAL_DATA_SOURCE_STANDARD.md). This standard governs source classification and public attribution. It does not waive any of the Phase 1 exit conditions above.
