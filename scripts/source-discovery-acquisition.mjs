import { createHash } from "node:crypto";

const DEFAULT_UA = "ROBOSCOPIA-ResearchBot/1.0 (+https://roboscopia.com/robots)";
const MAX_ROBOTS_BYTES = 512 * 1024;
const MAX_SITEMAP_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
const PRIVATE_HOST = /^(localhost|.*\.localhost|.*\.local|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|::1$)/i;

function publicHttps(raw) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (!host || PRIVATE_HOST.test(host) || !host.includes(".") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
    return url;
  } catch { return null; }
}

async function boundedFetch(url, { fetchImpl, maxBytes, timeoutMs, headers = {}, redirectHost } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs ?? 15000);
  try {
    let current = url;
    for (let hop = 0; hop <= 3; hop++) {
      const parsed = publicHttps(current);
      if (!parsed || (redirectHost && parsed.hostname !== redirectHost)) throw new Error("UNSAFE_URL_OR_CROSS_HOST_REDIRECT");
      const response = await fetchImpl(parsed, { method: "GET", redirect: "manual", signal: controller.signal, headers });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || hop === 3) throw new Error("REDIRECT_LIMIT_OR_MISSING_LOCATION");
        current = new URL(location, parsed).toString();
        continue;
      }
      if (!response.ok) throw new Error("HTTP_" + response.status);
      const declared = Number(response.headers.get("content-length") || 0);
      if (declared > maxBytes) throw new Error("CONTENT_TOO_LARGE");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("EMPTY_RESPONSE_BODY");
      const chunks = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          throw new Error("CONTENT_TOO_LARGE");
        }
        chunks.push(Buffer.from(value));
      }
      return { response, bytes: Buffer.concat(chunks), finalUrl: parsed.toString() };
    }
    throw new Error("REDIRECT_LIMIT");
  } finally {
    clearTimeout(timer);
  }
}

function robotsAllows(text, path, userAgent) {
  const groups = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (key === "user-agent") {
      if (!current || current.hasRules) { current = { agents: [], rules: [], hasRules: false }; groups.push(current); }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current) {
      current.hasRules = true;
      if (value) current.rules.push({ allow: key === "allow", path: value });
    }
  }
  const ua = userAgent.toLowerCase();
  const matching = groups.filter(group => group.agents.some(agent => agent === "*" || ua.includes(agent)));
  if (!matching.length) return true;
  const specificity = Math.max(...matching.flatMap(group => group.agents.map(agent => agent === "*" ? 0 : agent.length)));
  const rules = matching.filter(group => group.agents.some(agent => agent.length === specificity || (specificity === 0 && agent === "*"))).flatMap(group => group.rules);
  const applicable = rules.filter(rule => path.startsWith(rule.path)).sort((a,b) => b.path.length - a.path.length);
  return applicable.length === 0 || applicable[0].allow;
}

function xmlLocations(xml) {
  return [...xml.matchAll(/<(?:loc)>([\s\S]*?)<\/(?:loc)>/gi)]
    .map(match => match[1].replace(/&amp;/g, "&").trim())
    .filter(Boolean);
}

export async function discoverManufacturerDocuments({
  sourceUrls, fetchImpl = fetch, userAgent = DEFAULT_UA, maxSitemapUrls = 1000
}) {
  if (!Array.isArray(sourceUrls)) throw new TypeError("sourceUrls must be an array");
  const candidates = [];
  const rejected = [];
  const seen = new Set();
  for (const sourceUrl of sourceUrls) {
    const source = publicHttps(sourceUrl);
    if (!source) { rejected.push({ url: sourceUrl, reason: "UNSAFE_SOURCE_URL" }); continue; }
    const origin = source.origin;
    let robots;
    try {
      const result = await boundedFetch(new URL("/robots.txt", origin).toString(), {
        fetchImpl, maxBytes: MAX_ROBOTS_BYTES, timeoutMs: 10000, headers: { "user-agent": userAgent }, redirectHost: source.hostname
      });
      robots = result.bytes.toString("utf8");
    } catch (error) {
      rejected.push({ url: origin, reason: "ROBOTS_UNAVAILABLE_FAIL_CLOSED", detail: error.message });
      continue;
    }
    if (!robotsAllows(robots, source.pathname, userAgent)) {
      rejected.push({ url: source.toString(), reason: "ROBOTS_DISALLOWED" });
      continue;
    }
    const sitemapUrls = [...robots.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)].map(m => m[1]);
    const discovered = [];
    for (const sitemapUrl of sitemapUrls.slice(0, 5)) {
      const sitemap = publicHttps(sitemapUrl);
      if (!sitemap || sitemap.hostname !== source.hostname) continue;
      try {
        const result = await boundedFetch(sitemap.toString(), {
          fetchImpl, maxBytes: MAX_SITEMAP_BYTES, timeoutMs: 15000, headers: { "user-agent": userAgent }, redirectHost: source.hostname
        });
        discovered.push(...xmlLocations(result.bytes.toString("utf8")).slice(0, maxSitemapUrls));
      } catch (error) {
        rejected.push({ url: sitemapUrl, reason: "SITEMAP_FETCH_FAILED", detail: error.message });
      }
    }
    const urls = [source.toString(), ...discovered];
    for (const raw of urls) {
      const url = publicHttps(raw);
      if (!url || url.hostname !== source.hostname || !/\.pdf(?:$|[?#])/i.test(url.pathname + url.search)) continue;
      if (seen.has(url.toString())) continue;
      seen.add(url.toString());
      if (!robotsAllows(robots, url.pathname, userAgent)) {
        rejected.push({ url: url.toString(), reason: "ROBOTS_DISALLOWED" });
        continue;
      }
      candidates.push({
        url: url.toString(),
        host: url.hostname,
        discoveredFrom: source.toString(),
        robotsAllowed: true,
        rightsStatus: "not_established",
        processingPermitted: false,
        eligibleForDownload: false,
        note: "Discovery is not a copyright or processing licence. Explicit rights review is required."
      });
    }
  }
  return { schemaVersion: "1.0.0", candidates, rejected, policy: {
    robotsRequired: true, robotsUnavailable: "fail_closed", sameHostOnly: true,
    sitemapDiscovery: true, automaticRightsInference: false, catalogMutation: false
  }};
}

export async function downloadApprovedPdf(candidate, {
  fetchImpl = fetch, rightsReview, maxBytes = DEFAULT_MAX_DOCUMENT_BYTES,
  minIntervalMs = 1500, now = () => Date.now(), lastRequestByHost = new Map()
} = {}) {
  if (!candidate || typeof candidate.url !== "string") throw new TypeError("candidate.url is required");
  if (rightsReview?.processingPermitted !== true || !rightsReview?.reviewer || !rightsReview?.basis) {
    throw new Error("EXPLICIT_PROCESSING_RIGHTS_REVIEW_REQUIRED");
  }
  if (candidate.robotsAllowed !== true) throw new Error("ROBOTS_PERMISSION_REQUIRED");
  const url = publicHttps(candidate.url);
  if (!url || url.hostname !== candidate.host) throw new Error("UNSAFE_OR_UNBOUND_CANDIDATE");
  const last = lastRequestByHost.get(url.hostname) ?? 0;
  const wait = minIntervalMs - (now() - last);
  if (wait > 0) throw new Error("HOST_RATE_LIMITED_RETRY_AFTER_" + wait + "MS");
  lastRequestByHost.set(url.hostname, now());
  const { response, bytes, finalUrl } = await boundedFetch(url.toString(), {
    fetchImpl, maxBytes, timeoutMs: 30000, headers: { "user-agent": DEFAULT_UA, accept: "application/pdf" }, redirectHost: url.hostname
  });
  const type = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (type && !["application/pdf", "application/octet-stream"].includes(type)) throw new Error("UNSUPPORTED_CONTENT_TYPE_" + type);
  if (bytes.length < 8 || bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("PDF_SIGNATURE_MISMATCH");
  return {
    bytes,
    metadata: {
      sourceUrl: candidate.url, finalUrl, contentType: type || "signature-verified",
      byteSize: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"),
      rightsReview: { processingPermitted: true, reviewer: rightsReview.reviewer, basis: rightsReview.basis },
      redistribution: rightsReview.redistribution ?? "unknown",
      catalogMutation: false
    }
  };
}
