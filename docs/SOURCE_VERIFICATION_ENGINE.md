# ROBOSCOPIA Source Verification Engine

## Purpose

`scripts/source-verification-engine.mjs` maps each specification value in `data/robots.json` to its recorded source and creates a claim-level review report. It does not decide factual correctness by itself.

## Generate a report

```bash
node scripts/source-verification-engine.mjs
node scripts/source-verification-engine.mjs --json
```

The report reads the canonical robot catalog and the separate decision store at `data/source-verification-decisions.json`. It is read-only with respect to the catalog.

## Claim identity

Each claim receives a stable SHA-256-derived identifier based on:
- model ID;
- specification name and value;
- unit;
- configuration ID;
- linked source ID.

Changing any of these claim-defining values changes the ID. This prevents a prior decision from silently attaching to a materially changed value. It is not a permanent global identity for a real-world fact.

## Source URL and authority checks

The default run checks URL syntax and requires HTTPS. It normalizes the hostname and compares it with the source registry's domain field.

The engine marks a small list of known manufacturer domains as **manufacturer-domain candidates**. This is not a legal ownership determination and does not prove that the linked page is official, current, accessible, or relevant to the exact model and configuration.

## Optional live reachability probe

```bash
node scripts/source-verification-engine.mjs --check-urls --json
```

This optional mode sends one HTTP HEAD request per source URL. It does not fetch page bodies, follow redirects, crawl links, or scrape content. It is not part of GitHub Actions and must only be run intentionally. Network errors, bot protection, unsupported HEAD methods and rate limits can produce inconclusive results. A successful response is not factual verification.

## Claim outcomes

- `pending` — no accepted reviewer decision is recorded.
- `supported` — reviewer found evidence directly supporting the exact value, unit and configuration.
- `partially_supported` — evidence supports only part of the claim or requires a qualification.
- `contradicted` — reviewed evidence conflicts with the recorded claim.
- `not_applicable` — source does not apply to this model/configuration or claim.

A result of `supported` is a recorded human review decision, not a cryptographic proof. The evidence locator should identify a precise page, section, table, figure or manufacturer variant.

## Record a human decision

First generate the JSON report and copy the exact `claimId`. Then run:

```bash
node scripts/record-source-decision.mjs <claimId> <outcome> "<evidenceLocator>" "<note>" "<reviewer>"
```

Example (illustrative only):

```bash
node scripts/record-source-decision.mjs 0123456789abcdef01234567 supported "Manufacturer PDF, p. 4, payload table" "Exact value and unit match the UR20-1750 configuration." "technical-reviewer"
```

The recorder checks that the claim exists, the source ID matches, the outcome is allowed, and the evidence locator, note, reviewer and date are present. Decisions are stored separately from `data/robots.json`.

## Safety and limitations

- No page content is downloaded by the default report.
- No automatic approval or AI-generated factual verdict exists.
- No canonical robot data is modified by report generation or decision recording.
- No redirect is followed in the optional HEAD probe.
- No claim is considered verified merely because its URL uses a manufacturer domain.
- The engine does not determine copyright or media reuse rights.
- The engine does not yet parse PDF text/tables, compare revisions, or validate the exact source passage.
- Reviewer identity is a text field, not an authenticated identity. Do not enter secrets or personal data.
- Review decisions must be followed by a separate, evidence-backed catalog edit and a fresh audit when a value needs correction.

## Tests

```bash
node --test tests/*.test.mjs
node scripts/source-verification-engine.mjs --json
```

GitHub Actions runs the tests and report generation. Live URL probes are deliberately excluded from CI to avoid unapproved external requests and flaky results.
