import test from "node:test";
import assert from "node:assert/strict";
import { createResearchEvidenceAgent } from "../agents/research-evidence-agent.mjs";

function fixture(overrides = {}) {
  const calls = [];
  const agent = createResearchEvidenceAgent({
    getSource: async (sourceId) => ({ sourceId, url: "https://manufacturer.example/manual.pdf" }),
    authorizeProcessing: async () => ({ allowed: true }),
    loadAuthorizedDocument: async ({ source }) => ({
      text: "Spot maximum speed 1.6 m/s",
      sourceId: source.sourceId,
      modelId: "spot",
      name: "manual.txt",
      sha256: "a".repeat(64),
      contentType: "text/plain",
    }),
    getClaims: async (modelId) => [{ claimId: "c1", modelId, value: 1.6, unit: "m/s" }],
    extractCandidates: async (input) => {
      calls.push({ stage: "extract", input });
      return {
        document: { sha256: input.documentSha256 },
        candidates: [{ candidateId: "candidate-1", modelId: input.modelId, sourceId: input.sourceId }],
        policy: { catalogMutated: false, automaticApproval: false, factualVerificationPerformed: false },
      };
    },
    matchEvidence: async (sourceReport, extraction) => {
      calls.push({ stage: "match" });
      return { matches: [{ status: "value_match_unverified" }], catalogMutationAllowed: false };
    },
    ...overrides,
  });
  return { agent, calls };
}

const input = { modelId: "spot", sourceId: "src-spot-manual", documentRef: "evidence/spot-manual.txt", runId: "test-run-1" };

test("creates bounded research evidence agent with injected services", () => {
  assert.throws(() => createResearchEvidenceAgent(), /RESEARCH_AGENT_SERVICE_REQUIRED/);
});

test("returns candidate evidence and always requires human review", async () => {
  const { agent, calls } = fixture();
  const result = await agent.run(input);
  assert.equal(result.ok, true);
  assert.equal(result.agentId, "research_evidence");
  assert.equal(result.reviewRequired, true);
  assert.equal(result.policy.catalogMutation, false);
  assert.equal(result.policy.automaticApproval, false);
  assert.equal(result.policy.rightsDecision, false);
  assert.equal(result.policy.publication, false);
  assert.deepEqual(calls.map(call => call.stage), ["extract", "match"]);
});

test("rejects invalid model and source identifiers before services run", async () => {
  const { agent, calls } = fixture();
  assert.equal((await agent.run({ ...input, modelId: "../spot" })).code, "INVALID_MODEL_ID");
  assert.equal((await agent.run({ ...input, sourceId: " " })).code, "INVALID_SOURCE_ID");
  assert.equal(calls.length, 0);
});

test("requires a registered source with exact source identity", async () => {
  const { agent } = fixture({ getSource: async () => ({ sourceId: "another-source" }) });
  assert.equal((await agent.run(input)).code, "SOURCE_NOT_REGISTERED");
});

test("stops before loading document if processing rights are not authorized", async () => {
  let loaded = false;
  const { agent } = fixture({
    authorizeProcessing: async () => ({ allowed: false }),
    loadAuthorizedDocument: async () => { loaded = true; return { text: "no" }; },
  });
  const result = await agent.run(input);
  assert.equal(result.code, "PROCESSING_NOT_AUTHORIZED");
  assert.equal(loaded, false);
});

test("rejects a loaded document mapped to a different source or model", async () => {
  const sourceMismatch = fixture({
    loadAuthorizedDocument: async () => ({ text: "text", sourceId: "other", modelId: "spot" }),
  });
  assert.equal((await sourceMismatch.agent.run(input)).code, "DOCUMENT_SOURCE_MISMATCH");

  const modelMismatch = fixture({
    loadAuthorizedDocument: async () => ({ text: "text", sourceId: input.sourceId, modelId: "go2" }),
  });
  assert.equal((await modelMismatch.agent.run(input)).code, "DOCUMENT_MODEL_MISMATCH");
});

test("rejects oversized documents and excessive claims", async () => {
  const oversized = fixture({
    loadAuthorizedDocument: async () => ({ text: "x".repeat(2 * 1024 * 1024 + 1), sourceId: input.sourceId }),
  });
  assert.equal((await oversized.agent.run(input)).code, "DOCUMENT_TOO_LARGE");

  const tooManyClaims = fixture({ getClaims: async () => Array.from({ length: 501 }, () => ({ modelId: "spot" })) });
  assert.equal((await tooManyClaims.agent.run(input)).code, "INVALID_OR_EXCESSIVE_CLAIMS");
});

test("rejects claims for a different model", async () => {
  const { agent } = fixture({ getClaims: async () => [{ modelId: "go2" }] });
  assert.equal((await agent.run(input)).code, "CLAIM_MODEL_IDENTITY_INVALID");
});

test("rejects extractor output that reports mutation, approval, or verification", async () => {
  const { agent } = fixture({
    extractCandidates: async () => ({
      candidates: [],
      policy: { catalogMutated: true, automaticApproval: false, factualVerificationPerformed: false },
    }),
  });
  assert.equal((await agent.run(input)).code, "EXTRACTION_POLICY_OR_OUTPUT_INVALID");
});

test("does not silently approve unmatched or conflicting evidence", async () => {
  const { agent } = fixture({
    matchEvidence: async () => ({ matches: [{ status: "value_mismatch" }, { status: "ambiguous_match" }] }),
  });
  const result = await agent.run(input);
  assert.equal(result.ok, true);
  assert.equal(result.reviewRequired, true);
  assert.deepEqual(result.matching.matches.map(item => item.status), ["value_mismatch", "ambiguous_match"]);
});

test("does not fetch URLs or invoke services after authorization failure", async () => {
  const events = [];
  const { agent } = fixture({
    getSource: async () => { events.push("source"); return { sourceId: input.sourceId }; },
    authorizeProcessing: async () => { events.push("authorization"); return false; },
    loadAuthorizedDocument: async () => { events.push("document"); throw new Error("must not run"); },
  });
  await agent.run(input);
  assert.deepEqual(events, ["source", "authorization"]);
});
