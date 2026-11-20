import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { auditDatabase } from "../scripts/data-quality-audit.mjs";

const db = JSON.parse(await readFile(new URL("../data/robots.json", import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);

test("audit returns a deterministic report structure for the canonical database", () => {
  const report = auditDatabase(db);
  assert.equal(report.reportVersion, "1.0.0");
  assert.equal(report.schemaVersion, db.schemaVersion);
  assert.equal(report.recordCount, db.records.length);
  assert.ok(["passed", "review_required", "failed"].includes(report.status));
  assert.ok(Array.isArray(report.issues));
  assert.equal(
    report.counts.error + report.counts.warning + report.counts.info,
    report.issues.length
  );
});

test("audit detects broken model references and missing field provenance", () => {
  const damaged = clone(db);
  damaged.records[0].manufacturerId = "missing-manufacturer";
  delete damaged.records[0].specifications[0].provenance;

  const report = auditDatabase(damaged);
  assert.ok(report.issues.some((issue) => issue.code === "BROKEN_REFERENCE"));
  assert.ok(report.issues.some((issue) => issue.code === "MISSING_PROVENANCE"));
  assert.equal(report.status, "failed");
});

test("audit flags duplicate-like model identities for human review only", () => {
  const changed = clone(db);
  const duplicate = clone(changed.records[0]);
  duplicate.id = "spot-review-candidate";
  changed.records.push(duplicate);

  const report = auditDatabase(changed);
  assert.ok(report.issues.some((issue) => issue.code === "POTENTIAL_DUPLICATE_MODEL"));
  assert.equal(changed.records.length, db.records.length + 1);
  assert.equal(changed.records[0].id, "spot");
  assert.equal(changed.records.at(-1).id, "spot-review-candidate");
});

test("audit detects invalid source URLs and configuration status contradictions", () => {
  const damaged = clone(db);
  damaged.sources[0].url = "http://example.invalid/source";
  damaged.records[1].configurations[0].specificationStatus = "verified";

  const report = auditDatabase(damaged);
  assert.ok(report.issues.some((issue) => issue.code === "INVALID_SOURCE_URL"));
  assert.ok(report.issues.some((issue) => issue.code === "CONFIGURATION_STATUS_CONTRADICTION"));
});

test("audit never mutates the supplied database", () => {
  const input = clone(db);
  const before = JSON.stringify(input);
  auditDatabase(input);
  assert.equal(JSON.stringify(input), before);
});
