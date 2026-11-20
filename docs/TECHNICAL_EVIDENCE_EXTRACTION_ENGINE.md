# ROBOSCOPIA Technical Evidence Extraction Engine

## Purpose

`scripts/technical-evidence-extraction-engine.mjs` extracts candidate technical specifications from text that has already been extracted from a manufacturer document. It preserves the exact matched line, page number, line number, nearby section heading, document SHA-256 and optional model/configuration context.

The engine is an evidence-candidate generator, not a fact-checker. Every output remains `extracted_unverified`.

## Current supported fields

The initial conservative pattern set looks for explicitly labelled values for:
- mass / weight;
- payload;
- speed;
- runtime / operating time;
- battery capacity / energy;
- reach;
- repeatability;
- degrees of freedom;
- ingress protection;
- power.

It supports common engineering units and decimal comma in numeric values. It does not infer values from prose or convert units.

## Text input (portable path)

```bash
node scripts/technical-evidence-extraction-engine.mjs --text ./manual-extracted.txt --model-id spot --model-name Spot --source-url https://bostondynamics.com/spot/manual.pdf --output ./spot-evidence.json
```

The text file must be UTF-8 and under 12 MB. Page boundaries can be represented with form-feed characters (U+000C); these become page locators in the report.

## Local PDF input

```bash
node scripts/technical-evidence-extraction-engine.mjs --pdf ./manual.pdf --model-id spot --model-name Spot --source-url https://bostondynamics.com/spot/manual.pdf --output ./spot-evidence.json
```

PDF extraction uses the local `pdftotext` executable from Poppler with layout preservation. It does not download the URL. The local file must have a PDF signature and be at most 25 MB. Extraction has a 30-second timeout and a 10 MB extracted-text limit.

If `pdftotext` is not installed, the command reports that requirement. Image-only/scanned PDFs are not OCR'd; they require a separately reviewed OCR workflow.

## Output fields

Each candidate includes:
- stable candidate ID derived from document hash, page, line, field and exact match;
- field identifier and extracted value/unit;
- exact matched phrase and a bounded evidence quote;
- page and line locator plus a nearby possible section heading;
- document SHA-256 and filename;
- optional source URL, model, configuration and document revision/date;
- whether model/configuration names were found anywhere in the extracted text;
- `reviewStatus: extracted_unverified` and `factualVerification: not_performed`.

A model mention is only a text occurrence, not proof of applicability. Configuration mention status is similarly a hint, not a match certification.

## Security and limits

- No network request or URL fetch is performed.
- Source URLs are only syntax-checked and must be public HTTPS URLs.
- PDF and text inputs are local files supplied to the command.
- Input file size, extracted text size, and extraction time are bounded.
- Output is written with exclusive-create semantics; existing files are not overwritten.
- The engine does not execute PDF JavaScript, install packages, OCR, or mutate the canonical catalog.
- The extraction rules are intentionally conservative; tables with split labels/values, complex layouts, scanned documents, unusual units and multi-column PDFs may be missed.
- A detected number can belong to a different model, variant, accessory or test condition. Human review must confirm the exact document section and configuration.
- No document copyright or redistribution rights are granted by extraction. Store and display only documents and excerpts that ROBOSCOPIA is permitted to use.

## Tests and CI

```bash
node --test tests/technical-evidence-extraction-engine.test.mjs
node scripts/technical-evidence-extraction-engine.mjs --help
```

The full repository test workflow runs the unit tests and existing data quality/source verification reports. It does not download documents or run live URL probes.
