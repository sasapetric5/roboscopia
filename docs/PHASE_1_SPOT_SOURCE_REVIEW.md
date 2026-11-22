# Phase 1 Pilot — Boston Dynamics Spot Source Review

**Review date:** 2026-11-22  
**Branch:** `main`  
**Scope:** Publicly accessible official Boston Dynamics product and support specifications for Spot.  
**Status:** SOURCE CONTENT REVIEWED; CLAIMS NOT HUMAN-APPROVED; RIGHTS NOT CLEARED; NO CATALOG MUTATION.

## 1. Sources inspected

### S1 — Official Spot product page

- Registry ID: `src-0001`
- URL: https://bostondynamics.com/products/spot/
- Source class: `manufacturer_primary`
- Page section: **Spot Specifications**
- Review locators are the visible headings/labels and values listed below. The live page does not expose a stable revision identifier or publication date in the inspected content. Capture date for this review: 2026-11-22.

### S2 — Official Spot Support specification article

- Registry ID: `src-0002`
- URL: https://support.bostondynamics.com/s/article/spot-specifications
- Source class: `manufacturer_primary`
- Article title: **Spot Specifications**
- Introductory applicability note: reference table is based on hardware/software currently in production; some specifications may differ for older models.
- Locators: **Physical Properties**, **Power**, **Payloads**, and the notes immediately following those tables.
- The article's indexed official content was available for inspection on 2026-11-22. Direct page opening through the browser inspection service returned a cache-miss error during this review; this is a retrieval limitation, not evidence that the manufacturer's page is unavailable to users. A reproducible HTML capture has not been created.

Both sources are on Boston Dynamics-controlled domains and are primary manufacturer sources. This establishes source class, not permission to download, process, quote or republish their content.

## 2. Current catalogue claims — source-level comparison

The Spot record in `data/robots.json` currently contains six claims, all linked to `src-0001` and marked `source_linked_unverified`.

| Catalogue claim | Catalogue value | Official product page | Preliminary result |
|---|---:|---|---|
| Mass with battery | 33.8 kg | “Net Mass/Weight (Spot with battery)” = 33.8 kg | Exact visible match |
| Maximum speed | 1.6 m/s | “Max Speed” = 1.6 m/s | Exact visible match |
| Maximum payload | 14 kg | “Max Weight” under Payload Mounting = 14 kg; page introduction also says 14 kg payload capacity | Exact visible match to the product-page wording; conflicting official support terminology below |
| Battery capacity | 564 Wh | “Battery Capacity” = 564 Wh | Exact visible match |
| Typical runtime | 90 min | “Average Runtime” = 90 mins; footnote says runtime may vary with payloads and environmental factors | Value matches; preserve the qualification |
| Ingress protection | IP54 | “Ingress Protection” = IP54 | Exact visible match |

These are source-to-catalogue matches only. They are not independent measurements and have not been approved as final catalogue claims.

## 3. Official-source differences and anomalies

### 3.1 Payload: 14 kg versus 20.43 kg — unresolved

S1, the product page, states:
- page introduction: “14kg of payload capacity”;
- Payload Mounting → Max Weight: **14 kg (30.9 lb)**.

S2, the support article, states:
- Payloads → Max recommended mass/weight: **20.43 kg**;
- accompanying note says Spot performs best with payload mass centered directly on top of its body and that performance/stability may degrade as more mass is added; tall, off-center or cantilevered payloads may affect performance even below that mass.

Both are official manufacturer statements. The current sources do not establish whether “Max Weight” and “Max recommended mass/weight” refer to different engineering limits, different payload mounting conditions, different product revisions or a changed specification.

**Decision:** Do not overwrite 14 kg with 20.43 kg, and do not merge them into one generic “maximum payload” field. Keep the current catalogue's 14 kg claim pending exact manufacturer clarification of the metric. If both values are eventually retained, model them as distinct manufacturer-declared fields with their original labels, source IDs and notes. No independent test is implied.

### 3.2 Speed: 1.6 m/s versus 5.8 kph — equivalent within rounding

S1 states maximum speed **1.6 m/s**. S2 states maximum nominal speed **5.8 kph** and explains that this is forward body velocity under nominal environmental/navigation conditions; individual leg motion can be faster.

5.8 kph converts to approximately 1.61 m/s, consistent with 1.6 m/s after rounding. Preserve S2's “nominal forward body velocity” definition if using that source; do not describe it as leg speed or an unrestricted field speed.

### 3.3 Runtime: 90 minutes is condition-dependent

S1 states average runtime 90 minutes and explicitly warns that payloads and environmental factors affect it.

S2 states approximately 90 minutes base and approximately 60 minutes when powering payloads. This adds an important operating condition. The current catalogue's 90-minute claim should retain its “average/base configuration” qualifier and must not be presented as guaranteed runtime with payloads.

### 3.4 Dimensions: inconsistent metric/imperial pair on S1

S1 currently renders Length as **110 mm (43.3 in)**. Those units are inconsistent: 43.3 inches is approximately 1100 mm. S2 states length **1100 mm**. Do not copy the 110 mm metric value. Treat S1's metric entry as an apparent page/transcription defect and use no dimension claim until the source capture and exact table are human-reviewed. The likely intended value is 1100 mm, but this report does not approve a correction to the catalogue.

### 3.5 Recharge time: method and condition matter

S1 gives “Recharge Time” = 60 minutes without a detailed charging-method qualifier in the displayed table.

S2 distinguishes charging conditions: Spot Dock at 25°C takes approximately 50 minutes to 80% and 2 hours to 100%; at 35°C approximately 2.5 hours to 80% and 3.5 hours to 100%; Spot Power Supply approximately 1 hour. Do not turn “60 minutes” into a universal full-charge claim. If charge time is added to the catalogue, it must be split by charger, ambient temperature and charge target.

## 4. Recommended claim dispositions

These are proposed outcomes for a reviewer; they are not recorded claim approvals.

| Claim | Proposed disposition | Reason |
|---|---|---|
| Mass with battery 33.8 kg | `supported` by S1; manufacturer-declared | Exact product-page match; confirm model applicability/capture |
| Maximum speed 1.6 m/s | `supported` by S1; manufacturer-declared | Exact product-page match; S2 gives equivalent rounded nominal body speed |
| Maximum payload 14 kg | `partially_supported` / `conflicting` pending clarification | S1 says 14 kg Max Weight; S2 says 20.43 kg Max recommended mass |
| Battery capacity 564 Wh | `supported` by S1; manufacturer-declared | Exact product-page match |
| Typical runtime 90 min | `partially_supported` until qualifier is explicit | S1 footnote and S2 distinguish base operation from powering payloads |
| Ingress protection IP54 | `supported` by S1; manufacturer-declared | Exact product-page match |

A reviewer must record decisions through the project's evidence review workflow with a precise locator, note, reviewer and timestamp. Do not write these proposed outcomes into the canonical decision store automatically.

## 5. Registry consistency findings

The current `data/evidence-document-registry.json` Spot record has:
- evidence document ID: `spot-current-production-specs`;
- source page URL: S2 support article;
- `canonicalSourceId: src-0002`;
- `relatedSourceIds: [src-0001]`;
- all six `catalogClaims` currently identify `catalogSourceId: src-0001`.

This relationship is not self-explanatory. The catalog claims cite S1, while the evidence-document record's canonical source is S2. Before evidence acquisition or claim review, explicitly document which source supports each claim and whether the evidence document is intended to capture S1, S2, or both. Do not silently reassign the canonical source ID.

The Spot evidence record also has `acquisition.status: not_acquired`, `processingPermission: false`, `rightsReview: pending`, `redistributionPermission: unknown`, and `factualVerification: not_performed`. These statuses must remain unchanged until a reviewer confirms an applicable lawful processing basis and performs a reproducible capture.

## 6. Rights and acquisition boundary

This review used publicly accessible official source content for source identification and factual comparison. It did **not**:
- download or store a manufacturer PDF or HTML page;
- create a local evidence artifact or SHA-256 hash;
- establish permission for automated scraping, local processing, hosting, quoting, display or redistribution;
- mark either source rights-cleared;
- approve evidence candidates or claim decisions;
- modify `data/robots.json` or either canonical registry.

A live webpage's visible content is not a substitute for a permission-reviewed, reproducible evidence capture. The HTML evidence workflow remains a Phase 1 blocker.

## 7. Pilot result

The pilot has demonstrated that source-level batch review surfaces issues that would be missed by checking only whether a number appears on a manufacturer page:
- two official payload labels with different values;
- an important runtime qualifier;
- a rounded speed equivalence;
- an apparent metric/imperial page defect;
- charging-time conditions;
- a source-to-evidence registry mapping ambiguity.

**Pilot status: PARTIAL — source content compared; acquisition, rights, reproducible HTML capture, and human claim decisions remain open.**

The next implementation task should be a permission-gated, reproducible HTML evidence-capture workflow that stores a capture timestamp, canonical URL, content type, SHA-256, stable heading/table locators and rights-review metadata. It must never fetch or process pages automatically when permission is unknown, and it must never mutate catalogue values or approve claims.
