# Roboscopia Media Source Catalogue

**Research snapshot:** 2026-11-22  
**Scope:** lawful discovery and use of photographs and videos depicting robots, CNC machines, industrial equipment, components, tooling and accessories.  
**Status:** research and evaluation only. No source is automatically approved for ingestion. This document does not grant rights or replace a per-asset rights review.

## Product boundary

Roboscopia is a robotics/CNC encyclopedia and product-intelligence platform. Media is contextual evidence/illustration attached to a machine, model, component, manufacturer, technical profile or use case. Roboscopia is not intended to be a general stock-photo library, wallpaper service, image marketplace or bulk redistribution mirror.

This distinction is relevant when interpreting stock-platform restrictions against creating a similar or competing photo service. It is not a blanket exemption: terms, API rules, asset-level licences, third-party rights and the actual implementation still govern each use.

## Initial source evaluation

| Source | What the source offers | Initial rights / technical findings | Roboscopia assessment |
|---|---|---|---|
| Unsplash | Searchable photography; relevant searches include industrial robotics, industrial machines and CNC machines. | Unsplash grants broad commercial-use rights under its licence, but prohibits compiling its images to replicate a similar or competing service. Individual images and any third-party marks/designs still need review. | **Candidate – conditional.** Use individual, contextually embedded assets only after checking the current licence and terms. Do not bulk-mirror or create a standalone Unsplash-derived image catalogue. |
| Pexels | Photos and videos; official API supports programmatic search. | Its licence permits commercial use, but prohibits standalone redistribution and compiling content to replicate a similar/competing service. Its API page reported new API-key issuance paused at the research date. | **Candidate – conditional.** Manual/individual contextual use may be suitable after review. Do not plan on API integration until key issuance and current API terms are confirmed. |
| Pixabay | Photos, illustrations, videos and API. | Content licence permits commercial and non-commercial use subject to prohibited uses. Standalone redistribution is prohibited; depictions of trademarks/logos/brands can trigger additional restrictions. API requires source attribution when showing search results. | **Candidate – conditional.** Asset-by-asset review; no standalone media downloads or brand endorsement implications. |
| Openverse | Search engine for openly licensed and public-domain media; public API with licence and commercial-use filters. | API supports filters including licence and commercial licence type. Its documentation warns against exhaustive/bulk harvesting; use search for discovery, not copying the full index. | **High-priority discovery source.** Strong candidate for a licence-aware search adapter. Verify rights at the original source, not just Openverse metadata. |
| Wikimedia Commons | Freely licensed and public-domain media, including industrial robot and industrial machinery categories. | Each file has its own licence and attribution requirements. Reuse generally does not require contacting the licensor if the file licence is followed. | **High-priority source.** Per-file licence and attribution capture are mandatory; verify source file page and rights metadata. |
| Flickr | Large photo collection and API. | Flickr API is described as non-commercial for outside developers; commercial API use requires prior arrangement. API access does not itself grant reuse rights to each photo. | **Conditional / lower priority.** No production API use until commercial permission is secured. Per-photo licence and uploader authority must be checked. |
| KUKA Media Library | Manufacturer press photos of robotics and automation. | KUKA states images are for press/reporting use; advertising, marketing and other commercial use are prohibited unless prior permission is obtained. | **Partnership-only by default.** Request a written licence for Roboscopia's commercial encyclopedia use. |
| Siemens Press Pictures / Media Library | Manufacturer images and media assets. | Published press-picture terms restrict use to editorial/scientific purposes and prohibit commercial use. Siemens' asset system may show per-asset rights levels and approval requirements; public-web availability does not mean unrestricted reuse. | **Partnership / per-asset approval only.** Only use assets marked for the required third-party use or explicitly approved by the owner. |
| ABB | Robotics and automation manufacturer content, press releases and imagery. | ABB terms say press imagery tied to releases is for editorial reporting; other reproduction, distribution, modification or scraping requires prior written permission. | **Partnership-only by default.** Request written commercial encyclopedic-use permission. |
| Universal Robots | Newsroom, media kit, product images, videos and use cases. | A media resource is available, but the reviewed page does not by itself establish a general commercial reuse licence for every asset. | **Permission verification required.** Contact media/PR and record rights per asset. |
| DMG MORI | CNC manufacturer website and product content. | Its terms reserve rights in website content and prohibit copying, reproducing, distributing, licensing or publishing without prior written consent except permitted intended purposes. | **Partnership-only by default.** Obtain written permission before copying or hosting product imagery. |
| ESA image/video resources | Scientific and technical image/video archive. | The European Commission library guide notes ESA imagery is limited to education/editorial/information uses; other uses, including commercial, require a specific licence. | **Not a default commercial source.** Use only when a specific licence covers the intended use. |

## Initial ranking

### Tier 1 – discovery candidates

1. **Openverse** – best initial discovery adapter because the API exposes licence filters, including commercial-use filtering. The original asset page remains the authority.
2. **Wikimedia Commons** – strong reusable-media pool with file-level licence information and robotics categories.
3. **Pixabay** – potentially useful for contextual images/videos, subject to standalone, trademark and API attribution restrictions.
4. **Unsplash** – retain as a candidate for individual contextual illustrations; avoid bulk collection and any stock-library-like presentation.
5. **Pexels** – retain as a candidate for individual contextual photos/videos; API integration is blocked pending API-key availability and terms confirmation.

### Tier 2 – direct permission / partnership

6. Universal Robots
7. KUKA
8. ABB
9. Siemens
10. DMG MORI

These manufacturers are valuable because their own media can accurately depict identifiable products and model variants. Do not infer commercial rights from a press page, download button, media kit or public URL. Obtain written permission or verify explicit per-asset third-party commercial rights.

### Tier 3 – conditional / not enabled by default

11. Flickr – commercial API arrangement required; file-level licence remains separate.
12. ESA – specific commercial licence required for commercial use.

## Mandatory asset-level rights record

Every media asset must have, at minimum:

- stable internal asset ID;
- media type (photo, video, diagram, render, document preview);
- source platform and original asset URL;
- creator/photographer and credited rights holder;
- exact licence identifier and version, or permission document reference;
- licence/source page URL and date checked;
- allowed use scope: commercial display, public display, local storage, caching, resizing/cropping, thumbnailing, deep-zoom tiles, video embedding/hosting, and derivative creation;
- attribution text and attribution URL, if required;
- model/product/component association and confidence of identification;
- third-party rights flags for trademarks, logos, identifiable people, artwork, industrial design or property;
- review status, reviewer, review timestamp and evidence reference;
- expiry, revocation, dispute and takedown state;
- original file checksum and provenance record where the file is stored.

A permission to display a still image does not imply permission to download/host a video, create zoom tiles, remove watermarks, modify the work, or use it for AI training. Those scopes must be explicitly covered.

## Publication gate

Fail closed. A media item must not be displayed as approved unless the record contains a valid licence/permission basis and all mandatory evidence fields. If the licence is ambiguous, non-commercial, editorial-only, expired, revoked, disputed, or does not cover the intended operation, do not publish it as approved.

Use a separate status for:
- discovered / not reviewed;
- licence verified;
- permission requested;
- permission granted;
- rejected / incompatible;
- expired / revoked / disputed.

Keep photos and videos in separate collections and apply independent rights gates.

## Implementation recommendation

Do not integrate all providers at once. First implement a provider-neutral **Media Source Registry** and **Media Rights Ledger**:

1. source registry: provider name, official terms URL, API availability, API-key state, rate limits, commercial-use notes, last checked date;
2. discovery adapters: query only relevant robotics/CNC categories and return source metadata, not a bulk copy of provider libraries;
3. asset rights evaluator: classify licence type and required attribution, but never auto-approve based only on search-result metadata;
4. human review queue for ambiguous rights, brand/design concerns and manufacturer permissions;
5. approved media delivery: cache/transform only when the asset licence permits it;
6. revocation and takedown workflow with an auditable history.

Initial recommendation: evaluate Openverse and Wikimedia integration first, retain Unsplash/Pixabay/Pexels as conditional discovery sources, and establish direct manufacturer permission contacts in parallel. No API keys, paid services, deployment or bulk downloads are authorized by this research note.

## Official source references

- [Unsplash – industrial robotics search](https://unsplash.com/s/photos/industrial-robotics)
- [Unsplash – CNC machines search](https://unsplash.com/s/photos/cnc-machines)
- [European Commission library guide – Finding Images](https://ec-europa-eu.libguides.com/open-science/finding-images)
- [Pexels – commercial use FAQ](https://help.pexels.com/hc/en-us/articles/360042295214-Can-I-use-the-photos-and-videos-for-a-commercial-project)
- [Pexels – licence](https://www.pexels.com/legal-pages/license)
- [Pexels API documentation](https://www.pexels.com/api/documentation/)
- [Pexels API availability](https://www.pexels.com/api/)
- [Pixabay – full terms](https://pixabay.com/service/terms/)
- [Pixabay – licence summary](https://pixabay.com/service/license-summary/)
- [Pixabay API documentation](https://pixabay.com/api/docs/)
- [Openverse API](https://api.openverse.org/v1/)
- [Openverse – about](https://openverse.org/about)
- [Wikimedia Commons – industrial robots](https://commons.wikimedia.org/wiki/Category:Industrial_robots)
- [Wikimedia Commons – industrial machinery](https://commons.wikimedia.org/wiki/Category:Industrial_machinery)
- [Wikimedia Commons – reusing content](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/en)
- [Flickr API](https://www.flickr.com/services/api/)
- [KUKA Media Library – usage terms](https://www.kuka.com/en-gb/company/press/media-library)
- [Siemens – press picture copyright](https://press.siemens.com/global/en/article/press-pictures-copyright)
- [Siemens – media library](https://press.assets.siemens.com/content/siemens/press/ui/en/search.html)
- [ABB – provider information and terms](https://www.abb.com/global/en/company/provider-information)
- [Universal Robots – newsroom and media kit](https://www.universal-robots.com/news-and-media/)
- [DMG MORI – terms of use](https://www.dmgmori.co.jp/en/attention/)
