# Verification Log

## Phase 0 baseline — 21 November 2026

### Repository and CI

- Repository: [sasapetric5/roboscopia](https://github.com/sasapetric5/roboscopia)
- Primary branch: `main`
- Baseline HEAD observed before Phase 0 edits: `4aa338071f00968fe4519ae292fdb0896e21567a`
- Pre-Phase-0 workflow run: [run #196](https://github.com/sasapetric5/roboscopia/actions/runs/44947691979), successful on the baseline commit only.
- Final Phase-0 implementation commit checked by CI: `cee49e98318314f86ccfb0648fd32e80d14ed941`
- Final Phase-0 workflow run: [run #208](https://github.com/sasapetric5/roboscopia/actions/runs/44949209148)
- Result: **success**, completed 21 November 2026 at 21:03:59 UTC. All 23 substantive workflow steps completed successfully.
- Full Node test suite: **169 passed, 0 failed**.
- The public verification-claim guard passed.
- Parser adapters compiled; evidence registry integrity audit and both CLI help checks passed.
- Two earlier rapid-push runs were cancelled by the workflow's `cancel-in-progress` policy. They are superseded by successful run #208 and are not counted as failures of the final commit.

### Parser benchmark — synthetic fixture only

- All three engines executed successfully: Poppler, OpenDataLoader 2.5.23 and Docling 2.151.1.
- One explicitly permitted synthetic PDF fixture, two pages.
- All engines matched 5/5 expected evidence snippets and 4/4 expected table rows (100% recall on this fixture).
- Docling execution took approximately 107.9 seconds; OpenDataLoader approximately 0.7 seconds; Poppler approximately 0.04 seconds.
- This is a pipeline smoke/benchmark result only. It does **not** establish production-document accuracy or real-world extraction quality.
- The benchmark did not mutate the catalog.

### Data and public-claim boundary

- Catalog: 7 model records.
- Manufacturer records: 5.
- Source registry: 17 source entries.
- Specification claims: 39; recorded status remains `source_linked_unverified`.
- Source URLs being present does not establish that each exact specification claim has been checked.
- No factual verification is asserted by this log.

### Phase 1 evidence-readiness snapshot — run #208

The generated audit artifacts were downloaded and inspected. The computed readiness status is **BLOCKED_NO_EVIDENCE**:

- Catalog audit: 0 errors, 17 warnings.
- Open review items: 24 (all medium priority).
- Sources: 17; claims: 39.
- Evidence packages: 0; extracted evidence candidates: 0.
- Claims without matching evidence: 39.
- Automatically eligible claims: 0; quarantined claims: 39.
- Source-review warning breakdown: 17 `SOURCE_NOT_REVIEWED`.

This is a genuine content/evidence readiness gap, not a CI failure. The verification pipeline completed and correctly refused to approve claims without evidence. No source-page content was fetched by the source-verification report, and no catalog records were changed. Do not remove quarantine or create evidence decisions merely to make the readiness status green.

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
- Manufacturer and source counters are calculated from data/robots.json.
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

### Remaining Phase 0 gates

Do not mark Phase 0 fully complete until the outstanding browser/device checks have actual results and the owner confirms the currently published Pages commit. CI is green for the recorded commit, but these separate release gates remain open.
