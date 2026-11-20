import { readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { auditDatabase } from "./data-quality-audit.mjs";
import {
  buildReviewQueue,
  validateReviewDecision,
} from "./data-quality-review-queue.mjs";

export function createReviewDecision({ itemId, status, note, decidedBy, decidedAt = new Date().toISOString() }, knownItemIds) {
  const decision = { itemId, status, note, decidedBy, decidedAt };
  const errors = validateReviewDecision(decision, knownItemIds);
  if (errors.length) {
    const error = new Error(errors.join(" "));
    error.validationErrors = errors;
    throw error;
  }
  return decision;
}

async function main() {
  const [itemId, status, note, decidedBy] = process.argv.slice(2);
  if (!itemId || !status || !note || !decidedBy) {
    throw new Error('Usage: node scripts/record-review-decision.mjs <itemId> <status> "<note>" "<reviewer>"');
  }

  const dbPath = resolve("data/robots.json");
  const decisionsPath = resolve("data/review-decisions.json");
  const db = JSON.parse(await readFile(dbPath, "utf8"));
  let store = { version: "1.0.0", decisions: [] };
  try {
    store = JSON.parse(await readFile(decisionsPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (!Array.isArray(store.decisions)) throw new Error("Review decision store is invalid.");

  const queue = buildReviewQueue(db, auditDatabase(db), store.decisions);
  const decision = createReviewDecision(
    { itemId, status, note, decidedBy },
    new Set(queue.items.map((item) => item.id))
  );

  const existingIndex = store.decisions.findIndex((entry) => entry.itemId === itemId);
  if (existingIndex >= 0) store.decisions[existingIndex] = decision;
  else store.decisions.push(decision);

  const nextStore = {
    version: "1.0.0",
    updatedAt: decision.decidedAt,
    decisions: store.decisions,
  };
  const temporaryPath = `${decisionsPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(nextStore, null, 2)}\n`, { flag: "w" });
  await rename(temporaryPath, decisionsPath);
  process.stdout.write(`Saved review decision for ${itemId}: ${status}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Review decision was not saved: ${error.message}\n`);
    process.exitCode = 1;
  });
}
