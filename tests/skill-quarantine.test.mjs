import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("imported robotics research Skill stays quarantined and cannot grant authority", async () => {
  const skill = await readFile("skills/quarantine/robotics-technical-research/SKILL.md", "utf8");
  const inventory = await readFile("skills/README.md", "utf8");
  assert.match(skill, /status: quarantined/);
  assert.match(skill, /activation: disabled/);
  assert.match(skill, /It grants no permissions/);
  assert.match(skill, /Never bypass authentication, paywalls, robots policies/);
  assert.match(skill, /Matching creates candidates only; it never approves claims/);
  assert.match(skill, /human factual and rights review remains required/);
  assert.match(skill, /MIT-licensed/);
  assert.match(inventory, /Quarantined means disabled/);
  assert.match(inventory, /No runtime loader or automatic activation/);
});
