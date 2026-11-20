# Data Quality component — open-source discovery and evaluation

## Scope and decision

Discovery covered 12 candidate repositories across JSON Schema validation, data profiling/quality, record linkage, and analytical data systems. The initial evaluation checked repository metadata (license, maintenance/activity, project scope) and inspected package/build manifests for selected JavaScript/Python candidates. This was a suitability screen, not a full security audit of every dependency or source file.

**Decision:** no third-party code or dependency is imported in the first audit implementation. The current catalog is a small JSON dataset and the audit can run with Node.js built-ins. Adding a large runtime or language toolchain would increase supply-chain and deployment complexity without a demonstrated benefit.

## Candidate register

| Project | License | Observed activity / status | Fit decision |
|---|---|---|---|
| [Ajv](https://github.com/ajv-validator/ajv) | MIT | Active; JSON Schema validator; package manifest inspected | Strong future candidate for formal JSON Schema validation. Not added yet: introduces runtime dependencies and the current task first needs domain-specific cross-reference/provenance rules. |
| [JSON Schema Test Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite) | MIT | Active test corpus | Useful if/when a formal JSON Schema validator is adopted; it is a test suite, not a runtime validator. |
| [OpenRefine](https://github.com/OpenRefine/OpenRefine) | BSD-3-Clause | Active data-cleaning application | Useful for human-operated bulk cleanup; too large and UI-oriented to embed in the current static catalog audit. |
| [Frictionless Framework](https://github.com/frictionlessdata/frictionless-py) | MIT | Active Python data tooling | Useful for tabular datasets and package validation; current source is JSON model records and no Python runtime is configured. |
| [Dedupe](https://github.com/dedupeio/dedupe) | MIT | Active but last observed repository push was 2025-07-29; Python/Cython build extension inspected | Relevant for probabilistic entity resolution, but a heavyweight Python/Cython runtime is not justified for seven model records. Revisit for large-scale entity matching. |
| [Deequ](https://github.com/awslabs/deequ) | Apache-2.0 | Active; Spark-based data quality library | Designed for distributed Spark datasets; excessive infrastructure for the current JSON catalog. |
| [DuckDB](https://github.com/duckdb/duckdb) | MIT | Active analytical database engine | Strong future analytics option, but not a focused validator and unnecessary for the present audit. |
| [data-diff](https://github.com/datafold/data-diff) | MIT | Archived; last observed push 2024-05-17 | Rejected for new integration because the repository is archived. |
| [Zod](https://github.com/colinhacks/zod) | MIT | Active; TypeScript-first schema validation; package manifest inspected | Good candidate for a future TypeScript application layer, but current repo has no package manifest or TypeScript build. No dependency added. |
| [python-jsonschema](https://github.com/python-jsonschema/jsonschema) | MIT | Active | Mature Python JSON Schema implementation; not suitable as a direct dependency in the current Node-only audit. |
| [Typia](https://github.com/samchon/typia) | MIT | Active; TypeScript transformation-based validation | Potential fit for a future TypeScript build, but requires compile-time transformation and is not a drop-in zero-build validator here. |
| [TypeScript](https://github.com/microsoft/TypeScript) | Apache-2.0 | Active compiler/toolchain | Not a data-quality engine; adding a compiler solely for this audit is not justified. |

License and activity observations are discovery-time snapshots and should be rechecked before any future adoption. A license label is not a substitute for reviewing bundled assets, transitive dependencies, notices and actual usage obligations.

## Six-stage delivery record

1. **Discover** — identified 12 candidate projects in the relevant problem areas.
2. **Evaluate** — screened license, repository activity, scope and implementation/toolchain fit; inspected manifests for Ajv and Zod and the Cython build setup for Dedupe. A complete security audit of all candidates has not been performed.
3. **Reuse** — no external runtime code was imported because no candidate was proportionate to the current JSON/Node task.
4. **Adapt** — implemented a read-only, dependency-free Node.js audit using built-in modules.
5. **Verify** — added seven focused Node test cases. Execution is still pending in a Node.js environment; do not treat the tests as passed yet.
6. **Deliver** — audit script, tests and usage/policy documentation committed to the single `main` branch. Production deployment remains paused.

## Next evaluation gate

Before adopting Ajv or Zod, define a versioned JSON Schema for `data/robots.json`, test it against current records, inspect the complete dependency tree and license notices, and run tests in CI. Keep the domain-specific audit because generic schema validation cannot determine whether a source truly supports a technical claim, whether two model identities are the same, or whether media rights are cleared.
