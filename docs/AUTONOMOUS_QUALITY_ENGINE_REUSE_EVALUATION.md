# Autonomous Quality & Trust Engine — reuse-first evaluation

Evaluation date: 2026-11-23  
Repository target: `sasapetric5/roboscopia`, branch `main`

## Objective

Scale Roboscopia toward 50,000–100,000 model and knowledge pages without requiring a person to approve every routine publication. Human review should be reserved for exceptions, disputed rights, unresolved contradictions, safety-critical claims, and sampled audits.

This document evaluates reusable open-source building blocks. It does not authorize a deployment, paid service, hosted API, or wholesale dependency adoption.

## Existing Roboscopia baseline

The repository already contains:
- a read-only canonical data audit (`scripts/data-quality-audit.mjs`);
- a stable issue review queue (`scripts/data-quality-review-queue.mjs`);
- append-only review-decision records (`scripts/record-review-decision.mjs`);
- evidence comparison/review tooling;
- media discovery adapters for Openverse and Wikimedia Commons;
- a fail-closed media review queue (`adapters/media-review-queue.mjs`).

Important gap: these components do not yet form an end-to-end, machine-enforced publication lifecycle. The media queue is intentionally non-persistent and cannot approve or publish media. The data audit reports issues; it does not decide publication eligibility. Do not create a second competing quality framework.

## Candidate projects reviewed

Repository metadata, README, stated license and recent activity were checked through GitHub on the evaluation date. Stars are indicative only and are not a quality or security score. A full dependency, security-advisory, release-history and code-level audit is still required before importing code.

| Project | License | Role it can contribute | Fit for Roboscopia |
|---|---|---|---|
| [OpenLineage](https://github.com/OpenLineage/OpenLineage) | Apache-2.0 | Standard event model for lineage and provenance across jobs, datasets and runs | **High as a schema/pattern**; adopt compatible lineage event fields without requiring its full backend |
| [Dagster](https://github.com/dagster-io/dagster) | Apache-2.0 | Asset-centric data orchestration, lineage, observability and testability | **Medium**; strong reference architecture, but Python-centric and a full runtime is heavy |
| [Prefect](https://github.com/PrefectHQ/prefect) | Apache-2.0 | Resilient Python workflows, retries and execution monitoring | **Medium**; useful orchestration patterns, but introduces Python runtime/service considerations |
| [Temporal](https://github.com/temporalio/temporal) | MIT | Durable workflow execution, retries and recovery across failures | **High conceptually, low immediate deployment fit**; full Temporal server is substantial infrastructure |
| [Open Policy Agent](https://github.com/open-policy-agent/opa) | Apache-2.0 | Explicit policy evaluation and policy-as-code | **High conceptually**; evaluate policy separation and tests; do not add a separate service until runtime/cost fit is proven |
| [Haystack](https://github.com/deepset-ai/haystack) | Apache-2.0 | RAG pipelines, retrieval, routing, agent tools and evaluation components | **Medium**; useful for research/RAG subsystem, not a factual or legal publication authority |
| [DeepEval](https://github.com/confident-ai/deepeval) | Apache-2.0 | LLM and agent trajectory evaluation, hallucination/relevance/task metrics | **Medium**; useful offline regression tests; LLM-as-judge scores must never independently authorize publication |
| [Evidently](https://github.com/evidentlyai/evidently) | Apache-2.0 | Data/LLM quality metrics, reports, test suites and monitoring | **Medium**; useful for batch quality reports and drift monitoring, Python-oriented |
| [Dedupe](https://github.com/dedupeio/dedupe) | MIT | Fuzzy matching, record deduplication and entity resolution | **Medium-high for entity matching**; Python dependency and human-labelled training considerations |
| [Apache Airflow](https://github.com/apache/airflow) | Apache-2.0 | Mature scheduled workflow orchestration and monitoring | **Low for initial deployment**; operationally heavy relative to the current lightweight repository |
| [Cleanlab](https://github.com/cleanlab/cleanlab) | Apache-2.0 | Data-centric detection of label/data quality problems | **Low-medium**; useful for specific ML datasets, not a general technical fact verifier |
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | Apache-2.0 | Web crawling and structured extraction for AI research pipelines | **Medium for a separate research worker**; Python/browser dependencies, resource and source-terms checks required |

## Recommended reuse decision

Do not install a large orchestration platform as the first move. Roboscopia's current repository and data pipeline are lightweight and JavaScript/Node oriented; several attractive candidates require a Python service, persistent database, workers, or substantial infrastructure. That would add cost and operational risk before proving the publication policy.

Reuse the strongest ideas and interoperable contracts first:

1. **OpenLineage-inspired provenance events** — record which source, extractor, parser, validation rule and data version produced each claim/page.
2. **Temporal-inspired durable state machine** — persist each page job's stage, attempts, lease/fencing token, idempotency key, last checkpoint and recovery reason. Prefer existing queue/runtime infrastructure where available.
3. **OPA-inspired policy separation** — deterministic, versioned rules decide eligibility. The research/generation agent cannot modify policy or approve its own output.
4. **Dagster/Evidently-inspired asset quality and monitoring** — each page, fact, media asset and source is a versioned asset with test results and revalidation dates.
5. **DeepEval-inspired regression suite** — evaluate research and agent behavior offline against curated test cases. Model-judge metrics are advisory signals, not hard proof.
6. **Dedupe-inspired candidate matching** — identify probable duplicate models, sources and media, but quarantine uncertain matches rather than merge automatically.
7. **Haystack/Crawl4AI-inspired research pipeline** — keep extraction, retrieval and generation as replaceable adapters, separate from the publication authority.

## Proposed publication decision contract

A future deterministic gate should consume existing audit/evidence/media results and return one of:

- `publish`: every mandatory gate passed with machine-verifiable evidence;
- `needs_more_verification`: a resolvable gap or conflict remains; schedule another independent verification attempt;
- `quarantine`: hard failure, unsafe input, unresolved high-impact contradiction, uncertain media rights, or exhausted retry budget.

The overall decision is conjunctive, not an average score:

`eligible = schema_pass && provenance_pass && factual_evidence_pass && rights_pass && security_pass && duplicate_check_pass && freshness_pass`

A confidence score can prioritize work, but it cannot override a failed hard gate. Media rights must remain independent from factual correctness. Public availability, a search result, or an AI-generated confidence estimate is not proof of copyright permission.

## Autonomous workflow outline

1. Discover candidate sources and extract structured claims with exact source locators.
2. Normalize claims, model identity, units, configuration scope and source metadata.
3. Verify source authority and claim applicability; seek independent corroboration for high-impact facts.
4. Detect contradictory values, stale evidence, duplicates and missing provenance.
5. Generate a draft page with field-level evidence links.
6. Run deterministic schema, security, quality, provenance and rights gates.
7. Publish only when all hard gates pass; otherwise retry, request specialist verification, or quarantine.
8. Persist immutable decision events and page/data version identifiers.
9. Revalidate on schedule and on source changes, licence revocation, takedown, broken links or reported errors.
10. Roll back or unpublish affected assets when a previously passed hard gate becomes invalid.

## Security boundaries

- Discovery, extraction, generation and verification are separate capabilities.
- A generator cannot approve its own final result.
- A media discovery adapter cannot grant rights.
- A source's trust tier does not prove every claim on that source.
- High-impact safety, legal, financial and machine-capability claims require stricter evidence and may remain in exception review.
- No automatic merge or deletion based solely on fuzzy similarity.
- Every automated decision must be reproducible from versioned rules and evidence references.

## Next implementation sequence

1. Map existing data audit, evidence matching, media rights and review-decision formats to one page-level readiness contract.
2. Implement a pure, deterministic publication-readiness evaluator that only consumes those existing outputs; no network, LLM or file mutation in the evaluator.
3. Add tests for each hard gate, contradictory evidence, stale evidence, missing licence scope, duplicate uncertainty, malformed reports and safe quarantine.
4. Add append-only readiness decision records and page/version linkage.
5. Connect scheduling/retries only after the gate is validated and a durable, free-compatible runtime is selected.
6. Integrate source monitoring and automated rollback after decision history and versioning are reliable.

## Explicitly not done

- No candidate repository has been cloned or integrated.
- No new dependency has been added.
- No hosted service, paid API, paid infrastructure or deployment has been enabled.
- No automatic publication has been activated.
- No claim is made that an AI system can guarantee 100% factual accuracy or legal rights.

## References

- OpenLineage: https://github.com/OpenLineage/OpenLineage
- Dagster: https://github.com/dagster-io/dagster
- Prefect: https://github.com/PrefectHQ/prefect
- Temporal: https://github.com/temporalio/temporal
- Open Policy Agent: https://github.com/open-policy-agent/opa
- Haystack: https://github.com/deepset-ai/haystack
- DeepEval: https://github.com/confident-ai/deepeval
- Evidently: https://github.com/evidentlyai/evidently
- Dedupe: https://github.com/dedupeio/dedupe
- Apache Airflow: https://github.com/apache/airflow
- Cleanlab: https://github.com/cleanlab/cleanlab
- Crawl4AI: https://github.com/unclecode/crawl4ai
