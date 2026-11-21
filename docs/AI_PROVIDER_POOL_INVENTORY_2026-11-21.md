# ROBOSCOPIA — AI Provider Pool & Technical Source Registry

**Review date:** 2026-11-21  
**Branch:** main  
**Status:** Inventory and plan only. No credentials imported, providers activated, crawlers started or catalogue records changed.

## 1. Two independent pools

- **AI Provider Pool:** optional inference services selected by task capability, current free-tier eligibility, privacy policy and remaining quota.
- **Technical Data Source Registry:** manufacturers and institutions used to discover product information and acquire traceable evidence through permitted methods.

An AI model is never a technical source of truth. A source being official or public does not automatically make its content approved for processing or redistribution.

## 2. AI Provider Pool — candidate inventory

The following providers appeared in earlier CEOAI planning/configuration discussions. Current account access, active credentials, free-tier eligibility and permission for reuse in ROBOSCOPIA are not verified here.

| Provider | Historical reference / candidate | Verification status | Potential role |
|---|---|---|---|
| Google Gemini | Historical labels GEMINI_KEY_1–3; Gemini Flash family | Keys/account not checked; model-level free terms differ | Multilingual assistance, summarization, document reasoning where permitted |
| OpenRouter | Historical OPENROUTER_KEY; openrouter/free | Key not checked; free-model pool and caps dynamic | Optional model gateway |
| Groq | Previously evaluated | Key/account not checked; limits are model/org-specific | Fast classification and short-form tasks |
| Cloudflare Workers AI | Previously used in CEOAI discussions | Account plan/model eligibility not checked | Edge inference for eligible lightweight tasks |
| DeepSeek | Previously evaluated | Current access, price and terms not checked | Optional reasoning |
| xAI / Grok | Previously evaluated | Free API access not confirmed | Candidate only |
| Hugging Face | Previously evaluated | Current credits, billing and endpoint terms not checked | Candidate only |
| Mistral | Previously evaluated | Current API free access not confirmed | Candidate only |
| NVIDIA API / NIM | Previously evaluated | Current API access and limits not checked | Candidate only |
| Cerebras | Previously evaluated | Current account/payment requirements not checked | Candidate only |

### 2.1 Official plan checks — 21 November 2026

These are public-plan reference checks, not confirmation of the user's account quota or permission to activate a provider.

- **Gemini:** Google's pricing page shows free access for selected models, not all models. It also states that free-tier content may be used to improve Google products. Do not send sensitive, private or restricted Roboscopia material until data-handling terms have been reviewed. https://ai.google.dev/gemini-api/docs/pricing
- **Groq:** limits vary by model and organization; the official documentation lists RPM/RPD/TPM/TPD and says exact limits are visible in the account Limits page. Honor response headers and 429/Retry-After. https://console.groq.com/docs/rate-limits
- **OpenRouter:** free variants are rate-limited. Current official documentation states 20 requests/minute and 50/day; the higher daily cap requires a purchase of credits, which is not allowed by the zero-cost Roboscopia mode. https://openrouter.ai/collections/free-models/ and https://openrouter.ai/pricing
- **Cloudflare Workers AI:** current official pricing documents 10,000 Neurons/day at no charge on Workers Free. Excess usage requires Workers Paid and is billed; some models require paid plan or prepaid credits. Exclude paid-only models and hard-stop at the free allocation. https://developers.cloudflare.com/workers-ai/platform/pricing/ and https://developers.cloudflare.com/changelog/product/workers-ai/
- **DeepSeek, xAI, Hugging Face, Mistral, NVIDIA and Cerebras:** do not label zero-cost until the exact API product, account terms, payment requirement, rate limits and data-use terms are checked from official documentation.

### 2.2 Safe reuse of CEOAI credentials

Prior CEOAI context includes labels such as GEMINI_KEY_1–3 and OPENROUTER_KEY. This review cannot inspect secret values or establish whether they still exist, are active, or may be reused by another application.

Before reuse:
1. identify the provider and owning account/project;
2. check terms for use by a second application and whether quota is shared;
3. decide whether to share a credential or create a distinct Roboscopia key under the same owner account;
4. store it only as a server-side secret, using a secret reference in configuration;
5. verify quota and billing state in the provider dashboard;
6. perform a bounded health check only after explicit activation;
7. enforce a hard zero-paid-spend policy.

Do not rotate multiple keys from one provider to bypass project/organization quotas. Do not silently fall back to a paid provider or send data to an unapproved provider.

### 2.3 Provider record and routing

Each provider/model record should include stable IDs, adapter type, API base URL, secret reference (never the secret value), enabled flag (default false), current free-tier evidence/date, quota type and account quota, billing/payment state, supported tasks/modalities/languages, context limits, data retention/training terms, approved data classes, rate-limit behavior, cooldown, health-check result and reviewer.

Routing policy:
1. deterministic/local code first for hashing, parsing, unit conversion, schema validation and evidence matching;
2. use AI only when model reasoning is needed;
3. select by capability, privacy eligibility, availability and remaining quota;
4. fail over only to explicitly enabled, zero-cost and data-approved providers;
5. when the free pool is exhausted, pause/queue or return a partial result—never silently use paid service;
6. keep model output as draft/inference until supported by evidence and review.

## 3. Technical Data Source Registry — initial discovery targets

These are discovery targets only. Each exact URL must be separately registered and evaluated for access method, terms, rights, model scope and freshness.

### 3.1 Robot manufacturers

- ABB Robotics — https://www.abb.com/robotics
- FANUC — https://www.fanuc.eu/
- KUKA — https://www.kuka.com/
- Yaskawa Motoman — https://www.yaskawa.eu.com/
- Universal Robots — https://www.universal-robots.com/
- Kawasaki Robotics — https://robotics.kawasaki.com/
- Stäubli — https://www.staubli.com/
- Epson Robots — https://www.epson.com/
- DENSO Robotics — https://www.densorobotics.com/
- Comau — https://www.comau.com/
- Doosan Robotics — https://www.doosanrobotics.com/
- Techman Robot — https://www.tm-robot.com/
- Unitree — https://www.unitree.com/
- Boston Dynamics — https://bostondynamics.com/

### 3.2 CNC machines and controls

- DMG MORI — https://www.dmgmori.com/
- Mazak — https://www.mazak.com/
- Haas Automation — https://www.haascnc.com/
- Okuma — https://www.okuma.com/
- DN Solutions — https://www.dn-solutions.com/
- Makino — https://www.makino.com/
- Hermle — https://www.hermle.de/
- Siemens SINUMERIK — https://www.siemens.com/
- HEIDENHAIN — https://www.heidenhain.com/
- FANUC CNC — https://www.fanuc.eu/

### 3.3 Components and industrial automation

- Bosch Rexroth — https://www.boschrexroth.com/
- Siemens — https://www.siemens.com/
- Mitsubishi Electric — https://www.mitsubishielectric.com/
- Beckhoff — https://www.beckhoff.com/
- Omron — https://www.omron.com/
- Schneider Electric — https://www.se.com/
- Festo — https://www.festo.com/
- SMC — https://www.smcworld.com/
- Keyence — https://www.keyence.com/
- SICK — https://www.sick.com/
- HIWIN — https://www.hiwin.com/
- THK — https://www.thk.com/
- NSK — https://www.nsk.com/
- SKF — https://www.skf.com/
- SEW-EURODRIVE — https://www.sew-eurodrive.com/
- Lenze — https://www.lenze.com/

### 3.4 Standards, research and industry

- ISO — https://www.iso.org/
- IEC — https://www.iec.ch/
- NIST — https://www.nist.gov/
- IFR — https://ifr.org/
- IEEE — https://www.ieee.org/
- ROS — https://www.ros.org/
- Fraunhofer — https://www.fraunhofer.com/

Standards may be copyrighted or require a paid subscription. Register metadata and permitted references only; do not redistribute standard text without rights.

## 4. Source authority, access and rights

Prioritize exact-model manufacturer datasheets/manuals and technical specifications; then manufacturer support/compatibility/spare-parts/software documentation; standards bodies and regulators; recognized research institutions; established specialist publications; authorized distributors/integrators; and finally marketplaces/community sources for discovery or corroboration only.

For each source record source ID, exact URL, publisher, source class, covered products, access method, language, revision/date, last checked, terms/robots status, processing and redistribution rights, evidence hash/locator if lawfully acquired, and review status.

Prefer official APIs, permitted downloads, licensed feeds and owner-supplied documents. Do not crawl or bulk-download merely because a domain appears here. Public visibility is not processing or redistribution permission. Preserve conflicts and variant differences; do not silently resolve them.

## 5. Current implementation boundary

The repository already contains source/evidence foundations:
- data/evidence-document-registry.json
- schemas/source-registry.schema.json
- scripts/source-discovery-acquisition.mjs
- scripts/source-verification-engine.mjs
- scripts/technical-evidence-extraction-engine.mjs
- scripts/evidence-document-acquisition.mjs

The reviewed repository tree does not show a runtime AI provider gateway or active provider credential configuration. The AI Provider Pool is therefore a planned capability, not a live integration.

No API keys were read, copied, tested or activated. No crawler, paid service, production deployment or catalogue mutation was performed.

## 6. Next implementation sequence

1. Reuse the existing source registry schema; do not create a competing source-of-truth registry.
2. Add a separate AI provider registry schema with disabled-by-default records and secret references only.
3. Add provider adapter interface and deterministic routing policy without live credentials.
4. Test missing secrets, disabled providers, quota exhaustion, 429/Retry-After, paid-model rejection, privacy restrictions and no-fallback behavior.
5. Populate technical source records in controlled batches, starting with the existing 15 sources and seven initial catalogue models.
6. Verify exact access and rights before automated acquisition.
7. Only after explicit owner authorization, configure a Roboscopia-specific secret and run one bounded free-provider health check.

**Release gate:** no provider is active until credentials, current zero-cost terms, data-use terms, quota behavior, secret storage and failure tests are verified. No source is evidence-approved until exact applicability, rights and human review are satisfied.
