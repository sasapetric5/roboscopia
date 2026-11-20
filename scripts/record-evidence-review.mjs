import { readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const OUTCOMES = new Set(["supported", "partially_supported", "contradicted", "not_applicable"]);
export function validateEvidenceReview(decision, report) {
  const errors = [];
  const match = report?.matches?.find((item) => item.matchId === decision?.matchId);
  if (!match || !match.candidateId) errors.push("matchId must identify a current evidence comparison.");
  if (!OUTCOMES.has(decision?.outcome)) errors.push("outcome is not an allowed human-review outcome.");
  if (typeof decision?.evidenceLocator !== "string" || !decision.evidenceLocator.trim()) errors.push("A precise evidence locator is required.");
  if (typeof decision?.note !== "string" || !decision.note.trim()) errors.push("A reviewer note is required.");
  if (typeof decision?.reviewer !== "string" || !decision.reviewer.trim()) errors.push("Reviewer identity is required.");
  if (!Number.isFinite(Date.parse(decision?.reviewedAt))) errors.push("reviewedAt must be a valid timestamp.");
  return errors;
}
async function main() {
  const [matchId, outcome, evidenceLocator, note, reviewer] = process.argv.slice(2);
  if (![matchId, outcome, evidenceLocator, note, reviewer].every(Boolean)) throw new Error('Usage: node scripts/record-evidence-review.mjs <matchId> <outcome> "<evidenceLocator>" "<note>" "<reviewer>"');
  const reportPath = resolve("data/evidence-matching-report.json");
  const decisionsPath = resolve("data/evidence-matching-decisions.json");
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  let store = { version: "1.0.0", decisions: [] };
  try { store = JSON.parse(await readFile(decisionsPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
  if (!Array.isArray(store.decisions)) throw new Error("Evidence decision store is invalid.");
  const decision = { matchId, outcome, evidenceLocator, note, reviewer, reviewedAt: new Date().toISOString() };
  const errors = validateEvidenceReview(decision, report);
  if (errors.length) throw new Error(errors.join(" "));
  const index = store.decisions.findIndex((item) => item.matchId === matchId);
  if (index >= 0) store.decisions[index] = decision; else store.decisions.push(decision);
  const temporary = `${decisionsPath}.tmp`;
  await writeFile(temporary, JSON.stringify({ version: "1.0.0", updatedAt: decision.reviewedAt, decisions: store.decisions }, null, 2) + "\n", { flag: "w" });
  await rename(temporary, decisionsPath);
  process.stdout.write(`Recorded human evidence review for ${matchId}: ${outcome}\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((error) => { process.stderr.write(`Evidence review was not recorded: ${error.message}\n`); process.exitCode = 1; });
