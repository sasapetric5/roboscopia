# SEO / AEO publication integration

Status: first deterministic adapter implementation; no automatic writes or publication.

## Data flow

1. The pinned Crawlie CLI produces a JSON report in the manual, bounded GitHub Actions workflow.
2. `scripts/seo-aeo-publication-adapter.mjs` validates the report scope and converts page findings into the existing publication gate vocabulary.
3. `scripts/publication-readiness-engine.mjs` remains the only page-level decision engine. Its ten gates are conjunctive.
4. `createSafeRepairPlan` emits proposal-only changes using existing canonical fields. It never writes HTML, catalog records, assets or publication state.

## Trust boundaries

Crawlie can provide crawl, SEO, GEO, link and duplicate signals. A clean crawl does not prove factual accuracy, provenance, media rights, security policy, content quality or freshness. Those gates remain `needs_verification` until independent reports are supplied.

Unknown Crawlie rules are treated as SEO findings requiring attention, not silently discarded. Invalid report URLs, malformed issue rows and non-ROBOSCOPIA targets are rejected. A non-200 page is a hard SEO failure.

## Repair policy

The first safe proposal rules are deliberately narrow:
- missing title: use existing canonical model + manufacturer;
- missing meta description: use an existing canonical summary;
- missing H1: use an existing canonical model name.

If the required source field is absent, no proposal is generated. There is no generated factual prose, source, rights assertion or date. All proposals require a writer integration, a fresh crawl and a full Publication Readiness Engine recheck before any future publication action.

## AEO Toolkit

The Apache-2.0 AEO Toolkit remains a package-level candidate, not a runtime dependency. The first integration reuses Crawlie's pinned MIT audit output and ROBOSCOPIA's native deterministic policy. Add individual AEO Toolkit packages only after verifying their exact package licences, dependency tree, build/test behavior and whether they can run without proprietary hosted services.

## Current limitations

- The Crawlie audit workflow is manual and read-only.
- The adapter is a library function; artifact ingestion and report-to-page orchestration are not yet wired into CI.
- Repair plans are proposals, not applied changes.
- Publication is never triggered by this integration.
