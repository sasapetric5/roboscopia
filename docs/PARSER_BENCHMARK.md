# Parser benchmark and local adapters

## Reuse-first adapters

- OpenDataLoader PDF: calls the official Python package locally and requests text output.
- Docling: uses the local `DocumentConverter` and exports Markdown.
- Both adapters emit the same normalized JSON envelope. No hosted API, upload, or remote URL conversion is used.

## Benchmark corpus

`data/parser-benchmark-corpus.json` is intentionally empty. Add a fixture only after a reviewer records explicit processing permission, reviewer identity and basis, plus manually checked expected evidence snippets. Do not commit source PDFs unless redistribution is separately permitted.

Run with both parser packages installed locally:

```bash
python3 -m pip install opendataloader-pdf docling
node scripts/parser-benchmark.mjs
```

The benchmark compares exact normalized expected-snippet recall and records parser versions, runtime, page count and errors. It does not claim factual correctness, full table accuracy, OCR accuracy, or select a winner from an empty corpus. Parser models may download during first local installation/run; no hosted inference is called by these adapters.

## Interpretation

A real benchmark requires multiple permission-cleared manufacturer documents representing born-digital PDFs, complex tables, multi-column layouts, variants/configurations and scanned pages. Gold snippets must be independently transcribed with page/locator metadata. Compare parser outputs against the same gold set; report per-document and aggregate results. OCR is a separate benchmark track and must not be conflated with born-digital parsing.
