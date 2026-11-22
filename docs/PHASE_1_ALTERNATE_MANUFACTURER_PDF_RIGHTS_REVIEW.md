# Phase 1 — Alternate Manufacturer PDF Rights Review

**Review date:** 2026-11-22  
**Branch:** `main`  
**Status:** DESK REVIEW ONLY — NO DOCUMENT DOWNLOADED OR PROCESSED; NO SOURCE CLEARED.

## 1. Purpose

The Boston Dynamics Spot 5.2 document remains unresolved: the official Product Safety index lists the manual, but the exact English PDF target has not been identified and the published Boston Dynamics Terms restrict automated access. This review checks already-registered official PDF candidates from other manufacturers to see whether one offers a clearer lawful route for the Phase 1 real-document pilot.

This review does not constitute legal advice, grant permission, or authorize acquisition, processing, quotation, hosting, display or redistribution.

## 2. Findings

### 2.1 Universal Robots — UR5e / UR20 manuals

Registered candidates:
- `ur5e-user-manual-sw5-26`
- `ur20-user-manual-sw5-26`

Official manual landing page:
https://www.universal-robots.com/manuals/EN/HTML/SW5_26/Content/Landingpages/Web/Usermanual.htm

Official permanent-URL page:
https://www.universal-robots.com/manuals/EN/HTML/MainLanding/Content/Landingpages/external_links.htm

The manufacturer provides versioned online manuals and PDF download links. The current manual index identifies PolyScope 5.26 and lists UR5e and UR20. The official permanent-URL page identifies stable PDF routes for these robot manuals. The indexed UR5e PDF bears the notice “© 2009-2026 by Universal Robots A/S. All rights reserved.”

**Disposition:** strong official-source and versioning candidate; rights for Roboscopia's proposed private evidence processing and public commercial factual reuse are not established by the download links or copyright notice. The located EULA concerns software and associated materials; it is not treated as a general license for public redistribution of manual content. Keep `rightsStatus: review_required`, acquisition `not_acquired`, and processing permission false until the applicable documentation terms or written permission are confirmed.

### 2.2 ABB — GoFa CRB 15000 datasheet

Registered candidate:
- `abb-gofa-crb15000-datasheet`

Official PDF URL:
https://library.e.abb.com/public/24de2251a42d4f9badda0232508ff242/9AKK107991A8564_en_F_GoFa%E2%84%A2%20CRB%2015000%20datasheet.pdf

ABB's current global website Terms of Use state that, unless otherwise stated, website content is ABB/licensor property and that other use — including reproducing, distributing, modifying or scraping — is prohibited without prior written permission. A separate ABB Robotics site terms page grants copying/distribution of documentation only for informational purposes within an organization, subject to retaining the copyright notice. That limited internal-use permission does not clearly cover a public, independently operated commercial reference platform.

**Disposition:** official document candidate, but the reviewed terms do not establish permission for Roboscopia's proposed use. Keep `rightsStatus: review_required`, acquisition `not_acquired`, and processing permission false. Obtain written permission or a document-specific license before processing or publishing extracted evidence under this pilot.

### 2.3 KUKA — KR 6 R700 sixx C Technical Data

Registered candidate:
- `kuka-kr6-r700-sixx-c-v4-1`

Official PDF URL:
https://www.kuka.com/-/media/kuka-downloads/imported/8350ff3ca11642998dbdc81dcc2ed44c/0000215571_en.pdf

The indexed official PDF identifies model KR 6 R700 sixx C and revision `V4.1 / 23.09.2022 / en`. It contains a technical-data table and model-specific qualifiers, including rated payload 3 kg and maximum payload up to 6 kg subject to load-case and center-distance conditions. It explicitly warns that the technical details are informational and do not constitute a guarantee.

KUKA's located contractual terms for documents and information supplied to customers state that KUKA retains copyright exploitation rights and that such documents are disclosed for evaluation purposes; third-party access requires prior written consent. Those terms are contract-specific and do not conclusively establish the terms applicable to this public PDF. No general public-document processing license was identified in this review.

**Disposition:** technically useful, revision-identifiable official PDF candidate; rights basis for Roboscopia remains unresolved. Keep `rightsStatus: review_required`, acquisition `not_acquired`, and processing permission false pending document-specific permission/terms confirmation.

## 3. Comparative decision

| Candidate | Official source / revision evidence | Rights position for Roboscopia | Pilot decision |
|---|---|---|---|
| Spot 5.2 IFU | Official Product Safety page lists 5.2; direct English PDF target unresolved | Boston Dynamics Terms restrict automated access; qualifying download and intended processing scope not yet confirmed | Blocked |
| UR5e / UR20 manuals | Official versioned manuals and permanent PDF routes | Download availability does not grant public reuse; copyright notice; scope of applicable documentation terms unresolved | Hold |
| ABB GoFa datasheet | Official ABB-hosted PDF | Global terms require prior written permission for other use; separate internal-use permission is not suitable for public platform reuse | Hold |
| KUKA KR 6 datasheet | Official PDF, revision V4.1 dated 23.09.2022 | Public PDF's applicable reuse/processing permission not established; customer-contract terms are restrictive | Hold |

## 4. Phase 1 decision

No candidate reviewed here is cleared for local evidence processing or public display/reuse. Do not infer permission from:
- an official manufacturer domain;
- a publicly accessible PDF URL or search-engine indexing;
- a download button or stable PDF route alone;
- a copyright notice that does not grant a license;
- terms applying to a different product, portal, customer contract or site.

The existing local processor remains appropriate only after a documented positive rights decision in the canonical registry. No document has been downloaded, no SHA-256 artifact has been created, no extracted candidates have been approved, and no catalogue record has been changed.

## 5. Next actions

1. For Spot 5.2, identify the exact English PDF manually through the official Product Safety page or obtain the file directly from an authorized Boston Dynamics representative. Do not automate access to the page.
2. Send a narrowly scoped written permission request to each manufacturer whose PDF is selected for the pilot. Ask separately about private local processing, retention of a private evidence copy/hash, extraction of factual values, public attribution of facts, short quotations, and public display/hosting of document content.
3. Prefer a manufacturer document with an explicit license that clearly covers the intended use. Record the exact license and its scope rather than relying on a general assumption.
4. Once one source is cleared, process only that locally supplied/authorized document through the existing processor, preserve the original outside the public repository, review the extraction and locators, and keep catalogue mutation disabled.

**Phase 1 remains IN PROGRESS.** This review narrows the rights decision but does not satisfy the real-document pilot gate.
