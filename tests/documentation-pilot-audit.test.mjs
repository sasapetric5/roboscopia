import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { auditDocumentationPilot } from "../scripts/documentation-pilot-audit.mjs";

async function fixtures() {
  const [registry, database, evidencePackage] = await Promise.all([
    readFile(new URL("../data/evidence-document-registry.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../data/robots.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../data/evidence-packages/source-robotics-parol6-release1-2026-a.json", import.meta.url), "utf8").then(JSON.parse)
  ]);
  return { registry, database, evidencePackage };
}

test("PAROL6 real-document pilot is recognized separately from catalog evidence", async () => {
  const report = auditDocumentationPilot(await fixtures());
  assert.equal(report.status, "PILOT_EVIDENCE_PRESENT_REVIEW_PENDING");
  assert.equal(report.counts.candidates, 21);
  assert.equal(report.counts.errors, 0);
  assert.equal(report.policy.catalogMutation, false);
  assert.equal(report.policy.automaticApproval, false);
  assert.equal(report.policy.catalogClaimMatching, false);
  assert.equal(report.review.factualVerification, "not_performed");
  assert.equal(report.review.humanClaimApproval, "pending");
});

test("pilot audit rejects accidental catalog linking or fabricated approval", async () => {
  const input = await fixtures();
  input.registry.sources.find(item => item.id === input.evidencePackage.id).catalogClaims = [{
    specification: "Payload", catalogValue: "1 kg", catalogSourceId: "src-0020"
  }];
  input.evidencePackage.review.humanClaimApproval = "approved";
  const report = auditDocumentationPilot(input);
  assert.equal(report.status, "failed");
  assert.ok(report.issues.some(item => item.code === "PILOT_CATALOG_CLAIMS_FORBIDDEN"));
  assert.ok(report.issues.some(item => item.code === "HUMAN_APPROVAL_OVERCLAIM"));
});

test("pilot audit detects a document hash mismatch", async () => {
  const input = await fixtures();
  input.evidencePackage.document.sha256 = "0".repeat(64);
  const report = auditDocumentationPilot(input);
  assert.equal(report.status, "failed");
  assert.ok(report.issues.some(item => item.code === "DOCUMENT_HASH_MISMATCH"));
});
