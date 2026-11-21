#!/usr/bin/env python3
"""Local-only Docling adapter. Emits normalized JSON to stdout."""
import json, sys, time
from pathlib import Path

def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: docling_adapter.py <local.pdf>")
    pdf = Path(sys.argv[1]).resolve(strict=True)
    if not pdf.is_file() or pdf.suffix.lower() != ".pdf":
        raise SystemExit("input must be a local PDF file")
    from docling.document_converter import DocumentConverter
    started = time.perf_counter()
    result = DocumentConverter().convert(str(pdf))
    doc = result.document
    payload = {
        "adapter": "docling",
        "version": __import__("importlib.metadata", fromlist=["version"]).version("docling"),
        "status": str(getattr(result, "status", "success")),
        "text": doc.export_to_markdown(),
        "page_count": len(getattr(doc, "pages", {}) or {}),
        "table_count": len(getattr(doc, "tables", []) or []),
        "elapsed_seconds": round(time.perf_counter() - started, 4),
        "local_only": True
    }
    print(json.dumps(payload, ensure_ascii=False))
if __name__ == "__main__":
    main()
