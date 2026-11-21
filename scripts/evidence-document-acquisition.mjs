import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { extractEvidenceCandidates, htmlToEvidenceText } from "./technical-evidence-extraction-engine.mjs";

const execFile = promisify(execFileCallback);
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_HTML_BYTES = 12 * 1024 * 1024;
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) throw new Error("Unexpected argument: " + token);
    const key = token.slice(2);
    if (key === "help") { args.help = true; continue; }
    const value = argv[++i];
    if (!value || value.startsWith("--")) throw new Error("Missing value for --" + key);
    args[key] = value;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write([
      "ROBOSCOPIA Evidence Document Acquisition & Verification",
      "This tool never downloads source URLs. A reviewer must lawfully obtain the file and confirm processing permission.",
      'Usage: node scripts/evidence-document-acquisition.mjs --source-id <registry-id> --file "<local.pdf>" --processing-permitted yes --rights-reviewer "<name>" --rights-note "<basis>" --redistribution permitted|not_permitted|unknown --output "<report.json>"',
      "Optional: --model-name <exact-model-name> --configuration-id <configuration> --document-date YYYY-MM-DD",
      ""
    ].join("\n"));
    return;
  }

  const required = ["source-id", "file", "processing-permitted", "rights-reviewer", "rights-note", "redistribution", "output"];
  for (const key of required) if (!args[key]) throw new Error("Required argument missing: --" + key);
  if (args["processing-permitted"] !== "yes") throw new Error("Processing is blocked until a reviewer explicitly confirms lawful processing permission.");
  if (!["permitted", "not_permitted", "unknown"].includes(args.redistribution)) throw new Error("--redistribution must be permitted, not_permitted or unknown.");

  const registry = JSON.parse(await readFile(resolve("data/evidence-document-registry.json"), "utf8"));
  const canonicalDb = JSON.parse(await readFile(resolve("data/robots.json"), "utf8"));
  if (!Array.isArray(canonicalDb.sources)) throw new Error("Canonical Source Registry is missing.");
  const source = registry.sources.find((item) => item.id === args["source-id"]);
  if (!source) throw new Error("Source ID not found in evidence document registry.");
  if (typeof source.canonicalSourceId !== "string" || !source.canonicalSourceId.trim()) throw new Error("Evidence document lacks an explicit canonicalSourceId mapping.");
  const canonicalMatches = canonicalDb.sources.filter((item) => item.id === source.canonicalSourceId);
  if (canonicalMatches.length !== 1) throw new Error("canonicalSourceId must resolve to exactly one Source Registry entry.");
  const canonicalSource = canonicalMatches[0];
  const registeredUrls = new Set([canonicalSource.url, canonicalSource.canonicalUrl].filter(Boolean));
  if (![source.sourcePageUrl, source.downloadUrl].filter(Boolean).some((url) => registeredUrls.has(url))) throw new Error("Evidence document URL does not match its explicitly mapped canonical Source Registry entry.");
  const rights = canonicalSource.rights;
  if (canonicalSource.reviewStatus !== "verified" || canonicalSource.authorityTier !== "manufacturer_primary" ||
      rights?.processingPermitted !== true || typeof rights?.reviewedBy !== "string" || !rights.reviewedBy.trim() ||
      !rights?.reviewedAt || !Number.isFinite(Date.parse(rights.reviewedAt)) ||
      typeof rights?.basis !== "string" || !rights.basis.trim()) {
    throw new Error("Acquisition blocked: canonical Source Registry must contain verified manufacturer authority and explicit, reviewed processing permission. CLI flags cannot grant rights.");
  }
  if (!["pdf", "html"].includes(source.documentType)) throw new Error("Unsupported registered document type.");

  const filePath = resolve(args.file);
  const info = await stat(filePath);
  if (!info.isFile()) throw new Error("Evidence input must be a local regular file.");
  const bytes = await readFile(filePath);
  let extractedText;
  let contentType;
  let mimeSignature;
  if (source.documentType === "pdf") {
    if (info.size < 8 || info.size > MAX_PDF_BYTES) throw new Error("Local PDF must be between 8 bytes and 25 MB.");
    if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("Local file does not have a valid PDF signature.");
    const { stdout } = await execFile("pdftotext", ["-layout", "-enc", "UTF-8", filePath, "-"], {
      timeout: 30000, maxBuffer: 12 * 1024 * 1024, windowsHide: true, encoding: "utf8"
    });
    if (!stdout.trim()) throw new Error("No selectable PDF text found. Scanned-page OCR requires a separate explicit approval and workflow.");
    extractedText = stdout;
    contentType = "application/pdf";
    mimeSignature = "%PDF-";
  } else {
    if (info.size < 1 || info.size > MAX_HTML_BYTES) throw new Error("Local HTML must be between 1 byte and 12 MB.");
    const html = bytes.toString("utf8");
    if (!/<(?:!doctype\s+html|html\b|head\b|body\b|table\b)/i.test(html)) throw new Error("Local file does not contain a recognizable HTML document or table.");
    extractedText = htmlToEvidenceText(html);
    contentType = "text/html";
    mimeSignature = "text/html";
  }

  const digest = sha256(bytes);
  const report = extractEvidenceCandidates({
    text: extractedText,
    documentContentType: contentType,
    documentSha256: digest,
    documentName: filePath.split(/[\\/]/).pop(),
    sourceUrl: canonicalSource.url,
    sourceId: canonicalSource.id,
    modelId: source.modelIds.length === 1 ? source.modelIds[0] : null,
    modelName: args["model-name"] ?? null,
    configurationId: args["configuration-id"] ?? null,
    documentRevision: source.revision ?? null,
    documentDate: args["document-date"] ?? source.documentDate ?? null
  });

  const result = {
    schemaVersion: "1.0.0",
    acquisitionStatus: "locally_processed_after_reviewer_permission",
    source: {
      sourceId: canonicalSource.id,
      evidenceDocumentId: source.id,
      manufacturer: source.manufacturer,
      title: source.title,
      sourcePageUrl: source.sourcePageUrl,
      downloadUrl: source.downloadUrl,
      registryRevision: source.revision ?? null,
      registryExpectedLocator: source.expectedLocator ?? null
    },
    localDocument: {
      fileName: filePath.split(/[\\/]/).pop(),
      byteSize: bytes.length,
      sha256: digest,
      mimeSignature,
      contentType,
      pageCount: report.counts.pages
    },
    rightsReview: {
      processingPermitted: true,
      reviewer: rights.reviewedBy,
      note: rights.basis,
      redistribution: rights.redistributionPermitted ?? "unknown",
      reviewedAt: rights.reviewedAt
    },
    extraction: report,
    verification: {
      factualVerification: "not_performed",
      exactSourceLocatorReview: "required",
      humanApproval: "required",
      catalogMutation: false,
      originalPdfCopiedToRepository: false
    }
  };

  const outputPath = resolve(args.output);
  await writeFile(outputPath, JSON.stringify(result, null, 2) + "\n", { encoding: "utf8", flag: "wx" });
  process.stdout.write("Evidence document processed. SHA-256: " + digest + "\n");
  process.stdout.write("Extraction candidates: " + report.counts.candidates + "; page count: " + report.counts.pages + "\n");
  process.stdout.write("Report: " + outputPath + "\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write("Evidence document acquisition failed: " + error.message + "\n");
    process.exitCode = 2;
  });
}
