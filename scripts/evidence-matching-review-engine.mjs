import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUTCOMES = new Set(["supported", "partially_supported", "contradicted", "not_applicable"]);
const sha = (value) => createHash("sha256").update(value).digest("hex").slice(0, 24);
const norm = (value) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const normUnit = (value) => String(value ?? "").normalize("NFKC").toLowerCase()
  .replace(/[·⋅]/g, "").replace(/\s+/g, "");
const FIELD_ALIASES = new Map([
  ["mass", ["mass", "weight", "mass with battery", "weight with battery", "robot arm mass", "robot mass"]],
  ["payload", ["payload", "maximum payload", "max payload", "rated payload", "standard payload"]],
  ["speed", ["speed", "maximum speed", "top speed", "maximum running speed", "moving speed", "maximum tcp speed", "max tcp speed"]],
  ["runtime", ["runtime", "typical runtime", "run time", "operating time", "battery life", "battery endurance"]],
  ["battery_capacity", ["battery capacity", "capacity", "battery energy"]],
  ["reach", ["reach", "working reach", "maximum reach", "reach to wrist", "reach to flange"]],
  ["repeatability", ["repeatability", "pose repeatability"]],
  ["degrees_of_freedom", ["degrees of freedom", "dof", "axes", "number of axes"]],
  ["ingress_protection", ["ingress protection", "ip rating", "ip"]],
  ["power", ["power", "rated power", "power consumption"]],
  ["height", ["height", "overall height", "standing height"]],
  ["dimensions", ["dimensions", "standing dimensions"]],
  ["torque", ["torque", "maximum joint torque", "joint torque"]],
]);
const FIELD_BY_LABEL = new Map([...FIELD_ALIASES].flatMap(([field, labels]) => [[norm(field), field], ...labels.map((label) => [norm(label), field])]));
const UNIT_GROUPS = {
  mass: { kg: 1, g: 0.001, lb: 0.45359237, lbs: 0.45359237 },
  payload: { kg: 1, g: 0.001, lb: 0.45359237, lbs: 0.45359237 },
  speed: { "m/s": 1, "km/h": 1 / 3.6, "mm/s": 0.001, mph: 0.44704 },
  runtime: { min: 1, minute: 1, minutes: 1, h: 60, hour: 60, hours: 60 },
  battery_capacity: { wh: 1, kwh: 1000, ah: null, mah: null },
  reach: { mm: 0.001, cm: 0.01, m: 1, in: 0.0254, inch: 0.0254, inches: 0.0254 },
  repeatability: { mm: 1, cm: 10, in: 25.4 },
  height: { mm: 0.001, cm: 0.01, m: 1, in: 0.0254 },
  torque: { nm: 1, knm: 1000 },
  power: { w: 1, kw: 1000 },
};
function fieldFor(spec) {
  const labels = [spec?.field, spec?.name, spec?.specification, spec?.fieldLabel].filter(Boolean).map(norm);
  for (const label of labels) {
    const direct = FIELD_BY_LABEL.get(label);
    if (direct) return direct;
  }
  const combined = labels.join(" ");
  for (const [field, aliases] of FIELD_ALIASES) {
    if (aliases.some((alias) => combined.includes(norm(alias)))) return field;
  }
  return null;
}
function numeric(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\s*\d+(?:[.,]\d+)?\s*$/.test(value)) return Number(value.trim().replace(",", "."));
  return null;
}
function compareValue(claim, candidate, field) {
  const claimText = String(claim.value ?? "").trim();
  const evidenceText = String(candidate.extractedValue ?? "").trim();
  if (candidate.valueQualifier || /[±≈~]|\b(?:approx(?:imately)?|about)\b|\d\s*[–—-]\s*\d/i.test(claimText + " " + evidenceText)) return "non_scalar_review";
  const a = numeric(claim.value);
  const b = numeric(candidate.extractedValue);
  if (a === null || b === null) {
    return norm(claim.value) === norm(candidate.extractedValue) ? "equal" : "non_scalar_review";
  }
  const claimUnit = normUnit(claim.unit);
  const evidenceUnit = normUnit(candidate.unit);
  if (claimUnit === evidenceUnit) return Math.abs(a - b) <= Math.max(0.000001, Math.abs(a) * 0.000001) ? "equal" : "mismatch";
  const group = UNIT_GROUPS[field];
  const left = group?.[claimUnit];
  const right = group?.[evidenceUnit];
  if (left === undefined || right === undefined || left === null || right === null) return "unit_mismatch";
  return Math.abs(a * left - b * right) <= Math.max(0.000001, Math.abs(a * left) * 0.000001) ? "equal_converted" : "mismatch";
}
function sourceHost(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
}
function staleEvidence(candidate, now) {
  if (!candidate.documentDate) return false;
  const date = Date.parse(candidate.documentDate);
  if (!Number.isFinite(date)) return false;
  return date < now - 365 * 24 * 60 * 60 * 1000;
}

/** Deterministic, read-only matching. It never changes catalog records or approves evidence. */
export function buildEvidenceMatchingReport(db, sourceReport, extractionReports = [], decisions = [], now = Date.now()) {
  const candidates = extractionReports.flatMap((report) => Array.isArray(report) ? report : report?.candidates ?? []);
  const claims = sourceReport?.claims ?? [];
  const pairs = [];
  for (const claim of claims) {
    const field = fieldFor(claim);
    const possible = candidates.filter((candidate) => {
      const candidateField = fieldFor(candidate);
      return field && candidateField === field;
    });
    const ranked = possible.map((candidate) => {
      const sameModel = candidate.modelId === claim.modelId;
      const modelUnspecified = !candidate.modelId;
      const sameConfig = (candidate.configurationId ?? null) === (claim.configurationId ?? null);
      const configUnspecified = !candidate.configurationId && !claim.configurationId;
      const claimHost = sourceHost(claim.sourceUrl);
      const evidenceHost = sourceHost(candidate.sourceUrl);
      const sameSourceHost = Boolean(claimHost && evidenceHost && claimHost === evidenceHost);
      const valueResult = compareValue(claim, candidate, field);
      let status = "candidate_review";
      if (!sameModel && !modelUnspecified) status = "model_mismatch";
      else if (!sameConfig && !configUnspecified) status = "configuration_mismatch";
      else if (candidate.modelMentionStatus === "not_found") status = "model_identity_unverified";
      else if (candidate.configurationMentionStatus === "not_found") status = "configuration_identity_unverified";
      else if (modelUnspecified) status = "model_identity_unverified";
      else if (valueResult === "unit_mismatch") status = "unit_mismatch";
      else if (valueResult === "mismatch") status = "value_mismatch";
      else if (valueResult === "non_scalar_review") status = "non_scalar_review";
      else if (staleEvidence(candidate, now)) status = "possible_stale_evidence";
      else if (valueResult === "equal" || valueResult === "equal_converted") status = "value_match_unverified";
      return {
        matchId: sha([claim.claimId, candidate.candidateId].join("|")),
        claimId: claim.claimId,
        candidateId: candidate.candidateId,
        status,
        field,
        catalog: { modelId: claim.modelId, model: claim.model, specification: claim.specification, value: claim.value, unit: claim.unit, configurationId: claim.configurationId, sourceId: claim.sourceId, sourceUrl: claim.sourceUrl },
        evidence: {
          extractedValue: candidate.extractedValue,
          unit: candidate.unit ?? null,
          modelId: candidate.modelId ?? null,
          modelName: candidate.modelName ?? null,
          configurationId: candidate.configurationId ?? null,
          sourceUrl: candidate.sourceUrl ?? null,
          sameSourceHost,
          documentName: candidate.documentName ?? null,
          documentSha256: candidate.documentSha256 ?? null,
          documentRevision: candidate.documentRevision ?? null,
          documentDate: candidate.documentDate ?? null,
          exactMatch: candidate.exactMatch ?? null,
          evidenceQuote: candidate.evidenceQuote ?? null,
          evidenceLocator: candidate.evidenceLocator ?? null,
          modelMentionStatus: candidate.modelMentionStatus ?? "not_checked",
          configurationMentionStatus: candidate.configurationMentionStatus ?? "not_checked",
          extractionStatus: candidate.reviewStatus ?? "extracted_unverified",
        },
        valueComparison: valueResult,
        identity: { sameModel, modelUnspecified, sameConfiguration: sameConfig, configurationUnspecified: configUnspecified, sameSourceHost },
        reviewRequired: true,
        catalogMutationAllowed: false,
      };
    });
    const best = ranked.filter((item) => item.status === "value_match_unverified" || item.status === "possible_stale_evidence");
    const chosen = best.length > 1 ? best.map((item) => ({ ...item, status: "ambiguous_match" })) : ranked;
    pairs.push(...chosen);
    if (chosen.length === 0) pairs.push({
      matchId: sha([claim.claimId, "no-evidence"].join("|")),
      claimId: claim.claimId, candidateId: null, status: "no_matching_evidence",
      field, catalog: { modelId: claim.modelId, model: claim.model, specification: claim.specification, value: claim.value, unit: claim.unit, configurationId: claim.configurationId, sourceId: claim.sourceId, sourceUrl: claim.sourceUrl },
      evidence: null, reviewRequired: true, catalogMutationAllowed: false,
    });
  }
  const knownMatchIds = new Set(pairs.map((item) => item.matchId));
  const validDecisions = decisions.filter((decision) =>
    decision && knownMatchIds.has(decision.matchId) && OUTCOMES.has(decision.outcome) &&
    typeof decision.evidenceLocator === "string" && decision.evidenceLocator.trim() &&
    typeof decision.note === "string" && decision.note.trim() &&
    typeof decision.reviewer === "string" && decision.reviewer.trim() &&
    Number.isFinite(Date.parse(decision.reviewedAt))
  );
  const decisionMap = new Map(validDecisions.map((item) => [item.matchId, item]));
  for (const item of pairs) {
    const decision = decisionMap.get(item.matchId);
    if (decision) item.humanReview = { outcome: decision.outcome, evidenceLocator: decision.evidenceLocator, note: decision.note, reviewer: decision.reviewer, reviewedAt: decision.reviewedAt };
    else item.humanReview = null;
  }
  const counts = {
    claims: claims.length, candidates: candidates.length, comparisons: pairs.length,
    valueMatches: pairs.filter((item) => item.status === "value_match_unverified").length,
    valueMismatches: pairs.filter((item) => item.status === "value_mismatch").length,
    unitMismatches: pairs.filter((item) => item.status === "unit_mismatch").length,
    modelMismatches: pairs.filter((item) => item.status === "model_mismatch").length,
    configurationMismatches: pairs.filter((item) => item.status === "configuration_mismatch").length,
    possibleStaleEvidence: pairs.filter((item) => item.status === "possible_stale_evidence").length,
    ambiguousMatches: pairs.filter((item) => item.status === "ambiguous_match").length,
    noMatchingEvidence: pairs.filter((item) => item.status === "no_matching_evidence").length,
    humanReviewed: pairs.filter((item) => item.humanReview).length,
  };
  return {
    engineVersion: "1.0.0", schemaVersion: db?.schemaVersion ?? null, generatedAt: new Date(now).toISOString(),
    policy: { deterministicMatching: true, externalNetworkRequests: false, scraping: false, catalogMutated: false, automaticApproval: false, humanApprovalRequiredForCatalogChanges: true, unitConversionsAreComparisonOnly: true },
    counts, matches: pairs, ignoredDecisionCount: decisions.length - validDecisions.length,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const paths = [];
  for (let i = 0; i < args.length; i++) if (args[i] === "--evidence") { if (!args[i + 1]) throw new Error("--evidence requires a JSON file path."); paths.push(args[++i]); }
  const db = JSON.parse(await readFile(resolve("data/robots.json"), "utf8"));
  const sourceReport = JSON.parse(await readFile(resolve("data/source-verification-report.json"), "utf8"));
  const extractionReports = [];
  for (const path of paths) extractionReports.push(JSON.parse(await readFile(resolve(path), "utf8")));
  const decisionPath = resolve("data/evidence-matching-decisions.json");
  let decisions = [];
  try { const store = JSON.parse(await readFile(decisionPath, "utf8")); decisions = Array.isArray(store.decisions) ? store.decisions : []; }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const report = buildEvidenceMatchingReport(db, sourceReport, extractionReports, decisions);
  process.stdout.write(json ? JSON.stringify(report, null, 2) + "\n" : `Evidence Matching — ${report.counts.claims} claims, ${report.counts.comparisons} comparisons, ${report.counts.valueMatches} unverified value matches\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { process.stderr.write(`Evidence matching failed: ${error.message}\n`); process.exitCode = 2; });
}
