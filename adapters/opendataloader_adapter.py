#!/usr/bin/env python3
"""Local-only OpenDataLoader PDF adapter. Emits normalized JSON to stdout."""
import json, sys, time, tempfile
from pathlib import Path

def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: opendataloader_adapter.py <local.pdf>")
    pdf = Path(sys.argv[1]).resolve(strict=True)
    if not pdf.is_file() or pdf.suffix.lower() != ".pdf":
        raise SystemExit("input must be a local PDF file")
    import opendataloader_pdf
    from importlib.metadata import version
    started = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="roboscopia-odl-") as temp:
        opendataloader_pdf.convert(input_path=str(pdf), output_dir=temp, format="text")
        outputs = list(Path(temp).glob("*.txt"))
        if not outputs:
            outputs = list(Path(temp).rglob("*.txt"))
        if not outputs:
            raise RuntimeError("OpenDataLoader produced no .txt output")
        text = "\n".join(path.read_text(encoding="utf-8", errors="replace") for path in outputs)
    payload = {
        "adapter": "opendataloader-pdf",
        "version": version("opendataloader-pdf"),
        "status": "success",
        "text": text,
        "page_count": text.count("\f") + 1 if text else 0,
        "table_count": None,
        "elapsed_seconds": round(time.perf_counter() - started, 4),
        "local_only": True
    }
    print(json.dumps(payload, ensure_ascii=False))
if __name__ == "__main__":
    main()
