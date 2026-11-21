import test from "node:test";
import assert from "node:assert/strict";
import { buildEvidenceMatchingReport } from "../scripts/evidence-matching-review-engine.mjs";

const db = { schemaVersion: "2.1.0" };
const claim = { claimId: "claim-1", modelId: "spot", model: "Spot", specification: "Maximum speed", value: 1.6, unit: "m/s", configurationId: null, sourceId: "src-1", sourceUrl: "https://manufacturer.example/spec" };
const sourceReport = { claims: [claim] };
const candidate = (overrides = {}) => ({
  candidateId: "candidate-1", field: "speed", extractedValue: 1.6, unit: "m/s", modelId: "spot",
  configurationId: null, sourceUrl: "https://manufacturer.example/manual.pdf", sourceId: "src-1", documentSha256: "abc",
  exactMatch: "Maximum speed 1.6 m/s", evidenceQuote: "Maximum speed 1.6 m/s",
  evidenceLocator: { page: 4, line: 12, section: "Performance" }, reviewStatus: "extracted_unverified", ...overrides,
});

test("matches exact model, field, value and unit but never approves", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate()] }], [], Date.parse("2026-11-20"));
  assert.equal(report.matches[0].status, "value_match_unverified");
  assert.equal(report.matches[0].catalogMutationAllowed, false);
  assert.equal(report.policy.automaticApproval, false);
});
test("compares compatible units without changing source values", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ extractedValue: 5.76, unit: "km/h" })] }]);
  assert.equal(report.matches[0].status, "value_match_unverified");
  assert.equal(report.matches[0].valueComparison, "equal_converted");
  assert.equal(report.matches[0].catalog.value, 1.6);
  assert.equal(report.matches[0].evidence.extractedValue, 5.76);
});
test("flags value mismatch", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ extractedValue: 2.1 })] }]);
  assert.equal(report.matches[0].status, "value_mismatch");
});
test("flags incompatible units", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ unit: "mph" })] }]);
  assert.equal(report.matches[0].status, "value_mismatch");
});
test("flags model and configuration mismatch", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ modelId: "go2" })] }]);
  assert.equal(report.matches[0].status, "model_mismatch");
  const configured = buildEvidenceMatchingReport(db, { claims: [{ ...claim, configurationId: "edu" }] }, [{ candidates: [candidate()] }]);
  assert.equal(configured.matches[0].status, "configuration_mismatch");
});
test("reports missing evidence for every catalog claim", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, []);
  assert.equal(report.matches[0].status, "no_matching_evidence");
});
test("marks old document evidence as potentially stale", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ documentDate: "2020-01-01" })] }], [], Date.parse("2026-11-20"));
  assert.equal(report.matches[0].status, "possible_stale_evidence");
});
test("records only a valid explicit human decision", () => {
  const base = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate()] }]);
  const matchId = base.matches[0].matchId;
  const decisions = [{ matchId, outcome: "supported", evidenceLocator: "PDF p.4, Performance table, row 2", note: "Exact value and model confirmed.", reviewer: "reviewer", reviewedAt: "2026-11-20T10:00:00.000Z" }];
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate()] }], decisions);
  assert.equal(report.matches[0].humanReview.outcome, "supported");
  assert.equal(report.policy.catalogMutated, false);
});
test("keeps ambiguous exact matches visible instead of choosing one", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate(), candidate({ candidateId: "candidate-2" })] }]);
  assert.equal(report.matches.length, 2);
  assert.ok(report.matches.every((item) => item.status === "ambiguous_match"));
});

test("maps every catalog specification label to its normalized field", () => {
  const cases = [
    ["Battery endurance", "runtime"], ["Maximum running speed", "speed"],
    ["Moving speed", "speed"], ["Maximum TCP speed", "speed"],
    ["Robot arm mass", "mass"], ["Robot mass", "mass"],
    ["Standard payload", "payload"], ["Maximum payload", "payload"],
    ["Maximum reach", "reach"], ["Reach to wrist", "reach"],
    ["Reach to flange", "reach"], ["Pose repeatability", "repeatability"],
    ["Axes", "degrees_of_freedom"], ["Height", "height"],
    ["Standing dimensions", "dimensions"], ["Maximum joint torque", "torque"],
  ];
  for (const [specification, expectedField] of cases) {
    const localClaim = { ...claim, specification, value: 1, unit: "" };
    const report = buildEvidenceMatchingReport(db, { claims: [localClaim] }, [{ candidates: [candidate({ field: expectedField, extractedValue: 1, unit: "" })] }]);
    assert.equal(report.matches[0].field, expectedField, specification);
    assert.notEqual(report.matches[0].status, "no_matching_evidence", specification);
  }
});
test("keeps approximate values, ranges and tolerances for human review", () => {
  const ranged = buildEvidenceMatchingReport(db, { claims: [{ ...claim, specification: "Battery endurance", value: "2–4", unit: "h" }] }, [{ candidates: [candidate({ field: "runtime", extractedValue: "2–4", unit: "h", valueQualifier: true })] }]);
  assert.equal(ranged.matches[0].status, "non_scalar_review");
  const tolerance = buildEvidenceMatchingReport(db, { claims: [{ ...claim, specification: "Pose repeatability", value: "±0.03", unit: "mm" }] }, [{ candidates: [candidate({ field: "repeatability", extractedValue: 0.03, unit: "mm", valueQualifier: true })] }]);
  assert.equal(tolerance.matches[0].status, "non_scalar_review");
});
test("does not treat evidence without model identity as an exact match", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ modelId: null })] }]);
  assert.equal(report.matches[0].status, "model_identity_unverified");
});

test("requires matching units for dimensions and normalizes axis-count labels", () => {
  const dimensionsClaim = { ...claim, specification: "Standing dimensions", value: "70 × 31 × 40", unit: "cm" };
  const dimensionsCandidate = candidate({ field: "dimensions", extractedValue: "70 × 31 × 40", unit: "mm" });
  const dimensionsReport = buildEvidenceMatchingReport(db, { claims: [dimensionsClaim] }, [{ candidates: [dimensionsCandidate] }]);
  assert.equal(dimensionsReport.matches[0].status, "unit_mismatch");
  const axesClaim = { ...claim, specification: "Degrees of freedom", value: 6, unit: "rotating joints" };
  const axesCandidate = candidate({ field: "degrees_of_freedom", extractedValue: 6, unit: "" });
  const axesReport = buildEvidenceMatchingReport(db, { claims: [axesClaim] }, [{ candidates: [axesCandidate] }]);
  assert.equal(axesReport.matches[0].valueComparison, "equal");
});


test("rejects evidence mapped to a different registered source even when model and value match", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ sourceId: "src-2" })] }]);
  assert.equal(report.matches[0].status, "source_mismatch");
  assert.equal(report.matches[0].identity.sameSourceId, false);
  assert.equal(report.matches[0].catalogMutationAllowed, false);
});

test("does not treat evidence with missing source identity as an exact match", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ sourceId: null })] }]);
  assert.equal(report.matches[0].status, "source_identity_unverified");
});


test("accepts only explicitly declared related source IDs as source lineage", () => {
  const report = buildEvidenceMatchingReport(db, sourceReport, [{ candidates: [candidate({ sourceId: "src-support", relatedSourceIds: ["src-1"] })] }]);
  assert.equal(report.matches[0].status, "value_match_unverified");
  assert.equal(report.matches[0].identity.declaredRelatedSourceMatch, true);
});
