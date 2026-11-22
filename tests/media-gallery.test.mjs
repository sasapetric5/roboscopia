import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("PhotoSwipe is vendored locally at the pinned MIT release", async () => {
  const [lightbox, core, css, license] = await Promise.all([
    read("../vendor/photoswipe/photoswipe-lightbox.esm.js"),
    read("../vendor/photoswipe/photoswipe.esm.js"),
    read("../vendor/photoswipe/photoswipe.css"),
    read("../vendor/photoswipe/LICENSE")
  ]);
  assert.match(lightbox, /PhotoSwipe Lightbox 5\.4\.4/);
  assert.match(core, /PhotoSwipe 5\.4\.4/);
  assert.match(css, /PhotoSwipe main CSS/);
  assert.match(license, /MIT License/);
  assert.match(license, /Copyright \(c\) 2014-2022 Dmitry Semenov/);
});

test("technical profile initializes a local responsive gallery", async () => {
  const html = await read("../robot-profile.html");
  const module = await read("../media-gallery.js");
  assert.match(html, /vendor\/photoswipe\/photoswipe\.css/);
  assert.match(html, /class="gallery roboscopia-gallery"/);
  assert.match(html, /class="roboscopia-gallery-link"/);
  assert.match(html, /import\("\.\/media-gallery\.js"\)/);
  assert.match(module, /pswpModule:/);
  assert.match(module, /naturalWidth/);
  assert.match(module, /naturalHeight/);
  assert.doesNotMatch(html, /unpkg\.com|jsdelivr\.net/);
});

test("gallery restricts media URLs to HTTPS and retains rights provenance", async () => {
  const html = await read("../robot-profile.html");
  assert.match(html, /const safeHttps=value=>/);
  assert.match(html, /u\.protocol==="https:"/);
  assert.match(html, /Image source:/);
  assert.match(html, /photo\.rightsStatus==="approved"/);
  const data = JSON.parse(await read("../data/robots.json"));
  for (const record of data.records) {
    for (const media of record.media || []) {
      assert.equal(media.rightsStatus, "permission_not_confirmed");
    }
  }
});


test("unapproved photographs are excluded from the rendered gallery", async () => {
  const html = await read("../robot-profile.html");
  assert.match(html, /photo\.rightsStatus==="approved"&&photo\.rightsEvidence&&photo\.rightsEvidence\.reference&&photo\.rightsEvidence\.reviewedAt/);
  assert.match(html, /No rights-cleared product photographs yet/);
  assert.doesNotMatch(html, /const photos=\(Array\.isArray\(r\.media\)\?r\.media:\[\]\)\.map\(photo=>/);
});

test("videos have a separate collection and require reviewed rights evidence", async () => {
  const html = await read("../robot-profile.html");
  const data = JSON.parse(await read("../data/robots.json"));
  assert.match(html, /const videos=\(Array\.isArray\(r\.videos\)\?r\.videos:\[\]\)/);
  assert.match(html, /video\.rightsStatus==="approved"&&video\.rightsEvidence/);
  assert.match(html, /video-media/);
  assert.match(html, /No verified video demonstrations yet/);
  for (const record of data.records) {
    assert.ok(Array.isArray(record.videos), `${record.id} must have a separate videos array`);
    assert.equal(record.videos.length, 0, `${record.id} must not receive invented video entries`);
  }
});

test("approved media requires a reference and review timestamp", async () => {
  const html = await read("../robot-profile.html");
  assert.match(html, /rightsEvidence\.reference&&photo\.rightsEvidence\.reviewedAt&&photo\.rightsEvidence\.reviewer&&photo\.rightsEvidence\.basis/);
  assert.match(html, /rightsEvidence\.reference&&video\.rightsEvidence\.reviewedAt&&video\.rightsEvidence\.reviewer&&video\.rightsEvidence\.basis/);
});


test("video demonstrations render in a separate section from the PhotoSwipe gallery", async () => {
  const html = await read("../robot-profile.html");
  assert.match(html, /const media=photoMedia;const videoSection=/);
  assert.match(html, /Video demonstrations/);
  assert.match(html, /Videos are reviewed separately from photographs/);
  assert.match(html, /class="gallery video-gallery"/);
  assert.match(html, /\+videoSection\+/);
  assert.doesNotMatch(html, /const media=photoMedia\+videoMedia/);
});
