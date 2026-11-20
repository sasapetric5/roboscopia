import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildSourceVerificationReport,
  checkUrlHead,
} from "../scripts/source-verification-engine.mjs";
import {
  createSourceDecision,
  validateSourceDecision,
} from "../scripts/record-source-decision.mjs";

const db = JSON.parse(await readFile(new URL("../data/robots.json", import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);

test("engine creates one provenance-linked claim for each specification", () => {
  const report = buildSourceVerificationReport(db);
  const expected = db.records.reduce((total, record) => total + (record.specifications?.length ?? 0), 0);
  assert.equal(report.claims.length, expected);
  assert.equal(report.counts.claims, expected);
  assert.ok(report.claims.every((claim) => claim.claimId.length === 24));
  assert.ok(report.claims.every((claim) => claim.sourceId));
});

test("claim IDs are stable for unchanged source-linked facts", () => {
  const first = buildSourceVerificationReport(db);
  const second = buildSourceVerificationReport(db);
  assert.deepEqual(first.claims.map((claim) => claim.claimId), second.claims.map((claim) => claim.claimId));
});

test("official manufacturer domain candidates are not treated as verified claims", () => {
  const report = buildSourceVerificationReport(db);
  const official = report.sources.find((source) => source.host === "bostondynamics.com");
  assert.ok(official);
  assert.equal(official.officialDomainCandidate, true);
  assert.equal(official.authorityAssessment, "manufacturer_domain_candidate_unreviewed");
  assert.ok(report.claims.every((claim) => claim.outcome === "pending"));
  assert.equal(report.policy.officialDomainIsNotClaimVerification, true);
});

test("review decisions are applied only to the matching claim and source", () => {
  const claim = buildSourceVerificationReport(db).claims[0];
  const decision = {
    claimId: claim.claimId,
    sourceId: claim.sourceId,
    outcome: "supported",
    evidenceLocator: "Manufacturer datasheet, page 3, section Technical data",
    note: "Value and unit match the specified model configuration.",
    reviewer: "technical-reviewer",
    reviewedAt: "2026-11-20T12:00:00.000Z",
  };
  const report = buildSourceVerificationReport(db, [decision]);
  const reviewed = report.claims.find((item) => item.claimId === claim.claimId);
  assert.equal(reviewed.outcome, "supported");
  assert.equal(reviewed.reviewedBy, "technical-reviewer");
  assert.equal(report.counts.supported, 1);
});

test("decision validation rejects missing evidence, reviewer and mismatched source", () => {
  const report = buildSourceVerificationReport(db);
  const claim = report.claims[0];
  const errors = validateSourceDecision({
    claimId: claim.claimId,
    sourceId: "wrong-source",
    outcome: "supported",
    evidenceLocator: "",
    note: "",
    reviewer: "",
    reviewedAt: "not-a-date",
  }, report);
  assert.ok(errors.length >= 5);
});

test("decision recorder accepts a valid, evidence-located review", () => {
  const report = buildSourceVerificationReport(db);
  const claim = report.claims[0];
  const decision = createSourceDecision({
    claimId: claim.claimId,
    sourceId: claim.sourceId,
    outcome: "partially_supported",
    evidenceLocator: "Official manual, page 12, table 2",
    note: "The value matches, but the document describes a different software revision.",
    reviewer: "technical-reviewer",
    reviewedAt: "2026-11-20T12:00:00.000Z",
  }, report);
  assert.equal(decision.outcome, "partially_supported");
});

test("invalid and non-HTTPS URLs are rejected without network access", async () => {
  assert.deepEqual(await checkUrlHead("http://example.com"), {
    status: "not_checked",
    reason: "HTTPS_REQUIRED",
  });
  assert.deepEqual(await checkUrlHead("https://localhost"), {
    status: "not_checked",
    reason: "NON_PUBLIC_OR_INVALID_HOST",
  });
});

test("engine does not mutate canonical catalog records", () => {
  const changed = clone(db);
  const before = JSON.stringify(changed);
  buildSourceVerificationReport(changed);
  assert.equal(JSON.stringify(changed), before);
});

test("unmatched and invalid decisions are ignored, not silently approved", () => {
  const report = buildSourceVerificationReport(db, [{
    claimId: "unknown",
    sourceId: "src-0001",
    outcome: "supported",
    evidenceLocator: "p. 1",
    note: "Reviewed",
    reviewer: "reviewer",
    reviewedAt: "2026-11-20T12:00:00.000Z",
  }]);
  assert.equal(report.ignoredDecisionCount, 1);
  assert.ok(report.claims.every((claim) => claim.outcome === "pending"));
});
