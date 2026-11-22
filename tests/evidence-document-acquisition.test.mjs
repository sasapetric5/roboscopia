import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
    const relatedIds = new Set([source.canonicalSourceId, ...(source.relatedSourceIds ?? [])]);
    for (const claim of source.catalogClaims) {
      assert.ok(relatedIds.has(claim.catalogSourceId), "claim source must be declared on its evidence record: " + source.id + " / " + claim.specification);
      const claimSource = sourceById.get(claim.catalogSourceId);
      assert.ok(claimSource, "claim source ID must resolve: " + claim.catalogSourceId);
      assert.ok(
        [source.sourcePageUrl, source.downloadUrl, ...(source.relatedSourceUrls ?? [])].filter(Boolean).includes(claimSource.url) ||
        relatedIds.has(claim.catalogSourceId),
        "claim source relationship must be explicit: " + source.id + " / " + claim.specification
      );
    }
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


test("authorized local HTML evidence is processed with provenance and without catalog mutation", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "roboscopia-html-evidence-"));
  try {
    await mkdir(join(workspace, "data"), { recursive: true });
    const registry = JSON.parse(await readFile(new URL("../data/evidence-document-registry.json", import.meta.url), "utf8"));
    const db = JSON.parse(await readFile(new URL("../data/robots.json", import.meta.url), "utf8"));
    const source = db.sources.find((item) => item.id === "src-0003");
    assert.ok(source, "Unitree Go2 canonical source must exist in the test fixture");
    source.reviewStatus = "verified";
    source.authorityTier = "manufacturer_primary";
    source.lastReviewedAt = "2026-11-22T00:00:00.000Z";
    source.rights = {
      processingPermitted: true,
      redistributionPermitted: "unknown",
      reviewedBy: "synthetic test fixture",
      reviewedAt: "2026-11-22T00:00:00.000Z",
      basis: "Synthetic fixture only; this is not a real-world rights determination."
    };
    const canonicalBefore = JSON.stringify(db);
    await writeFile(join(workspace, "data", "robots.json"), JSON.stringify(db, null, 2));
    await writeFile(join(workspace, "data", "evidence-document-registry.json"), JSON.stringify(registry, null, 2));

    const htmlPath = join(workspace, "authorized-source-capture.html");
    const outputPath = join(workspace, "evidence-report.json");
    const html = `<!doctype html><html><head><title>Unitree Go2</title></head><body>
      <h1>Unitree Go2</h1><section><h2>Performance Parameters</h2>
      <p>Payload: 8 kg</p><p>Maximum speed: 3.7 m/s</p></section></body></html>`;
    await writeFile(htmlPath, html, "utf8");

    const scriptPath = fileURLToPath(new URL("../scripts/evidence-document-acquisition.mjs", import.meta.url));
    const result = spawnSync(process.execPath, [
      scriptPath,
      "--source-id", "unitree-go2-product-page",
      "--file", htmlPath,
      "--processing-permitted", "yes",
      "--rights-reviewer", "synthetic test fixture",
      "--rights-note", "synthetic fixture only",
      "--redistribution", "unknown",
      "--model-name", "Go2",
      "--output", outputPath
    ], { cwd: workspace, encoding: "utf8" });

    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(await readFile(outputPath, "utf8"));
    assert.equal(report.localDocument.contentType, "text/html");
    assert.equal(report.localDocument.sha256.length, 64);
    assert.equal(report.source.sourceId, "src-0003");
    assert.equal(report.rightsReview.processingPermitted, true);
    assert.equal(report.rightsReview.redistribution, "unknown");
    assert.equal(report.verification.factualVerification, "not_performed");
    assert.equal(report.verification.catalogMutation, false);
    assert.ok(report.extraction.counts.candidates >= 2);
    assert.ok(report.extraction.candidates.every((candidate) => candidate.reviewStatus === "extracted_unverified"));
    assert.equal(JSON.stringify(JSON.parse(await readFile(join(workspace, "data", "robots.json"), "utf8"))), canonicalBefore);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
