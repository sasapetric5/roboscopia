import json, re, sys, time, tempfile
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
    if len(sys.argv)!=2: raise SystemExit("usage: opendataloader_adapter.py <local.pdf>")
    pdf=Path(sys.argv[1]).resolve(strict=True)
    if not pdf.is_file() or pdf.suffix.lower()!=".pdf": raise SystemExit("input must be a local PDF")
    import opendataloader_pdf
    from importlib.metadata import version
    start=time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="roboscopia-odl-") as tmp:
        opendataloader_pdf.convert(input_path=str(pdf),output_dir=tmp,format="markdown",quiet=True)
        outputs=sorted(Path(tmp).rglob("*.md"))+sorted(Path(tmp).rglob("*.markdown"))
        if not outputs: raise RuntimeError("OpenDataLoader produced no Markdown output")
        md="\n".join(p.read_text(encoding="utf-8",errors="replace") for p in outputs)
    found=tables(md)
    print(json.dumps({"adapter":"opendataloader-pdf","version":version("opendataloader-pdf"),"status":"success","text":md,"page_count":None,"table_count":len(found),"table_rows":found,"elapsed_seconds":round(time.perf_counter()-start,4),"local_only":True},ensure_ascii=False))
if __name__=="__main__": main()
