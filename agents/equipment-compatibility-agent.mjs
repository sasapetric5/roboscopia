/**
 * Evidence-gated compatibility assessment for robots, CNC equipment and parts.
 * A trusted injected assessor may return candidate findings; this agent never
 * converts a candidate into a compatibility approval or safety certification.
 */
const ID=/^[a-z0-9][a-z0-9._:-]{0,127}$/i, MAX=50;
export function createEquipmentCompatibilityAgent({getEntity,assessCompatibility}={}) {
  if(typeof getEntity!=="function"||typeof assessCompatibility!=="function") throw new TypeError("COMPATIBILITY_SERVICES_REQUIRED");
  return Object.freeze({async run({hostId,componentIds}={}) {
    if(typeof hostId!=="string"||!ID.test(hostId)||!Array.isArray(componentIds)||componentIds.length<1||
      componentIds.length>MAX||componentIds.some(x=>typeof x!=="string"||!ID.test(x))||new Set(componentIds).size!==componentIds.length)
      return {ok:false,agentId:"equipment_compatibility",code:"INVALID_INPUT"};
    let host;
    try {host=await getEntity(hostId);} catch {return {ok:false,agentId:"equipment_compatibility",code:"HOST_LOOKUP_FAILED"};}
    if(!host||host.id!==hostId) return {ok:false,agentId:"equipment_compatibility",code:"HOST_NOT_REGISTERED"};
    const findings=[];
    for(const componentId of componentIds) {
      let component;
      try {component=await getEntity(componentId);} catch {return {ok:false,agentId:"equipment_compatibility",code:"COMPONENT_LOOKUP_FAILED"};}
      if(!component||component.id!==componentId) return {ok:false,agentId:"equipment_compatibility",code:"COMPONENT_NOT_REGISTERED"};
      let result;
      try {result=await assessCompatibility({host,component});} catch {return {ok:false,agentId:"equipment_compatibility",code:"ASSESSMENT_FAILED"};}
      if(!result||!["candidate_compatible","candidate_incompatible","insufficient_evidence","not_assessed"].includes(result.status)||
        result.approved===true||result.safetyCertified===true)
        return {ok:false,agentId:"equipment_compatibility",code:"INVALID_ASSESSMENT_OUTPUT"};
      findings.push({componentId,status:result.status,reasons:Array.isArray(result.reasons)?result.reasons.slice(0,20):[],
        evidenceIds:Array.isArray(result.evidenceIds)?result.evidenceIds.slice(0,50):[],reviewRequired:true});
    }
    return {ok:true,agentId:"equipment_compatibility",hostId,findings,reviewRequired:true,
      policy:{compatibilityApproval:false,safetyCertification:false,catalogMutation:false,publication:false}};
  }});
}
