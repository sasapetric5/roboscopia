import { readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSourceVerificationReport } from "./source-verification-engine.mjs";

const ALLOWED = new Set(["supported", "partially_supported", "contradicted", "not_applicable"]);

export function validateSourceDecision(decision, report) {
  const errors = [];
  const claim = report.claims.find((item) => item.claimId === decision?.claimId);
  if (!claim) errors.push("claimId must refer to a current source-verification claim.");
  if (!ALLOWED.has(decision?.outcome)) errors.push("outcome must be supported, partially_supported, contradicted or not_applicable.");
  if (!claim?.sourceId || decision?.sourceId !== claim.sourceId) errors.push("sourceId must match the claim's linked source.");
  if (typeof decision?.evidenceLocator !== "string" || !decision.evidenceLocator.trim()) errors.push("evidenceLocator is required.");
  if (typeof decision?.note !== "string" || !decision.note.trim()) errors.push("A reviewer note is required.");
  if (typeof decision?.reviewer !== "string" || !decision.reviewer.trim()) errors.push("Reviewer identity is required.");
  if (!Number.isFinite(Date.parse(decision?.reviewedAt))) errors.push("reviewedAt must be a valid date.");
  if (decision?.outcome === "supported" && claim?.sourceId && !decision?.evidenceLocator?.trim()) {
    errors.push("A precise evidence locator is required for a supported claim.");
  }
  return errors;
}

export function createSourceDecision(input, report) {
  const decision = { ...input };
  const errors = validateSourceDecision(decision, report);
  if (errors.length) {
    const error = new Error(errors.join(" "));
    error.validationErrors = errors;
    throw error;
  }
  return decision;
}

async function main() {
  const [claimId, outcome, evidenceLocator, note, reviewer] = process.argv.slice(2);
  if (!claimId || !outcome || !evidenceLocator || !note || !reviewer) {
    throw new Error('Usage: node scripts/record-source-decision.mjs <claimId> <outcome> "<evidenceLocator>" "<note>" "<reviewer>"');
  }
  const db = JSON.parse(await readFile(resolve("data/robots.json"), "utf8"));
  const decisionsPath = resolve("data/source-verification-decisions.json");
  let store = { version: "1.0.0", decisions: [] };
  try {
    store = JSON.parse(await readFile(decisionsPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (!Array.isArray(store.decisions)) throw new Error("Source decision store is invalid.");
  const report = buildSourceVerificationReport(db, store.decisions);
  const claim = report.claims.find((item) => item.claimId === claimId);
  const decision = createSourceDecision({
    claimId,
    sourceId: claim?.sourceId,
    outcome,
    evidenceLocator,
    note,
    reviewer,
    reviewedAt: new Date().toISOString(),
  }, report);
  const index = store.decisions.findIndex((item) => item.claimId === claimId);
  if (index >= 0) store.decisions[index] = decision;
  else store.decisions.push(decision);
  const temp = `${decisionsPath}.tmp`;
  await writeFile(temp, `${JSON.stringify({ version: "1.0.0", updatedAt: decision.reviewedAt, decisions: store.decisions }, null, 2)}\n`);
  await rename(temp, decisionsPath);
  process.stdout.write(`Recorded source review for ${claimId}: ${outcome}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Source review was not recorded: ${error.message}\n`);
    process.exitCode = 1;
  });
}
