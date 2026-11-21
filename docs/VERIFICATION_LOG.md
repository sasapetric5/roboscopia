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

### Phase 0 implementation note

Record each subsequent Phase 0 commit and its matching Actions run here. Do not mark the phase complete until the CI run for the final HEAD is green and the outstanding browser/device checks have actual results.
