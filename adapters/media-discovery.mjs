/**
 * Roboscopia media discovery adapters.
 * Discovery only: no media downloads, rights grants, or automatic approvals.
 */
const OPENVERSE_ENDPOINT = "https://api.openverse.org/v1/images/";
const COMMONS_ENDPOINT = "https://commons.wikimedia.org/w/api.php";
const MAX_QUERY_LENGTH = 200;
const MAX_PAGE_SIZE = 20;

function validateQuery(query) {
  if (typeof query !== "string") throw new TypeError("query must be a string");
  const value = query.trim();
  if (!value || value.length > MAX_QUERY_LENGTH) {
    throw new RangeError("query must contain 1-" + MAX_QUERY_LENGTH + " characters");
  }
  return value;
}

function validatePageSize(pageSize) {
  const value = Number(pageSize ?? 10);
  if (!Number.isInteger(value) || value < 1 || value > MAX_PAGE_SIZE) {
    throw new RangeError("pageSize must be an integer between 1 and " + MAX_PAGE_SIZE);
  }
  return value;
}

function requireFetch(fetchImpl) {
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required");
  return fetchImpl;
}

async function fetchJson(fetchImpl, url, provider) {
  const response = await fetchImpl(url, {
    method: "GET",
    headers: { Accept: "application/json" }
  });
  if (!response || !response.ok) {
    const status = response?.status ?? "unknown";
    throw new Error(provider + " discovery request failed (HTTP " + status + ")");
  }
  return response.json();
}

function text(value) {
  if (typeof value !== "string") return null;
  const clean = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return clean || null;
}

function openverseCandidate(item) {
  return {
    id: "openverse:" + String(item.id ?? ""),
    provider: "openverse",
    title: text(item.title) ?? "Untitled media",
    creator: text(item.creator),
    sourceName: text(item.source),
    sourceAssetUrl: text(item.foreign_landing_url),
    mediaUrl: text(item.url),
    previewUrl: text(item.thumbnail),
    license: text(item.license),
    licenseVersion: text(item.license_version),
    licenseUrl: text(item.license_url),
    attribution: text(item.attribution),
    rightsStatus: "review_required",
    rightsEvidence: null,
    publicationEligible: false
  };
}

export async function searchOpenverse({ query, pageSize = 10, fetchImpl = globalThis.fetch } = {}) {
  const q = validateQuery(query);
  const size = validatePageSize(pageSize);
  const fetcher = requireFetch(fetchImpl);
  const url = new URL(OPENVERSE_ENDPOINT);
  url.search = new URLSearchParams({
    q,
    license_type: "commercial",
    category: "photograph",
    filter_dead: "true",
    page: "1",
    page_size: String(size)
  }).toString();

  const payload = await fetchJson(fetcher, url.toString(), "Openverse");
  const results = Array.isArray(payload?.results) ? payload.results : [];
  return {
    provider: "openverse",
    query: q,
    resultCount: Number.isFinite(payload?.result_count) ? payload.result_count : results.length,
    candidates: results
      .filter(item => item && typeof item.id === "string" && item.foreign_landing_url)
      .map(openverseCandidate)
  };
}

function commonsCandidate(page) {
  const info = Array.isArray(page?.imageinfo) ? page.imageinfo[0] : null;
  if (!info) return null;
  const metadata = info.extmetadata ?? {};
  const value = key => text(metadata[key]?.value);
  const title = text(page.title)?.replace(/^File:/, "") ?? "Untitled media";
  return {
    id: "wikimedia:" + String(page.pageid ?? title),
    provider: "wikimedia_commons",
    title,
    creator: value("Artist"),
    sourceName: "Wikimedia Commons",
    sourceAssetUrl: text(page.canonicalurl) ?? ("https://commons.wikimedia.org/wiki/" + encodeURIComponent(page.title ?? "")),
    mediaUrl: text(info.url),
    previewUrl: text(info.thumburl),
    license: value("LicenseShortName"),
    licenseVersion: value("LicenseVersion"),
    licenseUrl: value("LicenseUrl"),
    attribution: value("Attribution"),
    usageTerms: value("UsageTerms"),
    rightsStatus: "review_required",
    rightsEvidence: null,
    publicationEligible: false
  };
}

export async function searchWikimediaCommons({ query, pageSize = 10, fetchImpl = globalThis.fetch } = {}) {
  const q = validateQuery(query);
  const size = validatePageSize(pageSize);
  const fetcher = requireFetch(fetchImpl);
  const url = new URL(COMMONS_ENDPOINT);
  url.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: q,
    gsrnamespace: "6",
    gsrlimit: String(size),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "640",
    format: "json",
    formatversion: "2",
    origin: "*"
  }).toString();

  const payload = await fetchJson(fetcher, url.toString(), "Wikimedia Commons");
  const pages = Array.isArray(payload?.query?.pages) ? payload.query.pages : [];
  return {
    provider: "wikimedia_commons",
    query: q,
    resultCount: pages.length,
    candidates: pages.map(commonsCandidate).filter(Boolean)
  };
}

export async function searchMediaSources({ query, pageSize = 10, fetchImpl = globalThis.fetch } = {}) {
  const q = validateQuery(query);
  const results = await Promise.all([
    searchOpenverse({ query: q, pageSize, fetchImpl }),
    searchWikimediaCommons({ query: q, pageSize, fetchImpl })
  ]);
  return { query: q, providers: results, candidates: results.flatMap(result => result.candidates) };
}
