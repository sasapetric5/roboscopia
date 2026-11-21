import test from "node:test";
import assert from "node:assert/strict";
import { createDocumentProcessingAgent } from "../agents/document-processing-agent.mjs";

const record = { documentId:"doc-spot-manual", sourceId:"src-spot-manual", assetId:"spot",
  contentType:"application/pdf", sha256:"a".repeat(64), byteSize:1024 };
const document = { ...record, name:"spot-manual.pdf" };
function fixture(overrides={}) {
  const events=[];
  const agent=createDocumentProcessingAgent({
    getDocumentRecord:async id=>{events.push("registry");return record;},
    authorizeProcessing:async()=>{events.push("authorize");return {allowed:true};},
    loadAuthorizedDocument:async()=>{events.push("load");return document;},
    extractWithAdapter:async({adapter})=>{events.push(adapter);return {
      adapter,status:"success",localOnly:true,catalogMutated:false,
      factualVerificationPerformed:false,automaticApproval:false,version:"test",
      text:"Payload 14 kg",pageCount:2,tableRows:[["Payload","14 kg"]]
    };},
    ...overrides
  });
  return {agent,events};
}
const input={documentId:"doc-spot-manual",sourceId:"src-spot-manual",assetId:"spot",runId:"test-run-1"};
test("requires trusted services and valid parser adapter configuration",()=>{
  assert.throws(()=>createDocumentProcessingAgent(),/SERVICE_REQUIRED/);
  assert.throws(()=>createDocumentProcessingAgent({getDocumentRecord(){},authorizeProcessing(){},loadAuthorizedDocument(){},extractWithAdapter(){},adapters:["unknown"]}),/INVALID_DOCUMENT_AGENT_ADAPTERS/);
});
test("processes only after authorization and returns review-required parser outputs",async()=>{
  const {agent,events}=fixture(),r=await agent.run(input);
  assert.equal(r.ok,true);assert.equal(r.reviewRequired,true);
  assert.deepEqual(events,["registry","authorize","load","poppler","opendataloader","docling"]);
  assert.equal(r.policy.catalogMutation,false);assert.equal(r.policy.factualVerification,false);
  assert.equal(r.parserAgreement.factualAccuracyEstablished,false);
  assert.equal(r.parserAgreement.textAgreement,"identical_after_whitespace_normalization");
});
test("rejects invalid identifiers before invoking services",async()=>{
  const {agent,events}=fixture();
  assert.equal((await agent.run({...input,documentId:"../secret"})).code,"INVALID_DOCUMENT_ID");
  assert.equal((await agent.run({...input,assetId:""})).code,"INVALID_ASSET_ID");
  assert.equal(events.length,0);
});
test("blocks document loading and parsing when processing is unauthorized",async()=>{
  const {agent,events}=fixture({authorizeProcessing:async()=>{events.push("authorize");return {allowed:false};}});
  assert.equal((await agent.run(input)).code,"PROCESSING_NOT_AUTHORIZED");
  assert.deepEqual(events,["registry","authorize"]);
});
test("rejects document identity mismatch and digest mismatch",async()=>{
  const wrongAsset=fixture({loadAuthorizedDocument:async()=>({...document,assetId:"go2"})});
  assert.equal((await wrongAsset.agent.run(input)).code,"DOCUMENT_INTEGRITY_OR_IDENTITY_INVALID");
  const wrongHash=fixture({loadAuthorizedDocument:async()=>({...document,sha256:"b".repeat(64)})});
  assert.equal((await wrongHash.agent.run(input)).code,"DOCUMENT_SHA256_MISMATCH");
});
test("continues with remaining parser after one parser fails",async()=>{
  const {agent}=fixture({extractWithAdapter:async({adapter})=>adapter==="poppler"
    ? {adapter,status:"error",localOnly:true,catalogMutated:false,factualVerificationPerformed:false,automaticApproval:false,tableRows:[]}
    : {adapter,status:"success",localOnly:true,catalogMutated:false,factualVerificationPerformed:false,automaticApproval:false,text:"Extracted",pageCount:1,tableRows:[]}});
  const r=await agent.run(input);
  assert.equal(r.ok,true);assert.equal(r.parserResults[0].status,"error");
  assert.deepEqual(r.parserAgreement.successfulAdapters,["opendataloader","docling"]);
});
test("rejects parser output that claims catalogue mutation or factual verification",async()=>{
  const {agent}=fixture({extractWithAdapter:async({adapter})=>({adapter,status:"success",localOnly:true,
    catalogMutated:true,factualVerificationPerformed:false,automaticApproval:false,text:"text",pageCount:1,tableRows:[]})});
  assert.equal((await agent.run(input)).code,"PARSER_OUTPUT_POLICY_OR_SCHEMA_INVALID");
});
test("requires bounded parser output and at least one successful parser",async()=>{
  const huge=fixture({extractWithAdapter:async({adapter})=>({adapter,status:"success",localOnly:true,
    catalogMutated:false,factualVerificationPerformed:false,automaticApproval:false,text:"x".repeat(5_000_000),
    pageCount:1,tableRows:[]})});
  assert.equal((await huge.agent.run(input)).code,"PARSER_OUTPUT_TOO_LARGE");
  const failed=fixture({extractWithAdapter:async({adapter})=>({adapter,status:"error",localOnly:true,
    catalogMutated:false,factualVerificationPerformed:false,automaticApproval:false,tableRows:[]})});
  assert.equal((await failed.agent.run(input)).code,"ALL_PARSERS_FAILED");
});
test("reports parser disagreement without selecting a winner",async()=>{
  const {agent}=fixture({extractWithAdapter:async({adapter})=>({adapter,status:"success",localOnly:true,
    catalogMutated:false,factualVerificationPerformed:false,automaticApproval:false,
    text:adapter==="docling"?"Different value":"Payload 14 kg",pageCount:2,tableRows:[]})});
  const r=await agent.run(input);
  assert.equal(r.parserAgreement.textAgreement,"parser_outputs_differ");
  assert.equal(r.reviewRequired,true);
});
