import { createHash } from "node:crypto";
import { readFile, stat, realpath, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFile = promisify(execFileCallback);
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_TEXT_BYTES = 12 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 10 * 1024 * 1024;
const PDF_TIMEOUT_MS = 30_000;

const PATTERNS = [
  { id: "mass", label: "Mass / weight", regex: /\b(?:robot\s+)?(?:mass|weight)(?:\s+with\s+battery)?\s*[:=–-]?\s*(\d+(?:[.,]\d+)?)\s*(kg|g|lb|lbs)\b/i },
  { id: "payload", label: "Payload", regex: /\b(?:maximum|max\.?|rated)?\s*payload\s*[:=–-]?\s*(\d+(?:[.,]\d+)?)\s*(kg|g|lb|lbs)\b/i },
  { id: "speed", label: "Speed", regex: /\b(?:maximum|max\.?|top)?\s*speed\s*[:=–-]?\s*(\d+(?:[.,]\d+)?)\s*(m\/s|km\/h|mm\/s|mph)\b/i },
  { id: "runtime", label: "Runtime", regex: /\b(?:typical\s+)?(?:runtime|run\s*time|operating\s*time|battery\s+life)\s*[:=–-]?\s*(\d+(?:[.,]\d+)?)\s*(min(?:utes?)?|h(?:ours?)?)\b/i },
  { id: "battery_capacity", label: "Battery capacity / energy", regex: /\b(?:battery\s+)?(?:capacity|energy)\s*[:=–-]?\s*(\d+(?:[.,]\d+)?)\s*(Wh|kWh|Ah|mAh)\b/i },
  { id: "reach", label: "Reach", regex: /\b(?:working\s+)?reach\s*[:=–-]?\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|m|in|inch(?:es)?)\b/i },
  { id: "repeatability", label: "Repeatability", regex: /\brepeatability\s*[:=–-]?\s*(?:±|\+\/-)?\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|in)\b/i },
  { id: "degrees_of_freedom", label: "Degrees of freedom", regex: /\b(?:degrees?\s+of\s+freedom|DOF)\s*[:=–-]?\s*(\d+)\s*(?:axes?)?\b/i },
  { id: "ingress_protection", label: "Ingress protection", regex: /\b(?:ingress\s+protection|IP\s+rating|IP)\s*[:=–-]?\s*(IP\s*\d{2}[A-K]?)\b/i },
  { id: "power", label: "Power", regex: /\b(?:rated\s+)?power(?:\s+consumption)?\s*[:=–-]?\s*(\d+(?:[.,]\d+)?)\s*(W|kW)\b/i },
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const normalizeSpace = (value) => value.replace(/\s+/g, " ").trim();

function parseEngineeringNumber(raw) {
  if (raw.includes(",") && !raw.includes(".")) {
    const [whole, fraction] = raw.split(",");
    if (fraction.length === 3 && whole.length <= 3) return Number(whole + fraction);
    return Number(`${whole}.${fraction}`);
  }
  return Number(raw.replaceAll(",", ""));
}

function parseHttpsSource(raw) {
  if (!raw) return { value: null, issue: null };
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".")) {
      return { value: null, issue: "SOURCE_URL_MUST_BE_PUBLIC_HTTPS" };
    }
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
        /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) {
      return { value: null, issue: "SOURCE_URL_MUST_BE_PUBLIC_HTTPS" };
    }
    return { value: url.href, issue: null };
  } catch {
    return { value: null, issue: "SOURCE_URL_INVALID" };
  }
}

function extractPages(text) {
  return text.split("\f").map((pageText, index) => ({
    page: index + 1,
    text: pageText,
  }));
}

function findSection(lines, currentIndex) {
  for (let i = currentIndex - 1; i >= Math.max(0, currentIndex - 5); i--) {
    const candidate = normalizeSpace(lines[i]);
    if (!candidate || candidate.length > 100) continue;
    if (/^[-=_\s\d.]+$/.test(candidate)) continue;
    if (candidate.length < 90 && !/[.!?]$/.test(candidate)) return candidate;
  }
  return null;
}

export function extractEvidenceCandidates({
  text,
  documentSha256,
  documentName,
  sourceUrl = null,
  modelId = null,
  modelName = null,
  configurationId = null,
  documentRevision = null,
  documentDate = null,
}) {
  if (typeof text !== "string" || !text.trim()) throw new Error("Extracted document text is empty.");
  if (text.length > MAX_EXTRACTED_CHARS) throw new Error("Extracted text exceeds the configured size limit.");
  const source = parseHttpsSource(sourceUrl);
  const pages = extractPages(text);
  const allText = text.toLocaleLowerCase();
  const modelMatch = modelName ? allText.includes(modelName.toLocaleLowerCase()) : null;
  const configurationMatch = configurationId ? allText.includes(configurationId.toLocaleLowerCase()) : null;
  const candidates = [];

  for (const page of pages) {
    const lines = page.text.split(/\r?\n/);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const rawLine = lines[lineIndex];
      const line = normalizeSpace(rawLine);
      if (!line) continue;
      for (const pattern of PATTERNS) {
        const match = line.match(pattern.regex);
        if (!match) continue;
        const matchedText = normalizeSpace(match[0]);
        const value = parseEngineeringNumber(match[1]);
        const unit = pattern.id === "ingress_protection" ? "" : (match[2] ?? "");
        const candidateMaterial = [
          documentSha256 ?? sha256(text),
          page.page,
          lineIndex + 1,
          pattern.id,
          matchedText,
        ].join("|");
        candidates.push({
          candidateId: sha256(candidateMaterial).slice(0, 24),
          candidateType: "technical_specification",
          field: pattern.id,
          fieldLabel: pattern.label,
          extractedValue: pattern.id === "ingress_protection" ? match[1].replace(/\s+/g, "").toUpperCase() : value,
          unit,
          exactMatch: matchedText,
          evidenceQuote: line.slice(0, 500),
          evidenceLocator: { page: page.page, line: lineIndex + 1, section: findSection(lines, lineIndex) },
          documentSha256: documentSha256 ?? sha256(text),
          documentName: documentName ?? null,
          sourceUrl: source.value,
          sourceUrlIssue: source.issue,
          modelId,
          modelName: modelName ?? null,
          modelMentionStatus: modelMatch === null ? "not_checked" : modelMatch ? "mention_found" : "not_found",
          configurationId,
          configurationMentionStatus: configurationMatch === null ? "not_checked" : configurationMatch ? "mention_found" : "not_found",
          documentRevision,
          documentDate,
          extractionMethod: "label_value_line_pattern",
          reviewStatus: "extracted_unverified",
          factualVerification: "not_performed",
        });
      }
    }
  }

  return {
    extractionVersion: "1.0.0",
    document: {
      name: documentName ?? null,
      sha256: documentSha256 ?? sha256(text),
      sourceUrl: source.value,
      sourceUrlIssue: source.issue,
      revision: documentRevision,
      documentDate,
      pageCount: pages.length,
    },
    context: {
      modelId,
      modelName,
      modelMentionStatus: modelMatch === null ? "not_checked" : modelMatch ? "mention_found" : "not_found",
      configurationId,
      configurationMentionStatus: configurationMatch === null ? "not_checked" : configurationMatch ? "mention_found" : "not_found",
    },
    policy: {
      pdfDownloaded: false,
      sourcePageFetched: false,
      catalogMutated: false,
      factualVerificationPerformed: false,
      automaticApproval: false,
      scannedPageOcr: false,
    },
    counts: {
      pages: pages.length,
      candidates: candidates.length,
      candidateFields: [...new Set(candidates.map((candidate) => candidate.field))],
    },
    candidates,
  };
}

async function readLocalPdf(pdfPath) {
  const absolutePath = resolve(pdfPath);
  const details = await stat(absolutePath);
  if (!details.isFile()) throw new Error("PDF input must be a local regular file.");
  if (details.size < 8 || details.size > MAX_PDF_BYTES) {
    throw new Error(`PDF file size must be between 8 bytes and ${MAX_PDF_BYTES} bytes.`);
  }
  const actualPath = await realpath(absolutePath);
  const header = await readFile(actualPath, { encoding: null, flag: "r" }).then((buffer) => buffer.subarray(0, 5).toString("ascii"));
  if (header !== "%PDF-") throw new Error("Input does not have a valid PDF file signature.");
  return { actualPath, size: details.size, name: absolutePath.split(/[\\/]/).pop() };
}

async function extractPdfText(actualPath) {
  try {
    const { stdout } = await execFile("pdftotext", ["-layout", "-enc", "UTF-8", actualPath, "-"], {
      timeout: PDF_TIMEOUT_MS,
      maxBuffer: MAX_TEXT_BYTES,
      windowsHide: true,
      encoding: "utf8",
    });
    if (stdout.length > MAX_EXTRACTED_CHARS) throw new Error("Extracted text exceeds the configured size limit.");
    if (!stdout.trim()) throw new Error("No selectable text was extracted. The PDF may be scanned and require a separately approved OCR workflow.");
    return stdout;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("pdftotext was not found. Install Poppler utilities and ensure pdftotext is on PATH.");
    }
    if (error.killed || error.code === "ETIMEDOUT") throw new Error("PDF extraction exceeded the 30-second time limit.");
    throw new Error(`PDF text extraction failed: ${error.stderr?.toString?.().trim() || error.message}`);
  }
}

function readArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item.startsWith("--")) throw new Error(`Unexpected argument: ${item}`);
    const key = item.slice(2);
    if (key === "help" || key === "json") {
      args[key] = true;
      continue;
    }
    const value = argv[++i];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    args[key] = value;
  }
  return args;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write([
      "ROBOSCOPIA Technical Evidence Extraction Engine",
      "Usage:",
      '  node scripts/technical-evidence-extraction-engine.mjs --pdf "<local.pdf>" [--model-id spot] [--model-name Spot] [--configuration-id production] [--source-url https://manufacturer.example/manual.pdf] [--revision "Rev B"] [--document-date 2026-01-01] [--output evidence.json]',
      '  node scripts/technical-evidence-extraction-engine.mjs --text "<local-extracted.txt>" [same metadata options]',
      "PDF extraction requires the local pdftotext executable (Poppler). No URLs are downloaded.",
      "",
    ].join("\n"));
    return;
  }
  if (Boolean(args.pdf) === Boolean(args.text)) throw new Error("Provide exactly one of --pdf or --text.");
  let text;
  let documentName;
  let documentSha256;
  if (args.pdf) {
    const file = await readLocalPdf(args.pdf);
    text = await extractPdfText(file.actualPath);
    documentName = file.name;
    documentSha256 = sha256(await readFile(file.actualPath));
  } else {
    const path = resolve(args.text);
    const details = await stat(path);
    if (!details.isFile() || details.size > MAX_TEXT_BYTES) throw new Error("Text input must be a regular file under 12 MB.");
    const bytes = await readFile(path);
    text = bytes.toString("utf8");
    documentName = path.split(/[\\/]/).pop();
    documentSha256 = sha256(bytes);
  }
  const report = extractEvidenceCandidates({
    text,
    documentSha256,
    documentName,
    sourceUrl: args["source-url"] ?? null,
    modelId: args["model-id"] ?? null,
    modelName: args["model-name"] ?? null,
    configurationId: args["configuration-id"] ?? null,
    documentRevision: args.revision ?? null,
    documentDate: args["document-date"] ?? null,
  });
  const output = `${JSON.stringify(report, null, 2)}\n`;
  if (args.output) {
    const outputPath = resolve(args.output);
    await writeFile(outputPath, output, { encoding: "utf8", flag: "wx" });
    process.stdout.write(`Evidence report created: ${outputPath}\n`);
  } else {
    process.stdout.write(output);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Technical evidence extraction failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
