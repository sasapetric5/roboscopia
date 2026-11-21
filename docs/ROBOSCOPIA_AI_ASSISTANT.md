# ROBOSCOPIA AI — Robotics, CNC & Platform Assistant

## 1. Purpose and status

ROBOSCOPIA AI is the planned central conversational interface for the ROBOSCOPIA website. It will help engineers, integrators, researchers, manufacturers, sellers and buyers discover, understand, compare and evaluate robots, CNC machines, components, spare parts and technical documentation.

It must combine:
- specialist knowledge of robotics and CNC technologies;
- a strong understanding of the complete ROBOSCOPIA website, its catalogue, pages, data structures, documents and Marketplace;
- evidence-grounded retrieval from the site's own knowledge archive;
- general technical reasoning, clearly distinguished from verified product-specific facts;
- structured comparisons and, when evidence is sufficient, complete model/machine profile pages.

**This document defines a target architecture and requirements. It does not claim that the assistant, agents, retrieval system, knowledge graph, Marketplace integration or dynamic page generation are implemented.**

The current repository is an early foundation. Phase 1 remains blocked until its evidence, claim-verification, rights and review requirements are satisfied. A green CI run alone does not establish factual verification.

## 2. Product principles

1. **Knowledge before AI:** use structured, maintained and traceable data rather than model memory for product-specific facts.
2. **Evidence before recommendations:** technical facts and compatibility conclusions require applicable evidence for the exact model/configuration.
3. **One assistant, whole website:** users should not need to know which catalogue, document archive, comparison tool or Marketplace section contains the answer.
4. **Honest uncertainty:** missing, conflicting, outdated and unverified data must remain visible.
5. **Provider independence:** support replaceable AI models/providers behind a controlled server-side interface.
6. **Human control:** AI may research, extract, classify and propose; it must not silently approve evidence, change canonical facts, publish listings or make commercial commitments.
7. **Reuse first:** discover and evaluate suitable maintained open-source components before building equivalent functionality.
8. **Cost discipline:** prefer deterministic code and local processing for parsing, filtering, calculations and validation. No paid model, API, service or infrastructure without explicit owner approval.
9. **Security and privacy:** keep secrets server-side, enforce authorization and quotas, validate tools, and treat retrieved documents/listings as untrusted data.
10. **International by design:** Serbian and English initially, with extensible multilingual support.

## 3. Knowledge domains

### 3.1 Robotics
Industrial robots, cobots, mobile robots (AMRs/AGVs), humanoid, quadruped, service, medical, agricultural, logistics, inspection and research robots; robot arms, end effectors, grippers, controllers, teach pendants, safety systems and robot cells; kinematics, degrees of freedom, reach, payload, repeatability, speed, work envelope, mounting, environmental ratings, programming and communication protocols.

### 3.2 CNC and machine tools
CNC milling machines, lathes, turning/mill-turn centers, machining centers, routers, grinders, EDM, laser, plasma, waterjet and other CNC-controlled equipment; axes, travels, work envelope, spindle, tool changer, control system, accuracy, repeatability, feeds, speeds, workholding, tooling and metrology.

### 3.3 Components and spare parts
Servo motors/drives, stepper motors, encoders, reducers, gearboxes, brakes, bearings, spindles, ball screws, linear guides, couplings, tool holders, sensors, actuators, PLC modules, power supplies, safety relays, I/O modules, cables, connectors, robot-specific assemblies, CNC-specific parts and consumables.

### 3.4 Product identity
The assistant must distinguish manufacturer, product family, model, generation, configuration, variant, option package and individual used machine/robot. Similar names are not proof of identity or interchangeability.

### 3.5 ROBOSCOPIA website knowledge
The assistant must understand site navigation and features, catalogue records, model profiles, manufacturers, technical specifications and provenance, approved documentation, media rights, comparisons, component relationships, Marketplace listings and seller status, help pages and policies. It must not assume a feature exists merely because it appears in this roadmap.

## 4. Core user experiences

### 4.1 Ask — technical and website questions
Examples:
- "What is the difference between a collaborative robot and an industrial robot?"
- "What does repeatability mean in this robot's datasheet?"
- "Where can I find the manual for this CNC control?"
- "Show me everything ROBOSCOPIA currently has about this model."

Answers should include direct links to relevant ROBOSCOPIA pages and supporting sources where available.

### 4.2 Research — investigate and synthesize
The assistant should identify the exact model/generation/configuration, search approved catalogue records and documents, retrieve evidence and page/table locators, compare claims, identify conflicts and gaps, and summarize findings with citations and limitations. External research, where permitted and implemented, must preserve provenance and rights status; it must not silently import content into the canonical catalogue.

### 4.3 Compare — evidence-based comparison
Compare equivalent specifications and units, preserve source qualifiers and operating conditions, distinguish model-level from configuration-specific values, flag missing or incomparable fields, explain practical implications and link material values to sources. Never imply that missing values are equal.

### 4.4 Compatibility — parts and replacement candidates
Example questions:
- "Which used robot could replace this model with the same reach and payload?"
- "Which servo motor is suitable for this CNC control system?"
- "Can this gripper be mounted on this robot flange?"
- "Which replacement drive is compatible with this motor and controller?"

Collect constraints as relevant: exact manufacturer/model/generation/configuration; payload, reach, axes, repeatability, speed and mounting; controller/software version; motor ratings, feedback/encoder, brake, connector and drive; mechanical dimensions, shaft/interface and flange; voltage/current/power; communication protocol; safety requirements and application conditions.

Compatibility labels:
- **Verified compatible:** authoritative evidence supports the exact relevant models/configurations.
- **Manufacturer-listed alternative:** explicitly identified by the manufacturer as compatible or a replacement.
- **Potential candidate — engineering review required:** partial match; critical facts remain unverified.
- **Not compatible:** reliable evidence contradicts at least one mandatory requirement.
- **Insufficient data:** evidence cannot support a conclusion.

Similar payload, reach, voltage, connector shape or product name alone is not enough. Do not call something a drop-in replacement without checking mechanical, electrical, control, firmware, safety and application constraints as applicable. Safety-critical decisions require qualified engineering review.

### 4.5 Explore — complete model or machine page
When asked for everything available about a robot or CNC machine, the assistant should open the canonical profile or assemble a complete page view from approved structured data.

A profile may include:
- manufacturer, family, model, generation and configurations;
- overview, applications and development history;
- technical specifications with units, qualifiers and verification status;
- dimensions, diagrams and work-envelope information where rights permit;
- controller, software, programming and communication information;
- components, accessories, spare parts and verified compatibility relationships;
- manuals, datasheets and document page/section locators;
- licensed or permission-cleared photos and videos;
- related models, alternatives and comparisons;
- new and used Marketplace offers, when available;
- sources, evidence status, review dates and known limitations.

Only fields that exist and are permitted may be displayed. Never fill gaps with invented values. An incomplete record should show available sections and identify missing or unverified information. Generated presentation must not automatically mutate the canonical catalogue.

### 4.6 Marketplace discovery
When Marketplace is implemented, connect technical discovery to new, used and refurbished robots/CNC machines, parts, components, accessories and tooling. Support filters by model, manufacturer, condition, location, price, availability and seller; compare listing claims with technical requirements; expose seller/listing verification status; and later support RFQ and approved transaction flows.

Seller-submitted claims remain separate from canonical manufacturer specifications and do not become verified facts automatically.

## 5. Target architecture

This is a logical design, not a declaration of deployed services.

### 5.1 User interface
A central, responsive assistant available throughout the site, with conversation context, page-aware prompts, citations, comparison tables, links to profiles/listings, full-profile rendering, Serbian/English support and accessible mobile/desktop behavior.

### 5.2 Supervisor and task router
A supervisor identifies the user's intent and selects the smallest suitable workflow. Request types include general explanation, site navigation, catalogue lookup, document question, model identification, comparison, compatibility, replacement search, profile exploration and Marketplace search. Do not invoke every specialist for every question.

### 5.3 Specialist capabilities

| Capability | Responsibility |
|---|---|
| Site Knowledge | Site pages, navigation and feature availability |
| Catalogue Research | Exact manufacturer/model/family/configuration lookup |
| Document Research | Approved document passages, tables, figures and locators |
| Model Identity | Aliases, generations and variant resolution |
| Technical Analysis | Robotics and CNC specification interpretation |
| Comparison | Unit normalization and like-for-like comparison |
| Compatibility | Mechanical, electrical, control and application constraints |
| Evidence Verification | Claim-to-source applicability and review status |
| Conflict Analysis | Preserve and explain disagreements between sources |
| Profile Composer | Assemble pages from approved canonical records |
| Marketplace Search | Search listings, parts and sellers when available |

These may begin as tools/workflows rather than independent autonomous agents. Avoid unnecessary agent proliferation.

### 5.4 Retrieval and knowledge layer
Use a hybrid design:
- structured queries for exact fields, identifiers, filters and relationships;
- lexical/full-text search for exact model codes, part numbers and terminology;
- vector retrieval for semantic questions over approved documents;
- relational or graph relationships for manufacturer/model/part/compatibility links;
- deterministic calculations and validators for units, thresholds and comparisons.

The structured catalogue remains the source of truth for canonical identities and approved records. Vector search is a retrieval aid, not an authority system.

### 5.5 Document processing
Support PDF text/table extraction, OCR where necessary, section/page/table/figure locators, source hashes and revision metadata, extraction confidence and rights status. Under current policy, process only lawfully obtained documents supplied by the user or acquired through an explicitly authorized workflow. No unapproved scraping, automated crawling or bulk downloading. Public accessibility does not imply redistribution permission.

### 5.6 Model/provider gateway
Call models through a server-side provider abstraction. Route deterministic parsing, validation, filtering and calculations to code/local tools; simple classification to efficient models; complex technical reasoning to stronger models; and high-impact claims through independent verification. Configure budgets, quotas, fallback and logging. Never expose API keys in browser code or public repository files. No paid provider or billable service without explicit approval.

### 5.7 Security, governance and audit
Require authentication/authorization for protected actions, rate limits, strict tool schemas, server-side validation, audit trails, data minimization and retention controls. Treat documents, webpages, listings and uploads as untrusted data, never as system instructions. No arbitrary code execution or unrestricted network access. Require human approval for canonical data changes, publishing, seller verification, commercial actions and sensitive operations. Separate public content from private seller/customer data.

## 6. Evidence and response policy

Every answer must distinguish:
1. **Verified ROBOSCOPIA data** — exact claim reviewed against applicable evidence.
2. **Source-linked, not verified** — source attached, exact claim not yet checked.
3. **Secondary-source information** — distributor, publication or other non-manufacturer source.
4. **General technical explanation** — domain knowledge, not a verified claim about a specific product.
5. **Inference/candidate** — reasoned possibility requiring confirmation.
6. **Unknown/conflicting** — evidence missing, ambiguous, outdated or contradictory.

For product-specific facts retain exact model/configuration, value and original unit, qualifiers/conditions, source ID and URL, page/table/section locator where available, verification status and review date. Do not merge specifications across variants/generations or silently resolve conflicts. Explain semantic differences where possible and leave unresolved conflicts visible.

Cite material claims and link to relevant ROBOSCOPIA profiles/documents. A source URL alone does not make a claim verified.

## 7. Full-page generation contract

The Profile Composer accepts a canonical entity ID and authorized fields, then renders the standard website profile template.

Requirements:
- use canonical IDs; never rely on fuzzy name matching alone;
- load only approved records and linked evidence;
- preserve verification and rights labels;
- omit absent fields rather than guessing;
- distinguish model facts from individual Marketplace listing claims;
- display media only when rights permit;
- show a source/evidence section;
- create stable URLs only through approved routing;
- never write generated content back to canonical records without human review.

If multiple entities match, ask one focused clarification rather than selecting arbitrarily.

## 8. Quality and evaluation

Create a versioned evaluation set from real, rights-cleared documents and representative questions. Include robotics, CNC, controls, components, site navigation and Marketplace tasks.

Measure:
- exact entity/model/configuration identification;
- retrieval recall for relevant records and passages;
- citation correctness and source applicability;
- technical correctness reviewed by qualified people;
- unit normalization and comparison correctness;
- compatibility false-positive rate, especially safety-critical cases;
- abstention quality when evidence is insufficient;
- profile completeness and fabricated-field rate;
- latency, model/API cost and recovery behavior;
- Serbian/English quality;
- prompt-injection resistance, authorization and data isolation.

Test similar model names, aliases, generations, conflicting documents, missing/outdated evidence, ambiguous part numbers, superficially similar incompatible components, seller claims that conflict with manufacturer data, unavailable features and attempts to obtain secrets or trigger unauthorized actions. Do not rely on one aggregate score; high-risk compatibility and verification criteria need explicit thresholds and human review.

## 9. Staged development roadmap

Testing, security and quality work run continuously through every stage.

1. **Knowledge structure and archive** — stable identities, specifications, provenance, document metadata, rights and relationships.
2. **Intelligent technical search** — exact model/variant resolution, filters, lexical/semantic retrieval and unit-aware search.
3. **First Roboscopia AI Chat** — safe, cited answers grounded in the site archive with clear uncertainty.
4. **Specialist capabilities/agents** — comparison, compatibility, document research, identity resolution and verification.
5. **Complete profile generation** — render full robot/CNC pages from approved records.
6. **Marketplace integration** — connect technical knowledge to listings, parts, sellers and RFQ workflows.
7. **Real-world validation** — test actual technical documents and representative industrial-user tasks with expert review and security evaluation.

Release gates:
- Do not treat a chatbot as a substitute for a trustworthy data foundation.
- Do not release definitive compatibility recommendations before exact-configuration evidence and engineering review workflows exist.
- Do not generate profiles by filling missing data with model guesses.
- Do not create, edit, publish listings or transact without authorization and explicit user confirmation.
- Phase 1 evidence acceptance remains a separate prerequisite for claiming the initial catalogue is verified.

## 10. Reuse-first implementation method

For each substantial component:
1. Discover at least 10 relevant candidates where scope warrants it.
2. Evaluate actual functionality, maintenance, license, dependencies, security and compatibility.
3. Reuse suitable components rather than rebuilding equivalent systems.
4. Adapt them to ROBOSCOPIA's data model and security requirements.
5. Verify with focused, integration and failure tests.
6. Deliver documentation, provenance and reproducible implementation.

A marketing page or README is not proof of suitability. Review code, license and behavior. Do not import code, datasets, documents or media before rights and license review.

## 11. Operational constraints

- Work on the existing main branch; do not create additional branches without explicit approval.
- Keep ROBOSCOPIA independent from CEOAI during initial development. Any future integration requires a deliberate, secured API boundary.
- No production deployment, DNS change, paid service, paid API or billable infrastructure without explicit approval.
- Never commit secrets or credentials.
- No unapproved scraping, automated crawling or bulk downloading.
- Do not publish copyrighted media/documents without documented permission or a compatible license.
- Do not automatically modify canonical catalogue facts.
- Preserve auditability and backward compatibility when changing schemas.

## 12. Definition of done — first public assistant release

The first public release requires:
- reliable resolution of supported catalogue entities;
- answers grounded in approved site data with supporting citations;
- clear distinction between verified, unverified, conflicting and general knowledge;
- abstention instead of guessing missing model/configuration details;
- Serbian and English search;
- navigation to relevant existing profile pages;
- tested authentication, quotas, tool permissions and secret handling;
- passing prompt-injection and data-isolation tests;
- documented evaluation results;
- understood and explicitly approved operating costs and provider behavior.

Advanced compatibility, complete profile composition and Marketplace actions may ship later behind separate capability gates.

---

**Document status:** Architecture and product requirements proposal.  
**Implementation status:** Not implemented by this document.  
**Catalogue/evidence status:** Phase 1 remains subject to its separate acceptance criteria.
