import json, sys
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

def main(out):
    out.mkdir(parents=True, exist_ok=True)
    pdf=out/"roboscopia-synthetic-spec.pdf"; styles=getSampleStyleSheet()
    story=[Paragraph("ROBOSCOPIA SYNTHETIC TECHNICAL SPECIFICATION",styles["Title"]),Spacer(1,8*mm),
      Paragraph("Model identity: Spot (synthetic benchmark specimen)",styles["Heading2"]),
      Paragraph("Revision ROBOSCOPIA-BENCH-001. Fictional values for internal parser tests only.",styles["BodyText"]),
      Spacer(1,5*mm),Paragraph("Performance specifications",styles["Heading2"])]
    rows=[["Specification","Value","Unit"],["Maximum payload","14","kg"],["Maximum speed","1.6","m/s"],
      ["Mass with battery","33.8","kg"],["Battery capacity","564","Wh"]]
    table=Table(rows,colWidths=[75*mm,30*mm,25*mm],repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.lightgrey),("GRID",(0,0),(-1,-1),0.7,colors.black),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("ALIGN",(1,1),(-1,-1),"CENTER")]))
    story += [table,PageBreak(),Paragraph("Model identity: Spot",styles["Heading2"]),Paragraph("Second page for page-count testing. All data are fictional.",styles["BodyText"])]
    SimpleDocTemplate(str(pdf),pagesize=A4).build(story)
    manifest={"schemaVersion":"1.1.0","fixtures":[{"id":"synthetic-spec-table-v1","path":str(pdf),"timeoutMs":300000,"expectedPageCount":2,
      "rights":{"processingPermitted":True,"reviewer":"ROBOSCOPIA test fixture","basis":"Original synthetic content authored in this repository."},
      "expectedEvidence":[{"id":"model","text":"Model identity: Spot"},{"id":"payload","text":"Maximum payload 14 kg"},{"id":"speed","text":"Maximum speed 1.6 m/s"},{"id":"mass","text":"Mass with battery 33.8 kg"},{"id":"battery","text":"Battery capacity 564 Wh"}],
      "expectedTableRows":[["Maximum payload","14","kg"],["Maximum speed","1.6","m/s"],["Mass with battery","33.8","kg"],["Battery capacity","564","Wh"]]}]}
    (out/"parser-benchmark-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    print(pdf)
if __name__=="__main__": main(Path(sys.argv[1] if len(sys.argv)>1 else "artifacts/parser-fixtures").resolve())
