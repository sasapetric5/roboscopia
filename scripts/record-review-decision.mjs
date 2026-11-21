import { readFile, writeFile, rename, open, unlink } from "node:fs/promises";
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
  const queue = buildReviewQueue(db, auditDatabase(db));
  const decision = createReviewDecision(
    { itemId, status, note, decidedBy },
    new Set(queue.items.map((item) => item.id))
  );

  // Serialize writers and reload the event log only after acquiring the lock.
  const lockPath = decisionsPath + ".lock";
  let lock;
  try { lock = await open(lockPath, "wx"); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("Review decision store is locked; retry after it completes.");
    throw error;
  }
  const temporaryPath = decisionsPath + ".tmp-" + process.pid;
  try {
    let store = { version: "1.1.0", decisions: [] };
    try { store = JSON.parse(await readFile(decisionsPath, "utf8")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    if (!Array.isArray(store.decisions)) throw new Error("Review decision store is invalid.");
    const latest = store.decisions.filter((entry) => entry.itemId === itemId).at(-1);
    if (latest && latest.status === decision.status && latest.note === decision.note && latest.decidedBy === decision.decidedBy) {
      throw new Error("Identical review decision already exists.");
    }
    const nextStore = {
      version: "1.1.0",
      updatedAt: decision.decidedAt,
      decisions: [...store.decisions, decision],
    };
    await writeFile(temporaryPath, JSON.stringify(nextStore, null, 2) + "\n", { flag: "wx" });
    await rename(temporaryPath, decisionsPath);
  } finally {
    await lock.close();
    await unlink(lockPath).catch(() => {});
    await unlink(temporaryPath).catch(() => {});
  }
  process.stdout.write("Appended review decision for " + itemId + ": " + status + "\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Review decision was not saved: ${error.message}\n`);
    process.exitCode = 1;
  });
}
