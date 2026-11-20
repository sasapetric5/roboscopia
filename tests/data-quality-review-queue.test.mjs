import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { auditDatabase } from "../scripts/data-quality-audit.mjs";
import {
  buildReviewQueue,
  validateReviewDecision,
} from "../scripts/data-quality-review-queue.mjs";

const db = JSON.parse(await readFile(new URL("../data/robots.json", import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);

test("review queue converts audit findings into stable human-review items", () => {
  const report = auditDatabase(db);
  const first = buildReviewQueue(db, report);
  const second = buildReviewQueue(db, report);

  assert.equal(first.queueVersion, "1.0.0");
  assert.equal(first.items.length, report.issues.length);
  assert.deepEqual(first.items.map((item) => item.id), second.items.map((item) => item.id));
  assert.equal(first.counts.total, report.issues.length);
  assert.equal(first.counts.open, first.items.length);
});

test("review queue preserves model context and priority", () => {
  const changed = clone(db);
  changed.records[0].manufacturerId = "missing-manufacturer";

  const queue = buildReviewQueue(changed);
  const item = queue.items.find((entry) => entry.code === "BROKEN_REFERENCE");

  assert.ok(item);
  assert.equal(item.model.id, changed.records[0].id);
  assert.equal(item.priority, "critical");
  assert.equal(item.status, "open");
});

test("review decisions are separate and do not mutate canonical records", () => {
  const changed = clone(db);
  changed.records[0].manufacturerId = "missing-manufacturer";
  const queue = buildReviewQueue(changed);
  const item = queue.items.find((entry) => entry.code === "BROKEN_REFERENCE");
  const before = JSON.stringify(changed);
  const decision = {
    itemId: item.id,
    status: "resolved",
    note: "Reference corrected after checking the manufacturer's official dossier.",
    decidedBy: "reviewer",
    decidedAt: "2026-11-20T12:00:00.000Z",
  };

  const nextQueue = buildReviewQueue(changed, auditDatabase(changed), [decision]);
  assert.equal(nextQueue.items.find((entry) => entry.id === item.id).status, "resolved");
  assert.equal(JSON.stringify(changed), before);
});

test("decision validation rejects unknown items and missing closure notes", () => {
  const queue = buildReviewQueue(db);
  const knownIds = new Set(queue.items.map((item) => item.id));

  assert.deepEqual(validateReviewDecision({
    itemId: "unknown",
    status: "resolved",
    note: "Done",
  }, knownIds).length > 0, true);

  assert.ok(validateReviewDecision({
    itemId: queue.items[0].id,
    status: "resolved",
    note: " ",
  }, knownIds).length > 0);
});

test("in-review status may be set without a closure note", () => {
  const queue = buildReviewQueue(db);
  const knownIds = new Set(queue.items.map((item) => item.id));

  assert.deepEqual(validateReviewDecision({
    itemId: queue.items[0].id,
    status: "in_review",
  }, knownIds), []);
});

test("review queue does not treat accepted risk as resolved", () => {
  const queue = buildReviewQueue(db);
  const item = queue.items[0];
  const nextQueue = buildReviewQueue(db, auditDatabase(db), [{
    itemId: item.id,
    status: "accepted_risk",
    note: "Known limitation accepted pending a primary source review.",
  }]);

  const accepted = nextQueue.items.find((entry) => entry.id === item.id);
  assert.equal(accepted.status, "accepted_risk");
  assert.equal(nextQueue.counts.acceptedRisk, 1);
  assert.equal(nextQueue.counts.resolved, 0);
});
