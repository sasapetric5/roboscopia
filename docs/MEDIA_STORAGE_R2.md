# ROBOSCOPIA media storage — Cloudflare R2

## Decision and constraints

- Website remains on Cloudflare Pages; media storage is separate in Cloudflare R2.
- Free-only operation. No paid Cloudflare products, paid transformations, Stream, subscriptions, or automatic billing are authorized.
- Do not change DNS or attach a custom media domain as part of this implementation.
- Never put R2 S3 credentials, API tokens, or account secrets in browser code or Git.
- The R2 bucket is **not created or made public by this repository change**. Account-side setup is a separate manual step.
- Keep the bucket private until the owner explicitly enables a read-only public endpoint and confirms the displayed endpoint.

## Proposed bucket and object layout

Bucket name: `roboscopia-media` (proposed; availability not checked).

```text
robots/
  boston-dynamics/spot/
    gallery/
      spot-front.webp
      spot-side.webp
    video/
      spot-inspection-demo.mp4
    poster/
      spot-inspection-demo.webp
  unitree/go2/
    ...
machines/
  manufacturer/model/
    ...
components/
  manufacturer/model/
    ...
```

Use stable, lowercase object keys. Do not include personal data, secrets, or temporary upload names.

## Media variants

For each approved image, prepare variants rather than serving camera originals to every visitor:

- `thumb.webp`: catalogue card, target width around 480 px.
- `medium.webp`: profile gallery, target width around 1000 px.
- `large.webp`: user-opened/lightbox view, target width around 1800 px.
- Keep the original separately only when there is a documented reason and sufficient free storage.

Use AVIF only after checking browser fallback; WebP is the baseline. Use responsive `srcset`/sizes when a profile gallery is implemented. Images should have dimensions, descriptive alt text, and lazy loading below the fold.

Videos are not auto-downloaded. Show a poster and load/play the video only after the visitor presses Play. Do not use Cloudflare Stream; it is a paid product and is not approved.

## Rights and provenance gate

An object may be uploaded for public use only after its rights status is recorded. Required metadata:

- exact model and variant;
- media type and object key;
- original source URL and creator/publisher;
- license or written permission reference;
- date checked;
- permitted uses and attribution text;
- verification status.

A source URL alone is not permission. Current third-party preview images in `data/robots.json` remain external references with reuse permission unconfirmed; do not bulk-copy them into R2 or present them as rights-cleared.

## Public delivery and DNS

For the first test, keep the bucket private. If public display is later approved, Cloudflare's assigned `r2.dev` endpoint can be considered as a temporary read-only origin, subject to its documented limits and suitability. Do not create a custom domain or modify DNS. Do not assume that a public endpoint has been enabled.

The browser reads only the public base URL from `media-config.js`. That file intentionally ships with media disabled and an empty URL. The URL resolver rejects unsafe object keys and never contains credentials.

## Cost and quota safeguards

R2 has a free allowance, not unlimited free storage. Before creating a bucket or uploading files, check the current account's R2 pricing/usage and the exact free allowance in the Cloudflare dashboard. Do not enable billing, paid add-ons, Images, Stream, or paid Workers features. If the free allowance is unavailable, unclear, or exhausted, stop uploads and keep media disabled.

Operational controls:
1. Track stored bytes and request counts.
2. Set an internal upload budget below the account's free allowance.
3. Reject oversized files before upload.
4. Use cache headers on immutable media objects.
5. Do not run automated bulk imports.
6. Review usage manually before each upload batch.

## Rollout sequence

1. Create the bucket manually only after reviewing the account's current free allowance.
2. Keep it private; test upload and read permissions with a non-sensitive sample.
3. Record rights metadata before adding production media.
4. Optimize one approved image into variants and test mobile loading.
5. Only after a separate explicit approval, enable public read access and place the assigned HTTPS endpoint in `media-config.js`.
6. Verify image delivery, caching, fallback behavior, mobile performance, and cost usage before expanding.

## Current implementation status

- [x] Browser-side public URL resolver added; secrets are never required by the website.
- [x] Media is disabled by default.
- [x] Technical dossier can resolve an approved `assetKey` when configured, while retaining current external preview fallback.
- [ ] R2 bucket created (not done).
- [ ] Public read endpoint enabled (not done).
- [ ] Rights-cleared media uploaded (not done).
- [ ] Production media delivery verified (not done).
