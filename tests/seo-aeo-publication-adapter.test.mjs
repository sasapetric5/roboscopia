import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCrawlieReport,
  evaluateCrawliePageReadiness,
  createSafeRepairPlan
} from "../scripts/seo-aeo-publication-adapter.mjs";

const report = {
  config: { url: "https://roboscopia.com/" },
  summary: { total_pages: 2, errors: 1, warnings: 1, health_score: 91, geo_score: 78 },
  pages: [
    { url: "https://roboscopia.com/", status: 200, indexable: true },
    { url: "https://roboscopia.com/robot-profile.html?id=spot", status: 200, indexable: true }
  ],
  issues: [
    { rule: "title-missing", title: "Missing title", category: "titles-meta", severity: "error", url: "https://roboscopia.com/" },
    { rule: "broken-link", title: "Broken internal link", category: "links", severity: "warning", url: "https://roboscopia.com/robot-profile.html?id=spot" }
  ]
};

test("normalizes Crawlie issues into page-scoped publication gates", () => {
  const result = normalizeCrawlieReport(report);
  assert.equal(result.pages.length, 2);
  assert.equal(result.pages[0].gates.seo.status, "failed");
  assert.equal(result.pages[1].gates.internal_links.status, "needs_verification");
  assert.equal(result.pages[0].gates.facts.status, "needs_verification");
  assert.equal(result.catalogMutationAllowed, false);
});

test("the existing publication engine remains the final conjunctive gate", () => {
  const result = normalizeCrawlieReport(report);
  const decision = evaluateCrawliePageReadiness(result.pages[0]);
  assert.equal(decision.decision, "quarantine");
  assert.equal(decision.publishEligible, false);
  assert.equal(decision.publicationActionPerformed, false);
});

test("a clean crawl does not independently approve facts, provenance or media rights", () => {
  const clean = normalizeCrawlieReport({
    config: { url: "https://roboscopia.com/" },
    pages: [{ url: "https://roboscopia.com/", status: 200, indexable: true }],
    issues: []
  });
  assert.equal(clean.pages[0].gates.seo.status, "passed");
  const decision = evaluateCrawliePageReadiness(clean.pages[0]);
  assert.equal(decision.decision, "needs_verification");
  assert.equal(decision.publishEligible, false);
});

test("rejects external URLs and malformed reports instead of trusting arbitrary crawl input", () => {
  assert.throws(() => normalizeCrawlieReport({ config: { url: "https://example.org" }, pages: [], issues: [] }), /approved ROBOSCOPIA/);
  assert.throws(() => normalizeCrawlieReport({ config: { url: "https://roboscopia.com" }, pages: [], issues: [{ rule: "x", severity: "unknown", url: "https://roboscopia.com/" }] }), /invalid URL, rule or severity/);
});

test("proposes a title only from canonical model and manufacturer fields", () => {
  const plan = createSafeRepairPlan({
    issue: { rule: "title-missing" },
    canonicalRecord: { id: "spot", model: "Spot", manufacturer: "Boston Dynamics" }
  });
  assert.equal(plan.proposals[0].value, "Spot — Boston Dynamics | ROBOSCOPIA");
  assert.equal(plan.executionMode, "proposal_only");
  assert.equal(plan.catalogMutationAllowed, false);
});

test("does not invent missing descriptions or facts", () => {
  const plan = createSafeRepairPlan({
    issue: { rule: "meta-description-missing" },
    canonicalRecord: { id: "unknown-robot", model: "Unknown" }
  });
  assert.equal(plan.proposals.length, 0);
  assert.equal(plan.requiresPostRepairCrawl, false);
});
