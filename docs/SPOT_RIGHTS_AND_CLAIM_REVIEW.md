# Boston Dynamics Spot — Rights Gate and Claim Review

**Review date:** 2026-11-22  
**Branch:** `main`  
**Status:** RIGHTS RESTRICTION IDENTIFIED; NO HTML CAPTURE; CLAIMS SOURCE-REVIEWED BUT NOT APPROVED; NO CATALOG MUTATION.

## 1. Rights decision

Boston Dynamics' published Terms of Use apply to bostondynamics.com and associated sites linked by Boston Dynamics. They state that site content is protected by intellectual-property laws; copying, reproduction, republication, public display, distribution, mirroring or commercial use generally requires express prior written consent, subject to a limited exception for product/service information (such as datasheets and knowledge-base articles) that Boston Dynamics purposely makes available for download, provided proprietary notices are retained, the material is not modified and no additional representations or warranties are made.

The Terms also prohibit deep-linking, page-scraping, robots, spiders and other automated devices/programs/methodologies, as well as similar or equivalent manual processes, to access, acquire, copy or monitor site content or obtain material not purposely made available through the site.

Official terms: https://bostondynamics.com/terms/  
The Terms page lists legal@bostondynamics.com as the legal contact.

### Decision for Roboscopia

- **Automated fetching/scraping of Spot product, support or SDK HTML:** prohibited by the published Terms; do not implement or run it.
- **Using a page URL as a citation/link and manually describing facts:** keep the URL and attribute statements to the manufacturer; do not copy page text, tables, images or source files into Roboscopia.
- **Local processing of a saved HTML page:** blocked unless Boston Dynamics provides written permission covering the proposed processing, or confirms that the exact material is purposely made available for download and that the proposed processing falls within the stated exception.
- **Redistribution, public display, quotation, rehosting or commercial reuse of page content:** not approved; require express written permission or a separate applicable license.
- **SDK software/source code:** do not treat documentation permission as SDK software permission. The SDK software carries a separate license; do not copy SDK code into Roboscopia.
- **No permission inferred from public accessibility, official domain ownership, search indexing, or a successful browser request.**

This is a conservative product-policy assessment of the published terms, not a legal opinion. The canonical Source Registry now records automated processing as not permitted pending written permission. It deliberately does not mark any rights as cleared.

## 2. Lawful acquisition path

1. Ask Boston Dynamics for written permission for Roboscopia's narrowly described use of the three Spot technical sources.
2. Ask whether the support specification and SDK payload documentation are expressly downloadable for this purpose; request an approved PDF/export or a written permission for HTML capture if not.
3. Obtain explicit answers separately for: local processing/extraction; storage of a copy; retaining a SHA-256 digest and metadata; publishing short attributed factual values; quoting short excerpts; publicly displaying or hosting source material; redistribution of full documents; and use of images/diagrams.
4. Preserve the permission email/license and its scope, expiry, territory, attribution requirements and restrictions as a rights evidence record.
5. Only after approval, use the local-file acquisition CLI. It does not fetch URLs. It verifies the canonical source-to-document mapping and checks the Source Registry rights object before reading the local file.
6. Record the capture timestamp and method supplied by the reviewer, file name, byte size, MIME/signature, SHA-256, source URL, model/configuration, revision/date and extraction locators. The extractor's page/line/section locators are candidates and must be checked against the original source.
7. Keep original documents outside the public repository unless the permission explicitly allows hosting there. Never auto-approve a claim or mutate the catalogue from extraction output.

Until written permission or an applicable explicit download exception is confirmed, **do not save a copy of the HTML source or run the local processor on a Spot HTML capture**. The existing synthetic HTML test is only a software test; it is not a Spot source capture.

## 3. Spot claim-by-claim source assessment

The following is a source-level comparison of the previously reviewed official manufacturer statements. It is not an independent test and does not approve the six catalogue claims. The values remain `source_linked_unverified` in `data/robots.json`.

| Existing catalogue claim | Manufacturer source comparison | Review disposition |
|---|---|---|
| Mass with battery — 33.8 kg | Spot product page labels 33.8 kg as net mass/weight with battery. | Exact visible match to S1; manufacturer-declared candidate. Keep unverified until model-generation applicability and exact source locator are approved. |
| Maximum speed — 1.6 m/s | Product page gives 1.6 m/s. Support article gives nominal forward body velocity 5.8 kph (about 1.61 m/s). | Consistent after rounding. Preserve “nominal forward body velocity” when citing the support value. |
| Maximum payload — 14 kg | Product page says 14 kg payload capacity / Max Weight. SDK payload documentation says 14 kg total combined payload capacity including all payloads. Support article separately lists 20.43 kg as “Max recommended mass/weight” with center-of-mass, stability and performance caveats. | 14 kg has consistent manufacturer wording across S1 and S3. Do not relabel 20.43 kg as payload capacity; retain it as a distinct unresolved manufacturer statement. Exact Spot generation applicability of S3 still needs confirmation. |
| Battery capacity — 564 Wh | Product page gives 564 Wh. | Exact visible match to S1; manufacturer-declared candidate. |
| Typical runtime — 90 min | Product page says average runtime 90 minutes and qualifies it by payload/environment. Support article distinguishes approximately 90 minutes base from approximately 60 minutes while powering payloads. | Partially supported until the catalogue wording explicitly identifies average/base configuration and conditions. Never present as guaranteed loaded runtime. |
| Ingress protection — IP54 | Product page gives IP54. | Exact visible match to S1; manufacturer-declared candidate. Confirm model-generation applicability and source locator. |

### Additional source issues to preserve

- **Dimensions:** product-page rendering previously showed 110 mm alongside 43.3 in, an inconsistent pair. Support and SDK sources state 1100 mm (43.3 in). Do not copy 110 mm; a correction requires a recorded reviewer decision.
- **Recharge:** a generic 60-minute value must not be described as universal full-charge time. The support article distinguishes charger, ambient temperature and charge target.
- **Payload terminology:** preserve the exact label and conditions attached to 20.43 kg; do not merge it with 14 kg total combined payload capacity.
- **Variant applicability:** the support article says the table is based on current production hardware/software and older models may differ. The SDK source's applicability to the catalogued production Spot must be explicitly confirmed.

## 4. Registry and catalogue state

- `src-0001` — official Spot product page: rights gate recorded; automated processing not permitted pending written permission.
- `src-0002` — official Spot support article: same rights gate; no capture.
- `src-0018` — official Spot SDK payload documentation candidate: same rights gate; model-generation applicability pending.
- `spot-current-production-specs` and `spot-sdk-payload-configuration` remain `not_acquired`.
- Processing permission remains `false`; redistribution permission remains `unknown`; factual verification remains `not_performed`.
- Six existing Spot catalogue values and their `src-0001` mappings remain unchanged.
- No candidate extraction, source file, SHA-256 artifact or claim approval has been fabricated.

## 5. Permission request draft

Send to **legal@bostondynamics.com**. This draft is not sent by Roboscopia.

**Subject:** Permission request — limited use of Boston Dynamics Spot technical specifications in Roboscopia

Hello Boston Dynamics Legal Team,

We are developing Roboscopia, an independent, non-manufacturer robotics and CNC reference platform. We would like to accurately attribute a limited set of Spot technical facts to Boston Dynamics and maintain a reproducible evidence record for editorial quality control.

Could you please confirm whether Roboscopia may:

1. Access and locally process the Spot product specifications page, the Spot specifications support article, and the Spot SDK “Payload Configuration Requirements” documentation for extracting a small set of factual technical values;
2. retain a private source capture or manufacturer-provided document, together with its URL, retrieval date, file metadata and SHA-256 digest, solely for provenance and audit purposes;
3. publish the extracted factual values with clear attribution and links to the original Boston Dynamics pages;
4. quote short excerpts and identify section/table labels where needed to explain technical qualifiers and apparent discrepancies; and
5. display or host any portion of the source documents, tables, diagrams or images (we will not do so unless you expressly authorize it).

We will not reproduce full documents, scrape or crawl Boston Dynamics websites, redistribute SDK software/source code, imply manufacturer endorsement, or describe manufacturer-declared values as independently tested. We will preserve copyright notices and follow any attribution, scope, retention or other conditions you specify.

If any of these materials are expressly made available for download under your Terms of Use, please identify the permitted files and the applicable conditions. Written confirmation of the permitted activities and any limitations would be appreciated.

Thank you,
Roboscopia Project Team

## 6. Completion status

| Item | Status |
|---|---|
| Review published terms and identify access restrictions | **Completed** |
| Record rights restrictions in canonical registries | **Completed** |
| Design permission-gated local processing route | **Available; blocked until rights are approved** |
| Actual Spot HTML capture and SHA-256 | **Blocked — no permission/download basis established** |
| Source-level comparison of six existing Spot claims | **Completed as preliminary review** |
| Human approval of six claims | **Pending authorized reviewer** |
| Catalogue mutation | **None** |

**Spot pilot remains PARTIAL.** The next legal dependency is written permission or confirmation of a qualifying manufacturer-provided downloadable document. No automated access to Boston Dynamics pages is permitted under the reviewed Terms.

## 7. Official downloadable-material route review (22 November 2026)

A further public-source review identified a more promising route than the blocked live HTML pages. This review used indexed search results and official page references; it did not fetch or capture Boston Dynamics page HTML, download a document, or alter any registry or catalogue record.

### 7.1 Current Spot Product Safety page

- Official page: https://support.bostondynamics.com/s/spot/product-safety
- The page is titled **Spot Product Safety** and lists **Spot 5.2 Instructions for Use** for Spot, alongside current manuals for related equipment.
- The official *About the Spot Robot* article explicitly directs readers to the Spot Product Safety page to download instruction manuals and safety information: https://support.bostondynamics.com/s/article/about-the-spot-robot
- The official *Spot Safety and Operations Manuals* article describes Instructions for Use as foundational user documentation and directs readers to the Product Safety page: https://support.bostondynamics.com/s/article/spot-safety-and-operations-manuals
- The Product Safety page also lists 2026 Spot Robot EU Declaration of Conformity and declarations for related equipment.

**Assessment:** This is a credible manufacturer-provided download route under the narrow download exception described in the Terms. However, the exact English Spot 5.2 PDF URL, file revision metadata and document contents have not yet been independently captured or inspected. The presence of a document on the download page does not by itself resolve whether the proposed extraction, private retention, quotation and public factual reuse are all covered. Keep processing permission false until the exact file and applicable terms are reviewed; seek written clarification if the scope is not explicit.

### 7.2 Older official Spot specifications PDF — historical candidate only

An official-host PDF was found at:

https://www.bostondynamics.com/sites/default/files/inline-files/spot-specifications.pdf

The indexed PDF identifies itself as **SPOT Robot Specifications** and contains, among other values, base-robot net weight 32.5 kg, battery capacity 605 Wh, battery weight 4.2 kg and average runtime 90 minutes. These values differ from the current Spot product/support pages, which state 33.8 kg with battery and 564 Wh battery capacity; the support page describes current production hardware and warns that older models may differ.

**Disposition:** Do not use this PDF to verify current-production Spot claims. It is a historical/version-specific candidate only. Its exact issue date, model applicability and whether it is presently linked as a purposely offered download from the official site remain unconfirmed. Do not process it merely because its URL is publicly reachable or indexed.

A separate indexed 2025 **Spot 5.1 Instructions for Use** PDF was also found on Boston Dynamics' CloudFront delivery host. It is not the current 5.2 manual and must not be substituted for it:
https://d3cjkvgbik1jtv.cloudfront.net/translations/spot-5_1/spot-user-manual-en.pdf

### 7.3 Current product-page inconsistency remains open

The indexed current Spot product page displays **110 mm (43.3 in)** for length, while the official Spot Specifications support article displays **1100 mm** and the equivalent **43.3 in**. The 110 mm figure is internally inconsistent with its own imperial value and with the support article. Do not silently correct or publish a derived replacement; retain the discrepancy as an explicit source conflict pending an authorized claim decision.

- Product page: https://bostondynamics.com/products/spot/
- Support specifications: https://support.bostondynamics.com/s/article/spot-specifications

### 7.4 Next authorized review steps

1. Open the official Product Safety page and identify the exact English Spot 5.2 PDF download target and its displayed version/date.
2. Confirm that the file is explicitly offered for download by Boston Dynamics and record the page-to-file relationship.
3. Review the PDF's title page, applicable hardware part numbers/software version, revision, issue date and relevant technical sections.
4. Confirm whether the published Terms' download exception covers the proposed private processing/extraction, hash retention and publication of attributed factual values. Request written clarification where ambiguous.
5. Only after the rights reviewer records an explicit processing basis in the canonical Source Registry may an authorized reviewer provide the local PDF to the acquisition processor.
6. Keep redistribution of the original PDF, diagrams, photographs and other protected material separately blocked unless expressly permitted.

**Updated decision:** A plausible official download route has been identified, but no qualifying Spot 5.2 PDF has yet been acquired or rights-cleared for processing. No SHA-256 evidence package exists, no Spot claim has been approved, and no catalogue value has changed. The Spot pilot remains **PARTIAL**.

### 7.5 Additional official PDF evidence located (search review only)

Two further Boston Dynamics-hosted PDFs are now identified. Neither has been downloaded, captured, hashed or processed in this review.

**Spot 5.1 Instructions for Use (2025; historical manual, not the current 5.2 edition)**  
https://d3cjkvgbik1jtv.cloudfront.net/translations/spot-5_1/spot-user-manual-en.pdf

The indexed PDF identifies itself as *Spot Instructions for Use*, Version 5.1, © 2025 Boston Dynamics. Its specifications table reports 33.8 kg net mass with battery, 564 Wh battery capacity, approximately 90 minutes typical runtime, and other values matching the current support specification table. This is a stronger version-specific corroborating candidate than the much older specification sheet, but it is still not the current 5.2 IFU. The current Product Safety page lists 5.2; do not represent 5.1 as the latest manual.

**Historical Spot Robot Specifications sheet (2020)**  
https://www.bostondynamics.com/wp-content/uploads/2020/05/spot-spec-sheet.pdf

The indexed sheet reports base Spot net weight 32.5 kg, battery capacity 605 Wh, average runtime 90 minutes, recharge time 120 minutes, and payload max weight 14 kg. These are historical specifications and differ from current production values. It must remain a historical/version-specific reference and must not be used to support current Spot 5.2 claims.

A separate 2023 Enterprise Asset Management Kit PDF also includes Spot data, but several dimensions and weights refer to the robot with a specific payload configuration. Do not confuse those kit-specific measurements with the base robot:
https://bostondynamics.com/wp-content/uploads/2023/07/spot-enterprise-asset-management-kit.pdf

**Rights and acquisition boundary:** Boston Dynamics-hosted or CloudFront-hosted URLs and search indexing do not themselves prove that a particular PDF was purposely offered for download under the Terms or that private processing and publication of extracted facts are authorized. Before processing any PDF, confirm its exact download link from the official Product Safety/download page or obtain written permission, record the applicable terms and scope, and update the canonical rights record. No file has been downloaded in this review.

### 7.6 Confirmed current-source details from indexed official pages

The indexed current Spot Specifications support article identifies itself as covering hardware/software currently in production and says older models may differ. It states:
- Net mass/weight with battery: 33.8 kg
- Maximum nominal forward body speed: 5.8 kph
- Battery capacity: 564 Wh
- Typical runtime: approximately 90 minutes base; approximately 60 minutes when powering payloads
- Maximum recommended payload mass/weight: 20.43 kg, with center-of-mass, stability and performance caveats

The current Spot product page separately labels payload mounting maximum weight as 14 kg. The SDK documentation candidate describes 14 kg total combined payload capacity. Preserve these as distinct manufacturer statements with exact labels and context; do not collapse 14 kg and 20.43 kg into one field.

The current support article reports length 1100 mm, while the current product page's indexed text displays 110 mm alongside 43.3 in. This remains an apparent rendering/source inconsistency. The 1100 mm value is consistent with the 43.3 in conversion and support article, but no catalogue correction is made by this review.

**No change to the acquisition decision:** the 5.2 IFU download target has not been resolved to a direct PDF URL, no document has been acquired, no processing permission is recorded, and no catalogue claims have been approved.
