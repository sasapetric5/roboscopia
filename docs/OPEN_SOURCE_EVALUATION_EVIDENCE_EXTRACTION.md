# Open-source evaluation — Technical Evidence Extraction

## Scope

Ten established document-processing repositories were discovered and screened for PDF text, table, layout and OCR extraction. GitHub metadata (license, language, activity) and selected project manifests were inspected. This is a preliminary compatibility/supply-chain screen, not a full source-code security audit or a review of every transitive dependency.

## Candidate register

| Project | License / activity snapshot | Strength | Decision for ROBOSCOPIA |
|---|---|---|---|
| [Mozilla PDF.js](https://github.com/mozilla/pdf.js) | Apache-2.0; JavaScript; active on 2026-11-20 | Mature JS PDF renderer and text layer | Best browser-side review/viewing candidate. Its package manifest has a substantial development toolchain; not added to the small static site or serverless worker. |
| [Apache Tika](https://github.com/apache/tika) | Apache-2.0; Java; active on 2026-11-20 | Broad document type detection, metadata and text extraction | Strong future ingestion service if multi-format support becomes necessary. Large Maven multi-module Java stack is disproportionate for the current local extractor. |
| [Docling](https://github.com/docling-project/docling) | MIT; Python; active on 2026-11-20; production/stable classification in manifest | Document layout, tables and structured output | Strong future candidate for complex datasheets and tables. Python runtime and optional ML/layout dependencies are heavier; do not add to Cloudflare Pages/Workers. |
| [Unstructured](https://github.com/Unstructured-IO/unstructured) | Apache-2.0; Python; active on 2026-11-19 | Broad document partitioning and structured elements | Capable, but manifest has a large dependency surface (spaCy, NumPy, Numba, lxml, clients and more); not chosen for a narrow PDF-first workflow. |
| [Tabula Java](https://github.com/tabulapdf/tabula-java) | MIT; Java; latest observed push 2025-03-19 | Table extraction from text-based PDFs | Useful for tabular manufacturer specifications; Java runtime and slower activity make it a later specialist adapter, not the first dependency. |
| [pdfplumber](https://github.com/jsvine/pdfplumber) | MIT; Python; active on 2026-10-15 | Character/line geometry and table extraction | Strong candidate for a future precise table adapter. Python-only and not required for the initial labelled-value parser. |
| [Camelot](https://github.com/camelot-dev/camelot) | MIT; Python; active on 2026-11-17 | Table extraction with selectable flavours | Good future table-specific candidate. Core dependencies include NumPy, pandas, OpenCV, PDFium and Pillow; not justified for current simple text-first stage. |
| [PyMuPDF](https://github.com/pymupdf/PyMuPDF) | AGPL-3.0; Python; active on 2026-11-20 | Fast layout-aware PDF extraction and rendering | Not adopted. AGPL-3.0 creates material licensing obligations for a proprietary/commercial platform unless an appropriate commercial license is obtained. |
| [OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF) | MPL-2.0; Python; active on 2026-11-16 | Adds OCR text layer to scanned PDFs | Candidate for a separately isolated OCR pipeline. Requires OCR/Tesseract and image-processing dependencies; not activated now. |
| [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) | Apache-2.0; Python; latest observed push 2026-09-16 | Multilingual OCR and document structure | Promising for international/scanned datasheets, but model/runtime downloads and compute requirements need separate resource and licensing review. Not activated. |

## Selected implementation

The first implementation uses a conservative local adapter:
- Poppler `pdftotext` (external local executable) extracts selectable text with layout preservation.
- A dependency-free Node.js parser identifies explicitly labelled engineering values and retains page/line/quote locators.
- A text-input mode allows deterministic tests and integration with a future approved extraction backend.

No Poppler binary, third-party library, OCR model or service was installed or bundled into the repository by this change. The local PDF command requires the user/operator to have Poppler installed separately.

## Six-stage delivery record

1. **Discover** — screened ten established PDF/OCR/layout projects.
2. **Evaluate** — checked license metadata, activity, language and selected manifests; recorded licensing and dependency risks. This was not a full security audit.
3. **Reuse** — used Poppler's established `pdftotext` command as the optional local text-extraction adapter; no project source code was copied or vendored.
4. **Adapt** — added a bounded, dependency-free Node.js extraction layer with page locators, document hashes, model/configuration hints and evidence status.
5. **Verify** — added deterministic tests for supported engineering fields, page boundaries, URL validation, limits and non-approval semantics; GitHub Actions runs the full test suite.
6. **Deliver** — committed the engine, tests, usage documentation and this evaluation to the single `main` branch. Production deployment remains paused.

## Future adoption gates

- Add PDF.js only if browser-side PDF preview and page-level selection are needed; pin and audit the production bundle.
- Add pdfplumber or Camelot only when real datasheets demonstrate table extraction gaps that justify the Python runtime.
- Consider Docling for complex layouts only as an isolated ingestion service with explicit CPU/memory/time budgets and model supply-chain review.
- Consider OCRmyPDF/PaddleOCR only after scanned-document demand, languages, model licenses, resource costs and operator approval are established.
- Do not adopt PyMuPDF under AGPL-3.0 without a formal license decision.
- All ML/LLM extraction outputs must remain candidate evidence and require human confirmation.
