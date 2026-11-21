import test from "node:test";
import assert from "node:assert/strict";
import { createRobotCatalogRuntime } from "../adapters/robot-catalog-runtime.mjs";

const database = {
  sources: [{ id: "src-a" }],
  records: [
    { id: "robot-a", manufacturer: "Maker A", model: "Model A", specifications: [
      { name: "Payload", value: 5, unit: "kg", sourceId: "src-a",
        provenance: { verificationStatus: "source_linked_unverified", sourceId: "src-a" } },
      { name: "Reach", value: 800, unit: "mm", sourceId: "src-a",
        provenance: { verificationStatus: "source_linked_unverified", sourceId: "src-a" } },
    ] },
    { id: "robot-b", manufacturer: "Maker B", model: "Model B", specifications: [
      { name: "Payload", value: 7, unit: "kg", sourceId: "src-a",
        provenance: { verificationStatus: "source_linked_unverified", sourceId: "src-a" } },
      { name: "Reach", value: 900, unit: "mm", sourceId: "src-a",
        provenance: { verificationStatus: "source_linked_unverified", sourceId: "src-a" } },
    ] },
  ],
};

test("robot catalog runtime lists real records and compares through supervisor", async () => {
  const before = structuredClone(database);
  const runtime = await createRobotCatalogRuntime({ database });
  assert.deepEqual(runtime.listModels(), [
    { id: "robot-a", manufacturer: "Maker A", model: "Model A" },
    { id: "robot-b", manufacturer: "Maker B", model: "Model B" },
  ]);
  const result = await runtime.compareModels("robot-a", "robot-b");
  assert.equal(result.ok, true);
  assert.equal(result.agentId, "roboscopia_supervisor");
  assert.equal(result.task, "comparison");
  assert.equal(result.reviewRequired, true);
  assert.equal(result.result.comparisons[0].specifications.find(x => x.specification === "payload").status, "different_values");
  assert.equal(result.result.comparisons[0].specifications[0].evidenceStatus, "neither_human_reviewed");
  assert.equal(result.result.policy.catalogMutation, false);
  assert.deepEqual(database, before, "runtime must not mutate canonical catalog input");
});

test("robot catalog runtime rejects unknown model IDs without inventing records", async () => {
  const runtime = await createRobotCatalogRuntime({ database });
  const result = await runtime.compareModels("robot-a", "not-registered");
  assert.equal(result.ok, false);
  assert.equal(result.result.code, "MODEL_NOT_REGISTERED");
});

test("robot catalog runtime rejects malformed and duplicate catalog identities", async () => {
  await assert.rejects(() => createRobotCatalogRuntime({ database: { records: [] } }), /INVALID_ROBOT_CATALOG/);
  await assert.rejects(() => createRobotCatalogRuntime({ database: {
    records: [
      { id: "same", specifications: [] },
      { id: "same", specifications: [] },
    ],
  } }), /INVALID_ROBOT_CATALOG_RECORD/);
});

test("robot catalog runtime makes source inventory explicit without treating links as evidence", async () => {
  const runtime = await createRobotCatalogRuntime({ database });
  const status = runtime.getSourceRegistryStatus();
  assert.equal(status.catalogSources, 1);
  assert.deepEqual(status.sourceIds, ["src-a"]);
  assert.equal(status.sourceClaimsAreNotEvidence, true);
  assert.equal(runtime.policy.catalogMutation, false);
});
