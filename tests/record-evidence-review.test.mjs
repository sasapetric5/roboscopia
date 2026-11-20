import test from "node:test";
import assert from "node:assert/strict";
import { validateEvidenceReview } from "../scripts/record-evidence-review.mjs";
const report = { matches: [{ matchId: "match-1", candidateId: "candidate-1" }] };
const decision = { matchId: "match-1", outcome: "supported", evidenceLocator: "PDF p.4, table 2, row 3", note: "Exact model and value verified.", reviewer: "technical-reviewer", reviewedAt: "2026-11-20T12:00:00.000Z" };
test("accepts a complete explicit human evidence review", () => assert.deepEqual(validateEvidenceReview(decision, report), []));
test("rejects unknown matches and incomplete review metadata", () => assert.ok(validateEvidenceReview({ ...decision, matchId: "unknown", evidenceLocator: "", reviewer: "" }, report).length >= 3));
test("rejects unsupported outcomes", () => assert.ok(validateEvidenceReview({ ...decision, outcome: "auto_approve" }, report).some((error) => error.includes("outcome"))));
