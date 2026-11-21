/**
 * Roboscopia Comparison & Compatibility Agent.
 * Deterministic read-only comparison of explicit claims; no ranking or approval.
 */
const MODEL_ID = /^[a-z0-9][a-z0-9._-]{0,95}$/i;
const MAX_MODELS = 10, MAX_CLAIMS = 200;
const fail = (code, stage) => ({ ok:false, agentId:"comparison_compatibility", code, stage,
  policy:{externalNetwork:false,catalogMutation:false,automaticApproval:false,compatibilityDecision:false,publication:false} });
const plain = x => x !== null && typeof x === "object" && !Array.isArray(x) &&
  (Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null);
const copy = x => { try { return JSON.parse(JSON.stringify(x)); } catch { return null; } };
const keyOf = c => typeof c.specificationId === "string" && c.specificationId.trim()
  ? c.specificationId.trim().toLowerCase()
  : typeof c.specification === "string" && c.specification.trim() ? c.specification.trim().toLowerCase() : null;
const reviewed = c => plain(c.humanReview) && c.humanReview.outcome === "supported" &&
  typeof c.humanReview.reviewer === "string" && !!c.humanReview.reviewer.trim() &&
  typeof c.humanReview.reviewedAt === "string" && !!c.humanReview.reviewedAt.trim();
function compare(a,b) {
  const evidenceStatus = reviewed(a) && reviewed(b) ? "both_human_reviewed" :
    reviewed(a) ? "left_human_reviewed" : reviewed(b) ? "right_human_reviewed" : "neither_human_reviewed";
  if (a.value == null || b.value == null) return {status:"value_missing",evidenceStatus,left:a.value??null,right:b.value??null,interpretation:"not_ranked"};
  if (typeof a.value === "number" && typeof b.value === "number") {
    if (!Number.isFinite(a.value) || !Number.isFinite(b.value)) return {status:"invalid_numeric_value",evidenceStatus,interpretation:"not_ranked"};
    if (typeof a.unit !== "string" || !a.unit.trim() || a.unit !== b.unit)
      return {status:"unit_mismatch",evidenceStatus,left:a.value,right:b.value,leftUnit:a.unit??null,rightUnit:b.unit??null,interpretation:"not_ranked"};
    return {status:a.value===b.value?"same_value":"different_values",evidenceStatus,left:a.value,right:b.value,unit:a.unit,interpretation:"not_ranked"};
  }
  if (typeof a.value === "string" && typeof b.value === "string")
    return {status:a.value===b.value?"same_value":"different_values",evidenceStatus,left:a.value,right:b.value,unit:a.unit??null,interpretation:"not_ranked"};
  return {status:"incomparable_value_types",evidenceStatus,interpretation:"not_ranked"};
}
export function createComparisonCompatibilityAgent({getModel,getClaims}={}) {
  if(typeof getModel!=="function") throw new TypeError("COMPARISON_AGENT_SERVICE_REQUIRED:getModel");
  if(typeof getClaims!=="function") throw new TypeError("COMPARISON_AGENT_SERVICE_REQUIRED:getClaims");
  return Object.freeze({async run({modelIds}={}) {
    if(!Array.isArray(modelIds)||modelIds.length<2||modelIds.length>MAX_MODELS||
      modelIds.some(x=>typeof x!=="string"||!MODEL_ID.test(x))||new Set(modelIds).size!==modelIds.length)
      return fail("INVALID_MODEL_IDS","input");
    const models=[];
    for(const id of modelIds) {
      let model,claims;
      try { model=await getModel(id); } catch { return fail("MODEL_LOOKUP_FAILED","models"); }
      if(!plain(model)||model.id!==id) return fail("MODEL_NOT_REGISTERED","models");
      try { claims=await getClaims(id); } catch { return fail("CLAIMS_LOOKUP_FAILED","claims"); }
      if(!Array.isArray(claims)||claims.length>MAX_CLAIMS) return fail("INVALID_OR_EXCESSIVE_CLAIMS","claims");
      const safe=copy(claims);
      if(!safe||safe.some(c=>!plain(c)||c.modelId!==id||!keyOf(c)||
        (c.value!=null&&!["string","number"].includes(typeof c.value))))
        return fail("CLAIM_IDENTITY_OR_SCHEMA_INVALID","claims");
      const byKey=new Map();
      for(const c of safe) { const k=keyOf(c); if(byKey.has(k)) return fail("DUPLICATE_SPECIFICATION_CLAIM","claims"); byKey.set(k,c); }
      models.push({id,name:typeof model.name==="string"?model.name:id,claims:byKey});
    }
    const comparisons=[];
    for(let i=0;i<models.length;i++) for(let j=i+1;j<models.length;j++) {
      const a=models[i],b=models[j],keys=[...new Set([...a.claims.keys(),...b.claims.keys()])].sort();
      comparisons.push({leftModel:{id:a.id,name:a.name},rightModel:{id:b.id,name:b.name},
        specifications:keys.map(k=>{
          const x=a.claims.get(k),y=b.claims.get(k);
          if (!x || !y) {
            const evidenceStatus = x
              ? (reviewed(x) ? "left_human_reviewed" : "neither_human_reviewed")
              : (reviewed(y) ? "right_human_reviewed" : "neither_human_reviewed");
            return {specification:k,status:"not_available_for_one_model",evidenceStatus,
              left:x?.value??null,right:y?.value??null,interpretation:"not_ranked"};
          }
          return {specification:k,...compare(x,y)};
        })});
    }
    return {ok:true,agentId:"comparison_compatibility",models:models.map(({id,name})=>({id,name})),comparisons,
      reviewRequired:true,policy:{externalNetwork:false,catalogMutation:false,automaticApproval:false,
      compatibilityDecision:false,ranking:false,publication:false,unitConversion:false,onlyExplicitHumanReviewCountsAsReviewed:true},
      limitations:["Different values do not imply better performance.","Matching values do not prove compatibility.",
      "Units are compared only when identical.","Unreviewed claims remain unverified."]};
  }});
}
