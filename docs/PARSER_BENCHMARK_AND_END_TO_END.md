# Parser Benchmark and End-to-End Validation

CI generates an original synthetic technical PDF with a specification table and two pages. It contains fictional values and no third-party product content. Three local engines are measured: Poppler text extraction, OpenDataLoader PDF and Docling. Reports include exact normalized snippet recall, exact table-row recall where available, page count where exposed, parser versions and elapsed time. The JSON report is retained as a GitHub Actions artifact for 14 days.

Synthetic tests are regression indicators only. They do not prove accuracy on manufacturer manuals, scanned pages, multilingual documents or complex real-world tables. A separately rights-cleared, independently gold-labelled corpus remains required before any production-accuracy claim.

The end-to-end tests exercise candidate extraction, claim matching, explicit human review metadata and the canonical source/rights verification gate. Negative tests cover unapproved rights and numeric misreads. The verification gate remains read-only; eligibility is not a publication action. No catalog data is modified.

Phase 1 remains open until representative real documents with documented processing permission are supplied and independently labelled, then pass the same parser and lifecycle tests.
