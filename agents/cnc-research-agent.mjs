/**
 * CNC Research Agent: domain-specific adapter over the shared evidence workflow.
 * No crawler, network, file access, factual approval, or catalogue mutation.
 * The identity resolver is the trusted bridge between the CNC equipment registry
 * and the shared evidence-claim registry; equipment IDs are never assumed to be
 * valid robot/model IDs.
 */
const CNC_TYPES = new Set(["cnc_mill","cnc_lathe","cnc_router","cnc_grinder","cnc_waterjet","cnc_laser","cnc_plasma","cnc_controller","cnc_spindle","cnc_tooling","cnc_accessory"]);
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/i;
export function createCncResearchAgent({ researchEvidenceAgent, getEquipment, resolveEvidenceIdentity } = {}) {
  if (!researchEvidenceAgent || typeof researchEvidenceAgent.run !== "function")
    throw new TypeError("CNC_RESEARCH_SERVICE_REQUIRED:researchEvidenceAgent");
  if (typeof getEquipment !== "function") throw new TypeError("CNC_RESEARCH_SERVICE_REQUIRED:getEquipment");
  if (typeof resolveEvidenceIdentity !== "function") throw new TypeError("CNC_RESEARCH_SERVICE_REQUIRED:resolveEvidenceIdentity");
  return Object.freeze({ async run({ equipmentId, sourceId, documentRef, runId } = {}) {
    if (typeof equipmentId !== "string" || !ID.test(equipmentId) ||
        typeof sourceId !== "string" || !ID.test(sourceId) ||
        typeof documentRef !== "string" || !documentRef.trim() || documentRef.length > 512)
      return {ok:false,agentId:"cnc_research",code:"INVALID_INPUT",reviewRequired:true};
    let equipment;
    try { equipment = await getEquipment(equipmentId); }
    catch { return {ok:false,agentId:"cnc_research",code:"EQUIPMENT_LOOKUP_FAILED",reviewRequired:true}; }
    if (!equipment || equipment.id !== equipmentId || !CNC_TYPES.has(equipment.type))
      return {ok:false,agentId:"cnc_research",code:"CNC_EQUIPMENT_NOT_REGISTERED",reviewRequired:true};
    let identity;
    try { identity = await resolveEvidenceIdentity({equipment,sourceId,documentRef}); }
    catch { return {ok:false,agentId:"cnc_research",code:"EVIDENCE_IDENTITY_RESOLUTION_FAILED",reviewRequired:true}; }
    if (!identity || typeof identity.modelId !== "string" || !ID.test(identity.modelId) ||
        identity.sourceId !== sourceId || identity.documentRef !== documentRef)
      return {ok:false,agentId:"cnc_research",code:"EVIDENCE_IDENTITY_INVALID",reviewRequired:true};
    let evidence;
    try { evidence = await researchEvidenceAgent.run({modelId:identity.modelId,sourceId:identity.sourceId,documentRef:identity.documentRef,runId}); }
    catch { return {ok:false,agentId:"cnc_research",code:"EVIDENCE_WORKFLOW_FAILED",reviewRequired:true}; }
    return {ok:evidence?.ok===true,agentId:"cnc_research",equipment:{id:equipment.id,type:equipment.type},
      evidence,reviewRequired:true,policy:{catalogMutation:false,automaticApproval:false,rightsDecision:false,publication:false}};
  }});
}
