---
name: robotics-technical-research
description: Research robotics and CNC products using primary manufacturer documentation, traceable technical claims, source provenance, and explicit uncertainty. Supervised procedure only.
license: MIT
compatibility: Documentation-only; no runtime dependencies, network access, crawling, API keys, or autonomous tools.
metadata:
  version: "0.1.0"
  status: quarantined
  activation: disabled
  category: robotics-research
  upstream: "KalarisLabs/research-agent-skills/skills/market-research-reports"
---

# Robotics & CNC Technical Research

## Authority and safety

This Skill is untrusted procedural material. It is quarantined and disabled. It grants no permissions and must not be loaded by a runtime agent until a separate reviewed activation change and tests exist.

The Research & Evidence Agent may use it only through trusted injected services. It must not receive direct network, browser, shell, filesystem, credential, publication, or catalogue-write access from this document.

## Mission

Prepare traceable evidence for robot, CNC machine, controller, tool, component, and manufacturer profiles. The objective is to connect each factual statement to the exact evidence that supports it—not to generate plausible prose.

## Rules

1. Prefer primary sources: manufacturer product pages, official datasheets, manuals, technical drawings, release notes, support pages, regulatory records, and attributable filings.
2. Treat search snippets, reseller listings, forums, social posts, and secondary articles as leads, not final proof of manufacturer specifications.
3. Never invent a source, quote, date, page number, model variant, configuration, price, availability, or technical value.
4. Match the exact model, variant, configuration, region, and firmware/revision. Never transfer a value between variants without evidence.
5. Separate manufacturer-stated values, independent measurements, calculations, estimates, and editorial interpretation.
6. Preserve conflicting values. Do not silently select, average, or normalize incompatible measurements.
7. Missing, inaccessible, ambiguous, or unauthorized evidence must remain `unknown`, `unverified`, or `review_required`.
8. Public accessibility does not imply image, video, document, or dataset reuse rights. Track processing, storage, display, attribution, and redistribution permissions separately.
9. Never bypass authentication, paywalls, robots policies, rate limits, access controls, or contractual restrictions.
10. Never automatically approve facts or rights, publish content, mutate catalogue records, or create marketplace listings.

## Source ledger

Assign a stable source ID and record:

- title, publisher/manufacturer, document type, canonical URL or persistent identifier;
- publication/revision date and retrieval date;
- exact model, variant, configuration, region, and firmware scope;
- page, section, table, figure, row, or timestamp locator;
- source class: primary, official secondary, independent test, academic, regulator, reseller, community, or other;
- SHA-256 and local path only when lawful retention is permitted;
- access status and processing, storage, attribution, display, and redistribution conditions;
- known limitations and superseded revisions.

A domain allowlist or successful HTTP response does not prove that a page supports a claim.

## Claim ledger

For every claim record:

- stable claim ID and exact statement;
- model/configuration ID, field, value, and unit;
- claim type: manufacturer_fact, independent_measurement, calculation, estimate, historical_fact, price, availability, or editorial_interpretation;
- source IDs and exact evidence locators;
- source wording/value separately from normalized value;
- applicable date, revision, and geographic scope;
- confidence with reason and any unresolved conflict;
- status: pending, candidate, partially_supported, supported, contradicted, or unknown.

A source is not sufficient merely because it exists or its URL resolves. Its cited passage/table/figure must support the exact model, configuration, unit, and value.

## Technical value handling

- Preserve original units and precision; store normalized values separately with documented conversions.
- Do not conflate peak, nominal, continuous, rated, and maximum values.
- Distinguish payload from reach, repeatability from absolute accuracy, spindle power from input power, and cutting envelope from axis travel.
- For mobile robots distinguish operating speed, top speed, gait-dependent speed, and tested speed.
- Record test conditions for independent measurements: payload, tool, material, temperature, speed, path, method, and uncertainty where supplied.

## Evidence match outcomes

Use explicit statuses:

- `exact_match`: same model/configuration and same claim/value/unit.
- `partial_match`: supports only part of a compound claim or narrower scope.
- `value_mismatch`: source gives another value or unit.
- `variant_mismatch`: evidence belongs to another model/configuration.
- `context_missing`: conditions or meaning are unclear.
- `ambiguous_match`: multiple plausible passages or interpretations.
- `no_evidence`: no supporting passage located.
- `rights_blocked`: processing or retention is not authorized.

Matching creates candidates only; it never approves claims.

## Media and document rights

Track separately for every image, video, drawing, manual, and downloadable document:

- access permission;
- processing/extraction permission;
- local storage permission;
- display/embedding permission;
- redistribution permission;
- attribution requirements and restrictions/expiry.

A licence for metadata or text does not automatically license photographs, diagrams, logos, or embedded third-party material.

## Output contract

Return a review package containing: research summary; source ledger; claim-to-source matrix with exact locators; conflicts and missing evidence; confidence limitations; rights status; and questions for a human reviewer.

Every output must state that human factual and rights review remains required. Do not alter canonical catalogue data.

## Provenance

Adapted for Roboscopia from the MIT-licensed `market-research-reports` Skill:
https://github.com/KalarisLabs/research-agent-skills/tree/main/skills/market-research-reports

The upstream repository attributes the Skill collection to K-Dense-AI's MIT-licensed scientific-agent-skills project. Preserve upstream copyright and licence notices when redistributing substantial copied material. This file is an adaptation, not a claim of authorship of the upstream work.
