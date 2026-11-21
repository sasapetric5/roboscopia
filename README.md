# ROBOSCOPIA
### Global Robotics & CNC Intelligence Platform

- **What it is:** an independent, bilingual knowledge and intelligence platform for robotics and CNC technology.
- **What works today:** a 7-model catalog, provenance-aware data model, read-only audit, human review queue, source-verification, evidence-extraction and matching engines.
- **Data status:** 39 specification claims are source-linked but remain `source_linked_unverified`; linked sources have not been checked claim by claim.
- **What is planned:** verified technical records, rights-cleared media galleries, expanded intelligence and a marketplace.
- **Public demo:** [roboscopia.com](https://roboscopia.com) · [Cloudflare Pages preview](https://roboscopia-dpw.pages.dev/index.html).
- **Latest CI:** [ROBOSCOPIA Data Quality — run #196](https://github.com/sasapetric5/roboscopia/actions/runs/44947691979) — success on commit `4aa338071f00968fe4519ae292fdb0896e21567a`; see the workflow for current status.

[Engineering rules](docs/ENGINEERING_RULES.md) · [Demo deployment checklist](docs/DEMO_DEPLOY_CHECKLIST.md) · [Verification log](docs/VERIFICATION_LOG.md)

ROBOSCOPIA is being developed as a global robotics and CNC knowledge and intelligence platform. The current implementation is an initial, working repository foundation—not a finished marketplace or a fully verified technical encyclopedia.

## Vision

Build a reliable, visually rich and internationally accessible source of robotics and CNC information. The platform should help engineers, researchers, manufacturers, integrators, buyers and technology enthusiasts find useful information and make better-informed decisions.

The platform is intended to support:
- Robotics and CNC technology profiles with structured technical specifications.
- Manufacturer information, product generations, configurations and applications.
- Photographs, videos, manuals, datasheets and other relevant documentation, subject to rights and permissions.
- Technical comparisons based on clearly identified specifications and sources.
- New and used equipment listings, components, spare parts and accessories.
- Search and intelligence features that make complex technical information easier to explore.

## Manufacturer partnerships and future distribution

ROBOSCOPIA's long-term strategy includes becoming a trusted product-discovery and commercial referral channel for robotics and CNC manufacturers, authorized distributors and buyers. Manufacturer-controlled documentation is the preferred primary source for product facts. Technical independence must remain separate from commercial relationships: sponsorships and referrals are disclosed and must not influence factual specifications or objective comparisons. Any reseller, distributor or regional representation status requires a valid written agreement; no such status is implied today. See [Manufacturer Partnerships & Product Distribution Strategy](docs/MANUFACTURER_PARTNERSHIPS.md) for the staged plan and safeguards.

## Three connected pillars

1. **Knowledge Base** — structured profiles for manufacturers, robot and machine models, technical specifications, documentation and development history.
2. **Robotics Intelligence** — search, comparison, technical analysis and transparent data-confidence indicators.
3. **Marketplace** — a planned commercial layer for new and used robots, CNC machines, components, spare parts and accessories.

The knowledge base and the quality of its data are the foundation. Marketplace functionality will be introduced progressively and must not compromise editorial independence or technical accuracy.

## Planned architecture

The repository is expected to grow around these functional areas:

| Area | Responsibility |
|---|---|
| `website` | Public website, responsive experience and Serbian/English content |
| `data-engine` | Data discovery, collection, extraction, normalization, deduplication and verification |
| `database` | Structured records for manufacturers, models, specifications, sources and listings |
| `marketplace` | New and used equipment, parts, offers, sellers and commercial referrals |
| `intelligence` | Search, technical comparison and evidence-based analysis |
| `security` | Access control, secure integrations, validation and abuse protection |
| `docs` | Architecture decisions, research findings and technical documentation |
| `tests` | Automated and real-world verification of implemented functionality |

These are **planned architectural areas**, not a requirement to create or implement every module immediately. The structure and technology choices will be finalized after research, compatibility checks and cost review.

## Data quality and provenance

ROBOSCOPIA must distinguish verified facts from claims and unverified submissions.

Where applicable, each data point should retain:
- Its source and source URL or document reference.
- The date it was collected or last checked.
- Its verification status and confidence.
- Relevant model, generation and configuration context.
- Rights or permission information for media and documents.

Planned source-status labels:
- **Manufacturer Verified**
- **Source Verified**
- **Community Submitted**
- **Unverified**

AI-generated or extracted information must not be presented as verified fact without supporting evidence. Missing information must remain missing rather than being invented.

See [docs/ENGINEERING_RULES.md](docs/ENGINEERING_RULES.md) for the mandatory six-stage process and engineering/operating rules.

## International experience

The public platform is planned to support both **English and Serbian** from the beginning. The information architecture should be suitable for international audiences and large numbers of manufacturers, models, categories and technical records.

## Initial priorities

1. Establish the product requirements and architecture.
2. Conduct competitive research across relevant robotics and industrial-equipment platforms.
3. Discover and evaluate reusable open-source projects and data sources.
4. Design the data model and provenance/verification workflow.
5. Build and verify the first complete functional unit before expanding.

The first major technical focus is expected to be the **Data Engine**: dependable collection, document extraction, normalization, deduplication, source tracking and verification. Advanced AI features should build on reliable data rather than substitute for it.

## Current status

- [x] GitHub repository created.
- [x] Initial README created.
- [ ] Competitive intelligence research completed (initial candidate discovery started).
- [x] Preliminary open-source discovery across 10 robotics-related GitHub repositories; license and scope checks started. No third-party code or datasets imported.
- [ ] Full security, maintenance and compatibility evaluation of selected reusable components.
- [ ] Architecture and technology choices finalized.
- [x] Knowledge Base catalog: 7 model entries across 4 categories, bilingual interface, search, category filters, sorting and comparison of up to 3 models.
- [x] Structured model dataset added at `data/robots.json`, with model identity, variant notes, applications, strengths, limitations, specifications and source URLs.
- [x] Bilingual technical dossier page added at `robot-profile.html`; catalog cards link to individual model dossiers.
- [ ] Product photography, multi-angle galleries and video embeds pending image/video rights clearance and source review.
- [x] Initial Cloudflare R2 media integration prepared: public URL resolver and configuration are disabled by default; R2 bucket and public endpoint have not been created or enabled.
- [x] R2 media-storage policy documented: free-only, no paid add-ons, no DNS changes, rights metadata required before upload.
- [ ] Competitive comparisons, model histories and availability records pending equivalent-variant evidence and dated sources.
- [x] Original inline SVG illustrations added as temporary interface artwork; they are explicitly not represented as product photographs.
- [ ] Functional, accessibility and mobile-browser verification completed.
- [x] Cloudflare Pages project connected to `main`; automatic deployments are temporarily disabled by project owner request. Final production deployment is deferred until development and tests are complete.

---

# ROBOSCOPIA — srpski

### Globalna platforma za robotiku i CNC inteligenciju

ROBOSCOPIA je planirana kao međunarodna platforma za otkrivanje, razumevanje, poređenje i procenu robota, CNC mašina i srodnih industrijskih tehnologija.

## Tri povezana stuba

1. **Baza znanja** — strukturisani profili proizvođača, modela, generacija, tehničkih specifikacija i dokumentacije.
2. **Robotics Intelligence** — napredna pretraga, tehničko poređenje, analiza i transparentna procena pouzdanosti podataka.
3. **Marketplace** — postepeno uvođenje ponuda novih i polovnih robota, CNC mašina, rezervnih delova i pribora.

Kvalitetna i proverljiva baza podataka predstavlja temelj platforme. Marketplace se razvija postepeno i ne sme da utiče na objektivnost tehničkih informacija.

### Trenutna isporučena celina — Knowledge Base

- Početni katalog sadrži 7 profila: Boston Dynamics Spot, Unitree Go2, Unitree H1, Universal Robots UR5e, Universal Robots UR20-1750, ABB GoFa 5 i KUKA KR 6 R700 sixx C.
- Dostupni su pretraga, filteri po kategoriji, sortiranje, SR/EN promena jezika i poređenje do tri modela.
- Svaki profil vodi do izvora proizvođača. Prikazane vrednosti su odabrane specifikacije, a ne potpuna tehnička dokumentacija.
- Grafički prikazi su originalne SVG ilustracije interfejsa, ne fotografije stvarnih proizvoda.
- Katalog je početna verzija; funkcionalnost u mobilnom pregledaču i dostupnost na produkcionom domenu još zahtevaju praktičnu proveru.

## Data Engine — provenance and quality foundation

- Canonical data schema is `2.1.0`.
- A normalized `sources[]` registry assigns stable IDs to the 15 currently recorded source URLs.
- The 39 existing specification values now carry field-level provenance references and the explicit status `source_linked_unverified`; source URLs have not yet been independently checked against each exact claim.
- Media entries carry `permission_not_confirmed` unless reuse rights are documented.
- Quality statuses and conservative duplicate-handling rules are documented in [docs/DATA_ENGINE.md](docs/DATA_ENGINE.md).
- No scraping, automated crawling, database provisioning or media copying was activated.

- The Data Quality Review Queue at `scripts/data-quality-review-queue.mjs` turns audit findings into stable human-review items. Reviewer decisions are stored separately in `data/review-decisions.json` and recorded through a validating local command; the canonical robot catalog is never edited by the queue.
- Queue workflow and limitations: [docs/DATA_QUALITY_REVIEW_QUEUE.md](docs/DATA_QUALITY_REVIEW_QUEUE.md). Ten focused review-queue tests are committed and are included in the GitHub Actions command `node --test tests/*.test.mjs`. A local manual test run is not claimed.
- A read-only Data Quality Audit is implemented at `scripts/data-quality-audit.mjs`; it flags broken references, missing provenance, potential duplicate identities, conflicting values, stale verified claims, source-review gaps and media-rights gaps.
- Audit behavior and commands are documented in [docs/DATA_QUALITY_AUDIT.md](docs/DATA_QUALITY_AUDIT.md). Seven focused audit tests are included in the same automated Node.js test suite. Their latest pass status must be read from the corresponding workflow run, not inferred from the presence of the tests.


- Data Quality Review Queue u `scripts/data-quality-review-queue.mjs` pretvara nalaze audita u stabilne zadatke za ljudsku proveru. Odluke recenzenata čuvaju se odvojeno u `data/review-decisions.json`; red za proveru nikada sam ne menja kanonski katalog robota.
- Uputstvo i ograničenja: [docs/DATA_QUALITY_REVIEW_QUEUE.md](docs/DATA_QUALITY_REVIEW_QUEUE.md). Deset ciljanih testova uključeno je u GitHub Actions komandu `node --test tests/*.test.mjs`; lokalno ručno izvršavanje ne tvrdimo.

- [x] GitHub Actions workflow `.github/workflows/data-quality.yml` is configured to run the complete `tests/*.test.mjs` Node.js suite, the read-only data audit, review-queue generation, source verification and evidence reports on pushes to `main`. Previous run reference: [workflow run 44807571168](https://github.com/sasapetric5/roboscopia/actions/runs/44807571168). This run was checked: its automated-test, audit and review-queue steps completed with `success`. It predates the latest commits, so it does not certify the current HEAD.


## Source Verification Engine

The claim-level source verification engine is implemented at `scripts/source-verification-engine.mjs`. It maps each recorded specification to its source, generates stable claim IDs, checks HTTPS URL syntax and reports manufacturer-domain candidates without treating them as verified evidence.

- Reviewer decisions are validated and stored separately in `data/source-verification-decisions.json`.
- Record a review with `scripts/record-source-decision.mjs`; see [docs/SOURCE_VERIFICATION_ENGINE.md](docs/SOURCE_VERIFICATION_ENGINE.md).
- Open-source discovery and evaluation: [docs/OPEN_SOURCE_EVALUATION_SOURCE_VERIFICATION.md](docs/OPEN_SOURCE_EVALUATION_SOURCE_VERIFICATION.md).
- GitHub Actions runs tests and report generation. Live HTTP HEAD probes are opt-in only and are not part of CI.
- The engine does not fetch page bodies, scrape content, approve claims automatically or mutate the canonical robot catalog.


## Technical Evidence Extraction Engine

The initial evidence extractor is implemented at `scripts/technical-evidence-extraction-engine.mjs`. It extracts labelled engineering specification candidates from local PDF or UTF-8 text files and preserves document SHA-256, page/line locators, exact matched text, source URL metadata and model/configuration hints.

- PDF input uses a locally installed Poppler `pdftotext` executable; no PDF is downloaded from a source URL.
- Text input supports deterministic extraction tests and page breaks.
- Every candidate remains `extracted_unverified`; no automatic factual approval or catalog mutation occurs.
- Eleven focused tests cover the extraction logic; GitHub Actions is configured to run the full Node.js suite. The local-PDF/Poppler path is not yet exercised in CI.
- OCR, complex table parsing, live URL fetching and cloud document processing are not enabled.
- Usage and limits: [docs/TECHNICAL_EVIDENCE_EXTRACTION_ENGINE.md](docs/TECHNICAL_EVIDENCE_EXTRACTION_ENGINE.md).
- PDF/OCR open-source evaluation: [docs/OPEN_SOURCE_EVALUATION_EVIDENCE_EXTRACTION.md](docs/OPEN_SOURCE_EVALUATION_EVIDENCE_EXTRACTION.md).

## Evidence Matching & Review Engine

The deterministic, read-only matcher at `scripts/evidence-matching-review-engine.mjs` connects the Data Quality Audit, Source Verification Engine and Technical Evidence Extraction Engine. It compares extracted evidence candidates with the 39 catalog specification claims and reports value/unit, model, configuration and possible staleness mismatches. Each result preserves the exact evidence quote, document hash and page/line/section locator.

- Generate a local source report: `node scripts/source-verification-engine.mjs --json > data/source-verification-report.json`.
- Supply locally extracted, rights-cleared evidence JSON: `node scripts/evidence-matching-review-engine.mjs --evidence ./evidence/spot-manual.json --json`.
- Unit conversions are comparison-only; original catalog and evidence values are never rewritten.
- Ambiguous candidates remain visible. Missing evidence is reported. A match is not approval.
- Human review outcomes are separate metadata; catalog edits remain manual and require a fresh audit.
- CI runs the matcher without external evidence files to validate safe unmatched-claim behavior. It makes no network requests and performs no scraping.

Implementation and limitations: [docs/EVIDENCE_MATCHING_REVIEW_ENGINE.md](docs/EVIDENCE_MATCHING_REVIEW_ENGINE.md).

## Canonical catalog data model

- `data/robots.json` is the single source of truth for the current catalog and technical dossiers.
- Schema version `2.1.0` includes normalized manufacturer, product-family and model identity references, controlled categories, and configuration placeholders.
- The catalog loads model records from the JSON file and supports category and manufacturer filtering, search, sorting and comparison of up to three models.
- Technical dossiers load the same model records from the JSON file.
- Configuration placeholders are not verified technical profiles. Unitree Go2 AIR / PRO / X / EDU are identity/research entries only; their specifications have not been asserted.
- The data model and integrity rules are documented in [docs/DATA_MODEL.md](docs/DATA_MODEL.md).
- No live database, scraping pipeline, R2 bucket or Oracle resource has been activated.

## Planirane funkcionalne oblasti

- `website` — javni sajt i SR/EN iskustvo.
- `data-engine` — pronalaženje, prikupljanje, obrada i verifikacija podataka.
- `database` — proizvođači, modeli, specifikacije, izvori i ponude.
- `marketplace` — novi i polovni uređaji, mašine, delovi i prodavci.
- `intelligence` — pretraga, poređenje i tehnička analiza.
- `security` — zaštita, kontrola pristupa i bezbedne integracije.
- `docs` — arhitektura, odluke i tehnička dokumentacija.
- `tests` — provera implementiranih funkcionalnosti.

Ovo je planirana organizacija, a ne tvrdnja da su navedeni moduli već napravljeni.

## Obavezni šestofazni model razvoja

1. **Discover** — pronalaženje najmanje 10 relevantnih postojećih projekata kada obim zadatka to opravdava.
2. **Evaluate** — provera stvarnog koda, funkcionalnosti, aktivnosti, licence, zavisnosti, bezbednosti i kompatibilnosti.
3. **Reuse** — korišćenje proverenih postojećih komponenti umesto nepotrebnog razvoja od nule.
4. **Adapt** — prilagođavanje izabranih komponenti arhitekturi Roboscopije.
5. **Verify** — testiranje u realnim uslovima i provera bezbednosti.
6. **Deliver** — završetak, dokumentovanje i isporuka jedne funkcionalne celine pre prelaska na sledeću.

## Obavezna pravila

- Jedina redovna razvojna grana je `main`.
- Roboscopia ostaje infrastrukturno nezavisna od CEOAI-ja u početnoj fazi.
- Bez plaćenih servisa, API poziva ili infrastrukture bez izričitog odobrenja.
- Bez deployment-a, promena DNS-a ili produkcionih izmena bez izričitog odobrenja.
- Pouzdanost, bezbednost i integritet podataka imaju prednost nad brzinom.
- Ne integrišemo projekte samo na osnovu njihovog README opisa.
- Ne objavljujemo tuđe fotografije, video-snimke i dokumentaciju bez odgovarajućih prava ili dozvole.
- Ne izmišljamo specifikacije, cene, serijske brojeve, izvore ili podatke o dostupnosti.
- Komercijalni odnosi i affiliate veze moraju biti transparentni i ne smeju uticati na objektivna tehnička poređenja.

## Prvi prioriteti

Najpre se sprovode konkurentsko istraživanje i analiza postojećih open-source projekata. Zatim se definišu arhitektura, model podataka i postupak verifikacije. Prvi veliki tehnički fokus je Data Engine — pouzdano prikupljanje, ekstrakcija dokumentacije, normalizacija, deduplikacija, praćenje izvora i verifikacija podataka.

**Trenutni status:** GitHub repozitorijum je kreiran. Funkcionalnosti opisane u ovom dokumentu predstavljaju plan, a ne već isporuđene mogućnosti.
