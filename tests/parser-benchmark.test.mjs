import test from "node:test";
import assert from "node:assert/strict";
import { scoreOutput } from "../scripts/parser-benchmark.mjs";

test("scores exact normalized evidence snippets", () => {
  const result = scoreOutput(["Payload: 14 kg", "Speed: 1.6 m/s"].join(String.fromCharCode(10)), [
    { id: "payload", text: "Payload: 14 kg" },
    { id: "speed", text: "Speed: 1.6 m/s" },
    { id: "mass", text: "Mass: 33.8 kg" }
  ]);
  assert.equal(result.expectedCount, 3);
  assert.equal(result.matchedCount, 2);
  assert.equal(result.recall, 2 / 3);
});
test("does not report a score when gold evidence is absent", () => {
  const result = scoreOutput("some text", []);
  assert.equal(result.recall, null);
  assert.equal(result.matchedCount, 0);
});
test("does not confuse decimal values embedded in larger values", () => {
  const result = scoreOutput("maximum speed 11.6 m/s", [{ id: "speed", text: "1.6 m/s" }]);
  assert.equal(result.matchedCount, 0);
});
