import json, re, sys, time
from pathlib import Path
def tables(md):
    rows=[]
    for line in md.splitlines():
        s=line.strip()
        if s.startswith("|") and s.endswith("|"):
            cells=[x.strip() for x in s.strip("|").split("|")]
            if cells and not all(re.fullmatch(r":?-{3,}:?",x or "") for x in cells): rows.append(cells)
    return rows
def main():
    if len(sys.argv)!=2: raise SystemExit("usage: docling_adapter.py <local.pdf>")
    pdf=Path(sys.argv[1]).resolve(strict=True)
    if not pdf.is_file() or pdf.suffix.lower()!=".pdf": raise SystemExit("input must be a local PDF")
    from docling.document_converter import DocumentConverter
    from importlib.metadata import version
    start=time.perf_counter(); result=DocumentConverter().convert(str(pdf)); doc=result.document
    md=doc.export_to_markdown(); found=tables(md)
    raw_status=str(getattr(result,"status","success"))
    status="success" if "SUCCESS" in raw_status.upper() else "error"
    print(json.dumps({"adapter":"docling","version":version("docling-slim"),"status":status,"raw_status":raw_status,"text":md,"page_count":len(getattr(doc,"pages",{}) or {}),"table_count":len(getattr(doc,"tables",[]) or []),"table_rows":found,"elapsed_seconds":round(time.perf_counter()-start,4),"local_only":True},ensure_ascii=False))
if __name__=="__main__": main()
