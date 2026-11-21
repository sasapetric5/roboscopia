import json, re, sys, time
from pathlib import Path

def tables(md):
    rows=[]
    for line in md.splitlines():
        s=line.strip()
        if s.startswith("|") and s.endswith("|"):
            cells=[x.strip() for x in s.strip("|").split("|")]
            if cells and not all(re.fullmatch(r":?-{3,}:?",x or "") for x in cells):
                rows.append(cells)
    return rows

def main():
    if len(sys.argv)<2:
        raise SystemExit("usage: docling_adapter.py <local.pdf> [<local.pdf> ...]")
    pdfs=[Path(arg).resolve(strict=True) for arg in sys.argv[1:]]
    if any(not p.is_file() or p.suffix.lower()!=".pdf" for p in pdfs):
        raise SystemExit("all inputs must be local PDF files")
    from docling.document_converter import DocumentConverter
    from importlib.metadata import version
    converter=DocumentConverter()
    output=[]
    for pdf in pdfs:
        start=time.perf_counter()
        try:
            result=converter.convert(str(pdf)); doc=result.document
            md=doc.export_to_markdown(); found=tables(md)
            raw_status=str(getattr(result,"status","success"))
            status="success" if "SUCCESS" in raw_status.upper() else "error"
            output.append({"document":pdf.name,"adapter":"docling","version":version("docling-slim"),"status":status,"raw_status":raw_status,"text":md,"page_count":len(getattr(doc,"pages",{}) or {}),"table_count":len(getattr(doc,"tables",[]) or []),"table_rows":found,"elapsed_seconds":round(time.perf_counter()-start,4),"local_only":True})
        except Exception as exc:
            output.append({"document":pdf.name,"adapter":"docling","status":"error","error":str(exc),"text":"","page_count":None,"table_count":None,"table_rows":[],"elapsed_seconds":round(time.perf_counter()-start,4),"local_only":True})
    print(json.dumps(output,ensure_ascii=False))

if __name__=="__main__":
    main()
