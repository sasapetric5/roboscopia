import json, re, sys, time, tempfile
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
        raise SystemExit("usage: opendataloader_adapter.py <local.pdf> [<local.pdf> ...]")
    pdfs=[Path(arg).resolve(strict=True) for arg in sys.argv[1:]]
    if any(not p.is_file() or p.suffix.lower()!=".pdf" for p in pdfs):
        raise SystemExit("all inputs must be local PDF files")
    import opendataloader_pdf
    from importlib.metadata import version
    output=[]
    for pdf in pdfs:
        start=time.perf_counter()
        try:
            with tempfile.TemporaryDirectory(prefix="roboscopia-odl-") as tmp:
                opendataloader_pdf.convert(input_path=str(pdf),output_dir=tmp,format="markdown",quiet=True)
                outputs=sorted(Path(tmp).rglob("*.md"))+sorted(Path(tmp).rglob("*.markdown"))
                if not outputs:
                    raise RuntimeError("OpenDataLoader produced no Markdown output")
                md="\n".join(p.read_text(encoding="utf-8",errors="replace") for p in outputs)
            found=tables(md)
            output.append({"document":pdf.name,"adapter":"opendataloader-pdf","version":version("opendataloader-pdf"),"status":"success","text":md,"page_count":None,"table_count":len(found),"table_rows":found,"elapsed_seconds":round(time.perf_counter()-start,4),"local_only":True})
        except Exception as exc:
            output.append({"document":pdf.name,"adapter":"opendataloader-pdf","status":"error","error":str(exc),"text":"","page_count":None,"table_count":None,"table_rows":[],"elapsed_seconds":round(time.perf_counter()-start,4),"local_only":True})
    print(json.dumps(output,ensure_ascii=False))

if __name__=="__main__":
    main()
