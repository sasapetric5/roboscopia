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
  const data = JSON.parse(await read("../data/robots.json"));
  for (const record of data.records) {
    for (const media of record.media || []) {
      assert.equal(media.rightsStatus, "permission_not_confirmed");
    }
  }
});
