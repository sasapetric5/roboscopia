import test from "node:test";
import assert from "node:assert/strict";
import { buildAutomatedVerificationReport } from "../scripts/automated-verification-engine.mjs";

const claim = { claimId: "claim-spot-speed", modelId: "spot", configurationId: "production", value: 1.6, unit: "m/s" };
const evidence = (overrides = {}) => ({
  claimId: claim.claimId, modelId: "spot", configurationId: "production",
  source: { sourceId: "manufacturer-1", url: "https://manufacturer.example/specs", authority: "manufacturer_primary", rights: { processingPermitted: true } },
  document: { sha256: "a".repeat(64), revision: "rev-2026-01", capturedAt: "2026-11-21T00:00:00.000Z" },
  extraction: { value: 1.6, unit: "m/s", quote: "Maximum speed: 1.6 m/s", locator: { type: "pdf", page: 4, bbox: [10, 20, 30, 40] }, parser: { name: "opendataloader-pdf", version: "2.5.23" } },
  ...overrides
});
const registrySource = (overrides = {}) => ({
  id: "manufacturer-1", url: "https://manufacturer.example/specs", authorityTier: "manufacturer_primary",
  reviewStatus: "verified", lastReviewedAt: "2026-11-21T00:00:00.000Z",
  rights: { processingPermitted: true, reviewedBy: "reviewer-1", reviewedAt: "2026-11-21T00:00:00.000Z", basis: "Written permission from rights holder" },
  ...overrides
});
const independent = (overrides = {}) => evidence({
  source: { sourceId: "independent-1", url: "https://independent.example/datasheet", authority: "independent_primary", rights: { processingPermitted: true } },
  document: { sha256: "b".repeat(64), revision: "edition-2026", capturedAt: "2026-11-21T00:00:00.000Z" },
  ...overrides
});
const independentRegistry = (id = "independent-1", url = "https://independent.example/datasheet", hostName = "independent.example") => ({
  id, url, authorityTier: "independent_primary", reviewStatus: "verified", lastReviewedAt: "2026-11-21T00:00:00.000Z",
  rights: { processingPermitted: true, reviewedBy: "reviewer-1", reviewedAt: "2026-11-21T00:00:00.000Z", basis: "Written permission from rights holder" }
});
const run = (packages, registry = [registrySource()], claims = [claim]) =>
  buildAutomatedVerificationReport({ claims, evidence: packages, sourceRegistry: registry, now: "2026-11-21T01:00:00.000Z" });

test("accepts one exact, rights-cleared manufacturer source only when registry approves it", () => {
  const report = run([evidence()]);
  assert.equal(report.decisions[0].status, "eligible_for_automatic_ingestion");
  assert.equal(report.counts.eligible, 1);
  assert.equal(report.decisions[0].catalogMutationAllowed, false);
});
test("quarantines evidence when the source is absent from the canonical registry", () => {
  const report = run([evidence()], []);
  assert.ok(report.decisions[0].issues.some(item => item.code === "SOURCE_NOT_REGISTERED"));
  assert.equal(report.decisions[0].status, "quarantined");
});
test("quarantines forged manufacturer authority when registry says secondary", () => {
  const report = run([evidence()], [registrySource({ authorityTier: "third_party_secondary" })]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "REGISTRY_SOURCE_AUTHORITY_UNAPPROVED"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "SOURCE_AUTHORITY_MISMATCH"));
});
test("quarantines URL mismatch even when source ID exists", () => {
  const report = run([evidence({ source: { ...evidence().source, url: "https://attacker.example/specs" } })]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "SOURCE_URL_REGISTRY_MISMATCH"));
});
test("quarantines unreviewed source registry entries", () => {
  const report = run([evidence()], [registrySource({ reviewStatus: "not_reviewed" })]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "SOURCE_NOT_REVIEWED"));
});
test("quarantines source without explicit registry processing permission", () => {
  const report = run([evidence()], [registrySource({ rights: { ...registrySource().rights, processingPermitted: false } })]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "REGISTRY_RIGHTS_NOT_CLEARED"));
});
test("requires rights reviewer, review date and permission basis", () => {
  const report = run([evidence()], [registrySource({ rights: { processingPermitted: true } })]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "REGISTRY_RIGHTS_REVIEWER_MISSING"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "REGISTRY_RIGHTS_REVIEW_DATE_INVALID"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "REGISTRY_RIGHTS_BASIS_MISSING"));
});
test("quarantines duplicate source IDs in canonical registry", () => {
  const report = run([evidence()], [registrySource(), registrySource({ url: "https://other.example" })]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "DUPLICATE_SOURCE_REGISTRY_ID"));
});
test("accepts two matching independent primary sources only when both registry entries approve them", () => {
  const second = independent({ source: { sourceId: "independent-2", url: "https://second-independent.example/specs", authority: "independent_primary", rights: { processingPermitted: true } } });
  const report = run([independent(), second], [independentRegistry(), independentRegistry("independent-2", "https://second-independent.example/specs")]);
  assert.equal(report.decisions[0].status, "eligible_for_automatic_ingestion");
});
test("quarantines a single independent source without corroboration", () => {
  const report = run([independent()], [independentRegistry()]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "INSUFFICIENT_INDEPENDENT_EVIDENCE"));
});
test("quarantines conflicting values and units", () => {
  const second = independent({ extraction: { ...independent().extraction, value: 2, unit: "km/h" } });
  const report = run([evidence(), second], [registrySource(), independentRegistry()]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "VALUE_CONFLICT"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "UNIT_CONFLICT"));
});
test("quarantines an extracted value absent from evidence quote", () => {
  const bad = evidence({ extraction: { ...evidence().extraction, quote: "Maximum speed: 1.8 m/s" } });
  const report = run([bad]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "QUOTE_VALUE_MISMATCH"));
});
test("does not accept numeric substring inside a larger value", () => {
  const bad = evidence({ extraction: { ...evidence().extraction, quote: "Maximum speed: 11.6 m/s" } });
  const report = run([bad]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "QUOTE_VALUE_MISMATCH"));
});
test("accepts decimal comma as quoted representation of a numeric value", () => {
  const localized = evidence({ extraction: { ...evidence().extraction, quote: "Maksimalna brzina: 1,6 m/s" } });
  assert.equal(run([localized]).decisions[0].status, "eligible_for_automatic_ingestion");
});
test("quarantines model and configuration mismatches", () => {
  const report = run([evidence({ modelId: "go2" }), independent({ configurationId: "edu" })], [registrySource(), independentRegistry()]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "MODEL_IDENTITY_MISMATCH"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "CONFIGURATION_MISMATCH"));
});
test("quarantines missing rights clearance and document fingerprint", () => {
  const bad = evidence({
    source: { sourceId: "manufacturer-1", url: "https://manufacturer.example/specs", authority: "manufacturer_primary", rights: { processingPermitted: false } },
    document: { sha256: "bad", revision: "rev", capturedAt: "2026-11-21T00:00:00.000Z" }
  });
  const report = run([bad]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "RIGHTS_NOT_CLEARED"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "INVALID_DOCUMENT_HASH"));
});
test("quarantines invalid URL and unsafe locator", () => {
  const bad = evidence({
    source: { sourceId: "manufacturer-1", url: "http://manufacturer.example/specs", authority: "manufacturer_primary", rights: { processingPermitted: true } },
    extraction: { ...evidence().extraction, locator: { type: "pdf", page: 0 } }
  });
  const report = run([bad]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "INVALID_SOURCE_URL"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "INVALID_EVIDENCE_LOCATOR"));
});
test("rejects non-standard HTTPS ports", () => {
  const bad = evidence({ source: { ...evidence().source, url: "https://manufacturer.example:8443/specs" } });
  const report = run([bad], [registrySource({ url: "https://manufacturer.example:8443/specs" })]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "INVALID_SOURCE_URL"));
});
test("does not count two independent sources on the same host", () => {
  const first = independent();
  const second = independent({ source: { sourceId: "independent-2", url: "https://www.independent.example/other", authority: "independent_primary", rights: { processingPermitted: true } } });
  const report = run([first, second], [independentRegistry(), independentRegistry("independent-2", "https://www.independent.example/other")]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "INSUFFICIENT_INDEPENDENT_EVIDENCE"));
});
test("quarantines duplicate source identity in evidence packages", () => {
  const first = evidence();
  const second = evidence({ document: { ...evidence().document, sha256: "b".repeat(64) } });
  const report = run([first, second]);
  assert.ok(report.decisions[0].issues.some(item => item.code === "DUPLICATE_SOURCE_IDENTITY"));
});
test("quarantines uncertain range values", () => {
  const ranged = evidence({ extraction: { ...evidence().extraction, value: "1.4–1.6" } });
  const report = run([ranged], [registrySource()], [{ ...claim, value: "1.4–1.6" }]);
  assert.equal(report.decisions[0].status, "quarantined");
});
test("does not crash on malformed claims", () => {
  const report = run([evidence()], [registrySource()], [null, { claimId: "bad", modelId: "", value: null }]);
  assert.equal(report.counts.quarantined, 2);
  assert.ok(report.decisions.every(item => item.issues.some(problem => problem.code === "INVALID_CLAIM")));
});
test("never mutates catalog or source registry inputs", () => {
  const inputClaim = structuredClone(claim);
  const inputRegistry = [registrySource()];
  const before = JSON.stringify({ inputClaim, inputRegistry });
  run([evidence()], inputRegistry, [inputClaim]);
  assert.equal(JSON.stringify({ inputClaim, inputRegistry }), before);
});
test("rejects malformed report inputs including missing source registry", () => {
  assert.throws(() => buildAutomatedVerificationReport({ claims: {}, evidence: [], sourceRegistry: [] }), /claims must be an array/);
  assert.throws(() => buildAutomatedVerificationReport({ claims: [], evidence: {}, sourceRegistry: [] }), /evidence must be an array/);
  assert.throws(() => buildAutomatedVerificationReport({ claims: [], evidence: [], sourceRegistry: null }), /sourceRegistry must be an array/);
});
