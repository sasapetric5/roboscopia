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
const independent = (overrides = {}) => evidence({
  source: { sourceId: "independent-1", url: "https://independent.example/datasheet", authority: "independent_primary", rights: { processingPermitted: true } },
  document: { sha256: "b".repeat(64), revision: "edition-2026", capturedAt: "2026-11-21T00:00:00.000Z" },
  ...overrides
});

test("accepts one exact, rights-cleared manufacturer primary source", () => {
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [evidence()] });
  assert.equal(report.decisions[0].status, "eligible_for_automatic_ingestion");
  assert.equal(report.counts.eligible, 1);
  assert.equal(report.decisions[0].catalogMutationAllowed, false);
});
test("quarantines a single non-manufacturer source without corroboration", () => {
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [independent()] });
  assert.equal(report.decisions[0].status, "quarantined");
  assert.ok(report.decisions[0].issues.some(item => item.code === "INSUFFICIENT_INDEPENDENT_EVIDENCE"));
});
test("accepts two matching independent primary sources", () => {
  const second = independent({ source: { sourceId: "independent-2", url: "https://second-independent.example/specs", authority: "independent_primary", rights: { processingPermitted: true } } });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [independent(), second] });
  assert.equal(report.decisions[0].status, "eligible_for_automatic_ingestion");
});
test("quarantines conflicting values and units", () => {
  const second = { ...independent(), extraction: { ...independent().extraction, value: 2, unit: "km/h" } };
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [evidence(), second] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "VALUE_CONFLICT"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "UNIT_CONFLICT"));
});
test("quarantines an extracted value that is absent from its evidence quote", () => {
  const bad = evidence({ extraction: { ...evidence().extraction, value: 1.6, quote: "Maximum speed: 1.8 m/s" } });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [bad, independent()] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "QUOTE_VALUE_MISMATCH"));
});
test("does not accept a numeric substring inside a larger value", () => {
  const bad = evidence({ extraction: { ...evidence().extraction, quote: "Maximum speed: 11.6 m/s" } });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [bad] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "QUOTE_VALUE_MISMATCH"));
  assert.equal(report.decisions[0].status, "quarantined");
});
test("accepts decimal comma as the quoted representation of a numeric value", () => {
  const localized = evidence({ extraction: { ...evidence().extraction, quote: "Maksimalna brzina: 1,6 m/s" } });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [localized] });
  assert.equal(report.decisions[0].status, "eligible_for_automatic_ingestion");
});
test("quarantines model and configuration mismatches", () => {
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [evidence({ modelId: "go2" }), independent({ configurationId: "edu" })] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "MODEL_IDENTITY_MISMATCH"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "CONFIGURATION_MISMATCH"));
});
test("quarantines missing rights clearance and document fingerprint", () => {
  const bad = evidence({
    source: { sourceId: "manufacturer-1", url: "https://manufacturer.example/specs", authority: "manufacturer_primary", rights: { processingPermitted: false } },
    document: { sha256: "bad", revision: "rev", capturedAt: "2026-11-21T00:00:00.000Z" }
  });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [bad, independent()] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "RIGHTS_NOT_CLEARED"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "INVALID_DOCUMENT_HASH"));
});
test("quarantines invalid source URL and unsafe locator", () => {
  const bad = evidence({
    source: { sourceId: "manufacturer-1", url: "http://manufacturer.example/specs", authority: "manufacturer_primary", rights: { processingPermitted: true } },
    extraction: { ...evidence().extraction, locator: { type: "pdf", page: 0 } }
  });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [bad, independent()] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "INVALID_SOURCE_URL"));
  assert.ok(report.decisions[0].issues.some(item => item.code === "INVALID_EVIDENCE_LOCATOR"));
});
test("does not count two independent sources on the same host", () => {
  const first = independent();
  const second = independent({ source: { sourceId: "independent-2", url: "https://www.independent.example/other", authority: "independent_primary", rights: { processingPermitted: true } } });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [first, second] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "INSUFFICIENT_INDEPENDENT_EVIDENCE"));
});
test("quarantines duplicate source registry IDs", () => {
  const first = evidence();
  const second = independent({ source: { ...independent().source, sourceId: "manufacturer-1" } });
  const report = buildAutomatedVerificationReport({ claims: [claim], evidence: [first, second] });
  assert.ok(report.decisions[0].issues.some(item => item.code === "DUPLICATE_SOURCE_IDENTITY"));
});
test("keeps uncertain range values out of automatic acceptance", () => {
  const ranged = evidence({ extraction: { ...evidence().extraction, value: "1.4–1.6" } });
  const second = independent({ extraction: { ...independent().extraction, value: "1.4–1.6" } });
  const report = buildAutomatedVerificationReport({ claims: [{ ...claim, value: "1.4–1.6" }], evidence: [ranged, second] });
  assert.equal(report.decisions[0].status, "quarantined");
});
test("does not crash on malformed claims", () => {
  const report = buildAutomatedVerificationReport({ claims: [null, { claimId: "bad", modelId: "", value: null }], evidence: [evidence()] });
  assert.equal(report.counts.quarantined, 2);
  assert.ok(report.decisions.every(item => item.issues.some(problem => problem.code === "INVALID_CLAIM")));
});
test("never mutates catalog input", () => {
  const input = structuredClone(claim);
  const before = JSON.stringify(input);
  buildAutomatedVerificationReport({ claims: [input], evidence: [evidence(), independent()] });
  assert.equal(JSON.stringify(input), before);
});
test("rejects malformed report inputs", () => {
  assert.throws(() => buildAutomatedVerificationReport({ claims: {}, evidence: [] }), /claims must be an array/);
  assert.throws(() => buildAutomatedVerificationReport({ claims: [], evidence: {} }), /evidence must be an array/);
});
