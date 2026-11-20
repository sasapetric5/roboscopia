import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const databaseUrl = new URL("../data/robots.json", import.meta.url);
const db = JSON.parse(await readFile(databaseUrl, "utf8"));

test("canonical data file declares the expected schema", () => {
  assert.equal(db.schemaVersion, "2.1.0");
  assert.ok(Array.isArray(db.records));
  assert.ok(Array.isArray(db.manufacturers));
  assert.ok(Array.isArray(db.families));
  assert.ok(Array.isArray(db.categories));
  assert.ok(Array.isArray(db.sources));
});

test("all model IDs are unique and required identity references resolve", () => {
  const ids = db.records.map((record) => record.id);
  assert.equal(new Set(ids).size, ids.length, "model IDs must be unique");

  for (const record of db.records) {
    assert.ok(db.manufacturers.some((item) => item.id === record.manufacturerId), `unknown manufacturer for ${record.id}`);
    assert.ok(db.families.some((item) => item.id === record.familyId), `unknown family for ${record.id}`);
    assert.ok(db.categories.some((item) => item.id === record.category), `unknown category for ${record.id}`);
  }
});

test("manufacturer and family IDs are unique", () => {
  for (const collection of [db.manufacturers, db.families, db.sources]) {
    const ids = collection.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test("every specification has explicit field-level provenance", () => {
  const sourceIds = new Set(db.sources.map((source) => source.id));
  const allowed = new Set(db.dataQuality.statuses);
  for (const record of db.records) {
    for (const specification of record.specifications || []) {
      assert.ok(specification.provenance, `missing provenance: ${record.id}/${specification.name}`);
      assert.ok(allowed.has(specification.provenance.verificationStatus));
      if (specification.sourceId) assert.ok(sourceIds.has(specification.sourceId));
      if (specification.provenance.sourceId) assert.ok(sourceIds.has(specification.provenance.sourceId));
      assert.equal(specification.provenance.applicableModelId, record.id);
    }
  }
});

test("source URLs are valid HTTPS URLs and review state is explicit", () => {
  for (const source of db.sources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    assert.ok(source.domain);
    assert.ok(source.authorityTier);
    assert.ok(source.reviewStatus);
  }
});

test("media entries do not imply reuse permission", () => {
  for (const record of db.records) {
    for (const media of record.media || []) {
      assert.equal(media.rightsStatus, "permission_not_confirmed");
    }
  }
});

test("unverified configurations do not claim verified specifications", () => {
  for (const record of db.records) {
    for (const configuration of record.configurations || []) {
      if (configuration.specificationsVerified === false) {
        assert.equal(configuration.specificationStatus, "not_verified");
      }
    }
  }
});
