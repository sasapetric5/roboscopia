# ROBOSCOPIA — Standard for Technical Data Sources and Acceptance

**Status:** Project-wide Phase 1 policy  
**Applies to:** Robot, CNC machine, industrial equipment and component records  
**Purpose:** Establish which sources may support which kinds of claims, how evidence is accepted, and what is displayed publicly.

## 1. Fundamental rule

Roboscopia will not ingest everything it finds online. It will select relevant sources according to the type of claim, the issuer's competence and authority for that claim, the exact product/configuration, the evidence locator, currency and rights.

Every published technical value must have traceable provenance. Independent laboratory verification is **not** required for every value declared by a manufacturer. A manufacturer's exact official specification can be published as a manufacturer declaration once its origin, applicability and supporting passage are established. It must never be labelled as an independent test result.

There is no single universal source hierarchy for every question. The manufacturer is authoritative for what it declares; an appropriately accredited laboratory is authoritative for the test it performed; a certification body is authoritative for the certificate and scope it issued.

## 2. Source classes and intended authority

### 2.1 Manufacturer — `manufacturer_primary`
**Primary source for manufacturer-declared product facts.**

Accepted material includes official product pages, technical datasheets, manuals, configuration guides, technical bulletins, declarations, safety notices and revision-controlled documentation.

May support:
- official model, generation, variant and configuration identity;
- manufacturer-declared payload, reach, speed, repeatability, dimensions, mass, power, capacity and ratings;
- options, compatibility, environmental limits and intended use;
- official revisions, manuals, service notices and declared conformity information.

Acceptance requirements:
- source is controlled or issued by the manufacturer, not merely hosted on a lookalike or unrelated domain;
- exact model, generation, variant and relevant configuration are identified;
- document/page title, revision/date where available, retrieval/capture date and exact page/section/table/row are recorded;
- original value, unit, qualifiers, footnotes and configuration are preserved;
- public wording attributes the value as **“According to official manufacturer documentation.”**

This establishes what the manufacturer declares. It does not assert independent testing, guarantee performance in every installation, or establish that a particular used machine remains in that condition.

### 2.2 Accredited testing or calibration laboratory — `accredited_testing_laboratory`
**Preferred source for independent measured test or calibration results.**

For testing and calibration laboratories, check ISO/IEC 17025 accreditation (or applicable national adoption) in the official accreditation-body register. Verify:
- the accreditation was valid at the relevant test date;
- the exact method, parameter, range and activity are within the laboratory's published scope;
- the report identifies the sample/product, model/configuration and serial number where applicable;
- method/standard, conditions, date, results, uncertainty where relevant and report ID are captured;
- the report explicitly identifies which results are accredited and any exclusions.

Accreditation is scope-specific. An accredited laboratory may perform activities outside its accredited scope. Such results must not be labelled accredited. A non-accredited laboratory report may still be informative if accurately attributed and its limitations disclosed.

### 2.3 Product certification body — `product_certification_body`
**Authority for a formal product certification decision within the certificate's scope.**

Where accreditation is applicable, verify the body's ISO/IEC 17065 accreditation (or applicable national adoption), relevant scheme and scope. Record certificate number, issuer, status/validity, product/model/family, manufacturer, standard/regulation, scope, exclusions and official register entry.

A certificate supports only the conformity/certification statement it actually covers. It does not prove unrelated performance values such as speed, payload or accuracy unless those were explicitly evaluated within its scope.

Some legal regimes use designated or notified bodies. Record the legal designation and applicable scope separately; do not automatically describe every such body as an accredited laboratory.

### 2.4 Inspection body — `inspection_body`
Use inspection reports for a particular machine, installation or condition when the inspection activity is within the body's competence and, where claimed, accreditation scope (commonly ISO/IEC 17020). Record inspected object/serial number, criteria, date, findings, limitations and scope. An inspection is not the same as a laboratory test or product certification.

### 2.5 Research and technology institute — `research_institute`
Use original technical reports, instrumented experiments, benchmark studies and applied research where methods and data are disclosed.

Check the institute and responsible authors, funding/conflicts, sample/model/configuration, sample size, methods, instruments/calibration, environmental conditions, repeatability, uncertainty, limitations and underlying data where available.

An institute's name alone does not confer accreditation. If a particular institute laboratory holds relevant accreditation, verify its exact scope and classify that specific test as an accredited-laboratory result. Otherwise, label it as research-institute evidence.

### 2.6 University and peer-reviewed research — `university_research` / `peer_reviewed_research`
Use original papers, theses and university reports for research findings, scientific context, comparisons and prototype performance. Evaluate authors, publication venue, peer-review status, method, data, funding and limitations. Peer review is a quality signal, not a guarantee of correctness or applicability to every commercial configuration.

### 2.7 Authorized distributor or service partner — `authorized_distributor`
Use for regional availability, price, local configuration, installation, warranty handling, service, maintenance and spare-parts information. Verify authorization where it is material. Keep these statements attributed to the distributor/service provider and separate from manufacturer-declared specifications.

### 2.8 Specialist technical publication — `technical_secondary`
Use reputable industrial publications and specialist databases for discovery, context and corroboration. They should not silently replace an available primary source for canonical manufacturer specifications.

### 2.9 User or operator observation — `community_observation`
Use for clearly attributed real-world experience, practical observations and reported issues. Preserve date, operating context and model/configuration where possible. Never merge user observations into manufacturer-declared specifications.

### 2.10 Unknown or unclassified — `unknown`
May be retained for investigation, but cannot support a published technical value until the issuer and relevance are established.

## 3. Accreditation is not certification

These terms must not be confused:

- **Accreditation** recognizes a conformity-assessment body's competence for defined activities and scope.
- **ISO/IEC 17025** is the principal competence standard for testing and calibration laboratories.
- **ISO/IEC 17065** applies to bodies certifying products, processes and services.
- **ISO/IEC 17020** applies to inspection bodies.
- **ISO 9001** is a quality-management-system standard; by itself it does not prove competence to conduct a specific robot or CNC performance test.
- ISO does not test or certify products, accredit laboratories, or issue product certificates.

Where applicable, verify recognition arrangements (for example ILAC MRA for relevant laboratory testing/calibration and inspection scopes). A logo or membership statement is not enough: check the current official register and detailed scope.

For Serbia, use the Accreditation Body of Serbia (ATS) official directory/register. Check the actual body, accreditation number, current status, validity and scope. Do not infer accreditation from a company's marketing page.

## 4. Match the source to the claim

| Claim being made | Preferred evidence |
|---|---|
| Manufacturer-declared payload, reach, speed, dimensions, mass, repeatability | Exact official manufacturer page/document for the applicable model/configuration |
| Independently measured accuracy, speed, noise, energy use, endurance or payload | Relevant test report; accredited scope preferred and explicitly checked |
| Product conformity or safety certification | Valid certificate/declaration from the competent body, with exact scope and applicable legal basis |
| Condition of an individual used machine | Recent inspection report tied to that machine/serial number; seller disclosure separately labelled |
| Research prototype or experimental comparison | Original institute/university report or peer-reviewed paper |
| Firmware/software support and compatibility | Manufacturer release notes/manual; test evidence if claiming independently tested compatibility |
| Regional price, stock, service or warranty | Authorized distributor or seller, with territory and date |
| Field reliability or operator experience | Attributed user/operator reports with context |

Do not demand an independent laboratory report merely to state what the manufacturer officially declares. Conversely, do not use a manufacturer's marketing page as proof of an independently measured result.

## 5. Source acceptance checklist

For each source, record as applicable:

1. **Issuer identity:** legal/official name, official URL, canonical URL and source class.
2. **Authority for this claim:** why this issuer is competent for this particular claim.
3. **Authenticity:** official publication, controlled manufacturer host, signed report, DOI, certificate/report number or official register record.
4. **Product applicability:** manufacturer, exact model, generation, variant, configuration, software/hardware revision, sample/serial where relevant.
5. **Locator:** exact PDF page, section, table, row, figure or stable HTML locator.
6. **Method and conditions:** test standard, environment, load, boundary conditions, assumptions and uncertainty where relevant.
7. **Currency:** publication/revision/test date, expiry/current status, superseded status and retrieval date.
8. **Integrity:** source capture or file hash where a file/capture is retained.
9. **Rights:** lawful basis to access/process separately from permission to republish, display or redistribute.
10. **Conflict handling:** applicable revisions and conflicting sources are retained and compared.
11. **Decision record:** review status, reviewer, date, rationale and any limitation.

A domain name, institutional logo, search-result snippet or file title alone is not sufficient evidence.

## 6. Selective acquisition policy

The acquisition workflow is deliberately selective:

1. Identify the canonical manufacturer, model and exact fields needed.
2. Search the official manufacturer product page and current datasheet/manual first.
3. Add manuals, declarations, safety notices and revision notes only when they add relevant evidence.
4. Consult laboratory/certification registers when an independent test or conformity statement is relevant.
5. Consult institutes, universities and research papers for independent studies, comparisons or unresolved gaps.
6. Use distributors for regional/commercial facts and specialist publications for context.
7. Reject or defer irrelevant, duplicate, stale, ambiguous, unverifiable or rights-incompatible material.

Do not crawl entire domains or bulk-download every PDF. A single suitable manufacturer document can support many specification claims. Review the document once at source level, then map each supported claim to its exact passage. This avoids repeating the same source review for every value.

## 7. Separate quality dimensions

Do not compress quality into a single generic “verified” status. Track separately:

- `sourceAuthority`: source class and competence for the claim;
- `sourceAuthenticity`: whether origin/issuer has been checked;
- `claimSupport`: whether the exact passage supports the exact value;
- `independentTestStatus`: whether a separate test exists and its status;
- `accreditationStatus`: status of the relevant body at the relevant date;
- `accreditationScopeMatch`: whether the activity/result is within the verified scope;
- `extractionConfidence`: OCR/parser confidence and extraction quality;
- `reviewStatus`: pending, accepted, rejected, conflicting, outdated or not-applicable;
- `rightsStatus`: processing and redistribution/display permission.

Suggested public labels:
- “According to official manufacturer documentation”
- “Tested by an accredited laboratory” — only when the report and exact scope have been checked
- “Certified by [body]” — only for the precise valid certificate scope
- “Reported by a research institute”
- “According to peer-reviewed research”
- “Distributor-provided information”
- “User-reported observation”

Never display a bare “verified” badge without stating what was verified.

## 8. Conflicts, variants and uncertainty

- Preserve original values, units, qualifiers and footnotes.
- Never average conflicting sources or silently choose a value.
- Check whether different values reflect model generation, optional equipment, regional variant, software revision, test conditions or document revision.
- A newer manufacturer document may supersede an older one for current declarations, but retain revision history where relevant.
- A test on one sample does not automatically describe every unit of a model.
- A test outside the laboratory's accredited scope must not be labelled accredited.
- If exact applicability or source support is unclear, mark the claim pending/quarantined or omit it from public display.
- Never fill gaps with guessed values.

## 9. Efficient review model

Review should be performed in **source/document batches**, not as 39 isolated investigations:

1. Verify the source issuer and document once.
2. Capture revision/date and source metadata once.
3. Extract all relevant candidate values from that source.
4. Map each candidate to the exact model/configuration and page/table/row.
5. Automatically flag missing locators, unit ambiguity, model mismatch, OCR uncertainty, conflicting values and stale revisions.
6. Human-review the source mapping and exceptions; perform risk-based sample checks of straightforward extractions.
7. Accept only claims whose source passage and model/configuration mapping are supported. Keep all others pending.

Automated extraction is a candidate-generation step, never an automatic approval. This policy reduces repeated work without lowering the standard for published facts.

## 10. Initial work sequence for Phase 1

Do not expand the catalogue yet.

1. Reclassify the existing 15 source URLs under this standard.
2. Map the 39 current technical claims to claim types and appropriate source classes.
3. Identify duplicate, historical, stale, variant-mismatched and irrelevant sources.
4. Review the seven evidence-document records; retain only documents that add relevant support.
5. Select a small pilot set of real manufacturer pages/documents that can lawfully be processed.
6. Demonstrate source capture, precise locators, extraction, variant matching, exception handling and human review.
7. Measure extraction quality and processing time on the pilot before scaling.
8. Expand to the remaining initial claims only after the pilot demonstrates reliable results.

Phase 1 is not complete merely because CI is green. It is complete when the source and claim pipeline is demonstrably reliable, rights-aware, traceable and scalable.

## 11. Official reference registers

- ISO — certification and conformity assessment overview: https://www.iso.org/certification.html
- Accreditation Body of Serbia (ATS) — accredited organizations: https://www.ats.rs/sr-lat/akreditovane-organizacije
- ATS public register: https://register.ats.rs/apex/ats/r/registar/home
- ILAC — MRA signatories and recognition: https://ilac.org/ilac-mra-and-signatories/
- ILAC — accredited conformity assessment bodies: https://ilac.org/ilac-mra-and-signatories/accredited-conformity-assessment-bodies/

These are framework/reference links. The decisive evidence for an individual laboratory or certification body is its current official register entry, certificate and detailed scope.
