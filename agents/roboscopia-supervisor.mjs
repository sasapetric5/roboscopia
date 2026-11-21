/**
 * Deterministic task router. No planning LLM, dynamic imports, tool grants,
 * autonomous retries, cross-agent permission escalation, or data mutation.
 */
const TASKS=new Set(["cnc_research","technical_profile","equipment_compatibility","research_evidence","comparison"]);
const POLICY={externalNetwork:false,catalogMutation:false,automaticApproval:false,publication:false};
export function createRoboscopiaSupervisor({agents}={}) {
  if(!agents||typeof agents!=="object"||Array.isArray(agents)) throw new TypeError("SUPERVISOR_AGENTS_REQUIRED");
  const routes={cnc_research:"cncResearch",technical_profile:"technicalProfile",
    equipment_compatibility:"equipmentCompatibility",research_evidence:"researchEvidence",comparison:"comparison"};
  return Object.freeze({async run({task,input}={}) {
    if(!TASKS.has(task)||!input||typeof input!=="object"||Array.isArray(input))
      return {ok:false,agentId:"roboscopia_supervisor",code:"INVALID_TASK"};
    const key=routes[task],agent=agents[key];
    if(!agent||typeof agent.run!=="function") return {ok:false,agentId:"roboscopia_supervisor",code:"AGENT_UNAVAILABLE",task,policy:POLICY};
    let result;
    try {result=await agent.run(input);} catch {return {ok:false,agentId:"roboscopia_supervisor",code:"AGENT_EXECUTION_FAILED",task,policy:POLICY};}
    if(!result||typeof result!=="object"||result.policy?.catalogMutation===true||
      result.policy?.automaticApproval===true||result.policy?.publication===true)
      return {ok:false,agentId:"roboscopia_supervisor",code:"AGENT_POLICY_VIOLATION",task,policy:POLICY};
    return {ok:result.ok===true,agentId:"roboscopia_supervisor",task,result,
      reviewRequired:result.reviewRequired!==false,policy:POLICY};
  }});
}
