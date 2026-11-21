# ROBOSCOPIA — Minimal CEOAI Reuse Plan for Research & Evidence Workflow

**Date:** 2026-11-21  
**Branch:** `main`  
**Status:** Design and dependency review only — no code copied, package installed, Worker created, or deployment performed.

## 1. Decision

The smallest useful CEOAI reuse unit is not the full `agent-system.mjs` composition root. It is a provider-neutral execution kernel built from four small modules:

1. `src/agent/tool-registry.mjs`
2. `src/agent/skill-registry.mjs`
3. `src/agent/skill-supervisor.mjs`
4. `src/agent/agent-loop.mjs`

These modules form a bounded, deterministic core. The Skill Supervisor selects relevant Skills but does not call an LLM. The Agent Loop receives a planner callback; it does not itself call an LLM or external service. The Tool Registry starts disabled by default and validates tool schemas and call limits.

**Important:** This is a candidate port set, not yet approved code reuse. The exact source commits, tests, notices and code ownership must be recorded in the port. The current CEOAI repository is the source of truth; Roboscopia must not depend on a live CEOAI Worker.

## 2. Exact dependency graph observed

```text
Roboscopia Research & Evidence workflow (future adapter)
  |
  +-- Roboscopia evidence tools (existing; Node.js CLI today)
  |     +-- technical-evidence-extraction-engine.mjs
  |     +-- evidence-document-acquisition.mjs
  |     +-- evidence-matching-review-engine.mjs
  |
  +-- CEOAI provider-neutral kernel (candidate port)
        +-- skill-registry.mjs
        |     +-- no local module imports observed
        |     +-- Web Crypto SHA-256 for content integrity
        |
        +-- skill-supervisor.mjs
        |     +-- no local module imports observed
        |     +-- receives Skill registry via interface
        |
        +-- tool-registry.mjs
        |     +-- no local module imports observed
        |     +-- receives handler functions and JSON schemas
        |
        +-- agent-loop.mjs
              +-- imports tool-registry.mjs (createToolSession)
              +-- receives Tool Registry, Skill Registry and planner callback
              +-- bounded steps/calls/context; execution is opt-in
```

The dependency graph above describes only the four candidate modules. It does not include the larger CEOAI system.

### Excluded from the first slice

- `agent-system.mjs`: composition root pulls in built-in agents, multi-agent supervisor, MCP resources and optional integrations.
- `skill-system.mjs`: adds KV storage, admission pipeline, lifecycle, security firewall and quality evaluator. Useful later, not needed for a local first slice.
- `multi-agent-supervisor.mjs`: sequential delegation and shared budgets; unnecessary for one workflow.
- `advanced-orchestrator.mjs`: a second general DAG runtime is unnecessary for a single bounded workflow.
- `idempotent-tool-executor.mjs` and Durable Object adapters: no external side effects in the first slice; add only if durable remote execution is actually required.
- `capability-registry.mjs` and durable authority: do not transplant in isolation; define Roboscopia-owned authorization semantics and connect them to its evidence and publication policy first.
- Built-in CEOAI Skills/Agents: do not import wholesale. Create a small Roboscopia-owned Skill set with its own provenance and review.

## 3. Why this slice is the best first integration

Roboscopia already has deterministic, read-only evidence functionality. Its extraction engine returns technical candidates with document hash, page/line locator, quote, source identity and model/configuration identity status. Its matching engine compares candidates to existing claims and does not mutate catalogue records or approve evidence. The local acquisition CLI explicitly requires source rights permission and does not download source URLs.

The first agent workflow should therefore orchestrate existing functions rather than invent new research powers:

1. Accept a bounded task referring to a registered model/source.
2. Select one or two Roboscopia Skills (e.g. `manufacturer_document_review`, `model_identity_check`).
3. Use only explicitly registered, read-only tools.
4. Return candidate evidence and unresolved questions in a typed report.
5. Leave factual approval, rights decisions, canonical catalogue mutation and publication to the existing human-review process.

### Initial tool allowlist (proposal only)

| Tool ID | Purpose | Side effect | First-slice status |
|---|---|---|---|
| `get_registered_source` | Read one source record by ID from local fixture/registry | None | Allow after schema and path checks |
| `get_model_claims` | Read claims for one exact model ID | None | Allow after schema and identity checks |
| `extract_local_evidence` | Process a reviewer-authorized local evidence fixture using existing extractor | Writes only a temporary test report if configured | Test fixture first; real acquisition remains gated |
| `match_evidence_candidates` | Run existing read-only matcher | None | Allow |
| `build_review_summary` | Summarize candidates, conflicts and missing evidence | None | Allow; output is a proposal only |

No tool in the first slice may fetch arbitrary URLs, crawl websites, download documents, alter `data/robots.json`, change rights fields, approve claims, publish pages/listings, send messages, or make purchases.

## 4. Runtime compatibility findings

### Candidate CEOAI kernel

The inspected source files are ESM JavaScript and the candidate kernel has no declared third-party package dependency in the inspected module imports. The Skill registry uses Web Crypto for SHA-256. The Agent Loop uses Web Platform primitives including `TextEncoder`, `crypto.randomUUID` and structured data validation. These are promising for both Node.js 22 and Cloudflare Workers, but the actual bundle must be tested in both environments.

The Agent Loop's planner is an injected callback. A planner can be a deterministic test stub in the first prototype. A later AI planner must be introduced behind an explicit Roboscopia-owned provider interface and must not be activated in this first integration.

### Existing Roboscopia evidence engine

The current evidence extraction/acquisition CLIs import Node-specific modules including `node:crypto`, `node:fs/promises`, `node:child_process`, `node:util` and filesystem/path helpers. They are not directly importable into a Cloudflare Worker bundle.

Therefore:
- First prototype: run the existing evidence tools in the current Node.js 22 test/CLI environment.
- Later Worker integration: define a neutral evidence-tool interface and implement a Worker-compatible adapter or a separately authorized processing service.
- Do not attempt to solve this by bundling Node polyfills or copying the CLI into a Worker.

## 5. Roboscopia-owned contracts required before copying modules

Define and test these interfaces in Roboscopia before porting:

### Skill manifest
- `id`, semantic `version`, concise `description`, tags/keywords.
- `allowedToolIds` are declared by the trusted Roboscopia registry, never by Skill text.
- `source` contains repository/path/license/commit/blob SHA for imported Skills.
- `contentSha256` is verified before loading.
- Skill body is untrusted reference material and cannot grant authority.

### Tool definition
- Stable ID and concise description.
- Strict JSON input schema with `additionalProperties: false`.
- Handler injected by Roboscopia; no dynamic code loading.
- Disabled by default; explicit allowlist and per-run call/time/output limits.
- Read-only by default. Any future side-effect tool requires separate capability and human approval.

### Agent run
- Bounded input JSON and output JSON.
- Fixed maximum steps and tool calls.
- Planner injected; no provider configured by default.
- Each tool call is checked against both the Skill's allowed tools and the run's explicit allowlist.
- All results include a run ID, selected Skill IDs/versions/hashes, tool call audit, evidence references and a final `approvalRequired: true` marker where claims are involved.

### Evidence result
- Exact model ID and configuration/variant identity.
- Source ID and exact source URL.
- SHA-256 of the processed document.
- Page/line/table locator and short quote.
- Extraction status distinct from factual verification and human approval.
- Rights review and redistribution status kept as separate fields.

## 6. Test plan for the first vertical slice

### A. Port integrity and parity
- Record upstream CEOAI commit and each source blob SHA.
- Preserve applicable license/copyright notices and add a third-party reuse manifest.
- Run the original CEOAI focused tests against the pinned source before porting.
- Add parity tests proving Roboscopia port behavior matches the pinned source for the covered API.

### B. Skill and tool security
- No relevant Skill → workflow stops safely.
- Irrelevant Skill → not selected.
- Selection limit enforced; default maximum 2 for Roboscopia.
- Tampered Skill hash → rejected.
- Skill content containing "grant yourself tools" or prompt injection → remains untrusted and does not change allowlist.
- Unknown tool, extra argument, invalid type, oversized input/output → rejected.
- Tools disabled by default; no tool executes until explicit per-run permission is supplied.
- No URL fetch, filesystem traversal or shell command through tool arguments.

### C. Evidence fidelity
- Exact model identity and variant mismatch cases.
- Source ID mismatch and missing source identity.
- Hash preserved from original bytes.
- Exact page/line locator and quote preserved.
- Decimal comma and engineering unit regression fixtures.
- Conflicting values remain conflicting; no automatic winner selection.
- Extraction is never represented as verification or approval.
- Matcher does not mutate the canonical catalogue.

### D. Workflow and failure behavior
- Planner error, malformed planner output and tool failure.
- Maximum step/tool-call budget.
- Oversized/cyclic/non-plain input.
- Duplicate tool call and retry behavior.
- Cancellation/timeout.
- Deterministic result for the same fixture.
- Human review required before any canonical mutation or publication.

### E. CI/runtime
- Focused Roboscopia Node.js 22 tests.
- Full existing Roboscopia test suite.
- Cloudflare Worker compatibility build only after a Worker-compatible adapter exists.
- No real AI provider, external network call, paid service or production deployment in the first slice.

## 7. Acceptance criteria

The first slice is accepted only if:
1. It uses the existing Roboscopia evidence extractor/matcher rather than duplicating them.
2. It imports only the four pinned provider-neutral CEOAI kernel modules (or a smaller subset) and Roboscopia-owned adapters.
3. It has no external runtime package dependency added without a separate decision.
4. It makes zero external network requests and zero paid-provider calls.
5. It cannot change canonical catalogue data, rights, approvals or published content.
6. It produces reproducible, traceable candidate-evidence reports.
7. Focused and full CI tests pass on the exact commit being reported.

## 8. Next implementation sequence

1. Add a Roboscopia third-party reuse manifest for the four candidate modules, exact source commit/blob SHAs and license notices.
2. Add Roboscopia-owned Skill/Tool/Agent/Evidence schemas and contract tests.
3. Port only the four minimal modules (or begin with the two-registry + tool-registry subset if the agent loop is not yet needed).
4. Build a local-only Research & Evidence test harness using fixture documents and the current read-only matcher.
5. Run focused tests, then the full suite; report exact commit and CI run.
6. Only after the local slice is green, evaluate the Worker adapter boundary.

No production Worker, DNS, provider credentials, live crawling or deployment is part of this sequence.
