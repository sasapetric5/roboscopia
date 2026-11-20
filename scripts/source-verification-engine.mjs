import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_DATA = resolve("data/robots.json");
const DEFAULT_DECISIONS = resolve("data/source-verification-decisions.json");
const OUTCOMES = new Set(["supported", "partially_supported", "contradicted", "not_applicable"]);
const OFFICIAL_DOMAINS = new Set([
  "bostondynamics.com",
  "unitree.com",
  "universal-robots.com",
  "abb.com",
  "kuka.com",
]);

const normalizeHost = (hostname) => hostname.toLowerCase().replace(/^www\./, "");
const sha = (value) => createHash("sha256").update(value).digest("hex").slice(0, 24);

function safeHttpsUrl(raw) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return { ok: false, reason: "HTTPS_REQUIRED" };
    if (url.username || url.password) return { ok: false, reason: "URL_CREDENTIALS_NOT_ALLOWED" };
    const host = normalizeHost(url.hostname);
    if (!host || host === "localhost" || host.endsWith(".localhost") ||
        host.endsWith(".local") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
        host.startsWith("[") || !host.includes(".")) {
      return { ok: false, reason: "NON_PUBLIC_OR_INVALID_HOST" };
    }
    return { ok: true, url, host };
  } catch {
    return { ok: false, reason: "INVALID_URL" };
  }
}

function isOfficialDomainCandidate(host) {
  return [...OFFICIAL_DOMAINS].some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function fingerprintClaim(record, spec) {
  const material = [
    record.id,
    spec.name,
    String(spec.value),
    spec.unit ?? "",
    spec.provenance?.configurationId ?? "model-level",
    spec.sourceId ?? spec.provenance?.sourceId ?? "",
  ].join("|");
  return sha(material);
}

function validDecision(decision, knownClaims) {
  if (!decision || typeof decision !== "object") return false;
  if (!knownClaims.has(decision.claimId)) return false;
  if (typeof decision.sourceId !== "string" || !decision.sourceId) return false;
  if (!OUTCOMES.has(decision.outcome)) return false;
  if (typeof decision.evidenceLocator !== "string" || !decision.evidenceLocator.trim()) return false;
  if (typeof decision.note !== "string" || !decision.note.trim()) return false;
  if (typeof decision.reviewer !== "string" || !decision.reviewer.trim()) return false;
  if (typeof decision.reviewedAt !== "string" || !Number.isFinite(Date.parse(decision.reviewedAt))) return false;
  return true;
}

export function buildSourceVerificationReport(db, decisions = []) {
  const sourceById = new Map((db.sources ?? []).map((source) => [source.id, source]));
  const claims = [];
  for (const record of db.records ?? []) {
    for (const spec of record.specifications ?? []) {
      const sourceId = spec.sourceId ?? spec.provenance?.sourceId ?? null;
      const source = sourceId ? sourceById.get(sourceId) : null;
      const claimId = fingerprintClaim(record, spec);
      claims.push({
        claimId,
        modelId: record.id,
        model: record.model ?? record.name ?? record.id,
        specification: spec.name,
        value: spec.value,
        unit: spec.unit ?? null,
        configurationId: spec.provenance?.configurationId ?? null,
        sourceId,
        sourceFound: Boolean(source),
        sourceUrl: source?.url ?? null,
        verificationStatus: spec.provenance?.verificationStatus ?? "missing_provenance",
        outcome: "pending",
        evidenceLocator: null,
        reviewerNote: null,
        reviewedBy: null,
        reviewedAt: null,
      });
    }
  }

  const knownClaims = new Set(claims.map((claim) => claim.claimId));
  const validDecisions = decisions.filter((decision) => validDecision(decision, knownClaims));
  const decisionByClaim = new Map(validDecisions.map((decision) => [decision.claimId, decision]));
  for (const claim of claims) {
    const decision = decisionByClaim.get(claim.claimId);
    if (decision && decision.sourceId === claim.sourceId) {
      claim.outcome = decision.outcome;
      claim.evidenceLocator = decision.evidenceLocator;
      claim.reviewerNote = decision.note;
      claim.reviewedBy = decision.reviewer;
      claim.reviewedAt = decision.reviewedAt;
    }
  }

  const sourceReports = (db.sources ?? []).map((source) => {
    const parsed = safeHttpsUrl(source.url);
    const host = parsed.ok ? parsed.host : null;
    const linkedClaims = claims.filter((claim) => claim.sourceId === source.id);
    const reviewedClaims = linkedClaims.filter((claim) => claim.outcome !== "pending");
    const supportedClaims = linkedClaims.filter((claim) => claim.outcome === "supported");
    return {
      sourceId: source.id,
      label: source.label ?? null,
      url: source.url ?? null,
      host,
      urlSyntax: parsed.ok ? "valid_https" : "invalid",
      urlIssue: parsed.ok ? null : parsed.reason,
      domainMatch: Boolean(host && source.domain && source.domain !== "unknown" &&
        normalizeHost(source.domain) === host),
      officialDomainCandidate: Boolean(host && isOfficialDomainCandidate(host)),
      authorityAssessment: host && isOfficialDomainCandidate(host)
        ? "manufacturer_domain_candidate_unreviewed"
        : "not_established",
      sourceReviewStatus: source.reviewStatus ?? "missing",
      claimsCount: linkedClaims.length,
      reviewedClaims: reviewedClaims.length,
      supportedClaims: supportedClaims.length,
      claimsPending: linkedClaims.length - reviewedClaims.length,
    };
  });

  const counts = {
    sources: sourceReports.length,
    claims: claims.length,
    claimsPending: claims.filter((claim) => claim.outcome === "pending").length,
    supported: claims.filter((claim) => claim.outcome === "supported").length,
    partiallySupported: claims.filter((claim) => claim.outcome === "partially_supported").length,
    contradicted: claims.filter((claim) => claim.outcome === "contradicted").length,
    notApplicable: claims.filter((claim) => claim.outcome === "not_applicable").length,
    invalidSourceUrls: sourceReports.filter((source) => source.urlSyntax === "invalid").length,
    officialDomainCandidates: sourceReports.filter((source) => source.officialDomainCandidate).length,
  };

  return {
    engineVersion: "1.0.0",
    schemaVersion: db.schemaVersion ?? null,
    generatedAt: new Date().toISOString(),
    policy: {
      urlChecksAreSyntaxOnly: true,
      officialDomainIsNotClaimVerification: true,
      sourcePageContentFetched: false,
      catalogMutated: false,
      autoApproval: false,
    },
    counts,
    sources: sourceReports,
    claims,
    ignoredDecisionCount: decisions.length - validDecisions.length,
  };
}

export async function checkUrlHead(rawUrl, timeoutMs = 7000) {
  const parsed = safeHttpsUrl(rawUrl);
  if (!parsed.ok) return { status: "not_checked", reason: parsed.reason };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(parsed.url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "ROBOSCOPIA-SourceVerifier/1.0 (+https://roboscopia.com)" },
    });
    if (response.status >= 300 && response.status < 400) {
      return {
        status: "redirect",
        httpStatus: response.status,
        location: response.headers.get("location"),
        finalUrl: null,
      };
    }
    return {
      status: response.ok ? "reachable_head" : "http_error",
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      finalUrl: parsed.url.href,
    };
  } catch (error) {
    return {
      status: "request_failed",
      reason: error.name === "AbortError" ? "TIMEOUT" : "NETWORK_OR_TLS_ERROR",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const checkUrls = args.includes("--check-urls");
  const dbPath = resolve(args.find((arg) => !arg.startsWith("--")) || DEFAULT_DATA);
  const db = JSON.parse(await readFile(dbPath, "utf8"));
  let decisions = [];
  try {
    const parsed = JSON.parse(await readFile(DEFAULT_DECISIONS, "utf8"));
    decisions = Array.isArray(parsed.decisions) ? parsed.decisions : [];
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const report = buildSourceVerificationReport(db, decisions);
  if (checkUrls) {
    for (const source of report.sources) {
      source.liveCheck = await checkUrlHead(source.url);
    }
    report.policy.urlChecksAreSyntaxOnly = false;
    report.policy.liveCheckMethod = "HTTP HEAD only; no page content fetched; redirects are not followed";
  }
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write([
      `ROBOSCOPIA Source Verification Engine v${report.engineVersion}`,
      `Sources: ${report.counts.sources} | Claims: ${report.counts.claims}`,
      `Pending: ${report.counts.claimsPending} | Supported: ${report.counts.supported} | Partial: ${report.counts.partiallySupported} | Contradicted: ${report.counts.contradicted}`,
      `Official-domain candidates (not yet content-verified): ${report.counts.officialDomainCandidates}`,
      `Invalid source URLs: ${report.counts.invalidSourceUrls}`,
      "",
      ...report.sources.map((source) =>
        `[${source.urlSyntax}] ${source.sourceId} — ${source.host ?? "unknown host"} — ${source.claimsCount} claims — ${source.authorityAssessment}`
      ),
    ].join("\n") + "\n");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Source verification failed: ${error.message}\n`);
    process.exitCode = 2;
  });
}
