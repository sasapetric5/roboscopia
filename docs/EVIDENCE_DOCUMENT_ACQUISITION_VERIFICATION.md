# Evidence Document Acquisition & Verification

## Purpose

Acquire and process manufacturer-primary documents for the 39 existing robot catalog claims. This workflow creates traceable evidence packages; it does not approve evidence or mutate catalog data.

## Registered sources

The controlled source inventory is `data/evidence-document-registry.json`. It currently registers seven model-source records:
- Boston Dynamics Spot Instructions for Use v5.1 (PDF)
- Unitree Go2 official specification page (HTML)
- Unitree H1 official specification page (HTML)
- Universal Robots UR5e manual / technical specifications SW5_26 (PDF + HTML locator)
- Universal Robots UR20 manual SW5_26 (PDF)
- ABB GoFa CRB 15000 datasheet (PDF)
- KUKA KR 6 R700 sixx C technical data V4.1 (PDF)

A registered URL is a source lead, not proof that the file is currently reachable, authentic, current, or licensed for redistribution. Unitree Go2 and H1 are HTML-first entries in the registry and must not be represented as acquired PDFs unless the manufacturer supplies a PDF.

## Acquisition and rights gate

1. Open the manufacturer source page manually.
2. Confirm the exact model, document revision, publication date and configuration.
3. Confirm whether local downloading and processing are permitted by the source terms or an applicable permission.
4. Save the file locally under a reviewer-controlled directory. Do not commit the original PDF to the public repository unless redistribution rights are explicitly established.
5. Record the reviewer, basis for processing permission, redistribution status and date.
6. Run the local processor below. It does not download URLs or follow links.

Unknown or unreviewed rights must remain blocked. A permission to process locally does not imply permission to redistribute the PDF.

## Local PDF processing

Requirements: Node.js 22 and Poppler `pdftotext`.

```bash
node scripts/evidence-document-acquisition.mjs --help
```

Example (replace the values with an actual reviewer decision and a lawfully obtained local PDF):

```bash
node scripts/evidence-document-acquisition.mjs \
  --source-id ur20-user-manual-sw5-26 \
  --file "./private-evidence/UR20_User_Manual.pdf" \
  --processing-permitted yes \
  --rights-reviewer "Reviewer name" \
  --rights-note "Local processing permission confirmed from applicable manufacturer terms" \
  --redistribution not_permitted \
  --model-name "UR20" \
  --output "./private-evidence/ur20-evidence-report.json"
```

The processor:
- validates the local PDF signature and file-size limit;
- extracts selectable text with layout preservation;
- computes SHA-256 over the original PDF bytes;
- records page count, source ID, document revision, rights-review metadata and extracted page/line/section locators;
- retains non-scalar qualifiers and leaves factual verification pending;
- refuses scanned-only PDFs instead of silently running OCR;
- writes a new report file and never overwrites an existing report;
- never changes `data/robots.json` and never uploads or commits the source PDF.

## Evidence review requirements

For every claim, the reviewer must confirm:
- exact product/model and generation;
- configuration, payload boundary conditions and operating assumptions;
- the document revision/date and whether it supersedes older versions;
- page, table, row or section locator and surrounding context;
- source value, unit, qualifier and any conversion;
- whether the evidence supports, partially supports or contradicts the catalog claim.

A match from the extractor is a candidate only. Human review remains mandatory.

## HTML sources

For Unitree Go2 and H1, use the manufacturer page directly. Capture the exact visible table/section, page URL, access date and a reviewer-prepared evidence excerpt. Preserve variant columns and distinguish H1 from H1-2. Do not use an unofficial reseller PDF as a substitute for missing primary evidence.

## Completion criteria

The phase is complete only when all 39 claims have:
1. a source record and acquisition/rights status;
2. a source file hash or captured official-page revision/access record;
3. a model/configuration identity assessment;
4. exact page/section/table locator and excerpt;
5. matcher result and reviewer decision;
6. unresolved discrepancies documented separately.

## Current limitations

The model-source registry has been created, but no source PDF has yet been lawfully acquired and locally processed in this run. Direct file downloads from the execution environment were unavailable. Therefore no PDF SHA-256 values or extracted document candidates are claimed here. The next input needed is the official PDFs uploaded by the user or obtained manually by a reviewer. This is not a deployment task.
