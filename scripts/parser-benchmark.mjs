import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, basename } from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFile = promisify(execFileCallback);
function escapeRegex(value) {
  return Array.from(value).map((character) =>
    "\\^$.*+?()[]{}|".includes(character) ? "\\\\" + character : character
  ).join("");
}
export function scoreOutput(output, expected) {
  const normalized = String(output ?? "").toLocaleLowerCase().replace(/\\s+/g, " ").trim();
  const checks = expected.map((item) => {
    const needle = String(item.text).toLocaleLowerCase().replace(/\\s+/g, " ").trim();
    const exact = needle
      ? new RegExp("(?<![\\\\p{L}\\\\p{N}.,])" + escapeRegex(needle) + "(?![\\\\p{L}\\\\p{N}.,])", "u").test(normalized)
      : false;
    return { id: item.id, field: item.field ?? null, found: exact };
  });
  const passed = checks.filter((item) => item.found).length;
  return { expectedCount: checks.length, matchedCount: passed, recall: checks.length ? passed / checks.length : null, checks };
}
async function runAdapter(adapter, pdf, timeoutMs) {
  const script = resolve("adapters", adapter === "docling" ? "docling_adapter.py" : "opendataloader_adapter.py");
  const { stdout } = await execFile(process.env.PYTHON ?? "python3", [script, resolve(pdf)], {
    timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024, encoding: "utf8"
  });
  const result = JSON.parse(stdout);
  if (result.local_only !== true || typeof result.text !== "string") throw new Error("Adapter output failed normalized contract.");
  return result;
}
async function main() {
  const args = process.argv.slice(2);
  const manifestPath = args[0] ?? "data/parser-benchmark-corpus.json";
  const outputPath = args[1] ?? "artifacts/parser-benchmark-report.json";
  const manifest = JSON.parse(await readFile(resolve(manifestPath), "utf8"));
  const results = [];
  for (const fixture of manifest.fixtures ?? []) {
    if (!fixture.rights?.processingPermitted || !fixture.rights?.reviewer || !fixture.rights?.basis) {
      results.push({ fixtureId: fixture.id, status: "quarantined", reason: "RIGHTS_REVIEW_REQUIRED" });
      continue;
    }
    if (!fixture.path || !Array.isArray(fixture.expectedEvidence)) throw new Error("Invalid benchmark fixture: " + fixture.id);
    const fixtureResult = { fixtureId: fixture.id, document: basename(fixture.path), parsers: {} };
    for (const adapter of ["opendataloader", "docling"]) {
      try {
        const parsed = await runAdapter(adapter, fixture.path, fixture.timeoutMs ?? 300000);
        const score = scoreOutput(parsed.text, fixture.expectedEvidence);
        fixtureResult.parsers[adapter] = {
          status: parsed.status, version: parsed.version, elapsedSeconds: parsed.elapsed_seconds,
          pageCount: parsed.page_count, tableCount: parsed.table_count, ...score
        };
      } catch (error) {
        fixtureResult.parsers[adapter] = { status: "error", error: error.message };
      }
    }
    results.push(fixtureResult);
  }
  const report = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    corpusStatus: results.length ? "executed" : "empty_no_benchmark_claim",
    fixtureCount: results.length,
    rightsPolicy: "Only fixtures with explicit processing permission are processed.",
    scoring: "Exact normalized expected-snippet recall only; not factual correctness, table fidelity, or parser winner determination.",
    catalogMutation: false,
    results
  };
  await mkdir(dirname(resolve(outputPath)), { recursive: true });
  await writeFile(resolve(outputPath), JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
  process.stdout.write(JSON.stringify({ corpusStatus: report.corpusStatus, fixtureCount: report.fixtureCount, output: resolve(outputPath) }) + "\n");
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { process.stderr.write(error.message + "\n"); process.exitCode = 2; });
}
