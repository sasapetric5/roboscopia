import { createHash } from "node:crypto";
import { evaluatePublicationReadiness } from "./publication-readiness-engine.mjs";

const ISSUE_SEVERITIES = new Set(["error", "warning", "notice", "good"]);
const SAFE_PAGE_HOSTS = new Set(["roboscopia.com", "www.roboscopia.com"]);

function safePageUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !SAFE_PAGE_HOSTS.has(url.hostname) || url.username || url.password) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function normalizeIssue(issue, index) {
  if (!issue || typeof issue !== "object" || Array.isArray(issue)) {
    throw new TypeError(`issues[${index}] must be an object`);
  }
  const url = safePageUrl(issue.url);
  const rule = typeof issue.rule === "string" ? issue.rule.trim().toLowerCase() : "";
  const severity = typeof issue.severity === "string" ? issue.severity.toLowerCase() : "";
  if (!url || !rule || !ISSUE_SEVERITIES.has(severity)) {
    throw new TypeError(`issues[${index}] has an invalid URL, rule or severity`);
  }
  return {
    url,
    rule,
    severity,
    category: typeof issue.category === "string" ? issue.category.toLowerCase() : "unknown",
    title: typeof issue.title === "string" ? issue.title.slice(0, 240) : rule,
    detail: typeof issue.detail === "string" ? issue.detail.slice(0, 1000) : ""
  };
}

function statusForIssues(issues, reasonPrefix) {
  const actionable = issues.filter(issue => issue.severity !== "good");
  if (!actionable.length) return { status: "passed", reasonCodes: [] };
  if (actionable.some(issue => issue.severity === "error")) {
    return { status: "failed", reasonCodes: [reasonPrefix + "_ERROR_FINDING"] };
  }
  return { status: "needs_verification", reasonCodes: [reasonPrefix + "_FINDING_REQUIRES_REVIEW"] };
}

function classifyIssue(issue) {
  const key = issue.rule + " " + issue.category;
  if (/broken-link|internal-link|orphan|dead-end|link-anchor|link-graph/.test(key)) return "internal_links";
  if (/external-link|external-source|outbound-link/.test(key)) return "external_sources";
  if (/duplicate|canonical-conflict|duplicate-title|duplicate-description/.test(key)) return "duplicates";
  if (/title|meta|heading|h1|h2|canonical|robots|sitemap|schema|structured|geo|answer|semantic|image|video|alt|accessibility|a11y|redirect|status|response|index|hreflang|open-graph|twitter/.test(key)) return "seo";
  return "unknown";
}

/**
 * Converts a pinned Crawlie JSON report into conservative ROBOSCOPIA page gate inputs.
 * Crawlie can report crawl/SEO signals; it cannot verify factual claims, source provenance,
 * media permissions, security policy or content freshness.
 */
export function normalizeCrawlieReport(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) throw new TypeError("report must be an object");
  if (!report.config || !safePageUrl(report.config.url)) throw new TypeError("report.config.url must be an approved ROBOSCOPIA HTTPS URL");
  if (!Array.isArray(report.pages) || !Array.isArray(report.issues)) {
    throw new TypeError("report must contain pages and issues arrays");
  }
  const pages = report.pages.map((page, index) => {
    const url = safePageUrl(page?.url);
    if (!url) throw new TypeError(`pages[${index}].url must be an approved ROBOSCOPIA HTTPS URL`);
    return { url, status: Number.isInteger(page.status) ? page.status : null, indexable: page.indexable === true };
  });
  const issues = report.issues.map(normalizeIssue);
  const byUrl = new Map(pages.map(page => [page.url, []]));
  for (const issue of issues) {
    if (!byUrl.has(issue.url)) byUrl.set(issue.url, []);
    byUrl.get(issue.url).push(issue);
  }

  const pageReports = pages.map(page => {
    const findings = byUrl.get(page.url) || [];
    const groups = {
      seo: findings.filter(issue => classifyIssue(issue) === "seo" || classifyIssue(issue) === "unknown"),
      internal_links: findings.filter(issue => classifyIssue(issue) === "internal_links"),
      external_sources: findings.filter(issue => classifyIssue(issue) === "external_sources"),
      duplicates: findings.filter(issue => classifyIssue(issue) === "duplicates")
    };
    const gates = {
      seo: statusForIssues(groups.seo, "CRAWL_SEO"),
      internal_links: statusForIssues(groups.internal_links, "CRAWL_INTERNAL_LINKS"),
      external_sources: statusForIssues(groups.external_sources, "CRAWL_EXTERNAL_SOURCES"),
      duplicates: statusForIssues(groups.duplicates, "CRAWL_DUPLICATES"),
      facts: { status: "needs_verification", reasonCodes: ["CRAWLER_CANNOT_VERIFY_FACTS"] },
      provenance: { status: "needs_verification", reasonCodes: ["CRAWLER_CANNOT_VERIFY_PROVENANCE"] },
      media_rights: { status: "needs_verification", reasonCodes: ["CRAWLER_CANNOT_VERIFY_MEDIA_RIGHTS"] },
      security: { status: "needs_verification", reasonCodes: ["INDEPENDENT_SECURITY_GATE_REQUIRED"] },
      freshness: { status: "needs_verification", reasonCodes: ["CONTENT_FRESHNESS_REVIEW_REQUIRED"] },
      content: { status: "needs_verification", reasonCodes: ["CONTENT_QUALITY_REVIEW_REQUIRED"] }
    };
    if (page.status !== 200) {
      gates.seo = { status: "failed", reasonCodes: ["CRAWL_PAGE_HTTP_STATUS_NOT_200"] };
    }
    return { pageId: page.url, url: page.url, gates, findings };
  });

  return {
    schemaVersion: "1.0.0",
    source: "crawlie",
    sourceReportUrl: safePageUrl(report.config.url),
    summary: report.summary && typeof report.summary === "object" ? {
      totalPages: Number.isInteger(report.summary.total_pages) ? report.summary.total_pages : pages.length,
      errors: Number.isInteger(report.summary.errors) ? report.summary.errors : null,
      warnings: Number.isInteger(report.summary.warnings) ? report.summary.warnings : null,
      healthScore: Number.isInteger(report.summary.health_score) ? report.summary.health_score : null,
      geoScore: Number.isInteger(report.summary.geo_score) ? report.summary.geo_score : null
    } : { totalPages: pages.length, errors: null, warnings: null, healthScore: null, geoScore: null },
    pages: pageReports,
    issueCount: issues.length,
    catalogMutationAllowed: false,
    publicationActionPerformed: false
  };
}

/** Evaluate one normalized page using the existing ten-gate publication policy. */
function stablePageId(url) {
  return "page-" + createHash("sha256").update(url).digest("hex").slice(0, 32);
}

export function evaluateCrawliePageReadiness(pageReport, supplementalGates = {}) {
  if (!pageReport || typeof pageReport !== "object" || !pageReport.gates) {
    throw new TypeError("pageReport must be a normalized Crawlie page report");
  }
  return evaluatePublicationReadiness({
    pageId: stablePageId(pageReport.url),
    gates: { ...pageReport.gates, ...supplementalGates }
  });
}

/**
 * Creates deterministic repair proposals from verified canonical fields only.
 * This stage is intentionally proposal-only: no HTML, catalog, media or publication writes.
 */
export function createSafeRepairPlan({ issue, canonicalRecord }) {
  if (!issue || typeof issue !== "object" || !canonicalRecord || typeof canonicalRecord !== "object") {
    throw new TypeError("issue and canonicalRecord are required");
  }
  const rule = String(issue.rule || "").toLowerCase();
  const model = typeof canonicalRecord.model === "string" ? canonicalRecord.model.trim() : "";
  const manufacturer = typeof canonicalRecord.manufacturer === "string" ? canonicalRecord.manufacturer.trim() : "";
  const summary = typeof canonicalRecord.summary === "string" ? canonicalRecord.summary.trim() : "";
  const proposals = [];

  if (rule === "title-missing" && model && manufacturer) {
    proposals.push({
      field: "title",
      value: `${model} — ${manufacturer} | ROBOSCOPIA`,
      basis: "canonical_record.model + canonical_record.manufacturer",
      deterministic: true
    });
  } else if ((rule === "meta-description-missing" || rule === "description-missing") && summary) {
    proposals.push({
      field: "metaDescription",
      value: summary.slice(0, 300),
      basis: "canonical_record.summary",
      deterministic: true
    });
  } else if (rule === "h1-missing" && model) {
    proposals.push({
      field: "h1",
      value: model,
      basis: "canonical_record.model",
      deterministic: true
    });
  }

  return {
    schemaVersion: "1.0.0",
    issueRule: rule || "unknown",
    recordId: typeof canonicalRecord.id === "string" ? canonicalRecord.id : null,
    executionMode: "proposal_only",
    proposals,
    requiresPostRepairCrawl: proposals.length > 0,
    requiresPublicationReadinessRecheck: proposals.length > 0,
    catalogMutationAllowed: false,
    publicationActionPerformed: false,
    reason: proposals.length ? "Only canonical, existing fields were used; an implementation-specific writer and post-change verification are still required."
      : "No deterministic repair can be derived from the supplied canonical fields; manual research or review is required."
  };
}
