/**
 * Evidence-bound technical profile structurer. Produces draft fields only.
 * Does not infer missing values, normalize units, verify facts, or publish.
 */
const ID=/^[a-z0-9][a-z0-9._:-]{0,127}$/i, MAX=300;
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&(Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
export function createTechnicalProfileAgent({getEntity,getEvidenceCandidates}={}) {
  if(typeof getEntity!=="function"||typeof getEvidenceCandidates!=="function") throw new TypeError("PROFILE_AGENT_SERVICES_REQUIRED");
  return Object.freeze({async run({entityId}={}) {
    if(typeof entityId!=="string"||!ID.test(entityId)) return {ok:false,agentId:"technical_profile",code:"INVALID_ENTITY_ID"};
    let entity,candidates;
    try { entity=await getEntity(entityId); } catch { return {ok:false,agentId:"technical_profile",code:"ENTITY_LOOKUP_FAILED"}; }
    if(!plain(entity)||entity.id!==entityId) return {ok:false,agentId:"technical_profile",code:"ENTITY_NOT_REGISTERED"};
    try { candidates=await getEvidenceCandidates(entityId); } catch { return {ok:false,agentId:"technical_profile",code:"EVIDENCE_LOOKUP_FAILED"}; }
    if(!Array.isArray(candidates)||candidates.length>MAX||candidates.some(x=>!plain(x)||x.entityId!==entityId||
      typeof x.specificationId!=="string"||!x.specificationId.trim()||
      !("value" in x)||typeof x.sourceId!=="string"||!x.sourceId.trim()))
      return {ok:false,agentId:"technical_profile",code:"INVALID_EVIDENCE_CANDIDATES"};
    const fields=candidates.map(x=>({specificationId:x.specificationId,value:x.value,unit:x.unit??null,
      sourceId:x.sourceId,documentId:x.documentId??null,locator:x.locator??null,
      evidenceStatus:x.evidenceStatus??"unreviewed",humanReviewRequired:true}));
    return {ok:true,agentId:"technical_profile",draft:{entityId,entityType:entity.type??null,name:entity.name??null,fields},
      reviewRequired:true,policy:{inference:false,unitConversion:false,factualVerification:false,catalogMutation:false,publication:false}};
  }});
}
