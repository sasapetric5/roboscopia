import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { auditDatabase } from "../scripts/data-quality-audit.mjs";
import {
  buildReviewQueue,
  validateReviewDecision,
} from "../scripts/data-quality-review-queue.mjs";
import { createReviewDecision } from "../scripts/record-review-decision.mjs";

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


test("decision recorder creates a validated, timestamped review record", () => {
  const queue = buildReviewQueue(db);
  const itemId = queue.items[0].id;
  const decision = createReviewDecision({
    itemId,
    status: "resolved",
    note: "Reviewed against the official manufacturer documentation.",
    decidedBy: "reviewer",
    decidedAt: "2026-11-20T15:00:00.000Z",
  }, new Set(queue.items.map((item) => item.id)));

  assert.equal(decision.itemId, itemId);
  assert.equal(decision.status, "resolved");
  assert.equal(decision.decidedAt, "2026-11-20T15:00:00.000Z");
});

test("decision recorder refuses unknown queue items", () => {
  const queue = buildReviewQueue(db);
  assert.throws(() => createReviewDecision({
    itemId: "not-in-current-queue",
    status: "resolved",
    note: "Reviewed",
    decidedBy: "reviewer",
  }, new Set(queue.items.map((item) => item.id))));
});


test("review queue resolves source context for specification findings", () => {
  const changed = clone(db);
  changed.records[0].specifications[0].provenance = null;
  const queue = buildReviewQueue(changed);
  const item = queue.items.find((entry) => entry.code === "MISSING_PROVENANCE");

  assert.ok(item);
  assert.equal(item.source.id, changed.records[0].specifications[0].sourceId);
});

test("review queue ignores decisions that fail validation", () => {
  const queue = buildReviewQueue(db);
  const item = queue.items[0];
  const nextQueue = buildReviewQueue(db, auditDatabase(db), [{
    itemId: item.id,
    status: "resolved",
    note: " ",
  }]);

  assert.equal(nextQueue.items.find((entry) => entry.id === item.id).status, "open");
});


test("review item identity survives record reordering", () => {
  const changed = clone(db);
  changed.records[0].manufacturerId = "missing-manufacturer";
  const first = buildReviewQueue(changed);
  const target = first.items.find((item) => item.code === "BROKEN_REFERENCE");
  const reordered = clone(changed);
  reordered.records.reverse();
  const second = buildReviewQueue(reordered);
  assert.ok(second.items.some((item) => item.id === target.id));
});

test("latest append-only decision wins without deleting earlier history", () => {
  const queue = buildReviewQueue(db);
  const itemId = queue.items[0].id;
  const history = [
    { itemId, status: "in_review", decidedBy: "reviewer-a" },
    { itemId, status: "resolved", note: "Verified against primary source", decidedBy: "reviewer-b" },
  ];
  const rebuilt = buildReviewQueue(db, auditDatabase(db), history);
  assert.equal(rebuilt.items.find((item) => item.id === itemId).status, "resolved");
});
