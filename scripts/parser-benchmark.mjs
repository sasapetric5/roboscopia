import { readFile,writeFile,mkdir } from "node:fs/promises";
import { resolve,dirname,basename } from "node:path";
import { execFile as cb } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
const execFile=promisify(cb);
const norm=x=>String(x??"").normalize("NFKC").toLowerCase().replace(/\s+/g," ").trim();
const token=c=>c!==undefined&&/[A-Za-z0-9.,]/.test(c);
function has(h,n){if(!n)return false;let i=0;while((i=h.indexOf(n,i))!==-1){const b=i?h[i-1]:undefined,a=i+n.length<h.length?h[i+n.length]:undefined;if(!token(b)&&!token(a))return true;i++;}return false;}
export function scoreOutput(output,expected,rows=[],expectedRows=[]){
 const searchable=norm([output,...rows.map(row=>row.join(" "))].join(" "));
 const checks=expected.map(x=>({id:x.id,found:has(searchable,norm(x.text))}));
 const tableChecks=expectedRows.map((e,index)=>({index,found:rows.some(r=>r.length===e.length&&e.every((c,i)=>norm(r[i])===norm(c)))}));
 const matched=checks.filter(x=>x.found).length,tm=tableChecks.filter(x=>x.found).length;
 return {expectedCount:checks.length,matchedCount:matched,evidenceRecall:checks.length?matched/checks.length:null,checks,expectedTableRows:tableChecks.length,matchedTableRows:tm,tableRowRecall:tableChecks.length?tm/tableChecks.length:null,tableChecks};
}
async function run(adapter,pdf,timeout){
 const start=Date.now();
 if(adapter==="poppler"){
  const r=await execFile("pdftotext",["-layout","-enc","UTF-8",resolve(pdf),"-"],{timeout,maxBuffer:32*1024*1024,encoding:"utf8"});
  const v=await execFile("pdftotext",["-v"],{timeout:10000,encoding:"utf8"});
  return {version:(v.stderr||v.stdout).trim().split("\n")[0],status:"success",text:r.stdout,page_count:r.stdout.split("\f").filter(p=>p.trim()).length,table_count:null,table_rows:[],elapsed_seconds:(Date.now()-start)/1000,local_only:true};
 }
 const script=resolve("adapters",adapter==="docling"?"docling_adapter.py":"opendataloader_adapter.py");
 const r=await execFile(process.env.PYTHON??"python3",[script,resolve(pdf)],{timeout,maxBuffer:32*1024*1024,encoding:"utf8"});
 const out=JSON.parse(r.stdout);
 if(out.local_only!==true||typeof out.text!=="string"||!Array.isArray(out.table_rows))throw Error("Adapter output contract invalid");
 return out;
}
async function main(){
 const [manifestArg,outputArg]=process.argv.slice(2);
 const manifest=JSON.parse(await readFile(resolve(manifestArg??"data/parser-benchmark-corpus.json"),"utf8"));
 const results=[];
 for(const f of manifest.fixtures??[]){
  if(!f.rights?.processingPermitted||!f.rights?.reviewer||!f.rights?.basis){results.push({fixtureId:f.id,status:"quarantined",reason:"RIGHTS_REVIEW_REQUIRED"});continue;}
  if(!f.path||!Array.isArray(f.expectedEvidence))throw Error("Invalid benchmark fixture: "+f.id);
  const item={fixtureId:f.id,document:basename(f.path),expectedPageCount:f.expectedPageCount??null,parsers:{}};
  for(const adapter of ["poppler","opendataloader","docling"]){
   try{const p=await run(adapter,f.path,f.timeoutMs??300000),s=scoreOutput(p.text,f.expectedEvidence,p.table_rows,f.expectedTableRows??[]);
    item.parsers[adapter]={status:p.status,version:p.version,elapsedSeconds:p.elapsed_seconds,pageCount:p.page_count??null,pageCountMatch:Number.isInteger(f.expectedPageCount)&&Number.isInteger(p.page_count)?p.page_count===f.expectedPageCount:null,tableCount:p.table_count,tableRowsAvailable:p.table_rows.length,...s};
   }catch(e){item.parsers[adapter]={status:"error",error:e.message};}
  } results.push(item);
 }
 const report={schemaVersion:"1.1.0",generatedAt:new Date().toISOString(),corpusStatus:results.length?"executed":"empty_no_benchmark_claim",fixtureCount:results.length,parsersExecuted:[...new Set(results.flatMap(x=>Object.keys(x.parsers??{})))],scoring:"Exact normalized snippet and table-row recall; synthetic fixture only; no production accuracy claim.",rightsPolicy:"Only explicitly permitted fixtures are processed.",catalogMutation:false,results};
 const out=resolve(outputArg??"artifacts/parser-benchmark-report.json");await mkdir(dirname(out),{recursive:true});
 await writeFile(out,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 process.stdout.write(JSON.stringify({corpusStatus:report.corpusStatus,fixtureCount:report.fixtureCount,parsersExecuted:report.parsersExecuted,output:out})+"\n");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(e=>{process.stderr.write(e.message+"\n");process.exitCode=2;});
