import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

function issue(issues, code, path, message) {
  issues.push({ severity: "error", code, path, message });
}

/**
 * Read-only audit for real-document pilots that are intentionally not linked
 * to catalog claims. It does not feed candidates into the catalog matcher.
 */
export function auditDocumentationPilot({ registry, database, evidencePackage }) {
  const issues = [];
  if (!registry || !Array.isArray(registry.sources)) {
    issue(issues, "INVALID_DOCUMENT_REGISTRY", "registry.sources", "Document registry sources must be an array.");
  }
  if (!database || !Array.isArray(database.sources) || !Array.isArray(database.records)) {
    issue(issues, "INVALID_CANONICAL_DATABASE", "database", "Canonical database must contain sources and records arrays.");
  }
  if (!evidencePackage || typeof evidencePackage !== "object" || Array.isArray(evidencePackage)) {
    issue(issues, "INVALID_EVIDENCE_PACKAGE", "evidencePackage", "A single evidence package object is required.");
  }
  if (issues.length) return summarize(evidencePackage, issues);

  const document = evidencePackage.document ?? {};
  const extraction = evidencePackage.extraction ?? {};
  const review = evidencePackage.review ?? {};
  const rights = evidencePackage.rights ?? {};
  const pilot = registry.sources.find((item) => item.id === evidencePackage.id);

  if (!pilot) {
    issue(issues, "PILOT_NOT_REGISTERED", "id", "Evidence package ID must resolve to the document registry.");
    return summarize(evidencePackage, issues);
  }
  if (pilot.pilotOnly !== true) issue(issues, "NOT_PILOT_ONLY", "registry.pilotOnly", "This audit is only for explicitly pilot-only documents.");
  if (!Array.isArray(pilot.modelIds) || pilot.modelIds.length !== 0) issue(issues, "PILOT_MODEL_LINK_FORBIDDEN", "registry.modelIds", "A pilot-only document must not be linked to catalog model IDs.");
  if (!Array.isArray(pilot.catalogClaims) || pilot.catalogClaims.length !== 0) issue(issues, "PILOT_CATALOG_CLAIMS_FORBIDDEN", "registry.catalogClaims", "A pilot-only document must not claim support for catalog claims.");
  if (pilot.acquisition?.status !== "processed") issue(issues, "PILOT_NOT_PROCESSED", "registry.acquisition.status", "Pilot document must be recorded as processed.");
  if (pilot.acquisition?.processingPermission !== true || pilot.acquisition?.rightsReview !== "approved") {
    issue(issues, "PILOT_RIGHTS_NOT_APPROVED", "registry.acquisition", "Scoped processing rights must be explicitly approved.");
  }

  const canonical = database.sources.find((item) => item.id === pilot.canonicalSourceId);
  if (!canonical) {
    issue(issues, "CANONICAL_SOURCE_NOT_FOUND", "registry.canonicalSourceId", "Pilot canonical source must resolve exactly.");
  } else {
    if (canonical.authorityTier !== "manufacturer_primary") issue(issues, "SOURCE_NOT_MANUFACTURER_PRIMARY", "canonical.authorityTier", "Pilot source must be manufacturer-primary.");
    if (canonical.reviewStatus !== "verified") issue(issues, "SOURCE_NOT_REVIEWED", "canonical.reviewStatus", "Pilot source identity and rights review must be complete.");
    if (canonical.rights?.processingPermitted !== true) issue(issues, "CANONICAL_PROCESSING_NOT_PERMITTED", "canonical.rights.processingPermitted", "Canonical source must explicitly permit scoped processing.");
    if (canonical.url !== document.sourceUrl && canonical.canonicalUrl !== document.sourceUrl) {
      issue(issues, "DOCUMENT_SOURCE_URL_MISMATCH", "document.sourceUrl", "Document URL must match the canonical source URL.");
    }
  }

  if (typeof document.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(document.sha256)) {
    issue(issues, "INVALID_DOCUMENT_SHA256", "document.sha256", "A valid SHA-256 digest is required.");
  }
  if (document.sha256 !== pilot.acquisition?.sha256) issue(issues, "DOCUMENT_HASH_MISMATCH", "document.sha256", "Evidence package hash must match the document registry.");
  if (document.byteSize !== pilot.acquisition?.byteSize) issue(issues, "DOCUMENT_SIZE_MISMATCH", "document.byteSize", "Evidence package byte size must match the document registry.");
  if (document.pageCount !== pilot.acquisition?.pageCount) issue(issues, "DOCUMENT_PAGE_COUNT_MISMATCH", "document.pageCount", "Evidence package page count must match the document registry.");
  if (typeof document.revision !== "string" || !document.revision.trim()) issue(issues, "DOCUMENT_REVISION_MISSING", "document.revision", "Document revision is required.");

  if (rights.status !== "approved_for_scoped_processing" || rights.textAndImages !== "CC BY-SA 4.0") {
    issue(issues, "SCOPED_LICENSE_NOT_RECORDED", "rights", "The pilot must retain its scoped text/image license decision.");
  }
  if (rights.codeExamples !== "MIT" || rights.robotModelsAndPicturesMadeFromThem !== "robot_descriptions, CC BY 4.0") {
    issue(issues, "THIRD_PARTY_LICENSES_NOT_SEPARATED", "rights", "Code and robot_descriptions assets must retain their separate license statements.");
  }
  if (extraction.status !== "extracted_unverified_candidates") issue(issues, "INVALID_EXTRACTION_STATUS", "extraction.status", "Extracted technical values must remain unverified candidates.");
  if (!Array.isArray(extraction.claims) || extraction.claims.length === 0) {
    issue(issues, "NO_EXTRACTED_CANDIDATES", "extraction.claims", "At least one extracted candidate is required.");
  } else {
    extraction.claims.forEach((claim, index) => {
      const path = "extraction.claims[" + index + "]";
      if (!claim || typeof claim.field !== "string" || !claim.field.trim()) issue(issues, "CANDIDATE_FIELD_MISSING", path + ".field", "Candidate field label is required.");
      if (!claim || typeof claim.value !== "string" || !claim.value.trim()) issue(issues, "CANDIDATE_VALUE_MISSING", path + ".value", "Candidate value must be retained as text.");
      if (!claim || typeof claim.locator !== "string" || !claim.locator.trim()) issue(issues, "CANDIDATE_LOCATOR_MISSING", path + ".locator", "A precise document locator is required.");
      if (!claim || claim.status !== "extracted_unverified") issue(issues, "CANDIDATE_STATUS_INVALID", path + ".status", "Candidates cannot be automatically approved.");
      if (!claim || !["high", "medium", "low"].includes(claim.confidence)) issue(issues, "CANDIDATE_CONFIDENCE_INVALID", path + ".confidence", "Extraction confidence must be explicit.");
    });
  }
  if (review.factualVerification !== "not_performed") issue(issues, "FACTUAL_VERIFICATION_OVERCLAIM", "review.factualVerification", "Extraction must not be represented as factual verification.");
  if (review.independentLaboratoryVerification !== "not_performed") issue(issues, "LAB_VERIFICATION_OVERCLAIM", "review.independentLaboratoryVerification", "No independent laboratory verification was performed.");
  if (review.humanClaimApproval !== "pending") issue(issues, "HUMAN_APPROVAL_OVERCLAIM", "review.humanClaimApproval", "Human claim approval must remain pending.");
  if (review.catalogMutation !== false) issue(issues, "CATALOG_MUTATION_NOT_BLOCKED", "review.catalogMutation", "Pilot audit must confirm no catalog mutation.");
  if (review.originalPdfCopiedToRepository !== false) issue(issues, "ORIGINAL_DOCUMENT_REHOSTED", "review.originalPdfCopiedToRepository", "Original PDF must not be copied into the public repository.");

  return summarize(evidencePackage, issues);
}

function summarize(evidencePackage, issues) {
  const candidateCount = Array.isArray(evidencePackage?.extraction?.claims) ? evidencePackage.extraction.claims.length : 0;
  const counts = { errors: issues.length, candidates: candidateCount };
  return {
    schemaVersion: "1.0.0",
    pilotId: evidencePackage?.id ?? null,
    status: issues.length ? "failed" : "PILOT_EVIDENCE_PRESENT_REVIEW_PENDING",
    counts,
    policy: { readOnly: true, catalogMutation: false, automaticApproval: false, catalogClaimMatching: false },
    review: { factualVerification: "not_performed", humanClaimApproval: "pending" },
    issues
  };
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const registry = JSON.parse(await readFile(resolve("data/evidence-document-registry.json"), "utf8"));
  const database = JSON.parse(await readFile(resolve("data/robots.json"), "utf8"));
  const evidencePackage = JSON.parse(await readFile(resolve("data/evidence-packages/source-robotics-parol6-release1-2026-a.json"), "utf8"));
  const report = auditDocumentationPilot({ registry, database, evidencePackage });
  process.stdout.write(json ? JSON.stringify(report, null, 2) + "\n" :
    "Documentation pilot: " + report.status + "; candidates: " + report.counts.candidates + "; errors: " + report.counts.errors + "\n");
  if (report.issues.length) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { process.stderr.write("Documentation pilot audit failed: " + error.message + "\n"); process.exitCode = 2; });
}
