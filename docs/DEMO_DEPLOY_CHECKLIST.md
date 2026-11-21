# Public Demo Deployment Checklist

**Status: preparation only — no deployment action authorized by this checklist.**

## Current deployment boundary

- [ ] Owner has explicitly approved a production deployment.
- [ ] Confirm the exact commit intended for publication and verify it is on `main`.
- [ ] Confirm the Cloudflare Pages project and production branch settings with the owner.
- [ ] Record the currently published production commit and compare it with `main`.
- [ ] Confirm the preview URL and custom-domain behavior without changing DNS.

## Cloudflare Pages settings to verify

- Framework preset: **None / static HTML** unless the project configuration proves otherwise.
- Build command: verify from the existing Pages project; do not invent or change it during Phase 0.
- Build output directory: verify the configured static output directory against the repository root and existing project settings.
- Production branch: `main`.
- Environment variables: inspect names and exposure; no secrets belong in client-side variables.
- Automatic production deployments: leave disabled until the owner explicitly approves enabling them.
- Do not create or enable R2 buckets, public endpoints, paid add-ons, Workers or other billable resources.

## Pre-enable verification gates

- [ ] Mobile smoke test on a narrow viewport for `index.html`, `knowledge-base.html` and `robot-profile.html`.
- [ ] Keyboard-only navigation and visible focus check.
- [ ] Screen-reader/semantic structure spot check; labels, headings, landmarks and image alternatives.
- [ ] Verify language switching and core catalog search/filter/compare interactions.
- [ ] Confirm no secrets, private tokens or credentials are present in public files or build output.
- [ ] Confirm no active R2 endpoint or bucket reference is required for the demo; current R2 media resolver must remain disabled unless separately approved.
- [ ] Check browser console and network failures on the three pages.
- [ ] Confirm all public factual claims match the catalog and evidence audit; source-linked is not the same as verified.
- [ ] Confirm media publication rights before adding photographs, video or documents.

## Approval

The repository owner must explicitly approve:
1. the exact commit;
2. enabling automatic production deployments, if desired;
3. any production publish action;
4. any DNS, domain, R2 or paid-service change.

Until then, keep this checklist as preparation only. A successful CI run is not deployment approval.
