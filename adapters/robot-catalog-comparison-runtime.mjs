import { createComparisonCompatibilityAgent } from "../agents/comparison-compatibility-agent.mjs";
import { createRoboscopiaSupervisor } from "../agents/roboscopia-supervisor.mjs";

const plain = value => value !== null && typeof value === "object" && !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

/**
 * Browser-safe, read-only comparison runtime shared by the public knowledge base
 * and the Node catalog adapter. Source links are provenance, never verification.
 */
export function createRobotCatalogComparisonRuntime({ database } = {}) {
  if (!plain(database) || !Array.isArray(database.records) || database.records.length === 0)
    throw new TypeError("INVALID_ROBOT_CATALOG");
  const records = new Map();
  for (const record of database.records) {
    if (!plain(record) || typeof record.id !== "string" || !record.id.trim() ||
        records.has(record.id) || !Array.isArray(record.specifications))
      throw new TypeError("INVALID_ROBOT_CATALOG_RECORD");
    records.set(record.id, record);
  }
  const sources = new Set((Array.isArray(database.sources) ? database.sources : [])
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
    compareModels: modelIds =>
      supervisor.run({ task: "comparison", input: { modelIds } }),
    policy: Object.freeze({
      externalNetwork: false, catalogMutation: false, automaticApproval: false, publication: false,
    }),
  });
}
