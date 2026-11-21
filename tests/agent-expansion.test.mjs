import test from "node:test";
import assert from "node:assert/strict";
import { createCncResearchAgent } from "../agents/cnc-research-agent.mjs";
import { createTechnicalProfileAgent } from "../agents/technical-profile-agent.mjs";
import { createEquipmentCompatibilityAgent } from "../agents/equipment-compatibility-agent.mjs";
import { createRoboscopiaSupervisor } from "../agents/roboscopia-supervisor.mjs";

test("CNC research delegates evidence workflow only for registered CNC equipment", async () => {
  let calls=0;
  const agent=createCncResearchAgent({
    getEquipment:async id=>({id,type:"cnc_mill"}),
    resolveEvidenceIdentity:async ({equipment,sourceId,documentRef})=>({modelId:"cnc-mill-a",sourceId,documentRef}),
    researchEvidenceAgent:{run:async input=>{calls++;return {ok:true,reviewRequired:true,input};}}
  });
  const result=await agent.run({equipmentId:"mill-1",sourceId:"src-1",documentRef:"docs/manual.pdf"});
  assert.equal(result.ok,true);assert.equal(result.reviewRequired,true);assert.equal(calls,1);
  assert.equal(result.policy.catalogMutation,false);
});
test("CNC research rejects non-CNC or unregistered equipment",async()=>{
  const agent=createCncResearchAgent({getEquipment:async id=>({id,type:"industrial_robot"}),resolveEvidenceIdentity:async()=>({modelId:"robot-1",sourceId:"src-1",documentRef:"manual.pdf"}),researchEvidenceAgent:{run:async()=>{throw Error("must not run");}}});
  assert.equal((await agent.run({equipmentId:"robot-1",sourceId:"src-1",documentRef:"manual.pdf"})).code,"CNC_EQUIPMENT_NOT_REGISTERED");
});
test("technical profile creates evidence-linked draft without inventing or approving values",async()=>{
  const agent=createTechnicalProfileAgent({getEntity:async id=>({id,type:"cnc_mill",name:"Mill A"}),
    getEvidenceCandidates:async id=>[{entityId:id,specificationId:"spindle_power",value:7.5,unit:"kW",sourceId:"src-1",evidenceStatus:"unreviewed"}]});
  const r=await agent.run({entityId:"mill-a"});
  assert.equal(r.ok,true);assert.equal(r.draft.fields[0].value,7.5);
  assert.equal(r.draft.fields[0].humanReviewRequired,true);
  assert.equal(r.policy.catalogMutation,false);assert.equal(r.policy.factualVerification,false);
});
test("technical profile rejects cross-entity evidence and excessive candidate lists",async()=>{
  const agent=createTechnicalProfileAgent({getEntity:async id=>({id}),getEvidenceCandidates:async()=>[{entityId:"other",specificationId:"payload",value:1,sourceId:"src"}]});
  assert.equal((await agent.run({entityId:"robot-1"})).code,"INVALID_EVIDENCE_CANDIDATES");
});
test("equipment compatibility reports candidate findings but never approves compatibility",async()=>{
  const agent=createEquipmentCompatibilityAgent({getEntity:async id=>({id}),assessCompatibility:async()=>({status:"candidate_compatible",reasons:["matching interface"],evidenceIds:["ev-1"]})});
  const r=await agent.run({hostId:"robot-1",componentIds:["tool-1"]});
  assert.equal(r.ok,true);assert.equal(r.findings[0].status,"candidate_compatible");
  assert.equal(r.findings[0].reviewRequired,true);assert.equal(r.policy.compatibilityApproval,false);
});
test("equipment compatibility rejects assessor attempts to self-approve",async()=>{
  const agent=createEquipmentCompatibilityAgent({getEntity:async id=>({id}),assessCompatibility:async()=>({status:"candidate_compatible",approved:true})});
  assert.equal((await agent.run({hostId:"cnc-1",componentIds:["controller-1"]})).code,"INVALID_ASSESSMENT_OUTPUT");
});
test("supervisor routes a fixed task to one registered agent and preserves review gate",async()=>{
  const supervisor=createRoboscopiaSupervisor({agents:{cncResearch:{run:async()=>({ok:true,reviewRequired:true,policy:{catalogMutation:false,automaticApproval:false,publication:false}})}}});
  const r=await supervisor.run({task:"cnc_research",input:{equipmentId:"mill-1"}});
  assert.equal(r.ok,true);assert.equal(r.agentId,"roboscopia_supervisor");assert.equal(r.reviewRequired,true);
});
test("supervisor rejects unknown tasks, missing agents and policy violations",async()=>{
  const supervisor=createRoboscopiaSupervisor({agents:{technicalProfile:{run:async()=>({ok:true,policy:{catalogMutation:true}})}}});
  assert.equal((await supervisor.run({task:"unknown",input:{}})).code,"INVALID_TASK");
  assert.equal((await supervisor.run({task:"cnc_research",input:{}})).code,"AGENT_UNAVAILABLE");
  assert.equal((await supervisor.run({task:"technical_profile",input:{}})).code,"AGENT_POLICY_VIOLATION");
});

test("CNC research rejects unresolved or mismatched evidence identity before invoking research",async()=>{
  let calls=0;
  const agent=createCncResearchAgent({
    getEquipment:async id=>({id,type:"cnc_mill"}),
    resolveEvidenceIdentity:async()=>({modelId:"mill-1",sourceId:"different-source",documentRef:"manual.pdf"}),
    researchEvidenceAgent:{run:async()=>{calls++;return {ok:true};}}
  });
  const result=await agent.run({equipmentId:"mill-1",sourceId:"src-1",documentRef:"manual.pdf"});
  assert.equal(result.code,"EVIDENCE_IDENTITY_INVALID");
  assert.equal(calls,0);
});


test("supervisor requires explicit human-review gate and rejects unsafe policy flags",async()=>{
  const noReview=createRoboscopiaSupervisor({agents:{technicalProfile:{run:async()=>({ok:true,reviewRequired:false,policy:{catalogMutation:false,automaticApproval:false,publication:false}})}}});
  assert.equal((await noReview.run({task:"technical_profile",input:{}})).code,"AGENT_POLICY_VIOLATION");
  const unsafe=createRoboscopiaSupervisor({agents:{researchEvidence:{run:async()=>({ok:true,reviewRequired:true,policy:{catalogMutation:false,automaticApproval:false,publication:false,externalNetwork:true}})}}});
  assert.equal((await unsafe.run({task:"research_evidence",input:{}})).code,"AGENT_POLICY_VIOLATION");
});
test("supervisor routes document processing through its dedicated registered agent",async()=>{
  let called=0;
  const supervisor=createRoboscopiaSupervisor({agents:{documentProcessing:{run:async input=>{called++;return {ok:true,reviewRequired:true,policy:{externalNetwork:false,filesystemAccess:false,parserExecution:false,rightsDecision:false,factualVerification:false,catalogMutation:false,publication:false},input};}}}});
  const r=await supervisor.run({task:"document_processing",input:{documentId:"doc-1"}});
  assert.equal(r.ok,true);assert.equal(r.reviewRequired,true);assert.equal(called,1);
});
test("supervisor rejects malformed agent results and non-object inputs",async()=>{
  const supervisor=createRoboscopiaSupervisor({agents:{comparison:{run:async()=>null}}});
  assert.equal((await supervisor.run({task:"comparison",input:{modelIds:["a","b"]}})).code,"INVALID_AGENT_RESULT");
  assert.equal((await supervisor.run({task:"comparison",input:null})).code,"INVALID_TASK");
});
