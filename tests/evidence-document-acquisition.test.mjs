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
    assert.ok(["pdf", "html"].includes(source.documentType));
    assert.ok(source.modelIds.length > 0);
    assert.equal(source.rightsStatus, "review_required");
    assert.equal(source.acquisition.status, "not_acquired");
    assert.equal(source.acquisition.rightsReview, "pending");
    assert.equal(source.acquisition.sha256, null);
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

  const sourceById = new Map(db.sources.map((source) => [source.id, source]));
  for (const source of registry.sources) {
    const canonical = sourceById.get(source.canonicalSourceId);
    assert.ok(canonical, "canonical source ID must resolve: " + source.id);
    assert.ok(
      [source.sourcePageUrl, source.downloadUrl].filter(Boolean).includes(canonical.url),
      "source page or download URL must exactly match canonical registry URL: " + source.id
    );
  }
});


test("CLI flags cannot override missing canonical source rights approval", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evidence-document-acquisition.mjs",
    "--source-id", "ur20-user-manual-sw5-26",
    "--file", "does-not-exist.pdf",
    "--processing-permitted", "yes",
    "--rights-reviewer", "self-asserted-reviewer",
    "--rights-note", "self-asserted permission",
    "--redistribution", "unknown",
    "--output", "unused-report.json"
  ], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /canonical Source Registry|exact URL/i);
  assert.doesNotMatch(result.stderr, /ENOENT|does-not-exist/);
});

test("HTML evidence acquisition remains behind the canonical rights gate", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evidence-document-acquisition.mjs",
    "--source-id", "unitree-go2-product-page",
    "--file", "does-not-exist.html",
    "--processing-permitted", "yes",
    "--rights-reviewer", "self-asserted-reviewer",
    "--rights-note", "self-asserted permission",
    "--redistribution", "unknown",
    "--output", "unused-html-report.json"
  ], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /canonical Source Registry|exact URL/i);
  assert.doesNotMatch(result.stderr, /ENOENT|does-not-exist/);
});
