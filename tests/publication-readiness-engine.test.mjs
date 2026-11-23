import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePublicationReadiness, REQUIRED_PUBLICATION_GATES } from "../scripts/publication-readiness-engine.mjs";

const passingGates = Object.fromEntries(REQUIRED_PUBLICATION_GATES.map(name => [name, { status: "passed" }]));

test("publishes only when every required gate passes", () => {
  const result = evaluatePublicationReadiness({ pageId: "spot", gates: passingGates, now: "2026-11-23T08:00:00.000Z" });
  assert.equal(result.decision, "publish");
  assert.equal(result.publishEligible, true);
  assert.equal(result.counts.passed, REQUIRED_PUBLICATION_GATES.length);
  assert.equal(result.publicationActionPerformed, false);
});

test("missing gates require verification and never publish", () => {
  const gates = { ...passingGates };
  delete gates.media_rights;
  const result = evaluatePublicationReadiness({ pageId: "spot", gates, now: "2026-11-23T08:00:00.000Z" });
  assert.equal(result.decision, "needs_verification");
  assert.equal(result.publishEligible, false);
  assert.ok(result.reasonCodes.includes("MEDIA_RIGHTS_GATE_REPORT_MISSING"));
});

test("a hard media-rights failure quarantines even when every other gate passes", () => {
  const gates = { ...passingGates, media_rights: { status: "failed", reasonCodes: ["RIGHTS_NOT_CONFIRMED"] } };
  const result = evaluatePublicationReadiness({ pageId: "spot", gates, now: "2026-11-23T08:00:00.000Z" });
  assert.equal(result.decision, "quarantine");
  assert.equal(result.publishEligible, false);
  assert.ok(result.reasonCodes.includes("MEDIA_RIGHTS_RIGHTS_NOT_CONFIRMED"));
});

test("a malformed gate status fails closed into quarantine", () => {
  const gates = { ...passingGates, facts: { status: "maybe" } };
  const result = evaluatePublicationReadiness({ pageId: "spot", gates, now: "2026-11-23T08:00:00.000Z" });
  assert.equal(result.decision, "quarantine");
  assert.ok(result.reasonCodes.includes("FACTS_GATE_STATUS_INVALID"));
});

test("SEO and link gates are mandatory and cannot be overridden by factual success", () => {
  const gates = {
    ...passingGates,
    seo: { status: "needs_verification", reasonCodes: ["MISSING_META_DESCRIPTION"] },
    internal_links: { status: "failed", reasonCodes: ["BROKEN_INTERNAL_LINK"] }
  };
  const result = evaluatePublicationReadiness({ pageId: "spot", gates, now: "2026-11-23T08:00:00.000Z" });
  assert.equal(result.decision, "quarantine");
  assert.equal(result.counts.needsVerification, 1);
  assert.equal(result.counts.failed, 1);
});

test("decision fingerprint is stable for identical inputs", () => {
  const first = evaluatePublicationReadiness({ pageId: "spot", gates: passingGates, now: "2026-11-23T08:00:00.000Z" });
  const second = evaluatePublicationReadiness({ pageId: "spot", gates: passingGates, now: "2026-11-23T08:00:00.000Z" });
  assert.equal(first.decisionId, second.decisionId);
});

test("rejects invalid page identifiers and timestamps", () => {
  assert.throws(() => evaluatePublicationReadiness({ pageId: "../spot", gates: passingGates }), /pageId/);
  assert.throws(() => evaluatePublicationReadiness({ pageId: "spot", gates: passingGates, now: "not-a-date" }), /timestamp/);
});
