# Phase 1 — Preliminary Official-Source Review

**Review date:** 2026-11-21  
**Repository branch:** `main`  
**Purpose:** Preserve preliminary findings from a manual inspection of publicly accessible manufacturer pages and technical sheets.  
**Status:** Preliminary research only — not a final claim-verification decision, not evidence-package acquisition, and not a rights clearance.

## 1. Current acceptance baseline

The latest Phase 1 readiness report (CI workflow run #145) records:

- 7 catalogue records;
- 15 registered sources;
- 39 technical claims;
- 0 acquired evidence packages;
- 0 extracted evidence candidates;
- 39 claims without evidence;
- 0 eligible claims and 39 quarantined claims;
- 22 open review-queue items;
- 0 data-quality audit errors and 15 warnings.

The workflow completed successfully. This confirms that the audit and test tooling executed; it does not mean the catalogue claims have been verified.

## 2. Preliminary source observations

The observations below are based on visible content from official manufacturer domains. They are useful for prioritizing the formal review, but must not be copied into canonical verification decisions without the required evidence capture, exact locator, reviewer identity and rights review.

### 2.1 Boston Dynamics Spot

**Official sources inspected**
- [Spot product specifications](https://bostondynamics.com/products/spot/)
- [Spot specifications support page](https://support.bostondynamics.com/s/article/spot-specifications)
- [Spot 5.2 SDK — payload configuration requirements](https://dev.bostondynamics.com/docs/payload/payload_configuration_requirements)

**Preliminary findings**
- The current product page lists 33.8 kg mass with battery, 1.6 m/s maximum speed, 564 Wh battery capacity, 90 minutes average runtime, IP54 and 14 kg maximum payload weight.
- The SDK documentation describes 14 kg as the total combined payload capacity.
- The support specifications page also displays 20.43 kg as “Max recommended mass/weight”. The semantics and applicability of this field must be resolved against the 14 kg total payload limit before any interpretation is approved.

**Required action:** retain the 14 kg payload claim as unverified pending formal review; open a specific discrepancy review for the 20.43 kg support-page field. Do not silently substitute one value for the other.

### 2.2 Unitree Go2

**Official source inspected**
- [Unitree Go2 product specifications](https://www.unitree.com/go2/)

**Preliminary findings**
- The page presents AIR, PRO, X and EDU configurations.
- Standing dimensions (70 × 31 × 40 cm) and approximate weight with battery (about 15 kg) are shown across the four columns.
- Battery endurance differs: the page shows approximately 1–2 hours for AIR/PRO/X and approximately 2–4 hours for EDU.
- Maximum speed and payload are configuration-dependent. The page shows different standard speeds and payload figures by variant; the approximately 5 m/s figure is a maximum, laboratory-tested value, not a universal operating speed.
- Payload values are approximately 7–8 kg depending on configuration, with higher maximum values shown for some variants.

**Required action:** do not publish one universal endurance, speed or payload value. Formal evidence must preserve the configuration column and the manufacturer's qualifiers.

### 2.3 Unitree H1

**Official source inspected**
- [Unitree H1 / H1-2 product specifications](https://www.unitree.com/h1/)

**Preliminary findings**
- The page separates H1 and H1-2 into distinct sections and parameter columns.
- The H1 overview lists approximately 180 cm height, approximately 47 kg mass, 3.3 m/s moving speed, 864 Wh battery capacity and 360 N·m maximum joint torque.
- H1-2 values differ; the H1-2 column must not be used as evidence for H1.

**Required action:** formal capture must identify the H1 section/column and preserve approximate qualifiers for height and mass.

### 2.4 Universal Robots UR5e

**Official sources inspected**
- [UR5e technical specifications — PolyScope SW5_26](https://www.universal-robots.com/manuals/EN/HTML/SW5_26/Content/prod-usr-man/complianceUR5e/H_g5_sections/appendix_g5/tech_spec_sheet.htm)
- [UR5e user manual PDF — SW5_26](https://www.universal-robots.com/manuals/EN/PDF/SW5_26/user-manual-UR5e-PDF_online/710-965-00_UR5e_User_Manual_en_Global.pdf)

**Preliminary findings**
- The SW5_26 technical specification page lists 5 kg maximum payload, 850 mm reach, six rotating joints, ±0.03 mm pose repeatability and IP54.
- The catalogue's 20.7 kg arm-mass claim is linked to a separate SW5_24 source URL. The same mass appears in official UR5e specification material, but the revision difference must be recorded and checked rather than hidden.

**Required action:** formally capture the SW5_26 specification page and resolve whether the SW5_24 mass source is acceptable for the catalogue's intended model/revision.

### 2.5 Universal Robots UR20-1750

**Official sources inspected**
- [UR20-1750 product page](https://www.universal-robots.com/products/ur20-1750/)
- [UR20 product page](https://www.universal-robots.com/products/ur20/)
- [Universal Robots FAQ — model naming and Generation 7 compatibility](https://www.universal-robots.com/insights/faq/)

**Preliminary findings**
- The UR20-1750 product page lists 20 kg standard payload, 25 kg extended payload, 1750 mm reach, 5 m/s maximum TCP speed and 64 kg weight.
- The specific UR20-1750 page displays ±0.01 mm repeatability, while the separate general UR20 product page displays ±0.1 mm. This is an unresolved discrepancy requiring exact source revision, model generation and specification context.
- Universal Robots states that UR20-1750 is a naming update for UR20, mechanically unchanged, and compatible with Generation 7 components. Preserve the naming/generation context in the record.

**Required action:** do not accept the repeatability claim until the ±0.01 mm versus ±0.1 mm discrepancy is resolved against the applicable manufacturer datasheet/manual. Keep standard and extended payload conditions separate.

### 2.6 ABB GoFa 5 (CRB 15000)

**Official sources inspected**
- [ABB GoFa product page](https://www.abb.com/global/en/areas/robotics/products/robots/collaborative-robots/gofa)
- [ABB GoFa CRB 15000 datasheet](https://library.e.abb.com/public/24de2251a42d4f9badda0232508ff242/9AKK107991A8564_en_F_GoFa%E2%84%A2%20CRB%2015000%20datasheet.pdf)
- [ABB GoFa CRB 15000 datasheet — alternate official library copy](https://library.e.abb.com/public/da08b5dcb0134ec4ab2be13397c07f56/GoFa%20CRB%2015000%20Datasheet.pdf)

**Preliminary findings**
- GoFa 5 is listed with 5 kg payload, 950 mm reach to wrist and 1050 mm reach to flange.
- The datasheet lists six axes and 0.02 mm pose repeatability for GoFa variants.
- GoFa 10 and GoFa 12 have different payload/reach values; do not apply those figures to GoFa 5.

**Required action:** formally capture the GoFa 5 column and verify the exact datasheet revision. Keep the distinct wrist and flange reach fields.

### 2.7 KUKA KR 6 R700 sixx C

**Official source inspected**
- [KUKA KR 6 R700 sixx C Technical Data — V4.1, 23 September 2022](https://www.kuka.com/-/media/kuka-downloads/imported/8350ff3ca11642998dbdc81dcc2ed44c/0000215571_en.pdf)

**Preliminary findings**
- The one-page technical sheet lists 706.7 mm maximum reach, 6 kg maximum payload, ±0.03 mm pose repeatability, six axes and approximately 50 kg mass.
- It explicitly distinguishes a 3 kg rated payload for optimized dynamic performance from a maximum payload of up to 6 kg under favorable load-centre and supplementary-load conditions; KUKA says the specific load case must be verified.

**Required action:** preserve rated and maximum payload as separate claims, including the load-case conditions and manufacturer warning.

## 3. Formal evidence and rights gate — still open

This review did not:
- download or locally acquire the seven registered evidence documents;
- create SHA-256 fingerprints or page counts;
- create extraction candidates or evidence packages;
- establish permission to process or redistribute any document;
- approve any of the 39 canonical claims;
- modify `data/robots.json`, source decisions or catalogue facts.

Public access to a webpage or PDF is not a grant of processing or redistribution permission.

## 4. Recommended next work order

1. Resolve the Spot 14 kg versus 20.43 kg payload terminology and the UR20 repeatability discrepancy.
2. Obtain the seven source documents/pages through the authorized reviewer workflow; prioritize KUKA, ABB, Unitree Go2/H1 and Universal Robots, while separately resolving any gated Boston Dynamics material.
3. Record each document's exact revision, acquisition method, SHA-256, size, page count and processing-rights basis.
4. Run local extraction and preserve exact PDF page or HTML table/section locators.
5. Match each extracted candidate to the exact model, configuration, claim and unit.
6. Have an identified human reviewer record claim decisions; keep unresolved or approximate/configuration-dependent claims quarantined.
7. Re-run the audit and readiness workflow. Do not change the readiness gate merely to obtain a green status.

**Status:** This memo is a preliminary research aid. Phase 1 remains `BLOCKED_NO_EVIDENCE`.


## 5. Registry-wide review of the 15 registered sources

This section maps the current source registry IDs to the publicly accessible official material inspected during the follow-up review. “Inspected” here means that visible page/PDF content was reviewed in the browser research session. It does **not** mean that the original file was acquired into the project's evidence intake, fingerprinted, rights-cleared or formally approved by a named catalogue reviewer.

| Registry ID | Registered source | Research result | Remaining action |
|---|---|---|---|
| src-0001 | Boston Dynamics Spot product page | Inspected. Current product page lists 14 kg payload mounting maximum, 33.8 kg mass with battery, 1.6 m/s, 564 Wh, 90 min average runtime and IP54. | Acquire/record approved source evidence and precise locators; compare against src-0002. |
| src-0002 | Boston Dynamics Spot support specifications | Inspected. Lists 20.43 kg “Max recommended mass/weight”, while src-0001 and the Spot SDK state 14 kg maximum payload. | Open discrepancy: manufacturer clarification or a traceable version/context explanation required. Do not publish 20.43 kg as the current payload limit. |
| src-0003 | Unitree Go2 official product page | Inspected. Four variant columns (AIR, PRO, X, EDU) show different payload, speed, climb angle and battery endurance. | Formal capture must preserve column-to-variant mapping and qualifiers. |
| src-0004 | Unitree Go2 mobile product page | Registered URL not independently inspected in this review. It appears to be an alternate presentation of the same product page, but equivalence has not been proven. | Compare the exact page content and determine whether this is a duplicate source record or contains unique facts. |
| src-0005 | Unitree H1 / H1-2 official page | Inspected. H1 and H1-2 are separate model variants with distinct mass, height, degrees of freedom and joint specifications. | Preserve model-specific column/section locators; do not merge H1-2 claims into H1. |
| src-0006 | UR5e SW5_26 online technical specification | Inspected. Confirms 5 kg payload, 850 mm reach, six axes, ±0.03 mm repeatability, IP54 and 20.7 kg robot-arm weight. | Formal capture with software/manual revision and section locator. |
| src-0007 | UR5e e-Series datasheet, updated December 2024 | Inspected. Confirms 5 kg payload, 850 mm reach, six axes and ±0.03 mm repeatability; states 20.6 kg “weight including cable”. | Keep the 20.6 kg including-cable field distinct from 20.7 kg robot-arm weight until the definitions/revisions are reconciled. |
| src-0008 | UR20-1750 product page | Inspected. Product page lists 20 kg standard payload, 25 kg extended payload, 1750 mm reach, 64 kg weight and ±0.01 mm repeatability. | Obtain the linked model-specific datasheet and verify ±0.01 mm against the applicable manual/revision. |
| src-0009 | UR20 SW10_9 online technical specification | Inspected. Generic UR20 manual states ±0.1 mm repeatability, 20 kg standard payload and 25 kg with manual boundary conditions. | Keep the ±0.1 mm manual claim distinct from the UR20-1750 page claim until exact model/revision applicability is resolved. |
| src-0010 | ABB GoFa family page | Inspected. ABB lists GoFa 5, GoFa 10 and GoFa 12 as separate variants; their reaches and payloads differ. | Use variant-specific facts, not family-level “up to” values for GoFa 5. |
| src-0011 | ABB GoFa datasheet, file name includes “200526” | Inspected. Its table separates GoFa 5/12/10; GoFa 5 is 5 kg with 950 mm wrist and 1050 mm flange reach, six axes and 0.02 mm pose repeatability. The higher 12–14 kg values apply to other family variants. | Establish the document's exact publication/revision date and retain page/table locators. |
| src-0012 | KUKA KR 6 R700 sixx C Technical Data V4.1 | Inspected. Dated 23 September 2022. Lists 706.7 mm reach, 6 kg maximum payload, ±0.03 mm repeatability, six axes and approx. 50 kg. It explicitly describes 3 kg rated payload and conditional maximum 6 kg. | Preserve rated and maximum payload as separate claims and capture the KUKA load-case warning. |
| src-0013 | UR5e SW5_24 earlier technical specification | Inspected. Confirms 20.7 kg arm weight, 5 kg payload, 850 mm reach and ±0.03 mm repeatability in the earlier manual revision. | Treat as historical/revision-specific support, not as a substitute for the newer SW5_26 source. |
| src-0014 | Additional ABB GoFa datasheet | Inspected. Copyright © 2023; lists GoFa 5/12/10 variants and 0.02 mm pose repeatability. | Establish exact relation to src-0011 (edition, revision and whether one supersedes the other). |
| src-0015 | ABB Collaborative Robotics Portfolio 2023 PDF | The exact registered URL was not accessible in this review. An alternate ABB-hosted 2023 portfolio PDF was located, but it has a different file path and has not been proven byte-identical. | Keep the registered source unreviewed until the exact file is acquired/compared; do not silently replace its URL. |

## 6. Confirmed variant and definition controls from the follow-up review

### 6.1 Unitree Go2 — preserve four columns

The official Go2 table explicitly separates AIR, PRO, X and EDU:

| Parameter | AIR | PRO | X | EDU |
|---|---:|---:|---:|---:|
| Payload (approx.) | 7 kg | 8 kg | 8 kg | 8 kg |
| Maximum payload shown | ~10 kg | ~10 kg | ~12 kg | ~12 kg |
| Speed range shown | 0–2.5 m/s | 0–3.5 m/s | 0–3.7 m/s | 0–3.7 m/s |
| Laboratory maximum speed | — | — | ~5 m/s | ~5 m/s |
| Battery life | 1–2 h | 1–2 h | 1–2 h | 2–4 h |
| Weight with battery | about 15 kg | about 15 kg | about 15 kg | about 15 kg |

These values are manufacturer-stated and configuration-dependent. The table does not justify assigning the maximum laboratory speed or maximum payload to every Go2 configuration. The official page also warns that configurations are diverse and asks users to contact Unitree for details.

### 6.2 ABB GoFa — distinguish family maximum from GoFa 5

The inspected ABB datasheets and product page separate GoFa 5, GoFa 10 and GoFa 12. For GoFa 5, the relevant table values are 5 kg payload, 950 mm wrist reach, 1050 mm flange reach, six axes and 0.02 mm pose repeatability. The family-level maximum reach/payload and the GoFa 10/12 figures must not be assigned to GoFa 5.

### 6.3 UR20 — preserve the unresolved precision claim

The UR20-1750 product page displays ±0.01 mm repeatability, while the SW10_9 UR20 manual states ±0.1 mm per ISO 9283. These are both official sources but are not yet reconciled by a model-specific datasheet and revision chain. The catalogue claim remains quarantined until the exact technical definition and applicability are documented.

### 6.4 Spot — preserve the conflicting manufacturer statements

The current Spot product page and Spot 5.2 SDK both state a 14 kg maximum payload. The Support specification page separately lists 20.43 kg as “Max recommended mass/weight”. Since both are manufacturer-hosted, source authority alone does not resolve the difference. Record both verbatim with their respective page contexts and seek clarification; do not average, choose the larger figure or silently discard the discrepancy.

## 7. Updated priority order

1. **Spot discrepancy:** request or locate manufacturer clarification for 14 kg versus 20.43 kg, including hardware/software applicability.
2. **UR20 repeatability:** obtain the current UR20-1750 datasheet linked by Universal Robots and reconcile ±0.01 mm with the UR20 manual's ±0.1 mm.
3. **ABB source lineage:** determine the exact revision/date and supersession relationship of src-0011 and src-0014; recover and compare the exact src-0015 file.
4. **Unitree Go2/H1:** acquire the exact manufacturer documents and preserve variant/section mappings.
5. **UR5e/KUKA:** acquire the PDFs or approved HTML evidence and preserve the cable-weight and rated-versus-maximum-payload definitions.

## 8. Evidence and rights boundary remains unchanged

No source in this review has been marked formally reviewed in the canonical source registry. No PDF was placed in the repository or redistributed. No processing permission was inferred from public availability. No source-verification decision was recorded, and no canonical catalogue value was changed.

**Phase 1 remains `BLOCKED_NO_EVIDENCE`.**
