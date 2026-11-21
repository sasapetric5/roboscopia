/**
 * Roboscopia Document Processing Agent.
 *
 * Orchestrates already-installed local parser adapters through injected trusted
 * services. It never downloads documents, opens files, executes parsers, grants
 * rights, verifies facts, mutates the catalogue, or publishes content itself.
 */
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/i;
const RUN_ID = /^[a-zA-Z0-9._:-]{1,128}$/;
const ALLOWED_ADAPTERS = new Set(["poppler", "opendataloader", "docling", "html_text", "plain_text"]);
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;
const MAX_ADAPTERS = 3;

const fail = (code, stage) => ({
  ok: false, agentId: "document_processing", code, stage,
  policy: { externalNetwork: false, filesystemAccess: false, parserExecution: false,
    rightsDecision: false, factualVerification: false, catalogMutation: false, publication: false },
});
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const byteLength = value => new TextEncoder().encode(value).byteLength;
const validSha = value => typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
const normalized = value => value.normalize("NFKC").replace(/\s+/g, " ").trim();

export function createDocumentProcessingAgent({
  getDocumentRecord,
  authorizeProcessing,
  loadAuthorizedDocument,
  extractWithAdapter,
  adapters = ["poppler", "opendataloader", "docling"],
  maxDocumentBytes = MAX_DOCUMENT_BYTES,
  maxOutputBytes = MAX_OUTPUT_BYTES,
} = {}) {
  const required = { getDocumentRecord, authorizeProcessing, loadAuthorizedDocument, extractWithAdapter };
  for (const [name, fn] of Object.entries(required)) {
    if (typeof fn !== "function") throw new TypeError(`DOCUMENT_AGENT_SERVICE_REQUIRED:${name}`);
  }
  if (!Array.isArray(adapters) || adapters.length < 1 || adapters.length > MAX_ADAPTERS ||
      adapters.some(name => !ALLOWED_ADAPTERS.has(name)) || new Set(adapters).size !== adapters.length) {
    throw new TypeError("INVALID_DOCUMENT_AGENT_ADAPTERS");
  }
  if (!Number.isSafeInteger(maxDocumentBytes) || maxDocumentBytes < 1 || maxDocumentBytes > MAX_DOCUMENT_BYTES ||
      !Number.isSafeInteger(maxOutputBytes) || maxOutputBytes < 1 || maxOutputBytes > MAX_OUTPUT_BYTES) {
    throw new TypeError("INVALID_DOCUMENT_AGENT_SIZE_LIMIT");
  }

  return Object.freeze({
    async run({ documentId, sourceId, assetId, runId = crypto.randomUUID() } = {}) {
      if (typeof documentId !== "string" || !ID.test(documentId) || documentId.includes("..") || documentId.includes("\\")) {
        return fail("INVALID_DOCUMENT_ID", "input");
      }
      if (typeof sourceId !== "string" || !ID.test(sourceId)) return fail("INVALID_SOURCE_ID", "input");
      if (typeof assetId !== "string" || !ID.test(assetId)) return fail("INVALID_ASSET_ID", "input");
      if (typeof runId !== "string" || !RUN_ID.test(runId)) return fail("INVALID_RUN_ID", "input");

      let record;
      try { record = await getDocumentRecord(documentId); }
      catch { return fail("DOCUMENT_REGISTRY_LOOKUP_FAILED", "registry"); }
      if (!plain(record) || record.documentId !== documentId || record.sourceId !== sourceId ||
          record.assetId !== assetId) return fail("DOCUMENT_REGISTRY_IDENTITY_MISMATCH", "registry");
      if (!["application/pdf", "text/html", "text/plain"].includes(record.contentType)) {
        return fail("UNSUPPORTED_DOCUMENT_TYPE", "registry");
      }

      let authorization;
      try { authorization = await authorizeProcessing({ record, sourceId, assetId, runId }); }
      catch { return fail("PROCESSING_AUTHORIZATION_FAILED", "authorization"); }
      if (authorization !== true && authorization?.allowed !== true) {
        return fail("PROCESSING_NOT_AUTHORIZED", "authorization");
      }

      let document;
      try { document = await loadAuthorizedDocument({ record, authorization, runId }); }
      catch { return fail("AUTHORIZED_DOCUMENT_LOAD_FAILED", "document"); }
      if (!plain(document) || document.documentId !== documentId || document.sourceId !== sourceId ||
          document.assetId !== assetId || document.contentType !== record.contentType ||
          !validSha(document.sha256) || typeof document.name !== "string" || !document.name.trim() ||
          !Number.isSafeInteger(document.byteSize) || document.byteSize < 1 ||
          document.byteSize > maxDocumentBytes) return fail("DOCUMENT_INTEGRITY_OR_IDENTITY_INVALID", "document");
      if (record.sha256 && record.sha256 !== document.sha256) return fail("DOCUMENT_SHA256_MISMATCH", "document");
      if (record.byteSize && record.byteSize !== document.byteSize) return fail("DOCUMENT_SIZE_MISMATCH", "document");

      const parserResults = [];
      let totalOutputBytes = 0;
      for (const adapter of adapters) {
        let result;
        try { result = await extractWithAdapter({ adapter, document, record, runId }); }
        catch {
          parserResults.push({ adapter, status: "error", code: "PARSER_EXECUTION_FAILED", text: "", tableRows: [] });
          continue;
        }
        if (!plain(result) || result.adapter !== adapter ||
            !["success", "error"].includes(result.status) || result.localOnly !== true ||
            result.catalogMutated !== false || result.factualVerificationPerformed !== false ||
            result.automaticApproval !== false || !Array.isArray(result.tableRows)) {
          return fail("PARSER_OUTPUT_POLICY_OR_SCHEMA_INVALID", "extraction");
        }
        if (result.status === "error") {
          parserResults.push({ adapter, status: "error", code: "PARSER_REPORTED_ERROR", text: "", tableRows: [] });
          continue;
        }
        if (typeof result.text !== "string" || !result.text.trim() ||
            (result.pageCount !== null && (!Number.isSafeInteger(result.pageCount) || result.pageCount < 0)) ||
            result.tableRows.some(row => !Array.isArray(row) || row.some(cell => typeof cell !== "string"))) {
          return fail("PARSER_CONTENT_INVALID", "extraction");
        }
        const textBytes = byteLength(result.text);
        const rowsBytes = byteLength(JSON.stringify(result.tableRows));
        totalOutputBytes += textBytes + rowsBytes;
        if (totalOutputBytes > maxOutputBytes) return fail("PARSER_OUTPUT_TOO_LARGE", "extraction");
        parserResults.push({
          adapter, status: "success", version: typeof result.version === "string" ? result.version : null,
          text: result.text, pageCount: result.pageCount, tableRows: result.tableRows,
        });
      }

      const successful = parserResults.filter(item => item.status === "success");
      if (!successful.length) return {
        ...fail("ALL_PARSERS_FAILED", "extraction"),
        parserResults: parserResults.map(({ adapter, status, code }) => ({ adapter, status, code })),
      };
      const textVariants = new Set(successful.map(item => normalized(item.text)));
      const tableVariants = new Set(successful.map(item => JSON.stringify(item.tableRows)));
      return {
        ok: true, agentId: "document_processing", runId, documentId, sourceId, assetId,
        document: { name: document.name, contentType: document.contentType, sha256: document.sha256, byteSize: document.byteSize },
        parserResults,
        parserAgreement: {
          successfulAdapters: successful.map(item => item.adapter),
          textAgreement: textVariants.size === 1 ? "identical_after_whitespace_normalization" : "parser_outputs_differ",
          tableAgreement: tableVariants.size === 1 ? "identical" : "parser_tables_differ",
          factualAccuracyEstablished: false,
        },
        reviewRequired: true,
        policy: {
          externalNetwork: false, filesystemAccess: false, parserExecution: "delegated_to_trusted_local_adapter",
          processingAuthorizationRequired: true, rightsDecision: false, factualVerification: false,
          catalogMutation: false, automaticApproval: false, publication: false,
        },
        limitations: [
          "Parser agreement is not proof of factual accuracy.",
          "Parser disagreement requires human review of the original document.",
          "Text extraction does not establish permission to display or redistribute the original document.",
          "Scanned-page OCR is not enabled by this agent.",
        ],
      };
    },
  });
}
