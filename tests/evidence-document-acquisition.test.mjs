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

test("registered source records link all 39 claims to real catalog model IDs", async () => {
  const registry = JSON.parse(await readFile(new URL("../data/evidence-document-registry.json", import.meta.url), "utf8"));
  const db = JSON.parse(await readFile(new URL("../data/robots.json", import.meta.url), "utf8"));
  const ids = new Set(db.records.map((record) => record.id));
  let linked = 0;
  for (const source of registry.sources) {
    for (const modelId of source.modelIds) assert.ok(ids.has(modelId), "unknown model ID: " + modelId);
    assert.ok(Array.isArray(source.catalogClaims));
    linked += source.catalogClaims.length;
  }
  assert.equal(linked, 39);
});
