/**
 * Build a human-review queue from discovery candidates.
 * This module never writes to the canonical robot catalog or grants media rights.
 */
const REQUIRED_APPROVAL_FIELDS = [
  "reference",
  "reviewedAt",
  "reviewer",
  "basis",
  "license",
  "licenseVersion",
  "intendedUse"
];

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(field + " must be a non-empty string");
  }
  return value.trim();
}

function httpsUrl(value, field) {
  const raw = requiredText(value, field);
  let parsed;
  try { parsed = new URL(raw); } catch { throw new TypeError(field + " must be a valid HTTPS URL"); }
  if (parsed.protocol !== "https:") throw new TypeError(field + " must be a valid HTTPS URL");
  return parsed.href;
}

export function buildMediaReviewQueue({ modelId, candidates, createdAt = new Date().toISOString() } = {}) {
  const targetModelId = requiredText(modelId, "modelId");
  if (!Array.isArray(candidates)) throw new TypeError("candidates must be an array");
  if (!Number.isFinite(Date.parse(createdAt))) throw new TypeError("createdAt must be a valid timestamp");
  const seen = new Set();
  const items = candidates.map((candidate) => {
    const id = requiredText(candidate?.id, "candidate.id");
    if (seen.has(id)) throw new Error("Duplicate media candidate id: " + id);
    seen.add(id);
    const sourceAssetUrl = httpsUrl(candidate.sourceAssetUrl, "candidate.sourceAssetUrl");
    const mediaUrl = candidate.mediaUrl ? httpsUrl(candidate.mediaUrl, "candidate.mediaUrl") : null;
    const previewUrl = candidate.previewUrl ? httpsUrl(candidate.previewUrl, "candidate.previewUrl") : null;
    return {
      id,
      modelId: targetModelId,
      provider: requiredText(candidate.provider, "candidate.provider"),
      title: requiredText(candidate.title, "candidate.title"),
      creator: candidate.creator ?? null,
      sourceAssetUrl,
      mediaUrl,
      previewUrl,
      license: candidate.license ?? null,
      licenseVersion: candidate.licenseVersion ?? null,
      licenseUrl: candidate.licenseUrl ? httpsUrl(candidate.licenseUrl, "candidate.licenseUrl") : null,
      attribution: candidate.attribution ?? null,
      status: "review_required",
      rightsEvidence: null,
      publicationEligible: false,
      checks: {
        originalAssetPageReviewed: false,
        rightsholderAndAuthorityConfirmed: false,
        commercialContextualDisplayAllowed: false,
        storageAndTransformationsAllowed: false,
        attributionRequirementsSatisfied: false,
        thirdPartyRightsChecked: false
      },
      discoveredAt: createdAt
    };
  });
  return {
    schemaVersion: "1.0.0",
    modelId: targetModelId,
    createdAt,
    publicationEligible: false,
    items
  };
}

export function validateMediaReviewDecision(decision, queue) {
  const errors = [];
  const item = queue?.items?.find((entry) => entry.id === decision?.candidateId);
  if (!item) errors.push("candidateId must identify an item in the current media review queue.");
  if (!["approved", "rejected", "deferred"].includes(decision?.status)) {
    errors.push("status must be approved, rejected, or deferred.");
  }
  if (typeof decision?.note !== "string" || !decision.note.trim()) errors.push("A reviewer note is required.");
  if (typeof decision?.reviewer !== "string" || !decision.reviewer.trim()) errors.push("Reviewer identity is required.");
  if (!Number.isFinite(Date.parse(decision?.decidedAt))) errors.push("decidedAt must be a valid timestamp.");

  if (decision?.status === "approved") {
    const evidence = decision?.rightsEvidence;
    for (const field of REQUIRED_APPROVAL_FIELDS) {
      if (typeof evidence?.[field] !== "string" || !evidence[field].trim()) {
        errors.push("Approved media requires rightsEvidence." + field + ".");
      }
    }
    if (evidence?.reference) {
      try { httpsUrl(evidence.reference, "rightsEvidence.reference"); }
      catch { errors.push("rightsEvidence.reference must be a valid HTTPS evidence URL."); }
    }
    if (evidence?.reviewedAt && !Number.isFinite(Date.parse(evidence.reviewedAt))) {
      errors.push("rightsEvidence.reviewedAt must be a valid timestamp.");
    }
    if (evidence?.reviewer && decision?.reviewer && evidence.reviewer !== decision.reviewer) {
      errors.push("rightsEvidence.reviewer must match the decision reviewer.");
    }
    if (item && evidence?.license && item.license && evidence.license !== item.license) {
      errors.push("Reviewed licence must match the discovered candidate licence or be resolved before approval.");
    }
  }
  return errors;
}
