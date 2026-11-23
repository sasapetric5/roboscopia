# Publication Readiness Engine

The deterministic page-level gate is implemented in `scripts/publication-readiness-engine.mjs`.

## Required gates

1. `content`
2. `facts`
3. `provenance`
4. `media_rights`
5. `seo`
6. `internal_links`
7. `external_sources`
8. `security`
9. `duplicates`
10. `freshness`

Every gate must explicitly return one of:
- `passed`
- `needs_verification`
- `failed`
- `quarantine`

## Decision rules

- `publish`: every required gate explicitly passed.
- `needs_verification`: no hard failure exists, but one or more required reports are missing or require more evidence.
- `quarantine`: any hard failure or malformed gate status exists.

The decision is conjunctive. There is no average score, AI confidence score or SEO score capable of overriding a hard gate. Media rights are independent from factual verification. SEO and internal/external link integrity are mandatory gates.

## Current integration status

This is the page-level policy evaluator and stable decision envelope. It is deliberately pure: it does not fetch data, call an LLM, edit canonical records, approve licences, publish pages, or trigger deployments.

Existing audit and verification engines have different report formats. The next integration task is to write small, tested adapters that translate their reports into the ten explicit gate inputs. Until those adapters are complete, callers must not treat this evaluator alone as a complete production publication pipeline.

## Safety

- Missing gate reports never count as success.
- Invalid status values quarantine.
- The result records a stable SHA-256-derived decision ID, policy version, gate statuses and reason codes.
- `catalogMutationAllowed` and `publicationActionPerformed` remain false.
