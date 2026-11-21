import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { auditEvidenceRegistry } from "../scripts/evidence-registry-integrity-audit.mjs";

const [registry, db] = await Promise.all([
  readFile(new URL("../data/evidence-document-registry.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/robots.json", import.meta.url), "utf8").then(JSON.parse),
]);
const clone = value => structuredClone(value);

test("canonical evidence registry has no structural or cross-reference errors", () => {
  const report = auditEvidenceRegistry(registry, db);
  assert.equal(report.counts.error, 0, JSON.stringify(report.issues.filter(x => x.severity === "error"), null, 2));
  assert.equal(report.documentCount, 7);
  assert.equal(report.catalogClaimCount, 39);
  assert.equal(report.status, "review_required");
  assert.equal(report.readOnly, true);
  assert.equal(report.networkAccess, false);
  assert.equal(report.catalogMutation, false);
});

test("audit identifies duplicate evidence document IDs", () => {
  const changed = clone(registry);
  changed.sources.push(clone(changed.sources[0]));
  const report = auditEvidenceRegistry(changed, db);
  assert.ok(report.issues.some(x => x.code === "DUPLICATE_ID"));
  assert.equal(report.status, "failed");
});

test("audit rejects broken canonical source and model references", () => {
  const changed = clone(registry);
  changed.sources[0].canonicalSourceId = "missing-source";
  changed.sources[0].modelIds = ["missing-model"];
  const report = auditEvidenceRegistry(changed, db);
  assert.ok(report.issues.some(x => x.code === "BROKEN_CANONICAL_SOURCE"));
  assert.ok(report.issues.some(x => x.code === "UNKNOWN_MODEL"));
});

test("audit rejects mismatched URLs, hosts and undeclared claim sources", () => {
  const changed = clone(registry);
  changed.sources[0].sourcePageUrl = "https://example.invalid/specs";
  changed.sources[0].officialHost = "example.invalid";
  changed.sources[0].catalogClaims[0].catalogSourceId = "src-0015";
  const report = auditEvidenceRegistry(changed, db);
  assert.ok(report.issues.some(x => x.code === "CANONICAL_URL_MISMATCH"));
  assert.ok(report.issues.some(x => x.code === "UNDECLARED_CLAIM_SOURCE"));
});

test("audit rejects unsafe policy changes", () => {
  const changed = clone(registry);
  changed.policy.scraping = true;
  changed.policy.automaticPdfDownload = true;
  const report = auditEvidenceRegistry(changed, db);
  assert.ok(report.issues.filter(x => x.code === "UNSAFE_POLICY").length >= 2);
});

test("unacquired documents cannot carry a fabricated hash or file size", () => {
  const changed = clone(registry);
  changed.sources[0].acquisition.sha256 = "a".repeat(64);
  changed.sources[0].acquisition.byteSize = 100;
  const report = auditEvidenceRegistry(changed, db);
  assert.ok(report.issues.some(x => x.code === "UNACQUIRED_DOCUMENT_HAS_ARTIFACT"));
});

test("acquired documents require a valid digest, byte size and approved rights", () => {
  const changed = clone(registry);
  Object.assign(changed.sources[0].acquisition, {
    status: "acquired", sha256: "invalid", byteSize: 0,
    processingPermission: false, rightsReview: "pending",
  });
  const report = auditEvidenceRegistry(changed, db);
  assert.ok(report.issues.some(x => x.code === "INVALID_SHA256"));
  assert.ok(report.issues.some(x => x.code === "INVALID_BYTE_SIZE"));
  assert.ok(report.issues.some(x => x.code === "PROCESSING_RIGHTS_NOT_APPROVED"));
});

test("audit never mutates registry or canonical catalog", () => {
  const r = clone(registry), d = clone(db);
  const beforeR = JSON.stringify(r), beforeD = JSON.stringify(d);
  auditEvidenceRegistry(r, d);
  assert.equal(JSON.stringify(r), beforeR);
  assert.equal(JSON.stringify(d), beforeD);
});
