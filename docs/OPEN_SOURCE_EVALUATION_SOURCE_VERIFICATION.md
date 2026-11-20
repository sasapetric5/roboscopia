# Source Verification Engine — open-source discovery and evaluation

## Scope

Discovery covered 12 repositories across schema validation, source-link checking, factual support, citation extraction, data provenance and data-quality tooling. Repository metadata and selected manifests were inspected. This was a compatibility and supply-chain screening, not a complete security audit or exhaustive code review of all 12 projects.

## Candidate register

| Repository | License / status | Relevant capability | Decision |
|---|---|---|---|
| [Ajv](https://github.com/ajv-validator/ajv) | MIT; active; TypeScript; package manifest inspected | JSON Schema validation | Strong future candidate for structural schema validation. Not imported now; current engine needs domain-specific source-to-claim checks, and no dependency tree is being added without need. |
| [lychee](https://github.com/lycheeverse/lychee) | Apache-2.0; active; Rust; Cargo manifest inspected | Fast link checking | Best candidate for a future scheduled URL reachability job. Not run in current CI; no binary install or external URL probes are triggered automatically. |
| [broken-link-checker](https://github.com/stevenvachon/broken-link-checker) | MIT; active; JavaScript; package manifest inspected | HTML links, redirects and page links | Relevant, but its manifest includes many dependencies and Git-hosted packages; not selected for the small source registry. |
| [markdown-link-check](https://github.com/tcort/markdown-link-check) | ISC; active; JavaScript; package manifest inspected | Markdown link checking | Useful for docs, not for claim-level technical evidence; introduces multiple dependencies. |
| [MiniCheck](https://github.com/Liyan06/MiniCheck) | Apache-2.0; last observed push 2025-08-27; Python | Model-based claim verification against documents | Research candidate only. Requires PyTorch/Transformers/datasets and is not a deterministic replacement for a human checking model, generation, configuration and page/table evidence. |
| [TabFact](https://github.com/wenhuchen/Table-Fact-Checking) | MIT; last observed push 2023-09-19; Python | Table fact-checking research dataset/code | Research reference, not a production source-verification engine. Older activity and research-specific setup. |
| [CitationExtractor](https://github.com/mromanello/CitationExtractor) | GPL-3.0; last observed push 2021-06-23 | Bibliographic citation extraction | Not selected: old activity, GPL obligations and focus on scholarly references rather than technical product claims. |
| [ProvToolbox](https://github.com/lucmoreau/ProvToolbox) | GitHub API returned NOASSERTION; active; Java/Maven manifest inspected | W3C PROV data model and provenance tooling | Conceptually relevant, but license needs clarification and Java/Maven stack is disproportionate for this JSON/Node application. |
| [Flowcept](https://github.com/ORNL/flowcept) | MIT; active; Python; pyproject inspected | Workflow provenance and observability | Useful architectural reference, but Python runtime and optional infrastructure adapters are not needed for current claim-level review. |
| [DQX](https://github.com/databrickslabs/dqx) | License metadata not asserted; active; Python | Data quality checks | Not selected: Databricks/PySpark-oriented and license must be reviewed before adoption. |
| [Frictionless](https://github.com/frictionlessdata/frictionless-py) | MIT; active; Python; pyproject inspected | Dataset/schema/package validation | Useful future option for bulk datasets; broader Python dependency set and tabular focus do not match the present per-spec JSON workflow. |
| [W3C Link Checker](https://github.com/w3c/link-checker) | License not confirmed in this screening; last observed push 2025-10-01; Perl | Web link and anchor validation | Useful reference but Perl/CGI setup is not a good fit for current Node.js pipeline. |

Activity dates and license observations are discovery-time snapshots. Recheck the current license files, notices, dependency trees and repository activity before adopting any project. A GitHub API license field of `NOASSERTION` or missing metadata must not be treated as an open-source license grant.

## Six-stage delivery record

1. **Discover** — identified 12 candidates across the relevant problem areas.
2. **Evaluate** — checked metadata and selected manifests; recorded license, maintenance, runtime and dependency concerns. A full security audit of all candidate source trees was not performed.
3. **Reuse** — reused the architectural ideas of explicit provenance, schema validation and link reachability, but did not vendor or install third-party code. No dependency or recurring service was added.
4. **Adapt** — implemented a dependency-free Node.js engine with stable claim IDs, source-to-claim mapping, evidence locators, reviewer decisions and optional manual HTTP HEAD checks.
5. **Verify** — added automated tests and a CI step for report generation. CI intentionally does not perform live URL requests.
6. **Deliver** — source-verification engine, decision recorder, separate decision store, tests and documentation are on the single `main` branch. Production deployment remains paused.

## Why the first implementation is conservative

A manufacturer's domain is only an authority candidate, not proof that a particular value is supported. A live HTTP response proves reachability at that moment, not that the page contains the claimed specification. A human review must identify the exact evidence location (for example, PDF page/table, manual section, product variant) and record the conclusion.

## Future adoption gates

- Adopt Ajv only after the catalog JSON Schema is versioned and tested; review transitive dependencies first.
- Consider lychee for a separate opt-in/scheduled link-check job with rate limits and domain allowlists.
- Consider W3C PROV-compatible export only when lineage consumers and a concrete interoperability requirement exist.
- Do not introduce LLM fact-checking as an automatic approval path. Any model-assisted extraction must remain a suggestion and require human evidence review.
