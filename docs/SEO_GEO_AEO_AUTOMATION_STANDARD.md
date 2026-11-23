# ROBOSCOPIA — Autonomous SEO, GEO, AEO and Discoverability Standard

Status: architecture and implementation requirements  
Target: every eligible public page and every published text, image and video asset  
Branch: `main`  
Policy: generate metadata and links automatically; never invent facts, sources, rights, or relationships.

## 1. Goal

Every public ROBOSCOPIA resource must be technically crawlable, semantically understandable, accessible, discoverable in traditional search, useful to answer engines and generative search systems, and connected to relevant internal knowledge.

This standard applies to:
- model, manufacturer, family, category, comparison and application pages;
- technical articles, explainers, research notes and FAQs;
- individual approved image and video assets where a useful standalone page exists;
- marketplace listings and other future public resource types, with their own structured-data rules.

SEO, GEO and AEO are not separate keyword-stuffing exercises. They share a foundation: original useful content, clear entities, accurate field-level evidence, stable URLs, accessible media, semantic structure, fast pages and trustworthy links.

## 2. Automatic per-page output

For every page, the publishing pipeline should generate and validate:

### Technical SEO
- unique, descriptive title and meta description, in the page language;
- stable human-readable slug and canonical URL;
- correct HTTP status, indexability and robots directives;
- one clear H1, logical H2/H3 hierarchy, semantic HTML and descriptive link text;
- XML sitemap inclusion only for canonical, indexable, publish-eligible URLs;
- correct pagination, redirects and 404/410 behavior; no duplicate parameter URLs;
- Open Graph and social preview metadata;
- mobile usability, image dimensions, responsive delivery, lazy loading below the fold and Core Web Vitals monitoring;
- hreflang/alternate-language links only when equivalent translated pages actually exist;
- breadcrumbs and a clear last-updated date only when the underlying content was genuinely reviewed.

### GEO — Generative Engine Optimization
- concise, direct entity definition near the top of the page;
- self-contained factual passages that can be quoted without losing context;
- explicit model identity, manufacturer, variant, generation, configuration and date scope;
- claim-level source citations adjacent to the claims they support;
- clear separation of verified facts, manufacturer claims, estimates, editorial analysis and unknown values;
- comparison tables with comparable configurations and units;
- definitions, limitations, methodology and source-quality notes;
- stable entity identifiers and structured relationships to related models, components, applications and manufacturers;
- original synthesis and useful analysis rather than paraphrased filler;
- no promise that any search engine or AI answer engine will index, cite or rank a page.

### AEO — Answer Engine Optimization
- answer-first summaries for genuine user questions;
- question-and-answer sections only where they add real value;
- concise definitions, specification summaries, comparison answers and contextual caveats;
- FAQ structured data only when the visible page contains the same genuine FAQ content and current search-engine policies permit its use; never add hidden or fabricated FAQs;
- HowTo markup only for actual step-by-step instructions, not product descriptions;
- structured tables and lists that preserve units, conditions and variant scope.

### Semantic and entity SEO
- normalized manufacturer, model, family, variant, generation, component, category and application entities;
- stable internal entity IDs and canonical entity URLs;
- meaningful entity relationships, with links to the relevant canonical pages;
- disambiguation for similar model names and generations;
- synonym handling for search without creating thin duplicate landing pages;
- multilingual terminology mapped to the same entity where appropriate.

## 3. Structured data (Schema.org / JSON-LD)

Generate JSON-LD from the canonical record and page type, not from free-form model guesses. Validate syntax, required properties and visible-content consistency before publication.

Potential types, selected only when applicable:
- `Organization` for ROBOSCOPIA and verified manufacturer entities;
- `WebSite` and `SearchAction` only if the site search actually supports it and the markup remains eligible under current guidelines;
- `WebPage`, `CollectionPage`, `BreadcrumbList`;
- `Product` for a real identifiable commercial product page, with truthful offer/price/availability data only when verified;
- `Article` / `TechArticle` for authored technical content;
- `ImageObject` for approved image assets, including creator, credit, licence and content URL only where rights and metadata support them;
- `VideoObject` for approved video pages with genuine title, description, thumbnail, upload date, duration and accessible embed/content URL;
- `FAQPage` only for genuine visible FAQs and subject to current search-engine eligibility rules.

Do not mark every robot profile as a purchasable Product with invented offers. Do not add aggregate ratings, reviews, prices, availability, author credentials or dates that do not exist. Structured data must never claim stronger verification or rights than the underlying record.

## 4. Images — every approved image

Each image record should carry:
- unique asset ID and stable asset landing URL when useful;
- canonical associated model/entity ID;
- descriptive, human-readable filename where the storage pipeline controls it;
- accurate alt text describing the visible subject and useful distinguishing details; decorative images use empty alt text;
- caption and visible credit where required;
- creator/rightsholder, source page and exact licence/permission evidence;
- dimensions, format, file size, responsive variants and checksum;
- approved crop/derivative/thumbnail/deep-zoom scopes;
- ImageObject metadata only when supported by verified facts.

Image SEO actions:
- use responsive `srcset`/sizes and modern formats where supported;
- reserve image dimensions to prevent layout shift;
- lazy-load below-the-fold images; do not lazy-load the primary LCP image;
- create useful thumbnails and descriptive captions;
- provide image sitemap entries for indexable approved assets where beneficial;
- link image to its canonical model/profile and show relevant source/credit links;
- never publish an image just because metadata or an image URL was discovered. Media rights gate remains mandatory.

Do not create thousands of thin, near-identical image pages. A standalone image page is appropriate only if it provides unique value, context, rights/credit details and useful links.

## 5. Videos — every approved video

Each video record should carry:
- unique video ID, canonical landing page and associated entity IDs;
- accurate title, description, language, creator/publisher and source;
- rights evidence separately covering embedding, hosting, downloading, thumbnails and transformations as applicable;
- thumbnail URL and rights status;
- duration, upload/publication date and content URL/embed URL when known;
- captions/subtitles and transcript where available and permitted;
- chapters/key moments only when real and validated.

Video SEO actions:
- dedicated indexable watch page for valuable videos, not a thin duplicate embed;
- visible player and useful explanatory context;
- VideoObject JSON-LD consistent with visible content;
- video sitemap only for eligible pages with valid thumbnails and metadata;
- accessible captions/transcript, responsive player, poster image and performance controls;
- internal links to model, manufacturer, related demonstrations and relevant technical explanations;
- source/creator attribution and rights statement.

A video licence is not implied by a still-image licence. Do not scrape, host, download or transform third-party video without the corresponding rights.

## 6. Internal linking — automatic knowledge graph

Build a relevance-based internal link graph from canonical IDs and explicit relationships. Link, when genuinely relevant:
- model ↔ manufacturer;
- model ↔ family, generation and variants;
- model ↔ components, payloads, controllers and accessories;
- model ↔ applications, industries and use cases;
- model ↔ comparable models and comparison pages;
- model ↔ technical articles, manuals and approved media;
- article ↔ claims, cited models and source entities;
- video/image ↔ canonical model and related resources;
- category ↔ relevant profiles and subcategories.

Rules:
- links must be contextually useful, not generated to hit an arbitrary link count;
- use descriptive anchor text and avoid repetitive exact-match anchors;
- prevent broken links, loops of low-value pages, orphan pages and excessive sitewide link blocks;
- prioritize a small number of highly relevant links in the body, then related-resource sections;
- preserve canonical IDs when slugs change and redirect old URLs;
- create breadcrumbs and HTML discovery paths for crawlers;
- automatically detect orphaned pages and propose links only from validated relationships.

## 7. External source links and citations

Every material factual claim must retain its evidence/source reference in the canonical data. On public pages:
- link to the original source page, not just a search-result page or an aggregator;
- cite the exact source near the supported fact or in a clearly mapped source section;
- show source title, publisher/rightsholder, publication/review date where known, and access date where useful;
- prefer primary manufacturer manuals, official technical documentation, standards bodies, research papers and original rights-holder pages;
- distinguish primary sources from secondary reporting and community discussion;
- retain source provenance internally even if a public link later becomes unavailable;
- monitor broken links and changed pages and trigger re-verification.

Link attributes:
- ordinary editorial citations to trustworthy sources should remain normal followed links unless a specific policy reason applies;
- paid placements, sponsorships and affiliate links must be clearly disclosed and use appropriate `rel=sponsored` (and `nofollow` where required);
- user-generated links must be moderated and use `rel=ugc` or `nofollow` as appropriate;
- untrusted or spam links must not pass ranking signals;
- never sell, exchange or manufacture backlinks; no automated link farms or reciprocal-link schemes.

An external link is not proof that the cited statement is correct. The fact-verification engine must validate claim applicability and source content independently.

## 8. Publication gate integration

SEO/GEO/AEO generation is a publishing stage after the page has passed factual, provenance, rights and security gates. Metadata cannot make an ineligible page publishable.

Suggested stage contract:
1. page content and claim evidence validated;
2. all media rights separately cleared;
3. entity IDs, relationships and canonical URL resolved;
4. SEO/GEO/AEO metadata generated;
5. internal links resolved and checked;
6. external citations checked against claim-to-source mapping;
7. structured data generated from canonical fields;
8. accessibility and technical performance checks run;
9. duplicate/thin-content and spam/link checks run;
10. final publication readiness gate records rule version, results and reasons.

If mandatory SEO metadata, canonical identity, citations, rights, structured-data validation or link integrity fails, do not silently publish a broken or misleading page. Return `needs_verification` or `quarantine` according to severity.

## 9. Continuous optimization and monitoring

Automate:
- sitemap refresh on eligible content changes;
- internal-link graph refresh and orphan detection;
- broken external/internal link checks;
- canonical, redirect, indexability and structured-data regression checks;
- duplicate title/description/H1 and near-duplicate content detection;
- outdated facts and last-reviewed date monitoring;
- image/video metadata, missing alt/captions and performance checks;
- search performance ingestion where an authorized free data source/connector is available;
- change detection for source pages and licence/takedown events;
- controlled title/description experiments only when measurable and reversible.

Do not claim access to Google Search Console, Bing Webmaster Tools, analytics or indexing status unless the relevant account/API is actually connected and authorized. No paid SEO services are required for the initial architecture.

## 10. Quality measures

Track by page type and language:
- indexable canonical page coverage;
- valid structured-data rate and visible-content consistency;
- missing/duplicate titles, descriptions, headings and canonical tags;
- source citation coverage for material factual claims;
- percentage of internal links resolving and orphan page count;
- external source-link health and source revalidation backlog;
- media rights completeness, alt text coverage, video caption coverage;
- Core Web Vitals and page-weight distributions;
- duplicate/thin-content rate;
- organic search impressions/clicks and answer-engine citations only when measured through legitimate available data.

Do not optimize for arbitrary keyword density, word count, schema volume or number of links. Optimize for relevance, usefulness, accuracy, accessibility and technical health.

## 11. Reuse-first implementation candidates

Evaluate before importing:
- [Lighthouse](https://github.com/GoogleChrome/lighthouse) — performance, accessibility, SEO and best-practice audits;
- [Schema.org validator / structured data tooling](https://github.com/schemaorg) and [Google Rich Results Test](https://search.google.com/test/rich-results) — validation references/tools; hosted test availability is not assumed;
- [html-validate](https://github.com/html-validate/html-validate) — HTML conformance checks;
- [pa11y](https://github.com/pa11y/pa11y) — automated accessibility checks;
- [Linkinator](https://github.com/JustinBeckwith/linkinator) — internal/external link checking;
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/) — useful benchmark but proprietary/limited free tier; not an assumed dependency;
- [Eleventy](https://github.com/11ty/eleventy) or existing rendering pipeline — consider only if it fits current architecture; do not migrate the site solely for SEO.

Potentially reusable tools must be checked for current maintenance, license, dependency and runtime fit. Browser-based crawlers can be resource-intensive; CI should use bounded crawl scopes and cache results.

## 12. Safety and integrity rules

- Never generate fake source citations, authors, dates, reviews, prices, ratings, licences or structured data.
- Never keyword-stuff alt text, headings, captions, metadata or anchor text.
- Never create mass doorway pages or thin pages solely to capture search queries.
- Never make a public page appear verified if the underlying claims are unverified.
- Never publish media before rights clearance.
- Never allow SEO scores to override publication hard gates.
- Do not promise ranking, indexing, rich results, AI citations or traffic.
- Respect robots directives, website terms, rate limits, privacy and copyright.

## 13. Rollout plan

Phase A — inventory and contracts:
- map current templates, routes, canonical URL strategy, robots.txt, sitemap and rendering model;
- define page-type metadata contracts and canonical entity IDs;
- inventory current internal/external links and media metadata.

Phase B — reusable validators:
- add offline tests for metadata, canonical, JSON-LD, links, alt text, captions and sitemap eligibility;
- evaluate Lighthouse, html-validate, pa11y and Linkinator for compatible use;
- keep audits deterministic and bounded.

Phase C — generation:
- generate metadata, structured data, breadcrumbs, internal links and source citations from canonical data;
- add bilingual support only where translated content exists;
- build dedicated image/video landing pages selectively.

Phase D — monitoring:
- add scheduled link/source/media revalidation and page regression reports;
- use search performance data only after authorized connection;
- add safe auto-repair for deterministic issues with audit history and rollback.

## 14. Explicit boundaries

This document defines required behavior; it does not claim that the entire SEO/GEO/AEO system is implemented. No external SEO service, paid API, deployment, search-console connection or automatic indexing action is enabled by this document.

The objective is the strongest technically and editorially defensible optimization for every published resource — not an unrealistic guarantee of maximum rankings.
