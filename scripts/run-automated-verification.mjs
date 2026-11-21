import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSourceVerificationReport } from "./source-verification-engine.mjs";
import { buildAutomatedVerificationReport } from "./automated-verification-engine.mjs";

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const dbPath = resolve(args.find(item => item.startsWith("--data="))?.slice(7) ?? "data/robots.json");
  const evidencePath = resolve(args.find(item => item.startsWith("--evidence="))?.slice(11) ?? "data/automated-evidence-packages.json");
  const db = JSON.parse(await readFile(dbPath, "utf8"));
  const evidenceFile = JSON.parse(await readFile(evidencePath, "utf8"));
  if (evidenceFile.schemaVersion !== "1.0.0" || !Array.isArray(evidenceFile.packages)) {
    throw new Error("Evidence package file must use schemaVersion 1.0.0 and contain a packages array.");
  }
  const sourceReport = buildSourceVerificationReport(db);
  const report = buildAutomatedVerificationReport({ claims: sourceReport.claims, evidence: evidenceFile.packages });
  if (json) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  else {
    process.stdout.write("Automated verification: " + report.counts.claims + " claims; " + report.counts.eligible + " eligible; " + report.counts.quarantined + " quarantined; " + report.counts.errors + " errors.\n");
    process.stdout.write("Read-only report. No catalog records were changed.\n");
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    process.stderr.write("Automated verification failed: " + error.message + "\n");
    process.exitCode = 2;
  });
}
