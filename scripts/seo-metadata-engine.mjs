import { createHash } from "node:crypto";

const DEFAULT_SITE_NAME = "ROBOSCOPIA";
const SAFE_ID = /^[a-z0-9][a-z0-9._-]{0,99}$/i;

function cleanText(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}
function safeHttps(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}
function slugify(value) {
  return cleanText(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}
function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter(item => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}
function pageUrl(baseUrl, id) {
  const base = safeHttps(baseUrl);
  if (!base) throw new TypeError("baseUrl must be a valid HTTPS site origin or URL");
  const url = new URL(base);
  return new URL("robot-profile.html?id=" + encodeURIComponent(id), url.origin + (url.pathname.endsWith("/") ? url.pathname : url.pathname + "/")).href;
}

/**
 * Deterministic metadata and link generation for the current ROBOSCOPIA catalog.
 * It never invents specifications, sources, rights, image descriptions or video facts.
 * The function is read-only and does not publish or mutate catalog records.
 */
export function buildRobotPageSEO({ db, recordId, baseUrl, language = "en", siteName = DEFAULT_SITE_NAME }) {
  if (!db || typeof db !== "object" || !Array.isArray(db.records)) throw new TypeError("db.records must be an array");
  if (typeof recordId !== "string" || !SAFE_ID.test(recordId)) throw new TypeError("recordId must be a valid catalog ID");
  if (!["en", "sr"].includes(language)) throw new TypeError("language must be en or sr");
  const record = db.records.find(item => item?.id === recordId);
  if (!record) throw new Error("recordId does not exist in the catalog");
  const model = cleanText(record.model);
  const manufacturer = cleanText(record.manufacturer);
  if (!model || !manufacturer) throw new Error("record requires model and manufacturer");
  const summary = cleanText(language === "sr" ? record.summarySr : record.summary) || cleanText(record.summary) || cleanText(record.summarySr);
  const title = `${model} — ${manufacturer} | ${siteName}`;
  const description = summary ? summary.slice(0, 300) : `${manufacturer} ${model} robotics profile and technical information.`;
  const canonicalUrl = pageUrl(baseUrl, record.id);
  const slug = slugify(`${manufacturer}-${model}`) || slugify(record.id);
  const category = cleanText(record.category);
  const profileLinks = db.records.filter(other => other?.id !== record.id && (
    (manufacturer && cleanText(other.manufacturer) === manufacturer) ||
    (category && cleanText(other.category) === category) ||
    (cleanText(record.family) && cleanText(other.family) === cleanText(record.family))
  )).map(other => ({
    id: other.id,
    label: [cleanText(other.manufacturer), cleanText(other.model)].filter(Boolean).join(" "),
    href: pageUrl(baseUrl, other.id),
    relation: cleanText(other.manufacturer) === manufacturer ? "same_manufacturer" :
      cleanText(other.family) && cleanText(other.family) === cleanText(record.family) ? "same_family" : "same_category"
  })).filter(item => item.label);
  const internalLinks = uniqueBy(profileLinks, item => item.id).slice(0, 12);

  const sourceCandidates = [];
  for (const source of Array.isArray(record.sources) ? record.sources : []) {
    const url = safeHttps(source?.url);
    if (url) sourceCandidates.push({ label: cleanText(source.label) || new URL(url).hostname, url, kind: "record_source" });
  }
  for (const spec of Array.isArray(record.specifications) ? record.specifications : []) {
    const url = safeHttps(spec?.source);
    if (url) sourceCandidates.push({ label: cleanText(spec.name) ? `${cleanText(spec.name)} — source` : new URL(url).hostname, url, kind: "specification_source" });
  }
  const externalSources = uniqueBy(sourceCandidates, item => item.url);

  const approvedPhotos = (Array.isArray(record.media) ? record.media : []).filter(media =>
    media?.rightsStatus === "approved" &&
    media?.rightsEvidence && cleanText(media.rightsEvidence.reference) &&
    cleanText(media.rightsEvidence.reviewedAt) && cleanText(media.rightsEvidence.reviewer) &&
    cleanText(media.rightsEvidence.basis) && safeHttps(media.url)
  ).map(media => ({
    id: cleanText(media.id) || null,
    url: safeHttps(media.url),
    alt: cleanText(media.alt),
    caption: cleanText(media.caption || media.note),
    sourceUrl: safeHttps(media.sourceUrl),
    altTextRequired: !cleanText(media.alt)
  }));
  const approvedVideos = (Array.isArray(record.videos) ? record.videos : []).filter(video =>
    video?.rightsStatus === "approved" &&
    video?.rightsEvidence && cleanText(video.rightsEvidence.reference) &&
    cleanText(video.rightsEvidence.reviewedAt) && cleanText(video.rightsEvidence.reviewer) &&
    cleanText(video.rightsEvidence.basis) && safeHttps(video.url)
  ).map(video => ({
    id: cleanText(video.id) || null,
    url: safeHttps(video.url),
    title: cleanText(video.title),
    description: cleanText(video.description),
    thumbnailUrl: safeHttps(video.thumbnailUrl),
    duration: cleanText(video.duration),
    captionsUrl: safeHttps(video.captionsUrl),
    metadataComplete: Boolean(cleanText(video.title) && cleanText(video.description) && safeHttps(video.thumbnailUrl))
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: language,
    about: {
      "@type": "Thing",
      identifier: record.id,
      name: model,
      description: summary || undefined
    },
    isPartOf: { "@type": "WebSite", name: siteName, url: new URL(baseUrl).origin },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: siteName, item: new URL(baseUrl).origin },
        { "@type": "ListItem", position: 2, name: "Knowledge Base", item: new URL("knowledge-base.html", new URL(baseUrl).origin + "/").href },
        { "@type": "ListItem", position: 3, name: model, item: canonicalUrl }
      ]
    }
  };

  const warnings = [];
  if (!summary) warnings.push("MISSING_SUMMARY");
  if (!externalSources.length) warnings.push("NO_VALID_EXTERNAL_SOURCES");
  if (!internalLinks.length) warnings.push("NO_RELATED_INTERNAL_LINKS");
  if (approvedPhotos.some(photo => photo.altTextRequired)) warnings.push("APPROVED_IMAGE_ALT_TEXT_MISSING");
  if (approvedVideos.some(video => !video.metadataComplete)) warnings.push("APPROVED_VIDEO_METADATA_INCOMPLETE");
  if (approvedPhotos.length === 0 && (record.media || []).length) warnings.push("NO_RIGHTS_CLEARED_IMAGES");
  if (approvedVideos.length === 0 && (record.videos || []).length) warnings.push("NO_RIGHTS_CLEARED_VIDEOS");

  const fingerprint = createHash("sha256").update(JSON.stringify({
    recordId, language, title, description, canonicalUrl, internalLinks, externalSources, approvedPhotos, approvedVideos
  })).digest("hex");
  return {
    engineVersion: "1.0.0",
    recordId,
    language,
    slug,
    title,
    metaDescription: description,
    canonicalUrl,
    robots: "index,follow",
    openGraph: { type: "website", title, description, url: canonicalUrl, siteName },
    jsonLd,
    internalLinks,
    externalSources,
    media: { images: approvedPhotos, videos: approvedVideos },
    warnings,
    readiness: warnings.length ? "needs_optimization" : "metadata_ready",
    fingerprint,
    catalogMutationAllowed: false
  };
}
