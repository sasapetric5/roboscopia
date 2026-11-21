import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createComparisonCompatibilityAgent } from "../agents/comparison-compatibility-agent.mjs";
import { createRoboscopiaSupervisor } from "../agents/roboscopia-supervisor.mjs";

const plain = value => value !== null && typeof value === "object" && !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

/**
 * Read-only runtime adapter for the canonical robotics catalog.
 * It exposes existing catalog assertions as unreviewed claims; a source URL
 * is provenance, not extracted evidence or factual verification.
 */
export async function createRobotCatalogRuntime({
  database,
  catalogPath = resolve("data/robots.json"),
} = {}) {
  let db = database;
  if (db === undefined) {
    const raw = await readFile(catalogPath, "utf8");
    db = JSON.parse(raw);
  }
  if (!plain(db) || !Array.isArray(db.records)) throw new TypeError("INVALID_ROBOT_CATALOG");
  const records = new Map();
  for (const record of db.records) {
    if (!plain(record) || typeof record.id !== "string" || records.has(record.id) ||
        !Array.isArray(record.specifications)) throw new TypeError("INVALID_ROBOT_CATALOG_RECORD");
    records.set(record.id, record);
  }
  const sources = new Set((Array.isArray(db.sources) ? db.sources : [])
    .filter(source => plain(source) && typeof source.id === "string").map(source => source.id));

  const comparison = createComparisonCompatibilityAgent({
    getModel: async id => {
      const record = records.get(id);
      return record ? { id: record.id, name: record.model } : null;
    },
    getClaims: async id => {
      const record = records.get(id);
      if (!record) return null;
      return record.specifications.map(spec => ({
        modelId: id,
        specification: spec.name,
        value: spec.value ?? null,
        unit: spec.unit ?? "",
        sourceId: spec.sourceId ?? spec.provenance?.sourceId ?? null,
        evidenceStatus: spec.provenance?.verificationStatus ?? "unverified",
      }));
    },
  });
  const supervisor = createRoboscopiaSupervisor({ agents: { comparison } });

  return Object.freeze({
    listModels: () => [...records.values()].map(record => ({
      id: record.id, manufacturer: record.manufacturer, model: record.model,
    })),
    getSourceRegistryStatus: () => ({
      catalogSources: sources.size,
      sourceIds: [...sources].sort(),
      sourceClaimsAreNotEvidence: true,
    }),
    compareModels: async (leftModelId, rightModelId) =>
      supervisor.run({ task: "comparison", input: { modelIds: [leftModelId, rightModelId] } }),
    policy: Object.freeze({ externalNetwork: false, catalogMutation: false,
      automaticApproval: false, publication: false }),
  });
}
