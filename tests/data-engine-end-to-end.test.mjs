import test from "node:test";
import assert from "node:assert/strict";
import { extractEvidenceCandidates } from "../scripts/technical-evidence-extraction-engine.mjs";
import { buildEvidenceMatchingReport } from "../scripts/evidence-matching-review-engine.mjs";
import { buildAutomatedVerificationReport } from "../scripts/automated-verification-engine.mjs";
const date="2026-11-21T08:00:00.000Z";
const source={id:"fixture-source",url:"https://manufacturer.example/spot/specifications",authorityTier:"manufacturer_primary",reviewStatus:"verified",lastReviewedAt:date,rights:{processingPermitted:true,reviewedBy:"test-reviewer",reviewedAt:date,basis:"Original synthetic fixture; internal processing permission."}};
const claim={claimId:"spot-speed",modelId:"spot",model:"Spot",specification:"Maximum speed",value:1.6,unit:"m/s",configurationId:null,sourceId:source.id,sourceUrl:source.url};
const text="ROBOSCOPIA SYNTHETIC TECHNICAL SPECIFICATION\nModel identity: Spot\nPerformance\nMaximum speed: 1.6 m/s";
const hash="a".repeat(64);
function extract(input=text){return extractEvidenceCandidates({text:input,documentSha256:hash,documentName:"synthetic.txt",sourceUrl:source.url,modelId:"spot",modelName:"Spot",documentRevision:"BENCH-001",documentDate:"2026-11-21"});}
function pack(c){return {claimId:claim.claimId,modelId:"spot",configurationId:null,source:{sourceId:source.id,url:source.url,authority:"manufacturer_primary",rights:{processingPermitted:true}},document:{sha256:hash,revision:"BENCH-001",capturedAt:date},extraction:{value:c.extractedValue,unit:c.unit,quote:c.evidenceQuote,locator:{type:"pdf",page:c.evidenceLocator.page},parser:{name:"poppler",version:"test-1"}}};}
test("end-to-end extraction, matching, human review and rights-aware evidence gate",()=>{
 const x=extract(),c=x.candidates[0];assert.equal(x.counts.candidates,1);assert.equal(c.field,"speed");assert.equal(c.extractedValue,1.6);
 const sourceReport={claims:[claim]},db={schemaVersion:"2.1.0"};
 const match=buildEvidenceMatchingReport(db,sourceReport,[x],[],Date.parse(date));assert.equal(match.matches[0].status,"value_match_unverified");
 const reviewed=buildEvidenceMatchingReport(db,sourceReport,[x],[{matchId:match.matches[0].matchId,outcome:"supported",evidenceLocator:"Synthetic PDF page 1, Performance row",note:"Exact value, unit and model reviewed.",reviewer:"test-reviewer",reviewedAt:date}],Date.parse(date));
 assert.equal(reviewed.matches[0].humanReview.outcome,"supported");assert.equal(reviewed.policy.catalogMutated,false);
 const gate=buildAutomatedVerificationReport({claims:[{claimId:claim.claimId,modelId:"spot",configurationId:null,value:1.6,unit:"m/s"}],evidence:[pack(c)],sourceRegistry:[source],now:date});
 assert.equal(gate.decisions[0].status,"eligible_for_automatic_ingestion");assert.equal(gate.decisions[0].catalogMutationAllowed,false);
});
test("end-to-end quarantine when source rights are not approved",()=>{
 const c=extract().candidates[0],unapproved={...source,reviewStatus:"not_reviewed",rights:{processingPermitted:false}};
 const gate=buildAutomatedVerificationReport({claims:[{claimId:claim.claimId,modelId:"spot",configurationId:null,value:1.6,unit:"m/s"}],evidence:[pack(c)],sourceRegistry:[unapproved],now:date});
 assert.equal(gate.decisions[0].status,"quarantined");assert.ok(gate.decisions[0].issues.some(x=>x.code==="REGISTRY_RIGHTS_NOT_CLEARED"));
});
test("end-to-end quarantine when parser misreads numeric value",()=>{
 const c=extract(text.replace("1.6 m/s","11.6 m/s")).candidates[0];
 const match=buildEvidenceMatchingReport({schemaVersion:"2.1.0"},{claims:[claim]},[{candidates:[c]}],[],Date.parse(date));assert.equal(match.matches[0].status,"value_mismatch");
 const gate=buildAutomatedVerificationReport({claims:[{claimId:claim.claimId,modelId:"spot",configurationId:null,value:1.6,unit:"m/s"}],evidence:[pack(c)],sourceRegistry:[source],now:date});
 assert.equal(gate.decisions[0].status,"quarantined");assert.ok(gate.decisions[0].issues.some(x=>x.code==="VALUE_CONFLICT"));
});
