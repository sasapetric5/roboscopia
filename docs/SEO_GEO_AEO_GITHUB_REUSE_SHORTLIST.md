# SEO / GEO / AEO Automation — GitHub Reuse Shortlist

Evaluation date: 2026-11-23  
Target: ROBOSCOPIA, `sasapetric5/roboscopia`, branch `main`  
Purpose: find existing, reusable automation before expanding in-house SEO tooling.

## Executive decision

There are already open-source projects covering most of the technical SEO, crawling, internal-link analysis, structured-data validation, accessibility, AI-search readiness and monitoring requirements. ROBOSCOPIA should not rebuild these from scratch.

The best immediate candidates for a deeper code-level evaluation are:

1. **Crawlie** — best lightweight crawler + SEO/GEO + agent/MCP integration candidate.
2. **OpenSEOSuite** — broadest self-hosted SEO suite candidate, but its first release and Python/Node stack require careful verification.
3. **AEO Toolkit** — focused TypeScript AEO/GEO audit engine and schema tooling; hosted platform/MCP integrations are now proprietary, so reuse only the Apache-2.0 open-source portion.
4. **gocrawl** — modular Go crawler/analyzer engine with AI-search checks, API and reports.
5. **All-In-One-Free-SEO-Tool** — broad feature coverage and automatic-fix agent; needs deeper dependency, data-source and safety review before considering adoption.

Do not select a winner based on feature claims alone. The repositories below have different maturity, scope, runtime requirements and limitations.

## Candidate evaluation

| Repository | License / stack | Relevant capabilities | Initial fit / caveats |
|---|---|---|---|
| [spronta/crawlie](https://github.com/spronta/crawlie) | MIT; Rust | Whole-site crawler, technical SEO, GEO, accessibility, structured data, broken links, JS-rendered audits, JSON/HTML reports, MCP server, agent skills, CI failure thresholds | **Very high** for repeatable audit and AI-agent workflows. Local CLI/MCP can be run in CI; not a Cloudflare Worker library. README describes 57 rules. |
| [Sushang-Agnihotri/OpenSEOSuite](https://github.com/Sushang-Agnihotri/OpenSEOSuite) | MIT; Python + Node | 95 audit rules, crawler, internal PageRank/link graph, orphan pages, schema, content optimizer, keywords, monitoring, reports, optional local LLM | **High feature coverage**, but explicitly first development release 0.1.0. Self-hosted Docker/SQLite application is heavier than ROBOSCOPIA's current static/Node architecture. |
| [Advance-Labs/aeo-toolkit](https://github.com/Advance-Labs/aeo-toolkit) | Apache-2.0; TypeScript | AEO/GEO audit rules, crawler/parser, scoring engine, schema validator, Chrome extension, skills | **High language fit** for reusable packages. Important: hosted platform, OAuth, billing, Google/Bing integrations and two MCP servers moved to a private repository; do not assume those are open source. |
| [Patience-dot-devl/gocrawl](https://github.com/Patience-dot-devl/gocrawl) | MIT; Go | Modular analyzers, SEO, redirects, links, sitemap, structured data, AI-search checks, optional headless rendering/Core Web Vitals, REST API and reports | **High as a standalone crawler**; Go 1.27 toolchain and browser rendering need runtime evaluation. |
| [IamRamgarhia/All-In-One-Free-SEO-Tool](https://github.com/IamRamgarhia/All-In-One-Free-SEO-Tool) | MIT; TypeScript | Broad SEO suite, crawler, schema, image optimization checks, broken links, AI search visibility, content briefs and agent-assisted fixes | **Potentially high**, but large surface area means audit all data providers, external API requirements, agent write permissions and dependency supply chain. |
| [booltools/booltools-seo-crawler](https://github.com/booltools/booltools-seo-crawler) | MIT; Go + Astro | 130+ claimed checks, technical SEO, GEO, AI crawler reachability, citability, schema, CI SDK and rule presets | **Potentially useful rule library**; public repository showed a small community footprint and last push in August 2026. Verify rule implementation and current maintenance before adoption. |
| [siva01c/seo-tools](https://github.com/siva01c/seo-tools) | MIT; TypeScript | On-page crawler, metadata and structured data extraction, AI/GenAI readiness, optional LLM suggestions, MCP server | **Good focused module candidate**; validate crawler coverage, prompt safety and whether optional model features can be fully disabled. |
| [arm-pz/seo-polish](https://github.com/arm-pz/seo-polish) | MIT; small workflow | Chains SEO audit and content rewrite tools for titles, descriptions, headings, content gaps and internal links | **Useful pattern, not a complete platform**; inspect upstream tools and ensure edits are reviewed/tested before application. |
| [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse) | Apache-2.0; JavaScript/Node | Performance, accessibility, SEO and best-practice audits; lab metrics and CI integration | **High as a specialist validator**; browser/Chromium runtime is resource-intensive, so use bounded scheduled or pre-release audits. |
| [JustinBeckwith/linkinator](https://github.com/JustinBeckwith/linkinator) | MIT; Node | Internal/external link checking, crawl scope controls and CI use | **High as a small focused validator** for source citations, internal links and broken links. |
| [pa11y/pa11y](https://github.com/pa11y/pa11y) | GPL-3.0; Node | Automated accessibility checks | **Useful technically, but GPL-3.0 needs legal compatibility review** before copying/distributing code. Consider running as a separate audit tool if compatible with project policy. |
| [html-validate/html-validate](https://github.com/html-validate/html-validate) | MIT; Node | HTML conformance and semantic markup validation | **High as a small validator** for generated page templates and semantic HTML. |

## Additional research lead — do not adopt yet

- [internet-and-sons/geo-reporter](https://github.com/internet-and-sons/geo-reporter) describes an LLM skill for GEO auditing, AI crawler reachability, citability scoring, schema and llms.txt. GitHub API returned `NOASSERTION` for the repository licence in this review. Do not copy or integrate code until a valid licence is confirmed.

## What a combined ROBOSCOPIA stack should cover

A good combination of specialist open-source components should automate the following, per canonical page and relevant media landing page:

1. Crawlability: HTTP status, redirects, canonical, robots.txt, sitemap inclusion, crawl depth and orphan detection.
2. On-page SEO: title, meta description, headings, URL, language, Open Graph and duplicate/thin-content checks.
3. Semantic/entity SEO: manufacturer/model/family/variant/component/application relationships and disambiguation.
4. Structured data: Schema.org JSON-LD generated from canonical records and validated against visible content.
5. GEO/AEO: answer-ready passages, entity clarity, source attribution, extractable facts, AI crawler access and citation-readiness checks.
6. Internal links: relevance-based graph, anchor text, orphan detection, broken links and canonical entity relationships.
7. External references: claim-to-source mapping, primary source links, link health and attribution; never invent citations.
8. Images: rights gate, alt text, captions, dimensions, responsive variants, image sitemap and contextual links.
9. Videos: separate video rights, thumbnail, transcript/captions, duration, VideoObject and eligible video sitemap entries.
10. Accessibility/performance: semantic HTML, WCAG checks, responsive images, Core Web Vitals and layout-shift prevention.
11. Internationalization: real translated pages, language metadata, reciprocal hreflang and canonical handling.
12. Monitoring: recurring crawl, source changes, broken citations, metadata regression, stale claims and rollback signals.
13. Safe remediation: propose deterministic fixes automatically; only auto-apply reversible changes with tests, provenance and rollback. AI-generated rewrites must not fabricate claims or sources.

## Recommended architecture for ROBOSCOPIA

Do not install one giant external SEO product as the website runtime. Use a modular audit-and-remediation pipeline:

- **Crawler/audit layer:** evaluate Crawlie first, with gocrawl as a second implementation to compare.
- **AEO/GEO rules:** evaluate AEO Toolkit's open TypeScript packages and the rule definitions in Crawlie.
- **Internal/external link integrity:** Linkinator plus ROBOSCOPIA's canonical entity graph.
- **Performance/accessibility/HTML:** Lighthouse, pa11y (licence review first), html-validate.
- **Content-specific intelligence:** use ROBOSCOPIA's canonical fact/evidence engine. External SEO tools must not overwrite verified technical facts.
- **Remediation:** deterministic code fixes and constrained agents; changes go through tests and the existing Publication Readiness Engine.
- **Scheduling:** bounded GitHub Actions or existing free-compatible runtime first. No new paid hosted SEO platform.

## Important limitations

- GEO/AEO scoring is heuristic and cannot guarantee citations from ChatGPT, Gemini, Claude, Perplexity or other systems.
- Search ranking, search volume, backlinks and competitor traffic require real measured data or an authorized provider. Never invent these metrics.
- Search Console and Bing Webmaster data require explicit authorized connection; open-source code does not grant account access.
- A crawler's report is a diagnostic, not proof of factual accuracy, media rights, ranking or indexing.
- SEO scores must never override ROBOSCOPIA's factual, provenance, media-rights, security and publication hard gates.
- Do not create mass thin pages, keyword stuffing, fake FAQs, fake reviews, fabricated authorship or link farms.
- Respect robots.txt, crawl rate limits, website terms, privacy and copyright.

## Next evaluation steps

1. Inspect Crawlie's rule implementation, tests, CLI/MCP interfaces, release history, Rust dependencies and licence notices.
2. Inspect AEO Toolkit's package boundaries and verify that the needed audit/parser/schema code is actually in the Apache-2.0 portion.
3. Inspect OpenSEOSuite's test results, known limitations, API boundaries, data providers and Docker dependency footprint.
4. Inspect gocrawl's analyzers, Go toolchain, headless rendering dependencies and rate-limit/robots behavior.
5. Inspect All-In-One tool's agent write actions, model/API dependencies and supply-chain posture.
6. Build a rule-by-rule mapping to ROBOSCOPIA's page types and existing SEO/publication modules; identify duplicates and gaps.
7. Reuse the smallest compatible packages or run standalone audit tools in CI; avoid porting entire applications.
8. Integrate only after licence, security, maintenance and test checks pass. Keep all work on `main`; no deployment or paid services without approval.

## Review evidence

Repository metadata and README/license files were inspected on 2026-11-23 for the primary candidates. This is an initial shortlist, not a full source-code/security audit. The next phase must inspect actual implementations and automated tests before a reuse decision.
