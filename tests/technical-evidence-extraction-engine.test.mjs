import test from "node:test";
import assert from "node:assert/strict";
import {
  extractEvidenceCandidates,
} from "../scripts/technical-evidence-extraction-engine.mjs";

const sha = "a".repeat(64);

test("extracts common robot specifications with exact page and line evidence", () => {
  const text = [
    "Spot Product Technical Specifications",
    "Mass with battery: 33.8 kg",
    "Maximum payload: 14 kg",
    "Maximum speed: 1.6 m/s",
    "Ingress protection: IP54",
  ].join("\n");
  const report = extractEvidenceCandidates({
    text,
    documentSha256: sha,
    documentName: "spot-manual.txt",
    sourceUrl: "https://bostondynamics.com/spot/manual.pdf",
    modelId: "spot",
    modelName: "Spot",
  });
  assert.equal(report.counts.candidates, 4);
  assert.equal(report.candidates.find((x) => x.field === "mass").extractedValue, 33.8);
  assert.equal(report.candidates.find((x) => x.field === "payload").unit, "kg");
  assert.equal(report.candidates.find((x) => x.field === "speed").unit, "m/s");
  assert.equal(report.candidates.find((x) => x.field === "ingress_protection").extractedValue, "IP54");
  assert.equal(report.candidates[0].evidenceLocator.page, 1);
  assert.equal(report.candidates[0].evidenceQuote, "Mass with battery: 33.8 kg");
  assert.equal(report.context.modelMentionStatus, "mention_found");
});

test("preserves page boundaries and document hash in candidate IDs", () => {
  const text = "Payload: 10 kg\fPayload: 12 kg";
  const report = extractEvidenceCandidates({ text, documentSha256: sha });
  assert.equal(report.counts.pages, 2);
  assert.deepEqual(report.candidates.map((x) => x.evidenceLocator.page), [1, 2]);
  assert.notEqual(report.candidates[0].candidateId, report.candidates[1].candidateId);
  assert.equal(report.candidates[0].documentSha256, sha);
});

test("does not classify an official-looking URL as verified evidence", () => {
  const report = extractEvidenceCandidates({
    text: "Payload: 10 kg",
    sourceUrl: "https://bostondynamics.com/spot.pdf",
  });
  assert.equal(report.candidates[0].reviewStatus, "extracted_unverified");
  assert.equal(report.candidates[0].factualVerification, "not_performed");
  assert.equal(report.policy.automaticApproval, false);
});

test("rejects non-HTTPS, credentialed and malformed source URLs", () => {
  for (const sourceUrl of [
    "http://example.com/manual.pdf",
    "https://user:password@example.com/manual.pdf",
    "not a URL",
  ]) {
    const report = extractEvidenceCandidates({ text: "Payload: 10 kg", sourceUrl });
    assert.equal(report.document.sourceUrl, null);
    assert.ok(report.document.sourceUrlIssue);
  }
});

test("does not invent model or configuration matches", () => {
  const report = extractEvidenceCandidates({
    text: "Payload: 10 kg",
    modelName: "Spot",
    configurationId: "EDU-2025",
  });
  assert.equal(report.context.modelMentionStatus, "not_found");
  assert.equal(report.context.configurationMentionStatus, "not_found");
  assert.equal(report.candidates[0].modelMentionStatus, "not_found");
  assert.equal(report.candidates[0].configurationMentionStatus, "not_found");
});

test("supports common engineering units and decimal comma", () => {
  const report = extractEvidenceCandidates({
    text: [
      "Reach: 1,750 mm",
      "Rated payload: 1,5 kg",
      "Repeatability: ±0.03 mm",
      "Runtime: 90 min",
      "Battery capacity: 564 Wh",
      "Power consumption: 1.2 kW",
      "Degrees of freedom: 6 axes",
    ].join("\n"),
  });
  const fields = Object.fromEntries(report.candidates.map((x) => [x.field, x]));
  assert.equal(fields.reach.extractedValue, 1750);
  assert.equal(fields.payload.extractedValue, 1.5);
  assert.equal(fields.repeatability.extractedValue, 0.03);
  assert.equal(fields.runtime.extractedValue, 90);
  assert.equal(fields.battery_capacity.extractedValue, 564);
  assert.equal(fields.power.extractedValue, 1.2);
  assert.equal(fields.degrees_of_freedom.extractedValue, 6);
});

test("rejects empty and oversized extracted text", () => {
  assert.throws(() => extractEvidenceCandidates({ text: "  " }), /empty/);
  assert.throws(() => extractEvidenceCandidates({ text: "x".repeat(10 * 1024 * 1024 + 1) }), /size limit/);
});

test("candidate IDs are deterministic for unchanged evidence", () => {
  const input = { text: "Maximum payload: 10 kg", documentSha256: sha, modelId: "spot" };
  const first = extractEvidenceCandidates(input);
  const second = extractEvidenceCandidates(input);
  assert.equal(first.candidates[0].candidateId, second.candidates[0].candidateId);
});

test("report never claims it fetched or verified a PDF or source", () => {
  const report = extractEvidenceCandidates({ text: "Payload: 10 kg" });
  assert.equal(report.policy.pdfDownloaded, false);
  assert.equal(report.policy.sourcePageFetched, false);
  assert.equal(report.policy.factualVerificationPerformed, false);
  assert.equal(report.policy.catalogMutated, false);
  assert.equal(report.policy.scannedPageOcr, false);
});

test("extracts all additional catalog field families and keeps ranges non-scalar", () => {
  const text = [
    "Battery endurance: 2–4 h",
    "Maximum running speed: 5 m/s",
    "Moving speed: 3.3 m/s",
    "Maximum TCP speed: 5 m/s",
    "Robot arm mass: 20.7 kg",
    "Robot mass: 64 kg",
    "Maximum reach: 706.7 mm",
    "Reach to wrist: 950 mm",
    "Reach to flange: 1050 mm",
    "Pose repeatability: ±0.03 mm",
    "Axes: 6",
    "Height: 180 cm",
    "Standing dimensions: 70 × 31 × 40 cm",
    "Maximum joint torque: 360 N·m",
    "Payload: ≈7–8 kg",
  ].join("\n");
  const report = extractEvidenceCandidates({ text, modelId: "test", modelName: "Test" });
  const byField = Object.groupBy(report.candidates, (item) => item.field);
  assert.ok(byField.runtime?.some((x) => x.extractedValue === "2–4" && x.valueQualifier));
  assert.ok(byField.speed?.some((x) => x.extractedValue === 5));
  assert.ok(byField.mass?.some((x) => x.extractedValue === 20.7));
  assert.ok(byField.reach?.some((x) => x.extractedValue === 706.7));
  assert.ok(byField.repeatability?.some((x) => x.extractedValue === 0.03 && x.valueQualifier));
  assert.ok(byField.degrees_of_freedom?.some((x) => x.extractedValue === 6));
  assert.ok(byField.height?.some((x) => x.extractedValue === 180));
  assert.ok(byField.dimensions?.some((x) => x.extractedValue === "70 × 31 × 40"));
  assert.ok(byField.torque?.some((x) => x.extractedValue === 360));
  assert.ok(byField.payload?.some((x) => x.extractedValue === "7–8" && x.valueQualifier));
});
