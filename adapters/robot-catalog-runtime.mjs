import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRobotCatalogComparisonRuntime } from "./robot-catalog-comparison-runtime.mjs";

/**
 * Node file-system adapter for the browser-safe, shared comparison runtime.
 * It reads the canonical catalog; it never writes or approves catalog data.
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
  const runtime = createRobotCatalogComparisonRuntime({ database: db });
  return Object.freeze({
    listModels: runtime.listModels,
    getSourceRegistryStatus: runtime.getSourceRegistryStatus,
    compareModels: (leftModelId, rightModelId) =>
      runtime.compareModels([leftModelId, rightModelId]),
    policy: runtime.policy,
  });
}
