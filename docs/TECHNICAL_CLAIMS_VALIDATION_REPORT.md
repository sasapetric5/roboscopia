# Roboscopia — Technical Claims Validation Report (preliminary)

**Scope:** 39 catalog claims across 7 robot records in `data/robots.json`  
**Catalog snapshot:** schema 2.1.0, updated 2026-11-20  
**Review status:** preliminary desk validation against identified manufacturer documentation and product pages. This is not a completed PDF extraction or a signed human review.

## Important interpretation

- “Preliminarily supported” means the identified manufacturer source appears to state the value for the named model/family. It is not a human-approved catalog change.
- “Conditional” means the value depends on configuration, load geometry, operating conditions, or a stated manufacturer boundary condition.
- “Potential contradiction” means the catalog value differs from the identified manufacturer documentation and must be investigated before any correction.
- Exact page/line locators are only stated where verified. For web product pages, section/table locators should be captured in a future evidence package; no invented page numbers are supplied.
- No source pages were scraped or downloaded by the extraction CLI. The table below records manual research findings and source targets, not generated extractor candidates.

## Claim-by-claim review

| # | Model | Catalog specification | Catalog value | Preliminary assessment | Manufacturer evidence target / locator |
|---:|---|---|---:|---|---|
| 1 | Spot | Mass with battery | 33.8 kg | Preliminarily supported | Spot Instructions for Use v5.1, p.10; production hardware |
| 2 | Spot | Maximum speed | 1.6 m/s | Preliminarily supported | Spot Instructions for Use v5.1, p.10 |
| 3 | Spot | Maximum payload | 14 kg | Preliminarily supported | Spot product specification; payload mounting weight |
| 4 | Spot | Battery capacity | 564 Wh | Preliminarily supported | Spot Instructions for Use v5.1, p.10 |
| 5 | Spot | Typical runtime | 90 min | Supported with qualifier | Spot Instructions for Use v5.1, p.10; average/base conditions; payload reduces runtime |
| 6 | Spot | Ingress protection | IP54 | Preliminarily supported | Spot Instructions for Use v5.1, p.10 |
| 7 | Go2 | Weight with battery | 15 kg | Preliminarily supported with approximation | Unitree Go2 official product page; variant family |
| 8 | Go2 | Standing dimensions | 70 × 31 × 40 cm | Preliminarily supported | Unitree Go2 official product page |
| 9 | Go2 | Battery endurance | 2–4 h | Needs qualification | Unitree Go2 official product page; configuration and operating conditions affect endurance |
| 10 | Go2 | Maximum running speed | 5 m/s | Configuration-specific review | Unitree Go2 official product page; maximum is not universal across AIR/PRO/X/EDU |
| 11 | Go2 | Payload | ≈7–8 kg | Configuration-specific review | Unitree Go2 official product page; payload varies by configuration |
| 12 | H1 | Height | 180 cm | Preliminarily supported with approximation | Unitree H1 official product page; keep H1 distinct from H1-2 |
| 13 | H1 | Mass | 47 kg | Preliminarily supported with approximation | Unitree H1 official product page; H1 variant only |
| 14 | H1 | Moving speed | 3.3 m/s | Preliminarily supported | Unitree H1 official product page; manufacturer-stated maximum |
| 15 | H1 | Battery capacity | 864 Wh | Preliminarily supported | Unitree H1 official product page |
| 16 | H1 | Maximum joint torque | 360 N·m | Preliminarily supported | Unitree H1 official product page; maximum joint torque |
| 17 | UR5e | Maximum payload | 5 kg | Preliminarily supported | Universal Robots UR5e Technical Specifications, SW5_26 |
| 18 | UR5e | Reach | 850 mm | Preliminarily supported | Universal Robots UR5e Technical Specifications, SW5_26 |
| 19 | UR5e | Degrees of freedom | 6 rotating joints | Preliminarily supported | Universal Robots UR5e Technical Specifications, SW5_26 |
| 20 | UR5e | Pose repeatability | ±0.03 mm | Preliminarily supported | Universal Robots UR5e Technical Specifications, SW5_26 |
| 21 | UR5e | Robot arm mass | 20.7 kg | Preliminarily supported; older manual version | Universal Robots UR5e Technical Specifications, SW5_24; confirm unchanged in SW5_26 before marking current |
| 22 | UR5e | Ingress protection | IP54 | Preliminarily supported | Universal Robots UR5e Technical Specifications, SW5_26 |
| 23 | UR20-1750 | Standard payload | 20 kg | Preliminarily supported | Universal Robots UR20 manual SW5_26 / current product information |
| 24 | UR20-1750 | Extended payload | 25 kg | Conditional; review required | Universal Robots UR20 manual; only under specified boundary conditions |
| 25 | UR20-1750 | Reach | 1750 mm | Preliminarily supported | Universal Robots UR20 manual SW5_26 |
| 26 | UR20-1750 | Maximum TCP speed | 5 m/s | Preliminarily supported; confirm definition | Universal Robots UR20 product information; verify whether this is maximum TCP speed under stated operating conditions |
| 27 | UR20-1750 | Robot mass | 64 kg | Preliminarily supported | Universal Robots UR20 manual SW5_26 |
| 28 | UR20-1750 | Repeatability | ±0.01 mm | Potential contradiction — high priority | Official UR20 manuals SW5_26 and SW10_15 state ±0.1 mm; catalog's ±0.01 mm differs by factor of 10 |
| 29 | GoFa 5 | Payload | 5 kg | Preliminarily supported | ABB GoFa 5 official product page |
| 30 | GoFa 5 | Reach to wrist | 950 mm | Preliminarily supported | ABB GoFa 5 official product page |
| 31 | GoFa 5 | Reach to flange | 1050 mm | Preliminarily supported | ABB GoFa 5 official product page |
| 32 | GoFa 5 | Axes | 6 | Preliminarily supported; family datasheet scope | ABB GoFa CRB 15000 datasheet; ensure exact GoFa 5 model mapping |
| 33 | GoFa 5 | Pose repeatability | 0.02 mm | Preliminarily supported; exact variant evidence to retain | ABB collaborative robotics portfolio/datasheet; verify GoFa 5-specific row and revision |
| 34 | KR 6 R700 sixx C | Maximum reach | 706.7 mm | Preliminarily supported | KUKA KR 6 R700 sixx C technical data PDF, V4.1 (23.09.2022) |
| 35 | KR 6 R700 sixx C | Rated payload | 3 kg | Supported with qualifier | KUKA technical data; rated load for optimized dynamic performance |
| 36 | KR 6 R700 sixx C | Maximum payload | 6 kg | Conditional; review required | KUKA technical data; depends on load centre distances and supplementary loads |
| 37 | KR 6 R700 sixx C | Axes | 6 | Preliminarily supported | KUKA technical data PDF, V4.1 |
| 38 | KR 6 R700 sixx C | Pose repeatability | ±0.03 mm | Preliminarily supported | KUKA technical data PDF, V4.1 |
| 39 | KR 6 R700 sixx C | Robot mass | 50 kg | Preliminarily supported with approximation | KUKA technical data PDF, V4.1 |

## High-priority review queue

1. **UR20 repeatability:** catalog says ±0.01 mm; UR20 manuals SW5_26 and SW10_15 state ±0.1 mm. Treat as a likely catalog error, but do not edit until a reviewer confirms exact model/manual applicability.
2. **UR20 25 kg payload:** preserve the condition that 25 kg is permitted only within the manual's boundary conditions. Do not present as an unconditional standard payload.
3. **Go2 speed and payload:** the 5 m/s and ≈7–8 kg figures are not universal across AIR/PRO/X/EDU. Record configuration-specific values or clearly label the current figures as maxima/variant-dependent.
4. **KUKA 3 kg vs 6 kg:** retain the distinction between rated payload (3 kg for optimized dynamic performance) and conditional maximum payload (6 kg under specified load-centre/supplementary-load conditions).
5. **UR5e arm mass:** the 20.7 kg value is linked to SW5_24 while other claims use SW5_26. Verify it remains unchanged in the newer manual.
6. **ABB GoFa 5 repeatability and axes:** retain a GoFa 5-specific datasheet/table locator and verify that family-level data is not accidentally attributed to a different GoFa payload variant.
7. **Spot runtime:** preserve “average/typical” wording and note that payload and environment reduce runtime. Older Spot documents may list different battery/weight values for earlier hardware revisions.

## Source targets

- Boston Dynamics Spot product page: https://bostondynamics.com/products/spot/
- Boston Dynamics Spot specifications support reference: https://support.bostondynamics.com/s/article/spot-specifications
- Unitree Go2: https://www.unitree.com/go2/
- Unitree H1: https://www.unitree.com/h1/
- Universal Robots UR5e SW5_26 technical specifications: https://www.universal-robots.com/manuals/EN/HTML/SW5_26/Content/prod-usr-man/complianceUR5e/H_g5_sections/appendix_g5/tech_spec_sheet.htm
- Universal Robots UR5e SW5_24 technical specifications: https://www.universal-robots.com/manuals/EN/HTML/SW5_24/Content/prod-usr-man/complianceUR5e/H_g5_sections/appendix_g5/tech_spec_sheet.htm
- Universal Robots UR20 product page: https://www.universal-robots.com/products/ur20-1750/
- Universal Robots UR20 SW5_26 manual: https://www.universal-robots.com/manuals/EN/HTML/SW5_26/Content/prod-usr-man/complianceUR20/H_g5_sections/appendix_g5/tech_spec_UR20.htm
- ABB GoFa: https://www.abb.com/global/en/areas/robotics/products/robots/collaborative-robots/gofa
- ABB GoFa CRB 15000 datasheet: https://library.e.abb.com/public/d4c38d5b4bcf40df8504ee417cb0e830/GoFa%20CRB%2015000%20Datasheet.pdf
- ABB collaborative robotics portfolio: https://library.e.abb.com/public/7c359cda481943cfa98182b818b89878/UPDATED%20ABB_Collaborative_robotics_portfolio_2023_v4%20kopia.pdf
- KUKA KR 6 R700 sixx C technical data: https://www.kuka.com/-/media/kuka-downloads/imported/8350ff3ca11642998dbdc81dcc2ed44c/0000215571_en.pdf

## Completion criteria for full evidence validation

The 39 claims are not considered fully validated until each claim has:
- a rights-cleared local source document or stable official source reference;
- exact model and configuration/generation identity;
- document title, revision/date, SHA-256 (for local documents), and page/line/table locator;
- quoted evidence text and normalized value/unit comparison;
- a human reviewer, explicit outcome, note, and timestamp.

## Safety and change policy

- `data/robots.json` was not changed by this report.
- No automated approval or catalog mutation is permitted.
- The review decision store remains separate from catalog data.
- No deployment was performed.
