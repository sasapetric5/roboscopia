/**
 * Roboscopia Research & Evidence Agent.
 *
 * Deterministic, read-only workflow adapter. No LLM, network access, crawling,
 * filesystem access, publication, rights approval, or catalogue mutation.
 *
 * Services are injected by the trusted application boundary. The agent only
 * processes a document after the source/rights service explicitly authorizes it.
 */
const MODEL_ID = /^[a-z0-9][a-z0-9._-]{0,95}$/i;
const SOURCE_ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/i;
const MAX_TEXT_BYTES = 2 * 1024 * 1024;
const MAX_CLAIMS = 500;

const fail = (code, stage) => ({
  ok: false,
  agentId: "research_evidence",
  code,
  stage,
  policy: {
    externalNetwork: false,
    catalogMutation: false,
    automaticApproval: false,
    rightsDecision: false,
    publication: false,
  },
});

function validPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function safeJson(value, maxBytes = MAX_TEXT_BYTES) {
  try {
    const json = JSON.stringify(value);
    if (typeof json !== "string" || new TextEncoder().encode(json).byteLength > maxBytes) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function createResearchEvidenceAgent({
  getSource,
  authorizeProcessing,
  loadAuthorizedDocument,
  getClaims,
  extractCandidates,
  matchEvidence,
  maxClaims = MAX_CLAIMS,
} = {}) {
  const required = { getSource, authorizeProcessing, loadAuthorizedDocument, getClaims, extractCandidates, matchEvidence };
  for (const [name, fn] of Object.entries(required)) {
    if (typeof fn !== "function") throw new TypeError(`RESEARCH_AGENT_SERVICE_REQUIRED:${name}`);
  }
  if (!Number.isSafeInteger(maxClaims) || maxClaims < 1 || maxClaims > MAX_CLAIMS) {
    throw new TypeError("INVALID_RESEARCH_AGENT_CLAIM_LIMIT");
  }

  return Object.freeze({
    async run({ modelId, sourceId, documentRef, runId = crypto.randomUUID() } = {}) {
      if (typeof modelId !== "string" || !MODEL_ID.test(modelId)) return fail("INVALID_MODEL_ID", "input");
      if (typeof sourceId !== "string" || !SOURCE_ID.test(sourceId)) return fail("INVALID_SOURCE_ID", "input");
      if (typeof documentRef !== "string" || !documentRef.trim() || documentRef.length > 512) {
        return fail("INVALID_DOCUMENT_REFERENCE", "input");
      }
      if (typeof runId !== "string" || !/^[a-zA-Z0-9._:-]{1,128}$/.test(runId)) return fail("INVALID_RUN_ID", "input");

      let source;
      try { source = await getSource(sourceId); }
      catch { return fail("SOURCE_LOOKUP_FAILED", "source"); }
      if (!validPlainObject(source) || source.sourceId !== sourceId) return fail("SOURCE_NOT_REGISTERED", "source");

      let authorization;
      try { authorization = await authorizeProcessing({ source, modelId, documentRef, runId }); }
      catch { return fail("RIGHTS_AUTHORIZATION_FAILED", "authorization"); }
      if (authorization !== true && authorization?.allowed !== true) {
        return fail("PROCESSING_NOT_AUTHORIZED", "authorization");
      }

      let document;
      try { document = await loadAuthorizedDocument({ source, modelId, documentRef, authorization, runId }); }
      catch { return fail("DOCUMENT_LOAD_FAILED", "document"); }
      if (!validPlainObject(document) || typeof document.text !== "string" || !document.text.trim()) {
        return fail("DOCUMENT_TEXT_UNAVAILABLE", "document");
      }
      if (new TextEncoder().encode(document.text).byteLength > MAX_TEXT_BYTES) {
        return fail("DOCUMENT_TOO_LARGE", "document");
      }
      if (document.sourceId !== sourceId) return fail("DOCUMENT_SOURCE_MISMATCH", "document");
      if (document.modelId && document.modelId !== modelId) return fail("DOCUMENT_MODEL_MISMATCH", "document");

      let claims;
      try { claims = await getClaims(modelId); }
      catch { return fail("CLAIMS_LOOKUP_FAILED", "claims"); }
      if (!Array.isArray(claims) || claims.length > maxClaims) return fail("INVALID_OR_EXCESSIVE_CLAIMS", "claims");
      const safeClaims = safeJson(claims, 512 * 1024);
      if (!safeClaims || safeClaims.some(claim => !validPlainObject(claim) || claim.modelId !== modelId)) {
        return fail("CLAIM_MODEL_IDENTITY_INVALID", "claims");
      }

      let extraction;
      try {
        extraction = await extractCandidates({
          text: document.text,
          documentContentType: document.contentType ?? "text/plain",
          documentSha256: document.sha256,
          documentName: document.name,
          sourceUrl: source.url ?? null,
          sourceId,
          relatedSourceIds: Array.isArray(source.relatedSourceIds) ? source.relatedSourceIds : [],
          modelId,
          modelName: document.modelName ?? null,
          configurationId: document.configurationId ?? null,
          documentRevision: document.revision ?? null,
          documentDate: document.documentDate ?? null,
        });
      } catch {
        return fail("EVIDENCE_EXTRACTION_FAILED", "extraction");
      }
      if (!validPlainObject(extraction) || !Array.isArray(extraction.candidates) ||
          extraction.policy?.catalogMutated !== false ||
          extraction.policy?.automaticApproval !== false ||
          extraction.policy?.factualVerificationPerformed !== false) {
        return fail("EXTRACTION_POLICY_OR_OUTPUT_INVALID", "extraction");
      }

      const sourceReport = { claims: safeClaims };
      let matching;
      try { matching = await matchEvidence(sourceReport, extraction); }
      catch { return fail("EVIDENCE_MATCHING_FAILED", "matching"); }
      if (!validPlainObject(matching)) return fail("INVALID_MATCHING_REPORT", "matching");

      return {
        ok: true,
        agentId: "research_evidence",
        runId,
        modelId,
        sourceId,
        document: {
          name: document.name ?? null,
          sha256: extraction.document?.sha256 ?? document.sha256 ?? null,
          contentType: document.contentType ?? "text/plain",
          sourceId,
        },
        extraction,
        matching,
        reviewRequired: true,
        policy: {
          externalNetwork: false,
          catalogMutation: false,
          automaticApproval: false,
          rightsDecision: false,
          publication: false,
          processingAuthorizationRequired: true,
        },
      };
    },
  });
}
