import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

test("evidence source registry contains seven manufacturer-primary source records", async () => {
  const registry = JSON.parse(await readFile(new URL("../data/evidence-document-registry.json", import.meta.url), "utf8"));
  assert.equal(registry.schemaVersion, "1.0.0");
  assert.equal(registry.sources.length, 7);
  assert.equal(new Set(registry.sources.map((item) => item.id)).size, 7);
  for (const source of registry.sources) {
    assert.ok(source.sourcePageUrl.startsWith("https://"));
    assert.ok(source.modelIds.length > 0);
    assert.equal(source.rightsStatus, "review_required");
  }
});

test("acquisition CLI documents manual rights gate and has no download mode", () => {
  const result = spawnSync(process.execPath, ["scripts/evidence-document-acquisition.mjs", "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /never downloads source URLs/i);
  assert.match(result.stdout, /processing-permitted yes/i);
  assert.doesNotMatch(result.stdout, /--download\b/i);
});
