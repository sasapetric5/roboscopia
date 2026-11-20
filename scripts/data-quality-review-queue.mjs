import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { auditDatabase } from "./data-quality-audit.mjs";

export const REVIEW_STATUSES = new Set([
  "open",
  "in_review",
  "resolved",
  "accepted_risk",
  "rejected",
]);

const PRIORITY_BY_CODE = {
  BROKEN_REFERENCE: "critical",
  INVALID_SOURCE_URL: "high",
  UNKNOWN_SOURCE_REFERENCE: "high",
  MISSING_PROVENANCE: "high",
  SOURCE_REFERENCE_MISMATCH: "high",
  CONFIGURATION_STATUS_CONTRADICTION: "high",
  POTENTIAL_SPECIFICATION_CONFLICT: "high",
  POTENTIAL_DUPLICATE_MODEL: "medium",
  STALE_VERIFIED_SPECIFICATION: "medium",
  MEDIA_NOT_CLEARED: "medium",
};

function stableId(issue) {
  return createHash("sha256")
    .update([issue.code, issue.path, issue.message].join("|"))
    .digest("hex")
    .slice(0, 20);
}

function getAtPath(root, path) {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let current = root;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function findRecord(db, issue) {
  const match = issue.path.match(/^records\[(\d+)\]/);
  if (!match) return null;
  const record = db.records?.[Number(match[1])];
  if (!record) return null;
  return {
    id: record.id ?? null,
    model: record.model ?? null,
    manufacturer: record.manufacturer ?? null,
    category: record.category ?? null,
  };
}

function findSource(db, issue) {
  const sourceMatch = issue.path.match(/sources\[(\d+)\]/);
  if (sourceMatch) return db.sources?.[Number(sourceMatch[1])] ?? null;

  const specificationMatch = issue.path.match(/^records\\[(\\d+)\\]\\.specifications\\[(\\d+)\\]/);
  if (specificationMatch) {
    const record = db.records?.[Number(specificationMatch[1])];
    const spec = record?.specifications?.[Number(specificationMatch[2])];
    const sourceId = spec?.sourceId ?? spec?.provenance?.sourceId;
    if (sourceId) return db.sources?.find((source) => source.id === sourceId) ?? null;
  }
  const sourceId = getAtPath(db, issue.path)?.sourceId;
  if (!sourceId) return null;
  return db.sources?.find((source) => source.id === sourceId) ?? null;
}

/**
 * Build a stable human-review queue from a read-only audit report.
 * Decisions are kept separately from canonical model data.
 */
export function buildReviewQueue(db, report = auditDatabase(db), decisions = []) {
  const knownItemIds = new Set(report.issues.map(stableId));
  const decisionMap = new Map();
  for (const decision of decisions) {
    if (!decision || typeof decision.itemId !== "string") continue;
    if (validateReviewDecision(decision, knownItemIds).length > 0) continue;
    decisionMap.set(decision.itemId, decision);
  }

  const items = report.issues.map((issue) => {
    const id = stableId(issue);
    const decision = decisionMap.get(id);
    const record = findRecord(db, issue);
    const source = findSource(db, issue);
    return {
      id,
      code: issue.code,
      severity: issue.severity,
      priority: PRIORITY_BY_CODE[issue.code] ??
        (issue.severity === "error" ? "high" : issue.severity === "warning" ? "medium" : "low"),
      status: decision?.status ?? "open",
      path: issue.path,
      message: issue.message,
      model: record,
      source: source ? {
        id: source.id ?? null,
        title: source.title ?? source.name ?? null,
        url: source.url ?? null,
        reviewStatus: source.reviewStatus ?? null,
      } : null,
      decision: decision ? {
        status: decision.status,
        note: decision.note,
        decidedBy: decision.decidedBy ?? null,
        decidedAt: decision.decidedAt ?? null,
      } : null,
    };
  });

  const counts = {
    total: items.length,
    open: items.filter((item) => item.status === "open").length,
    inReview: items.filter((item) => item.status === "in_review").length,
    resolved: items.filter((item) => item.status === "resolved").length,
    acceptedRisk: items.filter((item) => item.status === "accepted_risk").length,
    rejected: items.filter((item) => item.status === "rejected").length,
    critical: items.filter((item) => item.priority === "critical").length,
    high: items.filter((item) => item.priority === "high").length,
  };

  return {
    queueVersion: "1.0.0",
    schemaVersion: db?.schemaVersion ?? null,
    generatedAt: new Date().toISOString(),
    counts,
    items,
  };
}

export function validateReviewDecision(decision, knownItemIds) {
  const errors = [];
  if (!decision || typeof decision !== "object" || Array.isArray(decision)) {
    return ["Decision must be an object."];
  }
  if (typeof decision.itemId !== "string" || !knownItemIds.has(decision.itemId)) {
    errors.push("itemId must refer to an item in the current review queue.");
  }
  if (!REVIEW_STATUSES.has(decision.status) || decision.status === "open") {
    errors.push("Decision status must be in_review, resolved, accepted_risk or rejected.");
  }
  if (decision.status !== "in_review" && (typeof decision.note !== "string" || !decision.note.trim())) {
    errors.push("A non-empty note is required when closing or accepting a review item.");
  }
  if (decision.decidedBy !== undefined && (typeof decision.decidedBy !== "string" || !decision.decidedBy.trim())) {
    errors.push("decidedBy, when supplied, must be a non-empty string.");
  }
  return errors;
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const dbPath = resolve(args.find((arg) => !arg.startsWith("--")) || "data/robots.json");
  const decisionsPath = resolve("data/review-decisions.json");
  const db = JSON.parse(await readFile(dbPath, "utf8"));
  let decisions = [];
  try {
    const parsed = JSON.parse(await readFile(decisionsPath, "utf8"));
    decisions = Array.isArray(parsed.decisions) ? parsed.decisions : [];
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const report = auditDatabase(db);
  const queueResult = buildReviewQueue(db, report, decisions);
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(queueResult, null, 2)}\n`);
  } else {
    process.stdout.write([
      `ROBOSCOPIA Review Queue — ${queueResult.counts.total} items`,
      `Open: ${queueResult.counts.open} | In review: ${queueResult.counts.inReview} | Resolved: ${queueResult.counts.resolved}`,
      `Accepted risk: ${queueResult.counts.acceptedRisk} | Rejected: ${queueResult.counts.rejected}`,
      "",
      ...queueResult.items.map((item) =>
        `[${item.status.toUpperCase()} / ${item.priority.toUpperCase()}] ${item.code} — ${item.model?.model ?? "Database"} — ${item.path}\n  ${item.message}`
      ),
    ].join("\n") + "\n");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Review queue generation failed: ${error.message}\n`);
    process.exitCode = 2;
  });
}
