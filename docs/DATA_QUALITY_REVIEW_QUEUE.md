# ROBOSCOPIA Data Quality Review Queue

## Purpose

The review queue turns each finding from `scripts/data-quality-audit.mjs` into a stable human-review task. It keeps the audit report, review status and reviewer decision separate from the canonical robot catalog.

## Generate the queue

```bash
node scripts/data-quality-review-queue.mjs
node scripts/data-quality-review-queue.mjs --json
```

The queue is generated from `data/robots.json` and `data/review-decisions.json`. It does not make network requests or modify the catalog.

## Queue item fields

Each item contains:
- stable SHA-256-derived item ID based on finding code, path and message;
- finding code, severity and review priority;
- current review status;
- exact data path and explanation;
- model identity context when the finding belongs to a model;
- source context when a source can be resolved;
- recorded decision and reviewer metadata, if present.

Priority is a triage aid, not a claim that a particular robot is unsafe or defective.

## Review statuses

- `open` — not yet reviewed.
- `in_review` — a reviewer has started checking the finding.
- `resolved` — the underlying data issue was corrected or supported by evidence.
- `accepted_risk` — a reviewer explicitly accepts a documented limitation; this is not the same as resolving it.
- `rejected` — the finding was examined and judged not to require a data change, with an explanation.

A note is mandatory when an item is closed, accepted as risk or rejected. The reviewer identity is required by the command-line recorder.

## Record a decision

First generate the queue in JSON mode and copy the exact item ID. Then use:

```bash
node scripts/record-review-decision.mjs <itemId> <status> "<note>" "<reviewer>"
```

Allowed decision statuses: `in_review`, `resolved`, `accepted_risk`, `rejected`.

Example (illustrative item ID only):

```bash
node scripts/record-review-decision.mjs 0123456789abcdef0123 in_review "Checking the manufacturer's primary documentation." "data-reviewer"
```

The recorder validates that the item exists in the current queue, requires a note for a final decision, and writes the decision to `data/review-decisions.json` using a temporary file followed by rename. Re-recording a decision for the same item updates that decision entry. It never edits `data/robots.json`.

## Current limitations and safeguards

- This is a local developer/reviewer workflow, not a deployed public review UI.
- There is no user authentication, multi-reviewer permission model, approval signature or audit-log service yet.
- Decisions are stored in a JSON file in Git; do not put personal or confidential reviewer information in it.
- The queue is regenerated from current audit findings. If a finding's code, path or message changes, its stable item ID may change.
- The queue does not fetch external URLs, establish factual correctness, or automatically resolve findings.
- A `resolved` decision is a review record, not an automatic assertion that the catalog is correct. A reviewer must make any catalog edit separately and rerun the audit.

## Commands and tests

```bash
node scripts/data-quality-audit.mjs --json
node scripts/data-quality-review-queue.mjs --json
node --test tests/*.test.mjs
```

The test suite covers queue generation, stable IDs, context and priority, non-mutation of canonical data, status validation and decision creation. Tests must be executed in Node.js before this workflow is treated as verified.
