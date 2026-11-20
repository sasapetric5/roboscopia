# ROBOSCOPIA Data Engine — Provenance and Quality

## Current implementation status

The canonical data file is `data/robots.json`, schema version 2.1.0.

The data file now contains:
- `sources[]`: a normalized source registry with stable source IDs, domain, source type, authority tier, review status and review dates.
- `records[].specifications[].sourceId`: a reference to the normalized source registry.
- `records[].specifications[].provenance`: field-level applicability and verification metadata.
- `records[].media[].rightsStatus`: explicit media reuse permission status.
- `dataQuality`: policy version, allowed statuses and quality-review rules.
- `changeLog[]`: a minimal history of schema/data-quality changes.

## Verification statuses

| Status | Meaning |
|---|---|
| `source_linked_unverified` | A source URL is attached, but the exact claim/value has not been independently checked against it. |
| `verified` | A reviewer has checked the exact value, unit, model/configuration and source context. |
| `conflicting` | Credible sources disagree; preserve both claims and document the conflict. |
| `outdated` | The value or source is no longer current for the specified model/configuration. |
| `missing_source` | No supporting source is attached. |
| `rejected` | The claim failed review and must not be presented as a supported fact. |

A source URL alone never qualifies a technical value as verified. The existing records are currently source-linked, not independently verified.

## Source authority

- `manufacturer_primary`: manufacturer-owned product pages, manuals and datasheets.
- `third_party_secondary`: distributors, editorial publications and other secondary sources.
- Authority tier is a source classification, not proof that every statement on the page is correct.

## Field-level provenance requirements

Every technical value should ultimately identify:
- source ID and URL;
- exact model ID;
- configuration ID when applicable;
- original value and unit;
- qualifier and operating conditions;
- date checked;
- reviewer and verification status;
- source excerpt or page/table locator where practical.

Do not copy model-level values into a configuration unless the source explicitly confirms applicability.

## Media rights

A media source and a media reuse license are separate concepts. Existing external media may be used only as a research reference until permission or a compatible license is documented. `permission_not_confirmed` means do not republish or copy the asset into ROBOSCOPIA storage.

## Change history

The `changeLog[]` collection records schema and data changes. A future database should use append-only audit events or versioned records rather than silently overwriting reviewed technical claims.

## Duplicate handling

Potential duplicate detection must be conservative:
- compare manufacturer identity, model designation, family, generation and configuration;
- retain aliases and source-specific naming;
- never auto-merge records based on similar names alone;
- require human approval for merges and preserve redirect/alias history.

## Not implemented yet

- automated URL crawling or scraping;
- external source-content review;
- automatic confidence scoring;
- automated duplicate candidate detection;
- review queue UI;
- database persistence or migrations;
- automated browser end-to-end tests.

These remain future work and are intentionally not activated in this phase.
