import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SAFE_POLICY = {
  networkAutomation: false,
  scraping: false,
  automaticPdfDownload: false,
  redistributeOriginalDocuments: false,
  storeOriginalDocumentsInPublicRepository: false,
  catalogMutation: false,
  automaticApproval: false,
};

function issue(issues, severity, code, path, message) {
  issues.push({ severity, code, path, message });
}
function indexUnique(items, path, issues) {
  const map = new Map();
  if (!Array.isArray(items)) {
    issue(issues, "error", "INVALID_COLLECTION", path, "Expected an array.");
    return map;
  }
  items.forEach((item, i) => {
    const id = item?.id;
    if (typeof id !== "string" || !id.trim()) {
      issue(issues, "error", "MISSING_ID", path + "[" + i + "].id", "A non-empty ID is required.");
    } else if (map.has(id)) {
      issue(issues, "error", "DUPLICATE_ID", path + "[" + i + "].id", "Duplicate ID: " + id);
    } else map.set(id, item);
  });
  return map;
}
function validHttps(value) {
  try { const u = new URL(value); return u.protocol === "https:" && Boolean(u.hostname); }
  catch { return false; }
}
function hostMatches(url, expectedHost) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const expected = String(expectedHost || "").toLowerCase();
    return Boolean(expected) && (host === expected || host.endsWith("." + expected));
  } catch { return false; }
}

/** Read-only consistency audit. It never fetches URLs or mutates either input. */
export function auditEvidenceRegistry(registry, db) {
  const issues = [];
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    issue(issues, "error", "INVALID_REGISTRY_ROOT", "$", "Registry root must be an object.");
    return summarize(registry, issues, 0);
  }
  if (!db || typeof db !== "object" || Array.isArray(db)) {
    issue(issues, "error", "INVALID_DATABASE_ROOT", "database", "Canonical database root must be an object.");
    return summarize(registry, issues, 0);
  }
  if (typeof registry.schemaVersion !== "string" || !registry.schemaVersion.trim())
    issue(issues, "error", "MISSING_SCHEMA_VERSION", "schemaVersion", "Registry schemaVersion is required.");

  const policy = registry.policy || {};
  for (const [key, expected] of Object.entries(SAFE_POLICY)) {
    if (policy[key] !== expected)
      issue(issues, "error", "UNSAFE_POLICY", "policy." + key, "Safety policy must explicitly remain " + expected + ".");
  }
  if (policy.rightsReviewRequired !== true)
    issue(issues, "error", "RIGHTS_REVIEW_NOT_REQUIRED", "policy.rightsReviewRequired", "Rights review must remain mandatory.");

  const documents = indexUnique(registry.sources, "sources", issues);
  const canonicalSources = indexUnique(db.sources, "database.sources", issues);
  const models = indexUnique(db.records, "database.records", issues);
  let claimCount = 0;

  for (const [docId, doc] of documents) {
    const base = "sources[" + docId + "]";
    if (typeof doc.title !== "string" || !doc.title.trim())
      issue(issues, "error", "MISSING_DOCUMENT_TITLE", base + ".title", "Document title is required.");
    if (!["pdf", "html"].includes(doc.documentType))
      issue(issues, "error", "INVALID_DOCUMENT_TYPE", base + ".documentType", "Only registered PDF and HTML evidence types are supported.");
    if (!validHttps(doc.sourcePageUrl))
      issue(issues, "error", "INVALID_SOURCE_PAGE_URL", base + ".sourcePageUrl", "Source page must be a valid HTTPS URL.");
    if (doc.downloadUrl !== null && doc.downloadUrl !== undefined && !validHttps(doc.downloadUrl))
      issue(issues, "error", "INVALID_DOWNLOAD_URL", base + ".downloadUrl", "Download URL must be HTTPS or null.");
    if (!hostMatches(doc.sourcePageUrl, doc.officialHost))
      issue(issues, "error", "OFFICIAL_HOST_MISMATCH", base + ".officialHost", "Source page host does not match the declared official host.");
    if (doc.downloadUrl && doc.deliveryHost && !hostMatches(doc.downloadUrl, doc.deliveryHost))
      issue(issues, "error", "DELIVERY_HOST_MISMATCH", base + ".deliveryHost", "Download URL host does not match the declared delivery host.");

    const pilotOnlyWithoutCatalogClaims = doc.pilotOnly === true &&
      Array.isArray(doc.modelIds) && doc.modelIds.length === 0 &&
      Array.isArray(doc.catalogClaims) && doc.catalogClaims.length === 0;
    if ((!Array.isArray(doc.modelIds) || doc.modelIds.length === 0) && !pilotOnlyWithoutCatalogClaims)
      issue(issues, "error", "MISSING_MODEL_LINK", base + ".modelIds", "At least one catalog model ID is required unless this is an explicitly pilot-only document with no catalog claims.");
    else for (const modelId of (doc.modelIds ?? []))
      if (!models.has(modelId)) issue(issues, "error", "UNKNOWN_MODEL", base + ".modelIds", "Unknown catalog model ID: " + modelId);
    if (doc.pilotOnly === true && Array.isArray(doc.catalogClaims) && doc.catalogClaims.length > 0)
      issue(issues, "error", "PILOT_ONLY_HAS_CATALOG_CLAIMS", base + ".catalogClaims", "Pilot-only documents cannot link catalog claims.");

    const canonicalId = doc.canonicalSourceId;
    const canonical = canonicalSources.get(canonicalId);
    if (!canonicalId || !canonical) {
      issue(issues, "error", "BROKEN_CANONICAL_SOURCE", base + ".canonicalSourceId", "Canonical source ID must resolve to exactly one registered source.");
    } else {
      const registeredUrls = [canonical.url, canonical.canonicalUrl].filter(Boolean);
      if (![doc.sourcePageUrl, doc.downloadUrl].filter(Boolean).some(url => registeredUrls.includes(url)))
        issue(issues, "error", "CANONICAL_URL_MISMATCH", base, "Evidence source URLs do not match the mapped canonical source URL.");
      if (canonical.authorityTier !== "manufacturer_primary")
        issue(issues, "warning", "SOURCE_NOT_PRIMARY", base + ".canonicalSourceId", "Canonical source is not classified as manufacturer-primary.");
    }

    const related = new Set(Array.isArray(doc.relatedSourceIds) ? doc.relatedSourceIds : []);
    if (related.has(canonicalId))
      issue(issues, "warning", "DUPLICATE_RELATED_SOURCE", base + ".relatedSourceIds", "Canonical source is redundantly repeated as a related source.");
    for (const id of related)
      if (!canonicalSources.has(id)) issue(issues, "error", "UNKNOWN_RELATED_SOURCE", base + ".relatedSourceIds", "Unknown related source ID: " + id);

    if (!Array.isArray(doc.catalogClaims))
      issue(issues, "error", "INVALID_CATALOG_CLAIMS", base + ".catalogClaims", "catalogClaims must be an array.");
    else {
      for (let i = 0; i < doc.catalogClaims.length; i++) {
        claimCount++;
        const claim = doc.catalogClaims[i];
        const p = base + ".catalogClaims[" + i + "]";
        if (!claim || typeof claim.specification !== "string" || !claim.specification.trim())
          issue(issues, "error", "MISSING_CLAIM_SPECIFICATION", p + ".specification", "Claim specification label is required.");
        if (!claim || !Object.hasOwn(claim, "catalogValue"))
          issue(issues, "error", "MISSING_CLAIM_VALUE", p + ".catalogValue", "Catalog claim must explicitly carry its current value.");
        if (!claim?.catalogSourceId || !canonicalSources.has(claim.catalogSourceId))
          issue(issues, "error", "UNKNOWN_CLAIM_SOURCE", p + ".catalogSourceId", "Claim source ID must resolve in the canonical source registry.");
        else if (claim.catalogSourceId !== canonicalId && !related.has(claim.catalogSourceId))
          issue(issues, "error", "UNDECLARED_CLAIM_SOURCE", p + ".catalogSourceId", "Claim source must be the canonical source or an explicitly related source.");
      }
    }

    const acquisition = doc.acquisition;
    if (!acquisition || typeof acquisition !== "object") {
      issue(issues, "error", "MISSING_ACQUISITION_STATE", base + ".acquisition", "Acquisition state is required.");
      continue;
    }
    if (acquisition.status === "not_acquired") {
      if (acquisition.sha256 !== null || acquisition.byteSize !== null || acquisition.localFileName !== null)
        issue(issues, "error", "UNACQUIRED_DOCUMENT_HAS_ARTIFACT", base + ".acquisition", "Unacquired documents must not claim a local file, size or hash.");
      if (acquisition.rightsReview !== "pending" || acquisition.processingPermission !== false)
        issue(issues, "error", "UNACQUIRED_RIGHTS_STATE_INCONSISTENT", base + ".acquisition", "Unacquired documents must retain pending rights review and no processing permission.");
      issue(issues, "warning", "DOCUMENT_NOT_ACQUIRED", base + ".acquisition.status", "Evidence document has not been lawfully acquired and processed.");
    } else if (acquisition.status === "acquired" || acquisition.status === "processed") {
      if (typeof acquisition.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(acquisition.sha256))
        issue(issues, "error", "INVALID_SHA256", base + ".acquisition.sha256", "Acquired evidence requires a 64-character SHA-256 digest.");
      if (!Number.isSafeInteger(acquisition.byteSize) || acquisition.byteSize <= 0)
        issue(issues, "error", "INVALID_BYTE_SIZE", base + ".acquisition.byteSize", "Acquired evidence requires a positive integer byte size.");
      if (acquisition.processingPermission !== true || acquisition.rightsReview !== "approved")
        issue(issues, "error", "PROCESSING_RIGHTS_NOT_APPROVED", base + ".acquisition", "Processing requires explicit approved rights review.");
    } else {
      issue(issues, "error", "INVALID_ACQUISITION_STATUS", base + ".acquisition.status", "Unknown acquisition status.");
    }
    if (acquisition.factualVerification === "verified")
      issue(issues, "warning", "ACQUISITION_CANNOT_VERIFY_FACTS", base + ".acquisition.factualVerification", "Document acquisition alone cannot verify technical claims.");
  }
  return summarize(registry, issues, claimCount);
}

function summarize(registry, issues, claimCount) {
  const counts = {
    error: issues.filter(x => x.severity === "error").length,
    warning: issues.filter(x => x.severity === "warning").length,
    info: issues.filter(x => x.severity === "info").length,
  };
  return {
    schemaVersion: "1.0.0",
    registrySchemaVersion: registry?.schemaVersion ?? null,
    status: counts.error ? "failed" : counts.warning ? "review_required" : "passed",
    readOnly: true,
    networkAccess: false,
    catalogMutation: false,
    automaticApproval: false,
    documentCount: Array.isArray(registry?.sources) ? registry.sources.length : 0,
    catalogClaimCount: claimCount,
    counts,
    issues,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const registryPath = resolve(args.find((x, i) => args[i - 1] === "--registry") || "data/evidence-document-registry.json");
  const databasePath = resolve(args.find((x, i) => args[i - 1] === "--database") || "data/robots.json");
  const [registry, db] = await Promise.all([
    readFile(registryPath, "utf8").then(JSON.parse),
    readFile(databasePath, "utf8").then(JSON.parse),
  ]);
  const report = auditEvidenceRegistry(registry, db);
  process.stdout.write(json ? JSON.stringify(report, null, 2) + "\n" :
    "Evidence Registry Integrity: " + report.status + "\n" +
    "Documents: " + report.documentCount + "; catalog claims: " + report.catalogClaimCount + "\n" +
    "Errors: " + report.counts.error + "; warnings: " + report.counts.warning + "\n" +
    report.issues.map(x => x.severity.toUpperCase() + " " + x.code + " " + x.path + ": " + x.message).join("\n") + "\n");
  if (report.counts.error) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main().catch(error => { process.stderr.write("Evidence registry audit failed: " + error.message + "\n"); process.exitCode = 2; });
