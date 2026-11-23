import { createHash } from "node:crypto";

export const REQUIRED_PUBLICATION_GATES = Object.freeze([
  "content",
  "facts",
  "provenance",
  "media_rights",
  "seo",
  "internal_links",
  "external_sources",
  "security",
  "duplicates",
  "freshness"
]);

const GATE_STATUSES = new Set(["passed", "needs_verification", "failed", "quarantine"]);

function normalizeGate(name, gate) {
  if (!gate || typeof gate !== "object" || Array.isArray(gate)) {
    return {
      name,
      status: "needs_verification",
      reasonCodes: ["GATE_REPORT_MISSING"],
      details: "A required gate report was not supplied."
    };
  }
  if (!GATE_STATUSES.has(gate.status)) {
    return {
      name,
      status: "quarantine",
      reasonCodes: ["GATE_STATUS_INVALID"],
      details: "Gate status is missing or not recognized; fail closed."
    };
  }
  const reasonCodes = Array.isArray(gate.reasonCodes)
    ? [...new Set(gate.reasonCodes.filter(code => typeof code === "string" && /^[A-Z0-9_]{2,80}$/.test(code)))].sort()
    : [];
  if (gate.status !== "passed" && reasonCodes.length === 0) reasonCodes.push("GATE_REQUIRES_ATTENTION");
  return {
    name,
    status: gate.status,
    reasonCodes,
    details: typeof gate.details === "string" ? gate.details.slice(0, 500) : ""
  };
}

/**
 * Page-level deterministic publication decision.
 * All required gates are conjunctive: no score or successful gate can override a failed gate.
 * Missing evidence requires verification; malformed gate state is quarantined.
 * This function is pure and never publishes, edits content or changes source/media rights.
 */
export function evaluatePublicationReadiness({ pageId, gates, now = new Date().toISOString(), policyVersion = "1.0.0" }) {
  if (typeof pageId !== "string" || !/^[a-z0-9][a-z0-9._-]{0,119}$/i.test(pageId)) {
    throw new TypeError("pageId must be a stable non-empty identifier");
  }
  if (!gates || typeof gates !== "object" || Array.isArray(gates)) {
    throw new TypeError("gates must be an object keyed by required gate name");
  }
  if (!Number.isFinite(Date.parse(now))) throw new TypeError("now must be a valid timestamp");
  if (typeof policyVersion !== "string" || !policyVersion.trim()) throw new TypeError("policyVersion must be a non-empty string");

  const normalized = REQUIRED_PUBLICATION_GATES.map(name => normalizeGate(name, gates[name]));
  const hardFailures = normalized.filter(gate => gate.status === "failed" || gate.status === "quarantine");
  const pending = normalized.filter(gate => gate.status === "needs_verification");
  const decision = hardFailures.length ? "quarantine" : pending.length ? "needs_verification" : "publish";
  const reasonCodes = [...new Set(normalized.flatMap(gate => gate.reasonCodes.map(code => gate.name.toUpperCase() + "_" + code)))].sort();
  const material = JSON.stringify({ pageId, policyVersion, decision, gates: normalized, reasonCodes });
  return {
    decisionId: createHash("sha256").update(material).digest("hex").slice(0, 32),
    pageId,
    generatedAt: now,
    policyVersion,
    decision,
    publishEligible: decision === "publish",
    gates: normalized,
    counts: {
      required: normalized.length,
      passed: normalized.filter(gate => gate.status === "passed").length,
      needsVerification: pending.length,
      failed: normalized.filter(gate => gate.status === "failed").length,
      quarantined: normalized.filter(gate => gate.status === "quarantine").length
    },
    reasonCodes,
    catalogMutationAllowed: false,
    publicationActionPerformed: false
  };
}
