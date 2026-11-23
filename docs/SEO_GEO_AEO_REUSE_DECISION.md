# Reuse decision: SEO / GEO / AEO automation

Review date: 2026-11-23

## Decision

Use **Crawlie** first as an external, read-only audit engine in GitHub Actions. Pin the exact upstream source revision and retain the upstream MIT licence and attribution. Do not copy its source into ROBOSCOPIA yet.

Use **AEO Toolkit** as the next TypeScript package candidate after package-by-package compatibility review. Its root package is Apache-2.0, but the hosted browser platform and MCP servers are proprietary and are not part of the reusable open-source core.

Do not embed **CodoSEO** in ROBOSCOPIA at this stage: its workspace declares AGPL-3.0-only. This is a material licensing constraint for a commercial product. Reconsider only after a dedicated legal review and explicit approval.

OpenSEOSuite remains a feature-rich but early-stage candidate; evaluate later rather than adding another whole application now.

## Evidence from source inspection

### Crawlie — selected for first audit integration

- Upstream repository: https://github.com/spronta/crawlie
- Pinned revision: `9641d31f8ef1d7322792cb4fe532a3f5ad14c995`
- Workspace version observed: `0.5.3`
- Workspace licence: MIT
- Engine: Rust; CLI and MCP packages are in the same repository.
- Core crate has offline parser/audit tests covering metadata, headings, links, images, semantic content, FAQ schema and GEO signals.
- CLI includes a headless-render feature; do not enable browser rendering in the initial bounded crawl unless needed and separately provisioned.
- README documents robots.txt and sitemap handling, page/depth caps, concurrency controls, JSON output and CI failure thresholds.
- The hosted Crawlie Cloud service is separate and not required by this workflow.

### AEO Toolkit — next package-level candidate

- Upstream repository: https://github.com/Advance-Labs/aeo-toolkit
- Root package declares Apache-2.0 and requires Node 20+ / pnpm 9+.
- Open packages include crawler, HTML parser, schema validator, scoring and visibility.
- Source includes AEO checks for question headings, answerable content, server-rendered content, FAQ/QA schema and AI bot access.
- Its safe-fetch tests cover non-HTTP schemes, private IPs, DNS rebinding, redirect revalidation, response size and timeout behavior.
- The hosted browser platform and MCP servers are proprietary; do not assume those are included in the Apache-2.0 code.

### CodoSEO — not selected for direct reuse

- Upstream repository: https://github.com/SafrowLabs/codoSEO
- Workspace declares AGPL-3.0-only.
- Has extensive crawler/check/test packages and potentially useful features, but licence obligations need legal review before integration into a commercial product.

## Initial integration

`.github/workflows/seo-audit.yml` provides a manual, read-only Crawlie audit:

- only accepts HTTPS URLs on `roboscopia.com` or `www.roboscopia.com`;
- pins the upstream Crawlie source revision;
- limits crawl to 100 pages, depth 4 and concurrency 4;
- uses error-level CI failure threshold;
- stores the JSON report as a GitHub Actions artifact for 30 days;
- uses no hosted SEO subscription, API key, deployment or site mutation.

This is an initial bounded audit, not yet the automated per-publication pipeline. The current website's real crawl coverage, JavaScript-rendered profile behavior and all warnings must be measured from an actual run.

## Integration sequence

1. Run and inspect the bounded Crawlie report against the public site.
2. Map Crawlie rule IDs to ROBOSCOPIA's ten publication gates; keep factual correctness, evidence provenance and media rights as independent gates.
3. Evaluate AEO Toolkit packages individually; reuse only the smallest compatible open packages and preserve their notices.
4. Add image/video-specific checks for alt text, dimensions, thumbnails, captions/transcripts, media sitemap eligibility and rights evidence.
5. Connect the normalized audit output to `publication-readiness-engine.mjs`.
6. Add automated, reversible fixes only where deterministic and safe; AI text rewrites remain proposals until factual and source checks pass.
7. Enable scheduled and pre-publication crawls after the current public rendering/build pipeline is verified.

## Boundaries

- No claim that an audit score guarantees Google rankings or citations by AI systems.
- No keyword stuffing, fake FAQs, fake reviews, generated citations or fabricated facts.
- Robots directives are measured, not overridden.
- A crawler's passing score cannot approve copyright, technical claims or manufacturer authority.
- No paid API, paid hosted crawler, production deployment or broad external scanning is authorized by this integration.
