import test from "node:test";
import assert from "node:assert/strict";
import { discoverManufacturerDocuments, downloadApprovedPdf } from "../scripts/source-discovery-acquisition.mjs";

function response(body, headers = {}, status = 200) {
  const bytes = Buffer.from(body);
  return new Response(bytes, { status, headers: { "content-length": String(bytes.length), ...headers } });
}

test("discovers only same-host PDFs listed in a permitted sitemap", async () => {
  const fetchImpl = async url => {
    if (url.pathname === "/robots.txt") return response("User-agent: *\nAllow: /\nSitemap: https://maker.example/sitemap.xml");
    if (url.pathname === "/sitemap.xml") return response("<urlset><url><loc>https://maker.example/files/manual.pdf</loc></url><url><loc>https://other.example/x.pdf</loc></url></urlset>");
    throw new Error("unexpected request");
  };
  const report = await discoverManufacturerDocuments({ sourceUrls: ["https://maker.example/product/model"], fetchImpl });
  assert.equal(report.candidates.length, 1);
  assert.equal(report.candidates[0].processingPermitted, false);
  assert.equal(report.candidates[0].eligibleForDownload, false);
});
test("fails closed when robots.txt cannot be fetched", async () => {
  const report = await discoverManufacturerDocuments({ sourceUrls: ["https://maker.example/product"], fetchImpl: async () => { throw new Error("offline"); } });
  assert.equal(report.candidates.length, 0);
  assert.equal(report.rejected[0].reason, "ROBOTS_UNAVAILABLE_FAIL_CLOSED");
});
test("honours disallow rules", async () => {
  const fetchImpl = async url => url.pathname === "/robots.txt"
    ? response("User-agent: *\nDisallow: /private/")
    : response("<urlset><url><loc>https://maker.example/private/manual.pdf</loc></url></urlset>");
  const report = await discoverManufacturerDocuments({ sourceUrls: ["https://maker.example/product"], fetchImpl });
  assert.equal(report.candidates.length, 0);
});
test("blocks downloads without explicit processing-rights review", async () => {
  await assert.rejects(() => downloadApprovedPdf({ url: "https://maker.example/a.pdf", host: "maker.example", robotsAllowed: true }), /EXPLICIT_PROCESSING_RIGHTS_REVIEW_REQUIRED/);
});
test("downloads bounded PDF only after explicit permission and records hash", async () => {
  const pdf = Buffer.from("%PDF-1.7\nfixture");
  const candidate = { url: "https://maker.example/a.pdf", host: "maker.example", robotsAllowed: true };
  const result = await downloadApprovedPdf(candidate, {
    rightsReview: { processingPermitted: true, reviewer: "reviewer", basis: "written permission", redistribution: "not_permitted" },
    minIntervalMs: 0,
    fetchImpl: async () => new Response(pdf, { headers: { "content-type": "application/pdf" } })
  });
  assert.equal(result.metadata.byteSize, pdf.length);
  assert.match(result.metadata.sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.metadata.redistribution, "not_permitted");
  assert.equal(result.metadata.catalogMutation, false);
});
test("rejects non-PDF response and oversized content", async () => {
  const candidate = { url: "https://maker.example/a.pdf", host: "maker.example", robotsAllowed: true };
  const rightsReview = { processingPermitted: true, reviewer: "r", basis: "permission" };
  await assert.rejects(() => downloadApprovedPdf(candidate, { rightsReview, minIntervalMs: 0, fetchImpl: async () => response("<html>", { "content-type": "text/html" }) }), /UNSUPPORTED_CONTENT_TYPE/);
  await assert.rejects(() => downloadApprovedPdf(candidate, { rightsReview, maxBytes: 8, minIntervalMs: 0, fetchImpl: async () => new Response(Buffer.from("%PDF-1.7 oversized")) }), /CONTENT_TOO_LARGE/);
});
test("rejects cross-host redirects", async () => {
  const candidate = { url: "https://maker.example/a.pdf", host: "maker.example", robotsAllowed: true };
  await assert.rejects(() => downloadApprovedPdf(candidate, {
    rightsReview: { processingPermitted: true, reviewer: "r", basis: "permission" }, minIntervalMs: 0,
    fetchImpl: async () => new Response(null, { status: 302, headers: { location: "https://evil.example/a.pdf" } })
  }), /UNSAFE_URL_OR_CROSS_HOST_REDIRECT/);
});
