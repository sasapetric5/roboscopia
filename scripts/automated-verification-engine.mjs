import { createHash } from "node:crypto";

const AUTHORITIES = new Set(["manufacturer_primary", "independent_primary"]);
const PARSERS = new Set(["opendataloader-pdf", "docling", "paddleocr", "poppler", "manual-html"]);
const SHA256 = /^[a-f0-9]{64}$/i;

function issue(list, code, path, message) {
  list.push({ severity: "error", code, path, message });
}
function comparable(value) {
  if (typeof value === "number" && Number.isFinite(value)) return "n:" + value;
  if (typeof value === "string" && value.trim()) return "s:" + value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
  return null;
}
function uncertain(value) {
  if (typeof value !== "string") return false;
  return /[±≈~]|\b(about|approximately|approx\.?|up to|at least|typically|typical)\b/i.test(value) || /\d\s*(-|–|—|to)\s*\d/.test(value);
}
function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}
function host(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
}
function quoteContainsNumber(quote, value) {
  if (typeof quote !== "string" || !Number.isFinite(value)) return false;
  const tokens = quote.match(/(?<![\d.,])[-+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?![\d.,])/g) ?? [];
  return tokens.some(token => Number(token.replace(",", ".")) === value);
}
function validateEvidence(item, index, claim) {
  const out = [];
  const path = "evidence[" + index + "]";
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    issue(out, "INVALID_EVIDENCE", path, "Evidence item must be an object.");
    return out;
  }
  if (item.claimId !== claim.claimId) issue(out, "CLAIM_ID_MISMATCH", path + ".claimId", "Evidence is attached to a different claim.");
  if (item.modelId !== claim.modelId) issue(out, "MODEL_IDENTITY_MISMATCH", path + ".modelId", "Exact catalog model identity is not confirmed.");
  if ((item.configurationId ?? null) !== (claim.configurationId ?? null)) issue(out, "CONFIGURATION_MISMATCH", path + ".configurationId", "Evidence configuration differs from the catalog claim.");
  if (!safeUrl(item.source?.url)) issue(out, "INVALID_SOURCE_URL", path + ".source.url", "A public HTTPS URL without embedded credentials is required.");
  if (typeof item.source?.sourceId !== "string" || !item.source.sourceId.trim()) issue(out, "MISSING_SOURCE_ID", path + ".source.sourceId", "A stable source registry ID is required.");
  if (!AUTHORITIES.has(item.source?.authority)) issue(out, "UNAPPROVED_SOURCE_AUTHORITY", path + ".source.authority", "Classify the source as manufacturer_primary or independent_primary.");
  if (item.source?.rights?.processingPermitted !== true) issue(out, "RIGHTS_NOT_CLEARED", path + ".source.rights", "Explicit processing permission is required.");
  if (!SHA256.test(item.document?.sha256 ?? "")) issue(out, "INVALID_DOCUMENT_HASH", path + ".document.sha256", "A valid SHA-256 fingerprint is required.");
  if (typeof item.document?.revision !== "string" || !item.document.revision.trim()) issue(out, "MISSING_DOCUMENT_REVISION", path + ".document.revision", "Document or captured-page revision is required.");
  if (!item.document?.capturedAt || !Number.isFinite(Date.parse(item.document.capturedAt))) issue(out, "INVALID_CAPTURE_DATE", path + ".document.capturedAt", "A valid capture timestamp is required.");
  if (!item.extraction || comparable(item.extraction.value) === null) issue(out, "INVALID_EXTRACTED_VALUE", path + ".extraction.value", "Value must be a finite number or non-empty string.");
  if (typeof item.extraction?.unit !== "string") issue(out, "MISSING_UNIT", path + ".extraction.unit", "Original unit must be retained as a string.");
  if (typeof item.extraction?.quote !== "string" || !item.extraction.quote.trim()) issue(out, "MISSING_EVIDENCE_QUOTE", path + ".extraction.quote", "An exact, minimal source excerpt is required.");
  else if (typeof item.extraction?.value === "number" && !quoteContainsNumber(item.extraction.quote, item.extraction.value)) issue(out, "QUOTE_VALUE_MISMATCH", path + ".extraction.quote", "The exact quoted excerpt must contain the extracted numeric value as a complete numeric token.");
  else if (typeof item.extraction?.value === "string" && !item.extraction.quote.toLowerCase().includes(item.extraction.value.toLowerCase())) issue(out, "QUOTE_VALUE_MISMATCH", path + ".extraction.quote", "The exact quoted excerpt must contain the extracted text value.");
  const locator = item.extraction?.locator;
  const pdf = locator?.type === "pdf" && Number.isInteger(locator.page) && locator.page > 0;
  const html = locator?.type === "html" && typeof locator.selector === "string" && !!locator.selector.trim();
  if (!pdf && !html) issue(out, "INVALID_EVIDENCE_LOCATOR", path + ".extraction.locator", "Use a positive PDF page or stable HTML selector.");
  if (locator?.bbox !== undefined && (!Array.isArray(locator.bbox) || locator.bbox.length !== 4 || !locator.bbox.every(Number.isFinite))) issue(out, "INVALID_BOUNDING_BOX", path + ".extraction.locator.bbox", "Bounding box requires four finite coordinates.");
  if (!PARSERS.has(item.extraction?.parser?.name) || typeof item.extraction?.parser?.version !== "string" || !item.extraction.parser.version.trim()) issue(out, "UNAPPROVED_PARSER", path + ".extraction.parser", "Parser name and pinned version are required.");
  if (uncertain(item.extraction?.value) || uncertain(claim.value)) issue(out, "NON_SCALAR_OR_APPROXIMATE_VALUE", path + ".extraction.value", "Ranges, tolerances and approximate values must be quarantined.");
  if (comparable(item.extraction?.value) !== comparable(claim.value)) issue(out, "VALUE_CONFLICT", path + ".extraction.value", "Extracted value does not exactly match the claim.");
  if (item.extraction?.unit !== (claim.unit ?? "")) issue(out, "UNIT_CONFLICT", path + ".extraction.unit", "Unit mismatch; automatic unit conversion is not allowed.");
  return out;
}
function isValidClaim(claim) {
  return !!claim && typeof claim === "object" && !Array.isArray(claim) &&
    typeof claim.claimId === "string" && !!claim.claimId.trim() &&
    typeof claim.modelId === "string" && !!claim.modelId.trim() &&
    comparable(claim.value) !== null &&
    (claim.unit === null || claim.unit === undefined || typeof claim.unit === "string") &&
    (claim.configurationId === null || claim.configurationId === undefined || typeof claim.configurationId === "string");
}

/** Read-only pre-ingestion gate. Evidence is indexed once; each package is validated once. */
export function buildAutomatedVerificationReport({ claims, evidence, now = new Date().toISOString() }) {
  if (!Array.isArray(claims)) throw new TypeError("claims must be an array");
  if (!Array.isArray(evidence)) throw new TypeError("evidence must be an array");

  const evidenceByClaim = new Map();
  for (let index = 0; index < evidence.length; index++) {
    const item = evidence[index];
    const key = item && typeof item === "object" ? item.claimId : null;
    if (typeof key !== "string" || !key) continue;
    if (!evidenceByClaim.has(key)) evidenceByClaim.set(key, []);
    evidenceByClaim.get(key).push({ item, index });
  }

  const decisions = claims.map((claim, claimIndex) => {
    const issues = [];
    const validClaim = isValidClaim(claim);
    if (!validClaim) issue(issues, "INVALID_CLAIM", "claims[" + claimIndex + "]", "Claim requires non-empty claimId/modelId, a finite number or non-empty string value, and valid optional unit/configuration fields.");

    const related = validClaim ? (evidenceByClaim.get(claim.claimId) ?? []) : [];
    const valid = [];
    for (const entry of related) {
      const evidenceIssues = validateEvidence(entry.item, entry.index, claim);
      issues.push(...evidenceIssues);
      if (evidenceIssues.length === 0) valid.push(entry.item);
    }

    const sourceIds = valid.map(item => item.source.sourceId);
    if (new Set(sourceIds).size !== sourceIds.length) {
      issue(issues, "DUPLICATE_SOURCE_IDENTITY", "claims[" + claimIndex + "]", "Evidence packages must use distinct source registry IDs.");
    }

    const manufacturerPrimaryCount = valid.filter(item => item.source.authority === "manufacturer_primary").length;
    const independentHosts = new Set(valid
      .filter(item => item.source.authority === "independent_primary")
      .map(item => host(item.source.url))
      .filter(Boolean));
    if (manufacturerPrimaryCount < 1 && independentHosts.size < 2) {
      issue(issues, "INSUFFICIENT_INDEPENDENT_EVIDENCE", "claims[" + claimIndex + "]", "Require one exact, rights-cleared manufacturer primary source OR two matching independent primary sources on distinct hosts.");
    }

    const status = issues.length ? "quarantined" : "eligible_for_automatic_ingestion";
    const allHosts = new Set(valid.map(item => host(item.source.url)).filter(Boolean));
    const authorities = new Set(valid.map(item => item.source.authority));
    return {
      decisionId: createHash("sha256").update(String(claim?.claimId) + "|" + now).digest("hex").slice(0, 24),
      claimId: claim?.claimId ?? null,
      modelId: claim?.modelId ?? null,
      status,
      evidenceCount: related.length,
      independentHostCount: independentHosts.size,
      sourceHostCount: allHosts.size,
      sourceAuthorities: [...authorities].sort(),
      issues,
      catalogMutationAllowed: false
    };
  });

  return {
    engineVersion: "1.1.0",
    generatedAt: now,
    policy: {
      automaticGate: true,
      minimumIndependentSources: 2,
      requiredEvidenceRule: "one_manufacturer_primary_or_two_independent_primary_sources",
      exactModelAndConfigurationMatch: true,
      exactValueAndUnitMatch: true,
      rightsClearanceRequired: true,
      documentSha256Required: true,
      evidenceLocatorRequired: true,
      parserVersionRequired: true,
      evidenceIndexedByClaim: true,
      eachEvidenceValidatedOnce: true,
      catalogMutation: false,
      uncertainOrConflictingData: "quarantine"
    },
    counts: {
      claims: decisions.length,
      eligible: decisions.filter(item => item.status === "eligible_for_automatic_ingestion").length,
      quarantined: decisions.filter(item => item.status === "quarantined").length,
      errors: decisions.reduce((sum, item) => sum + item.issues.length, 0)
    },
    decisions
  };
}
