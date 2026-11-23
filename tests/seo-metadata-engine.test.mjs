import test from "node:test";
import assert from "node:assert/strict";
import { buildRobotPageSEO } from "../scripts/seo-metadata-engine.mjs";

const db = {
  records: [
    {
      id: "spot", manufacturer: "Boston Dynamics", model: "Spot", category: "quadruped",
      summary: "Mobile quadruped inspection platform.", summarySr: "Mobilna inspekcijska platforma.",
      family: "Spot", sources: [{ label: "Official product page", url: "https://bostondynamics.com/products/spot/" }],
      specifications: [{ name: "Payload", value: 14, unit: "kg", source: "https://bostondynamics.com/products/spot/" }],
      media: [{ url: "https://images.example.org/spot.jpg", rightsStatus: "permission_not_confirmed" }],
      videos: []
    },
    {
      id: "go2", manufacturer: "Unitree Robotics", model: "Go2", category: "quadruped",
      summary: "Compact quadruped platform.", family: "Go2", sources: [{ label: "Official", url: "https://unitree.com/go2/" }],
      specifications: [], media: [], videos: []
    },
    {
      id: "ur5e", manufacturer: "Universal Robots", model: "UR5e", category: "cobot",
      summary: "Collaborative robot arm.", family: "e-Series", sources: [], specifications: [], media: [], videos: []
    }
  ]
};

test("builds stable SEO metadata, canonical URL and Schema.org WebPage data", () => {
  const result = buildRobotPageSEO({ db, recordId: "spot", baseUrl: "https://roboscopia.com/", language: "en" });
  assert.equal(result.title, "Spot — Boston Dynamics | ROBOSCOPIA");
  assert.equal(result.canonicalUrl, "https://roboscopia.com/robot-profile.html?id=spot");
  assert.equal(result.jsonLd["@type"], "WebPage");
  assert.equal(result.jsonLd.about.identifier, "spot");
  assert.equal(result.robots, "index,follow");
  assert.equal(result.catalogMutationAllowed, false);
});

test("uses localized summary and emits only existing relevant internal links", () => {
  const result = buildRobotPageSEO({ db, recordId: "spot", baseUrl: "https://roboscopia.com", language: "sr" });
  assert.equal(result.metaDescription, "Mobilna inspekcijska platforma.");
  assert.deepEqual(result.internalLinks.map(link => link.id), ["go2"]);
  assert.equal(result.internalLinks[0].relation, "same_category");
});

test("deduplicates source links and rejects non-HTTPS sources", () => {
  const local = structuredClone(db);
  local.records[0].sources.push({ label: "Unsafe", url: "http://bad.example" });
  const result = buildRobotPageSEO({ db: local, recordId: "spot", baseUrl: "https://roboscopia.com" });
  assert.equal(result.externalSources.length, 1);
  assert.equal(result.externalSources[0].url, "https://bostondynamics.com/products/spot/");
});

test("does not expose unapproved images or videos as publishable media", () => {
  const local = structuredClone(db);
  local.records[0].media.push({
    id: "photo-2", url: "https://images.example.org/approved.jpg", rightsStatus: "approved",
    rightsEvidence: { reference: "https://rights.example.org/permission", reviewedAt: "2026-11-23",
      reviewer: "reviewer-1", basis: "Written permission" }
  });
  local.records[0].videos.push({
    id: "video-1", url: "https://video.example.org/watch", rightsStatus: "approved",
    rightsEvidence: { reference: "https://rights.example.org/video", reviewedAt: "2026-11-23",
      reviewer: "reviewer-1", basis: "Video hosting permission" },
    title: "Spot field test", description: "A field test of the robot.", thumbnailUrl: "https://video.example.org/thumb.jpg"
  });
  const result = buildRobotPageSEO({ db: local, recordId: "spot", baseUrl: "https://roboscopia.com" });
  assert.equal(result.media.images.length, 1);
  assert.equal(result.media.images[0].altTextRequired, true);
  assert.equal(result.media.videos.length, 1);
  assert.equal(result.media.videos[0].metadataComplete, true);
});

test("rejects invalid inputs and unknown records", () => {
  assert.throws(() => buildRobotPageSEO({ db, recordId: "missing", baseUrl: "https://roboscopia.com" }), /does not exist/);
  assert.throws(() => buildRobotPageSEO({ db, recordId: "spot", baseUrl: "http://roboscopia.com" }), /HTTPS/);
  assert.throws(() => buildRobotPageSEO({ db, recordId: "spot", baseUrl: "https://roboscopia.com", language: "fr" }), /language/);
});
