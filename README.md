# ROBOSCOPIA
### Global Robotics & CNC Intelligence Platform

**Discover. Compare. Understand. Verify.**

ROBOSCOPIA is planned as a global platform for discovering, understanding, comparing and evaluating robots, CNC machines and related industrial technologies. Its long-term vision combines a trusted technical knowledge base, robotics intelligence and a commercial marketplace.

> **Project status:** Initial repository created. Product architecture and research are in the planning and evaluation stage. The planned capabilities below are not claims that those capabilities have already been implemented.

## Vision

Build a reliable, visually rich and internationally accessible source of robotics and CNC information. The platform should help engineers, researchers, manufacturers, integrators, buyers and technology enthusiasts find useful information and make better-informed decisions.

The platform is intended to support:
- Robotics and CNC technology profiles with structured technical specifications.
- Manufacturer information, product generations, configurations and applications.
- Photographs, videos, manuals, datasheets and other relevant documentation, subject to rights and permissions.
- Technical comparisons based on clearly identified specifications and sources.
- New and used equipment listings, components, spare parts and accessories.
- Search and intelligence features that make complex technical information easier to explore.

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

## Development methodology — mandatory six-stage process

Every substantial integration or functional component must follow all six stages:

1. **Discover** — identify at least 10 relevant existing projects or candidate components where the scope warrants it.
2. **Evaluate** — inspect actual code and verify functionality, maintenance activity, license, dependencies, security and compatibility.
3. **Reuse** — prefer suitable, verified existing components over unnecessary development from scratch.
4. **Adapt** — integrate and adapt selected components to ROBOSCOPIA's architecture and requirements.
5. **Verify** — test the integrated result, including relevant failure and security cases.
6. **Deliver** — document and complete one functional unit before moving to the next.

A README description alone is not sufficient evidence that a project is suitable. No component is accepted until its code, license and practical behavior have been reviewed.

## Engineering and operating rules

- Use **one primary branch: `main`**. Do not create additional development branches unless explicitly approved.
- Keep ROBOSCOPIA operationally independent from CEOAI during the initial development and validation period.
- Any future CEOAI integration must use a deliberately designed and secured API boundary.
- Prefer free and open-source infrastructure where it meets the requirements.
- Do not activate paid services, paid APIs, subscriptions or billable infrastructure without explicit approval.
- Do not deploy to production, change DNS or alter domain configuration without explicit approval.
- Reliability, security and data integrity take priority over speed and feature count.
- Review third-party licenses and dependency risks before reuse.
- Never commit API keys, passwords, tokens, private credentials or other secrets.
- Do not publish copyrighted photographs, videos, manuals or documents without an appropriate license or permission.
- Keep commercial relationships transparent. Affiliate or sponsored relationships must not influence technical facts or objective comparison results.

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
- [x] Cloudflare Pages deployment from `main` approved; domain setup previously confirmed by the project owner.

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
