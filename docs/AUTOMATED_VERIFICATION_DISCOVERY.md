# ROBOSCOPIA — Automated Verification Engine: Discover

Date: 2026-11-21  
Repository: `sasapetric5/roboscopia`  
Target branch: `main`  
Status: Discovery completed; no third-party code, models, services or runtime dependencies added.

## Objective

Prepare a scalable, automated quality gate that validates candidate manufacturer/model records and their supporting evidence before any record can enter the public catalog. Human review is reserved for exceptions, calibration samples and periodic audits—not every record.

The pipeline must preserve source provenance, exact document/page/coordinate locators, model/configuration identity, original units and values, document hashes, rights status and an auditable decision trail. Extraction confidence is not factual truth. No parser, OCR model or language model may approve a technical claim by itself.

## Repository baseline inspected

The current `main` branch contains:
- `data/robots.json`, schema 2.1.0, 7 model records and 39 specification claims.
- `scripts/data-quality-audit.mjs`: read-only structural/provenance audit, duplicate/conflict/staleness flags.
- `scripts/source-verification-engine.mjs`: claim/source mapping and URL syntax/domain assessment; does not fetch source content.
- `scripts/technical-evidence-extraction-engine.mjs`: deterministic labelled-value extraction from local text or selectable-text PDFs via Poppler.
- `scripts/evidence-matching-review-engine.mjs`: deterministic claim/evidence comparison; matches remain unverified and do not mutate the catalog.
- `scripts/evidence-document-acquisition.mjs`: permission-gated local PDF processing; source URLs are not downloaded.
- `scripts/data-quality-review-queue.mjs`: creates a review queue, but is not an automatic publication gate.

The current catalog's specification provenance is explicitly `source_linked_unverified`. The current system does not yet fetch manufacturer page bodies, automatically parse web evidence, run OCR for scanned documents, apply a formal JSON schema validator, or produce a calibrated multi-signal automatic acceptance decision.

## Discover — candidate register

The following projects were discovered from their official repositories/documentation. This is a functional and licensing shortlist, not a full source-code, transitive-dependency or model-weight security audit.

| Candidate | Main capability | License / important caveat | ROBOSCOPIA fit |
|---|---|---|---|
| [OpenDataLoader PDF](https://github.com/opendataloader-project/opendataloader-pdf) | PDF structure, text, tables, OCR/hybrid parsing; JSON with bounding boxes | Apache-2.0 for 2.x+; pre-2.0 versions were MPL-2.0. Hybrid mode and optional features must be checked for external calls and model requirements. | **High-priority parser benchmark** because coordinates and structured output can preserve evidence locations. |
| [Docling](https://github.com/docling-project/docling) | PDF and office-document layout, reading order, tables and structured export | MIT codebase; individual model assets and optional components require separate license review. Python runtime and model footprint. | **High-priority parser benchmark** for complex datasheets and multi-column layouts. |
| [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) | OCR, document structure, table/cell coordinates and multilingual extraction | Apache-2.0 project; verify the exact license and terms of each selected model/weight and inference backend. Python/ML runtime. | **High-priority OCR candidate** for scanned manuals and international sources, isolated from the website runtime. |
| [Apache Tika](https://github.com/apache/tika) | File type detection, metadata and text extraction across many formats | Apache-2.0; Java 17+ in Tika 4.x, sizeable runtime. | **Secondary ingestion candidate** if formats expand beyond PDF/HTML. |
| [pdfplumber](https://github.com/jsvine/pdfplumber) | PDF character geometry, text and table extraction | MIT; Python and PDFMiner dependency; best with machine-generated PDFs, not scanned pages. | **Table/geometry specialist benchmark**. |
| [Camelot](https://github.com/camelot-dev/camelot) | Ruled/borderless PDF table extraction, table metrics and export | MIT; optional ML/OCR backends add substantial dependencies/models. | **Table specialist benchmark** against real robot/CNC datasheets. |
| [Ajv](https://github.com/ajv-validator/ajv) | JSON Schema and JTD validation | MIT; check the selected major version against the repository's Node.js runtime. | **Preferred schema-validation candidate** for enforcing a strict, versioned ingestion contract. |
| [Zod](https://github.com/colinhacks/zod) | TypeScript-first runtime schema validation and inferred types | MIT; alternative to Ajv, not necessary to install both initially. | **Alternative** if typed application schemas prove more useful than standalone JSON Schema. |
| [Splink](https://github.com/moj-analytical-services/splink) | Probabilistic entity resolution and deduplication using multiple attributes | MIT; Python/SQL workflow; needs representative training/calibration and careful thresholding. | **High-priority duplicate-resolution candidate**, isolated as a batch adapter; never auto-merge on score alone. |
| [OpenRefine](https://github.com/OpenRefine/OpenRefine) | Data cleaning, clustering and reconciliation through a local UI | BSD-3-Clause; Java application, not a lightweight runtime library. | **Stewardship/research tool**, not a production ingestion dependency. |
| [Scrapy](https://github.com/scrapy/scrapy) | Mature Python crawling and structured extraction framework | BSD-3-Clause; separate Python runtime; crawl policies and source terms remain ROBOSCOPIA's responsibility. | **Crawler candidate** for controlled, repeatable source acquisition. |
| [Crawlee](https://github.com/apify/crawlee) | TypeScript HTTP/browser crawling, queues, retries and storage | Apache-2.0; browser automation adds operational/resource costs; platform-hosted features are optional and must not be used. | **High-priority crawler benchmark** because it aligns with the existing Node/TypeScript ecosystem; run outside Cloudflare Pages. |
| [Great Expectations](https://github.com/great-expectations/great_expectations) | Declarative data-quality expectations and validation reports | Apache-2.0; Python and a broader framework/dependency surface. | **Secondary reference** for validation policy/reporting; likely too heavy for the first Node-based gate. |
| [OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF) | Adds OCR text layers to scanned PDFs | MPL-2.0 core; depends on Tesseract and system tools. | **Optional preprocessing adapter** if PaddleOCR alone does not cover the scanned-PDF workflow. |

## Candidates not selected for initial adoption

- [PyMuPDF](https://github.com/pymupdf/PyMuPDF): AGPL-3.0 or commercial licensing. Do not adopt without a deliberate legal decision.
- [Surya](https://github.com/datalab-to/surya): source code is Apache-2.0, but model weights have additional usage restrictions. Do not assume the code license covers model weights or commercial deployment.
- [Unstructured](https://github.com/Unstructured-IO/unstructured): capable broad document parsing, but its dependency surface is large for the current narrow use case. Reconsider only if benchmarks show a material advantage.
- [Firecrawl](https://github.com/mendableai/firecrawl): license/edition and hosted-service distinctions require careful review; not a first-choice dependency for a free-only, self-controlled ingestion path.

## Preliminary ranking for the next Evaluate stage

1. **Ajv** — strict validation of the canonical ingestion record and schema compatibility.
2. **OpenDataLoader PDF vs Docling** — run both against the same representative manufacturer manuals and compare evidence locator fidelity, tables, reading order, OCR behavior, accuracy and resource use.
3. **PaddleOCR** — evaluate as a separate scanned-document OCR adapter, with exact model-license review.
4. **Crawlee vs Scrapy** — compare safe acquisition, retries, queueing, rate limits, robots handling and resource footprint. No crawler is activated by this discovery.
5. **Splink** — evaluate model identity and duplicate candidate quality against a labelled set; output suggestions only.
6. **pdfplumber vs Camelot** — use only if the parser benchmark demonstrates table extraction gaps.
7. **OpenRefine** — optional offline data-steward tool, not part of the automatic publication path.

## Mandatory design constraints for the next stage

- Separate acquisition, parsing, validation, entity resolution, evidence verification and publication.
- Every candidate claim must retain source URL, source ID, document SHA-256, page and bounding-box/line locator where available, exact source excerpt, model/configuration scope, original value/unit, extraction tool/version and rights/processing status.
- Validate source identity and content—not merely HTTPS syntax or an official-looking domain.
- Distinguish independent sources from copied/reposted content; source count alone must not inflate confidence.
- Apply deterministic hard-fail rules for malformed schema, missing provenance, model mismatch, impossible units/ranges, rights restrictions and unsafe/invalid documents.
- Use confidence only as a triage/ranking signal. Automatic acceptance requires all mandatory gates and calibrated evidence rules; low-confidence, conflicting or novel cases go to quarantine.
- Preserve append-only decision/audit history. Never silently overwrite a previously verified claim.
- No automatic duplicate merges; no unverified media republication.
- No paid APIs, hosted crawling services, billable infrastructure, production deployment or external network ingestion without explicit approval.
- Reuse must respect licenses, notices, model-weight terms and third-party dependencies.

## Exit criteria for Discover

- More than ten relevant projects identified.
- Candidates mapped to the functions they solve.
- Major license/runtime constraints recorded.
- A shortlist prepared for reproducible, side-by-side evaluation.

Discover is complete as a research stage. No third-party dependency has been installed, no external source has been crawled and no production behavior has changed.
