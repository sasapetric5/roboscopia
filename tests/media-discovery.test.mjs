import test from "node:test";
import assert from "node:assert/strict";
import {
  searchOpenverse,
  searchWikimediaCommons,
  searchMediaSources
} from "../adapters/media-discovery.mjs";

function mockFetch(payload, status = 200, capture = () => {}) {
  return async (url, options) => {
    capture(new URL(url), options);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => payload
    };
  };
}

test("Openverse searches commercial-use photographs and keeps candidates unapproved", async () => {
  let requested;
  const fetchImpl = mockFetch({
    result_count: 1,
    results: [{
      id: "asset-1",
      title: "Industrial robot arm",
      creator: "Photographer",
      source: "Example source",
      foreign_landing_url: "https://example.org/photo/1",
      url: "https://example.org/photo/1.jpg",
      thumbnail: "https://example.org/photo/1-thumb.jpg",
      license: "by",
      license_version: "4.0",
      license_url: "https://creativecommons.org/licenses/by/4.0/",
      attribution: "By Photographer"
    }]
  }, 200, url => { requested = url; });

  const result = await searchOpenverse({ query: "industrial robot arm", pageSize: 7, fetchImpl });
  assert.equal(requested.searchParams.get("license_type"), "commercial");
  assert.equal(requested.searchParams.get("category"), "photograph");
  assert.equal(requested.searchParams.get("filter_dead"), "true");
  assert.equal(requested.searchParams.get("page_size"), "7");
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].license, "by");
  assert.equal(result.candidates[0].rightsStatus, "review_required");
  assert.equal(result.candidates[0].rightsEvidence, null);
  assert.equal(result.candidates[0].publicationEligible, false);
});

test("Wikimedia Commons requests file metadata and never auto-approves a licence", async () => {
  let requested;
  const fetchImpl = mockFetch({
    query: {
      pages: [{
        pageid: 123,
        title: "File:Industrial robot.jpg",
        canonicalurl: "https://commons.wikimedia.org/wiki/File:Industrial_robot.jpg",
        imageinfo: [{
          url: "https://upload.wikimedia.org/robot.jpg",
          thumburl: "https://upload.wikimedia.org/thumb/robot.jpg",
          extmetadata: {
            Artist: { value: "Artist name" },
            LicenseShortName: { value: "CC BY-SA 4.0" },
            LicenseVersion: { value: "4.0" },
            LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0/" },
            Attribution: { value: "Artist name / CC BY-SA 4.0" }
          }
        }]
      }]
    }
  }, 200, url => { requested = url; });

  const result = await searchWikimediaCommons({ query: "industrial robot", fetchImpl });
  assert.equal(requested.searchParams.get("generator"), "search");
  assert.equal(requested.searchParams.get("gsrnamespace"), "6");
  assert.match(requested.searchParams.get("iiprop"), /extmetadata/);
  assert.equal(result.candidates[0].license, "CC BY-SA 4.0");
  assert.equal(result.candidates[0].creator, "Artist name");
  assert.equal(result.candidates[0].rightsStatus, "review_required");
  assert.equal(result.candidates[0].publicationEligible, false);
});

test("missing rights metadata does not create an approved candidate", async () => {
  const result = await searchWikimediaCommons({
    query: "robot",
    fetchImpl: mockFetch({
      query: { pages: [{
        pageid: 1,
        title: "File:Robot.jpg",
        imageinfo: [{ url: "https://upload.wikimedia.org/robot.jpg" }]
      }] }
    })
  });
  assert.equal(result.candidates[0].license, null);
  assert.equal(result.candidates[0].rightsStatus, "review_required");
  assert.equal(result.candidates[0].publicationEligible, false);
});

test("invalid query and page size are rejected before network access", async () => {
  const neverFetch = async () => { throw new Error("network should not be called"); };
  await assert.rejects(searchOpenverse({ query: " ", fetchImpl: neverFetch }), /query/);
  await assert.rejects(searchOpenverse({ query: "robot", pageSize: 21, fetchImpl: neverFetch }), /pageSize/);
});

test("provider HTTP failures are surfaced without treating them as empty results", async () => {
  await assert.rejects(
    searchOpenverse({ query: "robot", fetchImpl: mockFetch({}, 429) }),
    /HTTP 429/
  );
});

test("combined search returns candidates from both independent providers", async () => {
  let count = 0;
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => (++count === 1)
      ? { result_count: 0, results: [] }
      : { query: { pages: [] } }
  });
  const result = await searchMediaSources({ query: "CNC machine", fetchImpl });
  assert.equal(count, 2);
  assert.equal(result.providers.length, 2);
  assert.deepEqual(result.candidates, []);
});
