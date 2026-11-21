import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRobotCatalogRuntime } from "../adapters/robot-catalog-runtime.mjs";

test("default robot catalog is read through the adapter and compared by the Supervisor", async () => {
  const catalogBefore = await readFile("data/robots.json", "utf8");
  const runtime = await createRobotCatalogRuntime();
  const models = runtime.listModels();

  assert.equal(models.length, 7);
  assert.ok(models.some(model => model.id === "spot"));
  assert.ok(models.some(model => model.id === "go2"));

  const result = await runtime.compareModels("spot", "go2");
  assert.equal(result.ok, true);
  assert.equal(result.agentId, "roboscopia_supervisor");
  assert.equal(result.task, "comparison");
  assert.equal(result.reviewRequired, true);
  assert.equal(result.result.comparisons.length, 1);
  assert.ok(result.result.comparisons[0].specifications.length > 0);
  assert.ok(result.result.comparisons[0].specifications.every(
    item => item.evidenceStatus === "neither_human_reviewed"
  ));
  assert.equal(result.policy.catalogMutation, false);
  assert.equal(runtime.policy.externalNetwork, false);
  assert.equal(runtime.policy.catalogMutation, false);
  assert.equal(runtime.policy.automaticApproval, false);
  assert.equal(runtime.policy.publication, false);
  assert.equal(await readFile("data/robots.json", "utf8"), catalogBefore,
    "comparison must not mutate the canonical catalog");
});
