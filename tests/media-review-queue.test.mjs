import test from "node:test";
import assert from "node:assert/strict";
import { buildMediaReviewQueue, validateMediaReviewDecision } from "../adapters/media-review-queue.mjs";

const candidate = {
  id: "openverse:asset-1",
  provider: "openverse",
  title: "Industrial robot arm",
  creator: "Photographer",
  sourceAssetUrl: "https://example.org/photo/1",
  mediaUrl: "https://cdn.example.org/photo/1.jpg",
  previewUrl: "https://cdn.example.org/photo/1-thumb.jpg",
  license: "by",
  licenseVersion: "4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  attribution: "By Photographer"
};

test("builds a model-scoped queue without granting publication rights", () => {
  const queue = buildMediaReviewQueue({ modelId: "ur5e", candidates: [candidate], createdAt: "2026-11-22T12:00:00.000Z" });
  assert.equal(queue.modelId, "ur5e");
  assert.equal(queue.items[0].status, "review_required");
  assert.equal(queue.items[0].publicationEligible, false);
  assert.equal(queue.items[0].rightsEvidence, null);
  assert.equal(queue.items[0].checks.originalAssetPageReviewed, false);
  assert.equal(queue.publicationEligible, false);
});

test("rejects unsafe URLs and duplicate candidate identities", () => {
  assert.throws(() => buildMediaReviewQueue({ modelId: "ur5e", candidates: [{ ...candidate, mediaUrl: "http://example.org/a.jpg" }] }), /HTTPS/);
  assert.throws(() => buildMediaReviewQueue({ modelId: "ur5e", candidates: [candidate, candidate] }), /Duplicate/);
});

test("requires explicit human review fields before approval", () => {
  const queue = buildMediaReviewQueue({ modelId: "ur5e", candidates: [candidate] });
  const incomplete = {
    candidateId: candidate.id, status: "approved", note: "Looks fine",
    reviewer: "reviewer-1", decidedAt: "2026-11-22T12:00:00.000Z"
  };
  assert.ok(validateMediaReviewDecision(incomplete, queue).some((error) => error.includes("rightsEvidence")));
});

test("accepts a complete, matching human approval record but does not mutate the queue", () => {
  const queue = buildMediaReviewQueue({ modelId: "ur5e", candidates: [candidate] });
  const decision = {
    candidateId: candidate.id, status: "approved", note: "Original asset page and licence reviewed.",
    reviewer: "reviewer-1", decidedAt: "2026-11-22T12:00:00.000Z",
    rightsEvidence: {
      reference: "https://example.org/photo/1",
      reviewedAt: "2026-11-22T11:55:00.000Z",
      reviewer: "reviewer-1",
      basis: "Copyright holder's explicit permission",
      license: "by",
      licenseVersion: "4.0",
      intendedUse: "commercial contextual display"
    }
  };
  assert.deepEqual(validateMediaReviewDecision(decision, queue), []);
  assert.equal(queue.items[0].publicationEligible, false);
  assert.equal(queue.items[0].status, "review_required");
});

test("does not accept an approval with a non-HTTPS evidence reference", () => {
  const queue = buildMediaReviewQueue({ modelId: "ur5e", candidates: [candidate] });
  const decision = {
    candidateId: candidate.id, status: "approved", note: "Reviewed.",
    reviewer: "reviewer-1", decidedAt: "2026-11-22T12:00:00.000Z",
    rightsEvidence: {
      reference: "http://example.org/evidence", reviewedAt: "2026-11-22T11:55:00.000Z",
      reviewer: "reviewer-1", basis: "Permission", license: "by",
      licenseVersion: "4.0", intendedUse: "commercial contextual display"
    }
  };
  assert.ok(validateMediaReviewDecision(decision, queue).some((error) => error.includes("HTTPS")));
});
