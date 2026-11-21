import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("CNC technical research Skill remains quarantined and does not grant authority", async () => {
  const skill = await readFile("skills/quarantine/cnc-technical-research/SKILL.md", "utf8");
  assert.match(skill, /status: quarantined/);
  assert.match(skill, /activation: disabled/);
  assert.match(skill, /It grants no permissions/);
  assert.match(skill, /Never bypass access controls/);
  assert.match(skill, /documented_compatible/);
  assert.match(skill, /unverified/);
  assert.match(skill, /Human technical and rights review remains mandatory/);
  assert.match(skill, /No catalogue mutation/);
});
