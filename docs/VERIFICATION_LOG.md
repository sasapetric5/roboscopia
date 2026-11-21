# Verification Log

## Phase 0 baseline — 21 November 2026

### Repository and CI

- Repository: [sasapetric5/roboscopia](https://github.com/sasapetric5/roboscopia)
- Primary branch: `main`
- Baseline HEAD observed before Phase 0 edits: `4aa338071f00968fe4519ae292fdb0896e21567a`
- Latest observed workflow run before Phase 0 edits: [run #196](https://github.com/sasapetric5/roboscopia/actions/runs/44947691979)
- Workflow: ROBOSCOPIA Data Quality
- Run result: **success** (completed 21 November 2026, 20:45 UTC)
- Run commit: `4aa338071f00968fe4519ae292fdb0896e21567a`
- Important: this workflow run predates the Phase 0 commits and does not certify them. A new run must complete against the final Phase 0 HEAD.

### Data and public-claim boundary

- Catalog: 7 model records.
- Manufacturer records: 5.
- Source registry: 17 source entries in the current data file; the public counter must be computed from the data rather than hardcoded.
- Specification claims: 39; the recorded status is `source_linked_unverified`.
- Source URLs being present does not establish that each exact specification claim has been checked.
- No factual verification is asserted by this log.

### Cloudflare Pages publication

- Known public addresses: `https://roboscopia.com` and `https://roboscopia-dpw.pages.dev/index.html`.
- The exact currently published commit and whether it equals `main` were **not independently confirmed** during this verification pass. Owner/dashboard confirmation is required.
- No deploy was initiated by this work.

### Mobile and accessibility checks

- `index.html`: not yet physically smoke-tested on mobile during this pass.
- `knowledge-base.html`: not yet physically smoke-tested on mobile during this pass.
- `robot-profile.html`: not yet physically smoke-tested on mobile during this pass.
- Keyboard, screen-reader and accessibility checks: pending.
- These checks are not marked passed merely because responsive CSS or semantic markup exists.

### Phase 0 implementation progress

Changes applied directly to main:

- README summary, live CI badge, project-status wording and deployment-claim correction.
- Homepage English/Serbian copy aligned with the currently available 7-profile Knowledge Base.
- Knowledge Base no longer says source-verified or Manufacturer source checked.
- Manufacturer and source counters are calculated from data/robots.json. The current source registry contains 17 entries (not the earlier planning document's 15).
- Added a CI guard that fails if either prohibited verification phrase appears in an HTML file.
- Added docs/ENGINEERING_RULES.md, docs/DEMO_DEPLOY_CHECKLIST.md and this verification log.

Phase 0 commits (all on main):

- 462e5c932c98776a4bbdfabfe27b985e0f89ea68 — homepage claims
- 292811fcf346443f73678b9c6afcc8e8612fc011 — knowledge-base verification language
- 01c9e23deb69839388983cfaebf315198340fdac — README restructuring
- 10feb2a9ecc70ef67c5a4fb84dc3c9b295ff70d2 — engineering rules
- 2fffd57f29879ba839cf089666c22a4c4cbbc0c1 — demo checklist
- 7382d482a32013d58b42d5460509503ea72e4c84 — verification log
- d952ea9642b04bddec2e92a7a4799ae962319620 — catalog-derived counters
- 1bee4890c06f2936227709b7e419d667e9dc7aef — CI public-claim guard
- a59c8b2b05e4ff6ad85fd10b62dc18d132aae517 — homepage fallback copy
- 9e77863d6801337feef5b6d224f1a4a6f2f9e60e — README CI badge and deployment status correction

The first new workflow attempts were cancelled by the workflow's cancel-in-progress concurrency policy while the rapid sequential commits were landing. The pre-Phase-0 successful run above does not certify these changes. A fresh, non-cancelled run against the final HEAD is still required.

Do not mark the phase complete until the CI run for the final HEAD is green and the outstanding browser/device checks have actual results.
