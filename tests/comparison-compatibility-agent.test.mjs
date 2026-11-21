import test from "node:test";
import assert from "node:assert/strict";
import { createComparisonCompatibilityAgent } from "../agents/comparison-compatibility-agent.mjs";
const models={spot:{id:"spot",name:"Spot"},go2:{id:"go2",name:"Go2"}};
const review={outcome:"supported",reviewer:"human-reviewer",reviewedAt:"2026-11-21T10:00:00Z"};
const c=(modelId,specification,value,unit,humanReview)=>({modelId,specification,value,unit,...(humanReview?{humanReview}:{})});
function fixture(overrides={}) {
 const calls=[];
 const agent=createComparisonCompatibilityAgent({
  getModel:async id=>{calls.push(["model",id]);return models[id];},
  getClaims:async id=>id==="spot"?[c(id,"payload",14,"kg",review),c(id,"speed",1.6,"m/s")]:
   [c(id,"payload",15,"kg",review),c(id,"speed",3,"km/h")],
  ...overrides
 });
 return {agent,calls};
}
test("requires injected model and claim services",()=>assert.throws(()=>createComparisonCompatibilityAgent(),/SERVICE_REQUIRED/));
test("compares claims without ranking and marks unreviewed evidence",async()=>{
 const {agent}=fixture(),r=await agent.run({modelIds:["spot","go2"]});
 assert.equal(r.ok,true);
 const s=r.comparisons[0].specifications;
 assert.equal(s.find(x=>x.specification==="payload").status,"different_values");
 assert.equal(s.find(x=>x.specification==="payload").evidenceStatus,"both_human_reviewed");
 assert.equal(s.find(x=>x.specification==="speed").status,"unit_mismatch");
 assert.equal(s.find(x=>x.specification==="speed").evidenceStatus,"neither_human_reviewed");
 assert.equal(r.policy.ranking,false);assert.equal(r.policy.compatibilityDecision,false);assert.equal(r.reviewRequired,true);
});
test("rejects invalid, duplicate, or excessive model selections before lookups",async()=>{
 const {agent,calls}=fixture();
 assert.equal((await agent.run({modelIds:["spot"]})).code,"INVALID_MODEL_IDS");
 assert.equal((await agent.run({modelIds:["spot","spot"]})).code,"INVALID_MODEL_IDS");
 assert.equal((await agent.run({modelIds:["../spot","go2"]})).code,"INVALID_MODEL_IDS");
 assert.equal(calls.length,0);
});
test("rejects model identity mismatch and duplicate specification claims",async()=>{
 const badModel=fixture({getModel:async()=>({id:"other"})});
 assert.equal((await badModel.agent.run({modelIds:["spot","go2"]})).code,"MODEL_NOT_REGISTERED");
 const dup=fixture({getClaims:async id=>[c(id,"payload",14,"kg"),c(id,"payload",15,"kg")]});
 assert.equal((await dup.agent.run({modelIds:["spot","go2"]})).code,"DUPLICATE_SPECIFICATION_CLAIM");
});
test("does not treat source-linked or unsupported values as human-reviewed",async()=>{
 const {agent}=fixture({getClaims:async id=>[c(id,"payload",10,"kg",{outcome:"supported",reviewer:"",reviewedAt:""})]});
 const r=await agent.run({modelIds:["spot","go2"]});
 assert.equal(r.comparisons[0].specifications[0].evidenceStatus,"neither_human_reviewed");
});
test("handles missing claims without inventing values",async()=>{
 const {agent}=fixture({getClaims:async id=>id==="spot"?[c(id,"payload",10,"kg")]:[]});
 const r=await agent.run({modelIds:["spot","go2"]});
 assert.equal(r.comparisons[0].specifications[0].status,"not_available_for_one_model");
});
