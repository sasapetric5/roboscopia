/**
 * Deterministic task router. No planning LLM, dynamic imports, tool grants,
 * autonomous retries, cross-agent permission escalation, or data mutation.
 */
const TASKS=new Set(["cnc_research","technical_profile","equipment_compatibility","research_evidence","comparison","document_processing"]);
const POLICY=Object.freeze({externalNetwork:false,catalogMutation:false,automaticApproval:false,publication:false});
const FORBIDDEN_TRUE=["externalNetwork","catalogMutation","automaticApproval","publication","rightsDecision","compatibilityApproval","safetyCertification","factualVerification"];
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&
  (Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
export function createRoboscopiaSupervisor({agents}={}) {
  if(!agents||typeof agents!=="object"||Array.isArray(agents)) throw new TypeError("SUPERVISOR_AGENTS_REQUIRED");
  const routes={cnc_research:"cncResearch",technical_profile:"technicalProfile",
    equipment_compatibility:"equipmentCompatibility",research_evidence:"researchEvidence",
    comparison:"comparison",document_processing:"documentProcessing"};
  return Object.freeze({async run({task,input}={}) {
    if(!TASKS.has(task)||!plain(input)) return {ok:false,agentId:"roboscopia_supervisor",code:"INVALID_TASK",policy:POLICY};
    const key=routes[task],agent=agents[key];
    if(!agent||typeof agent.run!=="function") return {ok:false,agentId:"roboscopia_supervisor",code:"AGENT_UNAVAILABLE",task,policy:POLICY};
    let result;
    try {result=await agent.run(input);} catch {return {ok:false,agentId:"roboscopia_supervisor",code:"AGENT_EXECUTION_FAILED",task,policy:POLICY};}
    if(!plain(result)) return {ok:false,agentId:"roboscopia_supervisor",code:"INVALID_AGENT_RESULT",task,policy:POLICY};
    if(result.ok===true&&(!plain(result.policy)||result.reviewRequired!==true||
      FORBIDDEN_TRUE.some(flag=>result.policy[flag]===true)))
      return {ok:false,agentId:"roboscopia_supervisor",code:"AGENT_POLICY_VIOLATION",task,policy:POLICY};
    return {ok:result.ok===true,agentId:"roboscopia_supervisor",task,result,
      reviewRequired:result.ok===true,policy:POLICY};
  }});
}
