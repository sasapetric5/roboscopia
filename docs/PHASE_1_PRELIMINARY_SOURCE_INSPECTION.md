# Phase 1 — Preliminary Manufacturer Source Inspection

**Inspection date:** 2026-11-21  
**Status:** PRELIMINARY TECHNICAL INSPECTION — NOT HUMAN-APPROVED, NOT RIGHTS-CLEARED, NOT CLAIM APPROVAL  
**Branch:** main

This report records initial inspection of official manufacturer pages/documents. It does not change catalogue values, canonical source review statuses, rights decisions, or evidence approval. Public accessibility does not grant permission to download, process, redistribute, host, or reuse content.

## Summary

| Model | Preliminary result | Outstanding issue |
|---|---|---|
| Boston Dynamics Spot | 5 values visibly match | Payload semantics conflict; support page unreadable in browser inspection |
| Unitree Go2 | Weight and dimensions match | Battery, speed and payload vary by configuration |
| Unitree H1 | 5 values visibly match | Keep H1 distinct from H1-2 |
| Universal Robots UR5e | All 6 values visibly match | Record exact capture/revision and rights review |
| Universal Robots UR20-1750 | Payload, reach, TCP speed and mass match | Repeatability not established from inspected product-page block |
| ABB GoFa 5 | Payload and both reach values match | Axes and repeatability need exact model-specific datasheet |
| KUKA KR 6 R700 sixx C | 6 values match official document extract | Obtain exact PDF locally and record hash/page locators |

## 1. Boston Dynamics Spot

Inspected: https://bostondynamics.com/products/spot/  
Locator: Spot Specifications; Base Robot; Battery & Payload.

- Mass with battery 33.8 kg, max speed 1.6 m/s, IP54, battery 564 Wh and average runtime 90 minutes visibly match the catalogue.
- The current page labels payload mounting Max Weight as 20.43 kg (45 lb), whereas the catalogue says Maximum payload 14 kg.
- The 14 kg and 20.43 kg figures may describe different payload definitions/configurations. Do not replace one with the other until the precise meaning is reconciled.
- The support URL https://support.bostondynamics.com/s/article/spot-specifications returned a loading/CSS error and remains unreviewed.

## 2. Unitree Go2

Inspected: https://www.unitree.com/go2/  
Locators: Mechanical Specifications; Performance Parameters; AIR / PRO / X / EDU columns; battery-life rows; footnote [8].

- Standing dimensions 70 × 31 × 40 cm and weight with battery about 15 kg visibly match across all four configurations.
- Battery life is approximately 1–2 h for AIR / PRO / X and 2–4 h for EDU. A separate page headline also states approximately 2–4 h.
- Payload is approximately 7 kg for AIR (maximum about 10 kg); approximately 8 kg for PRO (maximum about 10 kg); approximately 8 kg for X and EDU (maximum about 12 kg).
- Speed is 0–2.5 m/s for AIR, 0–3.5 m/s for PRO, and 0–3.7 m/s for X / EDU (maximum about 5 m/s). The separate 5 m/s headline says tested in a lab.
- Footnote [8] warns parameters may vary by scenario and configuration.

Disposition: The generic 5 m/s must not be presented as ordinary speed for every configuration. The generic 2–4 h battery and ≈7–8 kg payload conceal variant differences. Preserve configuration-specific claims or clearly qualify them; do not collapse maximum payload into one universal number.

## 3. Unitree H1

Inspected: https://www.unitree.com/h1/  
Locators: Unitree H1 section; Unitree H1 Parameter table.

The H1 section visibly reports height about 180 cm, weight about 47 kg, moving speed 3.3 m/s, battery capacity 864 Wh and maximum joint torque 360 N·m. All five match the catalogue.

Disposition: The same page separately identifies H1-2 with different dimensions and weight. Evidence must point specifically to the H1 section/table column, not merely the combined page title.

## 4. Universal Robots UR5e

Inspected: https://www.universal-robots.com/manuals/EN/HTML/SW5_26/Content/prod-usr-man/complianceUR5e/H_g5_sections/appendix_g5/tech_spec_sheet.htm  
Locator: Technical Specifications UR5e; General specification, Movement, Features and Physical sections.

The page visibly reports payload 5 kg, reach 850 mm, 6 rotating joints, pose repeatability ±0.03 mm, IP54 and robot arm weight 20.7 kg. All six values match the catalogue.

The 20.7 kg value is visible in the SW5.26 page as well as the earlier SW5.24 source currently referenced by the catalogue for that claim.

Disposition: SW5.26 appears to cover all six claims and may remove the need to rely on SW5.24 for robot arm mass. Treat this as a proposed provenance consolidation only; do not change canonical provenance until a reviewer approves the source mapping and revision.

## 5. Universal Robots UR20-1750

Inspected: https://www.universal-robots.com/products/ur20-1750/  
Locator: product specification block.

The page visibly reports payload 20 kg, extended payload 25 kg, reach 1750 mm, maximum TCP speed 5 m/s and weight 64 kg. These match the corresponding catalogue claims.

The inspected product-page block does not establish the catalogue repeatability value ±0.01 mm.

Disposition: Keep repeatability pending until the exact official manual/datasheet passage is inspected.

## 6. ABB GoFa 5

Inspected: https://www.abb.com/global/en/areas/robotics/products/robots/collaborative-robots/gofa  
Locator: Technical Data; Available Variants.

The GoFa 5 variant reports payload 5 kg, reach to wrist 0.95 m (950 mm) and reach to flange 1.05 m (1050 mm). These match the catalogue.

The same page separately lists GoFa 10 and GoFa 12. Keep all values attached to GoFa 5. The page includes a family-level repeatability statement of 0.02 mm, but this inspection does not establish that it applies to the exact GoFa 5 configuration in the catalogue. The axes claim and exact datasheet revision also require direct review.

Disposition: The payload and reach claims have preliminary page-level support. Axes and repeatability remain pending exact model/configuration evidence. Compare ABB datasheet sources src-0011 and src-0014 by title, revision, date and SHA-256. The 2023 portfolio src-0015 is historical and must not silently substitute for a current model-specific datasheet.

## 7. KUKA KR 6 R700 sixx C

Official document URL: https://www.kuka.com/-/media/kuka-downloads/imported/8350ff3ca11642998dbdc81dcc2ed44c/0000215571_en.pdf  
Document identity in official search extract: 0000-215-571 / V4.1 / 23.09.2022 / en.

The official technical table reports maximum reach 706.7 mm, rated payload 3 kg, maximum payload 6 kg, 6 axes, pose repeatability ±0.03 mm and weight approximately 50 kg. All six match the catalogue.

The rated 3 kg and maximum 6 kg are distinct conditions. The document says the robot is designed for 3 kg rated payload; up to 6 kg may be mounted under reduced load-centre distances and favourable supplementary loads, with the specific load case checked using KUKA.Load.

Disposition: Preserve the rated-versus-maximum distinction and manufacturer caveat. The browser inspection redirected the direct URL to KUKA Download Center, while the official search extract exposed the technical table. Obtain the exact PDF through an authorized route, verify revision and record local SHA-256 and page locator before marking it acquired.

## Registry integrity issues

1. Spot evidence-document record uses canonical source src-0002, while its six catalogClaims identify src-0001. Align the evidence record with the actual page used for each claim, or document an explicit two-source relationship.
2. UR5e evidence-document record points to SW5.26, while one claim references older SW5.24 src-0013. The SW5.26 page visibly contains 20.7 kg; review and approve a consistent provenance path.
3. ABB evidence-document record is mapped to family page src-0010, while axes and repeatability point to src-0014 and historical portfolio src-0015. Link each claim to the exact document actually inspected.
4. KUKA document is not yet acquired locally; a browser redirect is not a verified PDF acquisition.
5. Evidence acquisition CLI currently accepts PDF only, while three of seven evidence-document records are HTML. A traceable HTML capture workflow is required.

## Rights and approval boundary

- No source in this report is marked rights-cleared.
- No PDF was downloaded or stored in the repository during this inspection.
- No HTML page was copied into the repository as an evidence artifact.
- No evidence candidate was approved.
- No catalogue value or provenance field was changed.
- All findings require human review before canonical source-review or claim-review decisions are recorded.

## Next actions

1. Correct evidence-document-to-source mappings, including explicit multi-source relationships where needed.
2. Inspect and compare ABB datasheet candidates; confirm exact GoFa 5 model/revision.
3. Obtain the KUKA V4.1 PDF through an authorized route and record SHA-256/page locators.
4. Build and test a permission-gated HTML capture path; never label HTML as PDF.
5. Review Spot payload semantics and Go2 configuration-specific values before catalogue changes.
6. Complete rights review and human claim decisions; only then update canonical registries and catalogue through validated review tooling.
