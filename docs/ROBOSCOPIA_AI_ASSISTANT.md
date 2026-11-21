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
10. **Language independence:** automatically detect and respond in the user's language, without a fixed supported-language list, subject to the selected model's actual capabilities.

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
A central, responsive assistant available throughout the site, with conversation context, page-aware prompts, citations, comparison tables, links to profiles/listings, full-profile rendering, automatic multilingual interaction and accessible mobile/desktop behavior.

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

### 5.8 Automatic multilingual behavior

The assistant must automatically detect the language of each user message and normally respond in that same language. This is a core product requirement, not an optional translation feature, and must not be limited to Serbian and English or to a hard-coded list of languages.

Requirements:
- detect the language from the current message and conversational context; do not require a manual language selector;
- allow the user to switch languages naturally at any point in an ongoing conversation;
- retrieve from the same shared knowledge archive regardless of the language used in the question;
- support cross-language retrieval, such as a question in Serbian answered using an English manufacturer datasheet;
- preserve manufacturer names, model identifiers, part numbers, standards, protocol names, units and other technical identifiers exactly where translation would damage meaning;
- answer in the user's language while retaining original document titles, source quotations and citations as appropriate;
- translate explanations and summaries, not canonical source records or technical values;
- when language detection is uncertain, ask a concise clarification or use the strongest contextual signal rather than silently assuming;
- be transparent when a selected model/provider has limited capability in a particular language.

The language capability must be provider-independent. Do not make Gemini, or any single model provider, a mandatory dependency. Evaluate language detection, technical terminology and cross-language retrieval across representative languages and scripts. Do not claim support for every language until it has been tested; the requirement is an extensible, automatically adapting design rather than a fixed Serbian/English restriction.

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
- language detection accuracy and answer quality across a broad, changing set of user languages;
- cross-language retrieval quality when the question and source documents use different languages;
- preservation of technical names, model codes, part numbers, units and source quotations across languages;
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
- automatic language detection and responses in the user's language, evaluated across a broad multilingual test set;
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

## 13. Reliability, recovery and optional OpenAI API integration

This section defines required behavior for a future implementation. It does not enable an API provider, create credentials, or claim that the controls are already deployed.

### 13.1 No dependency on a single API key

- OpenAI may be configured as one optional model provider through the server-side provider gateway.
- ROBOSCOPIA must not depend on an OpenAI key, or any other single provider, for deterministic tasks such as file hashing, PDF text extraction, OCR orchestration, schema validation, unit conversion, evidence matching, audit generation and checkpoint storage.
- A ChatGPT subscription or ChatGPT login must not be represented as including API credits. API access and billing are separate and must be configured by the site owner.
- No OpenAI credential is supplied by the ChatGPT assistant. The owner must create and control any API project/key used by the website.
- The key must be stored only in the hosting platform's server-side secret store. It must never appear in frontend bundles, browser requests, public repository files, client-visible errors or logs.
- Provider activation is an explicit owner-controlled setting. The default state is disabled until the owner approves the provider and its budget.

### 13.2 Task execution as recoverable jobs

Every substantial research or document-processing task should have a durable job record with:
- a unique job ID and idempotency key;
- task type, requested scope and initiating user/authorization context;
- explicit workflow version and input references;
- status (queued, running, waiting for input, retrying, completed, failed, or cancelled);
- current step, completed steps and durable checkpoint references;
- bounded attempt count, next retry time and absolute deadline;
- provider/model identifiers where AI was used, plus token/cost metadata when available;
- structured errors and a concise user-facing outcome;
- timestamps and an append-only audit trail.

A browser refresh, worker restart, provider timeout or temporary network failure must not silently erase completed work. Resume from the last validated checkpoint, not from an assumed state.

### 13.3 Failure handling and fallback order

For each step, classify failures before retrying:
- transient: timeout, rate limit, temporary provider/network error;
- permanent: invalid input, unsupported file, authorization denial or malformed request;
- policy/rights: missing permission or prohibited operation;
- quality: low extraction confidence, ambiguous model identity, unsupported claim or conflicting evidence.

Use bounded exponential backoff with jitter only for retryable failures. Respect provider Retry-After instructions. Apply per-step deadlines and a maximum retry count. Do not retry permanent or policy failures automatically.

Fallback must preserve the task's safety and evidence requirements:
1. use deterministic/local processing where it can complete the same step;
2. use an explicitly enabled alternate provider only if the task's data policy permits it;
3. save the checkpoint and pause for user/reviewer input when no safe fallback exists;
4. return a clear partial result and exact failed step rather than claiming full success.

A fallback provider must never be activated merely because another provider failed if it would introduce unapproved cost, data transfer or a different privacy boundary.

### 13.4 Idempotency, concurrency and recovery

- Assign idempotency keys to external side effects and persist their outcomes before acknowledging completion.
- Use leases with expiry and fencing/version tokens for concurrent workers; stale workers must not overwrite newer checkpoints.
- Make checkpoint writes conditional on the expected workflow/job version.
- Deduplicate queue deliveries and safely replay completed steps.
- Separate read-only research from actions that mutate catalogue data, publish content, contact sellers or create commercial commitments.
- Require explicit authorization and confirmation before any consequential external action.
- Preserve partial outputs as drafts; never promote them to verified catalogue data automatically.

### 13.5 Cost, quota and privacy controls

Before any billable provider call, enforce:
- provider disabled by default until owner approval;
- a configured monthly and per-task spending ceiling;
- request/token limits and a maximum number of model calls per workflow;
- user/app rate limits and abuse controls;
- model allowlists and an explicit free-only mode where supported;
- usage accounting and alerts before a configured threshold;
- a hard stop when a budget or quota is exhausted.

Do not assume a model label containing "free" guarantees zero cost; verify provider pricing and routing configuration. Do not send private seller/customer data or restricted documents to an external provider unless the applicable data-processing and privacy basis has been approved.

### 13.6 Honest completion contract

A task is completed only when all required steps and acceptance checks have passed. Otherwise report partial, waiting for input, failed or cancelled, with:
- what was actually completed;
- what remains incomplete;
- the last successful checkpoint;
- the failed or blocked step and reason;
- whether a human decision, permission or provider configuration is needed.

A successful API response is not proof that a research claim is correct. Model output must still pass retrieval, source-applicability, evidence, rights and human-review gates. A green test suite proves only the tested software behavior, not factual accuracy or external-source availability.

### 13.7 Acceptance tests for the reliability layer

Before production use, test at minimum:
- provider key absent, invalid, revoked and rotated;
- provider disabled and budget exhausted;
- timeout, rate limit, server error and malformed provider response;
- primary provider failure with no approved fallback;
- approved fallback with explicit privacy and budget checks;
- worker restart after each durable checkpoint;
- duplicate queue delivery and replay of a completed side effect;
- concurrent workers where an expired lease holder attempts a stale write;
- cancellation and deadline expiry;
- partial extraction followed by successful resume;
- permanent, rights-related and authorization failures are not retried;
- no secret leakage into logs, errors, browser payloads or artifacts;
- accurate distinction between complete, partial, blocked and failed outcomes.

**Release condition:** the reliability layer is not production-ready until these tests pass against the actual durable storage, queue and provider adapters—not only mocks. Provider credentials and paid usage remain separately gated by explicit owner approval.

## 14. Dual resource pools: AI providers and technical data sources

ROBOSCOPIA should maintain two separate, independently governed resource pools. They serve different purposes and must not be conflated.

### 14.1 Pool A — free AI API providers

Purpose: provide language-model inference and specialist reasoning for permitted workflows, while avoiding dependency on a single provider.

Requirements:
- register each provider, model and credential reference separately; never store raw API keys in source code, repository files, frontend bundles or logs;
- reuse existing owner-controlled free API accounts/keys only after checking current provider terms, project ownership, rate limits, data handling and whether website use is permitted;
- store credentials in server-side secret storage and identify them through secret references, not copied values;
- record provider/model capabilities, context limits, supported modalities, rate limits, pricing/free-tier conditions, privacy/data-retention terms and last verification date;
- use per-provider health checks and bounded request quotas; avoid sending unnecessary health-check requests that consume free quotas;
- route tasks according to capability and policy: classification, multilingual assistance, summarization, technical reasoning or document interpretation;
- maintain per-key usage, errors, cooldown and quota state without exposing credentials;
- use bounded retries and failover only to another provider explicitly enabled for that task and approved data class;
- keep paid models and paid fallback disabled unless the owner explicitly approves a provider and budget;
- treat a provider's advertised free tier as subject to change; re-check current terms and pricing before activation.

The AI pool is an inference resource, not a source of truth. Model-generated statements must be grounded in retrieved evidence and retain the response/evidence status defined in Section 6.

### 14.2 Pool B — robotics, CNC and industrial technical data sources

Purpose: discover and retrieve traceable product, engineering and documentation information from reliable sources.

Maintain a source registry with, at minimum:
- source ID, organization/publisher and official domain;
- source class: manufacturer, standards/regulatory body, technical publication, research institution, distributor, integrator, marketplace or community;
- covered domains: robots, CNC machine tools, controllers, servo systems, motors, drives, reducers, sensors, end effectors, tooling, spare parts and industrial components;
- supported access method: official API, downloadable document, RSS/feed, permitted webpage access, user-supplied file or manual review;
- exact product/model/variant scope and source language;
- authority level and intended use;
- terms of use, robots.txt/access restrictions, copyright and processing/redistribution rights status;
- last checked date, source revision/date and availability status;
- evidence acquisition record, content hash and precise page/section/table/figure locator when a document is lawfully acquired and processed;
- source owner/contact or correction route where available.

Prioritize sources in this order:
1. exact-model manufacturer documentation: datasheets, manuals, technical specifications, CAD/STEP files and official product pages;
2. manufacturer support portals, official compatibility lists, software/firmware documentation and spare-parts catalogues;
3. recognized standards bodies, regulators and official safety/technical publications;
4. reputable robotics/CNC technical publications, research institutions and engineering organizations;
5. authorized distributors and integrators, clearly labelled as secondary sources;
6. marketplaces and community sources, used for discovery or corroboration only—not as automatic proof of manufacturer specifications.

The source registry should cover both major manufacturers and specialist component makers, not only complete robot/CNC brands. Search coverage should include industrial and collaborative robots, mobile and humanoid robots, CNC mills/lathes/machining centers, CNC controls, servo motors/drives, encoders, reducers, spindles, linear motion, tooling, grippers, sensors and safety components.

### 14.3 Source access and rights gate

- A website being prominent, official or publicly accessible does not automatically grant permission to crawl, process, store or redistribute its content.
- Prefer documented official APIs, feeds, manufacturer downloads with permitted use, licensed datasets and files supplied by the owner.
- Respect robots.txt, website terms, rate limits, authentication boundaries and copyright restrictions. Do not bypass access controls or download gated/bulk content without authorization.
- Store source metadata and permitted factual references separately from copyrighted document binaries and media.
- Do not republish full manuals, datasheets, images, CAD files or videos unless the applicable license or permission allows it.
- When rights are unclear, record the source as discoverable but processing/redistribution restricted or unknown; request permission or use an allowed alternative.
- Keep all newly discovered records in quarantine/review. No automatic writes to canonical catalogue data.

### 14.4 Retrieval and evidence pipeline

The intended flow is:

1. identify the user's task and exact manufacturer/model/variant or component;
2. query the source registry for relevant, permitted sources;
3. retrieve only through an allowed access method;
4. record provenance, revision, acquisition method and rights status;
5. extract text/tables/figures locally where possible, retaining exact locators and SHA-256 for acquired files;
6. match extracted candidates to the exact entity and claim;
7. detect conflicts, outdated revisions, variant mismatches and missing qualifiers;
8. send only the minimum necessary context to an approved AI provider when model reasoning is useful and permitted;
9. produce a cited draft with verification status and uncertainty;
10. require human review before canonical approval or publication.

AI providers must not be treated as data providers, and source websites must not be treated as AI inference providers. If an AI provider fails, the source registry and deterministic/local document tools remain usable. If a source website is unavailable, the system may use previously lawfully acquired, versioned evidence while displaying its date and status.

### 14.5 Operational independence from CEOAI

Existing CEOAI free-provider configuration and research capabilities may be evaluated for reuse, but ROBOSCOPIA must not depend on CEOAI being production-ready. Reuse only components whose behavior, security, licensing, data boundaries and free-tier conditions have been verified.

Initially, ROBOSCOPIA should own its source registry, evidence archive, job state, review queue and canonical catalogue. A later secured CEOAI integration may be an optional adapter, not a critical dependency. No CEOAI deployment, crawler activation, paid API use or new paid infrastructure is implied by this architecture decision.

### 14.6 Pool-level monitoring and acceptance

For the AI pool, monitor provider availability, quota exhaustion, cost, latency, failure rate, privacy eligibility and failover correctness.

For the data-source pool, monitor source availability, revision freshness, acquisition permission, extraction quality, exact-model applicability, duplicate sources, conflicting claims and evidence-review status.

Acceptance tests must prove:
- one unavailable AI provider does not corrupt or lose a job;
- failover never silently selects a paid or unapproved provider;
- API keys are not exposed in browser traffic, repository content, logs or errors;
- source ranking prefers applicable manufacturer evidence over weaker secondary material;
- an inaccessible or rights-restricted source is not crawled or processed through a prohibited route;
- conflicting manufacturer documents remain visible as conflicts;
- variant/generation mismatches are rejected;
- AI-generated claims cannot bypass evidence and human-review gates;
- source records and evidence remain usable when the AI pool is unavailable.

**Status:** dual-pool architecture proposal only. No API key has been imported, no provider activated, no crawler started and no new data source granted permission by this section.
