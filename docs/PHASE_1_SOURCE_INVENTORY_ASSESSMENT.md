# Phase 1 — Source Inventory and Claim Mapping Assessment

**Assessment date:** 2026-11-21  
**Branch:** `main`  
**Status:** Repository inventory only — not a source approval, rights decision or claim verification.

## 1. Verified repository inventory

The current `data/robots.json` on `main` contains:

| Item | Current count |
|---|---:|
| Catalogue models | 7 |
| Technical claims | 39 |
| Registered source entries | 17 |
| Evidence-document records | 7 |
| Source entries linked directly by catalogue claims | 11 |
| Source entries not linked directly by catalogue claims | 6 |

All 17 registered source entries currently have `reviewStatus: not_reviewed`. Their current classification is `manufacturer_primary`, based on the registered source origin. This is an initial source-type classification, not proof that every page/document has been inspected, that every claim is supported, or that any processing/reuse rights have been granted.

The previous Phase 1 baseline said 15 source URLs. That count is stale: the current data file contains 17 source entries. This assessment records the repository's actual current count.

## 2. Source-to-model grouping

| Manufacturer | Model(s) | Registered sources | Current claim mapping |
|---|---|---|---|
| Boston Dynamics | Spot | `src-0001`, `src-0002` | 6 claims use `src-0001`; `src-0002` unused |
| Unitree Robotics | Go2, H1 | `src-0003`, `src-0004`, `src-0005` | 5 Go2 claims use `src-0003`; 5 H1 claims use `src-0005`; `src-0004` unused |
| Universal Robots | UR5e, UR20-1750 | `src-0006`, `src-0007`, `src-0008`, `src-0009`, `src-0013`, `src-0016` | UR5e: 6 claims use `src-0006` and `src-0013`; UR20: 6 claims use `src-0008` and `src-0009`; `src-0007` and `src-0016` currently unused |
| ABB Robotics | GoFa 5 | `src-0010`, `src-0011`, `src-0014`, `src-0015`, `src-0017` | 5 claims use `src-0010`, `src-0014`, `src-0015`; `src-0011` and `src-0017` currently unused |
| KUKA | KR 6 R700 sixx C | `src-0012` | 6 claims use `src-0012` |

The six source entries not directly linked to a current catalogue claim are not automatically redundant. They may be alternate official references, historical sources, supporting manuals or candidates for a canonical source. They must be reviewed and either linked with a clear purpose, retained as historical/supporting material, or marked superseded/unused with a reason.

## 3. Important source and claim issues already identified

The existing preliminary inspection report records the following issues. These remain preliminary findings and must not be converted into automatic claim approvals:

- **Boston Dynamics Spot:** the catalogue's 14 kg payload and the current product page's 20.43 kg (45 lb) “Max Weight” label may describe different payload definitions/configurations. Do not silently replace one with the other. Resolve the meaning and conditions from the exact official source.
- **Unitree Go2:** speed, battery endurance and payload differ by AIR / PRO / X / EDU configuration. The generic catalogue values conceal important configuration differences. Preserve the variant table, footnotes and distinction between normal and maximum/tested speed.
- **Unitree H1:** the official page also discusses H1-2. Evidence must point to the H1-specific table/section and not be attributed to H1-2.
- **Universal Robots UR5e:** the catalogue uses both the SW5.26 online specification and the earlier SW5.24 manual for the arm-mass claim. Establish which current manufacturer document is canonical and whether the earlier source is only historical.
- **Universal Robots UR20-1750:** the repeatability claim needs an exact source locator and applicability check; do not infer it from a generic product-page block.
- **ABB GoFa 5:** axes and repeatability are linked to separate sources, including a 2023 portfolio and an additional datasheet. Establish exact GoFa CRB 15000 variant applicability, currentness and duplicate/version relationships before accepting the claims.
- **KUKA KR 6 R700 sixx C:** the preliminary report says six values match an official document extract, but the local evidence record still needs exact document acquisition/capture metadata, page locators, hash and rights review before the end-to-end gate can pass.

See [Phase 1 Preliminary Source Inspection](PHASE_1_PRELIMINARY_SOURCE_INSPECTION.md) for the detailed model-by-model notes. That report is explicitly preliminary, not human-approved claim verification.

## 4. Efficient review batches

Review by manufacturer/document, not one claim at a time:

1. **Spot:** inspect the current official product page and determine whether the support page adds distinct current evidence. Resolve the payload terminology before changing the catalogue.
2. **Unitree:** inspect Go2 once with all configuration columns and footnotes; then inspect the H1 section separately from H1-2.
3. **Universal Robots:** review UR5e current online specifications and datasheet together; compare SW5.24 and SW5.26; review UR20 product page and technical manual as a single document group.
4. **ABB:** compare the current product page and all three registered datasheet/portfolio documents. Identify exact document revisions and whether they are duplicates, historical or variant-specific.
5. **KUKA:** verify the exact technical-data PDF, revision, pages and all six linked claims as one document batch.

Within each batch, capture source metadata once, extract all candidate values, and map each claim to its exact locator. Human review should focus on model/configuration identity, footnotes, conflicts, ambiguous extraction and rights. Straightforward table extraction can be automated, but approval cannot.

## 5. Required outcomes for each source

Every registered source must receive one explicit disposition:

- `accepted_primary_for_claims` — official/competent source and exact applicability established for named claims;
- `accepted_supporting` — useful supporting material, but not canonical for the named claims;
- `historical_only` — retained for revision history/context, not current values;
- `duplicate_or_superseded` — relationship to canonical source documented;
- `not_relevant` — no relevant claim support;
- `unverifiable` — issuer/content/applicability cannot be established;
- `pending_review` — not yet examined.

This disposition must not be conflated with rights status or claim verification. A source may be authentic and authoritative while processing rights remain unresolved. A source may be accepted for one claim but not another.

## 6. Guardrails

- Do not change any of the 39 catalogue values based only on this inventory.
- Do not change a claim to verified because its source domain is official.
- Do not infer permission to download, process, host, display, quote or redistribute from public accessibility.
- Do not add external laboratory, institute or research sources merely to make the registry appear diverse. Add them only when a relevant independent-test, certification or research claim requires them.
- Do not expand the catalogue until the initial document pipeline and exception handling are demonstrated.
- Preserve the distinction between manufacturer-declared data, independent measurement, certification, research findings and user observations.

## 7. Next acceptance checkpoint

The next checkpoint is a completed source-level review of one representative manufacturer batch, preferably one official document that supports several claims and has clear model/configuration applicability. It must demonstrate lawful acquisition/processing basis, document/page capture provenance, precise locators, extraction quality, human review and no automatic catalogue mutation.

Only after that pilot is reliable should the remaining batches be processed.
