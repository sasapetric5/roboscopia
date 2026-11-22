# ROBOSCOPIA Media Standard — Photographs, Angles, Video and Rights

Status: implementation standard; no media is approved by this document.
Applies to canonical Knowledge Base profiles. Marketplace listing media must use a separate policy and storage domain.

## 1. Core rules

- Never invent, synthesize, or substitute product imagery or demonstrations to make a profile look complete.
- A manufacturer or distributor URL is a source reference, not permission to reproduce or embed its media.
- Media with missing, unclear, expired, disputed, or unreviewed rights remains non-approved and must not be displayed as approved.
- Keep photographs, video records, source evidence, and rights-review metadata distinct.
- A media item may be approved only after a human review records a rights basis, evidence reference, reviewer identity, and review timestamp.
- Do not activate external scraping, media copying, paid storage, or deployment as part of this standard.

## 2. Photograph and angle taxonomy

Each photograph is one media record with a stable ID and a controlled view label:
- `hero`: principal manufacturer-approved product view.
- `front`, `rear`, `left`, `right`, `top`, `bottom`: orthogonal views where relevant.
- `isometric`: three-quarter view showing overall geometry.
- `detail`: close-up of a named component; include `detailSubject`.
- `in-use`: product shown in a real operating environment; describe context and avoid implying unverified capabilities.

Record model/variant applicability, caption/alt text, dimensions, format, source URL, canonical asset reference, creator/rights holder, acquisition method, and attribution requirements. Never infer the view label from a filename alone.

## 3. Video demonstration records

Videos live in a separate `videos[]` collection, never inside `media[]` or the photograph gallery. Each record should contain:
- stable `id`, `title`, `url`, `platform`, `durationSeconds`, `language`;
- `demonstrationType` (e.g. locomotion, manipulation, inspection, setup, maintenance);
- exact model and configuration applicability;
- publisher/creator and original publication date when verified;
- source reference, attribution/embedding conditions, and rights evidence;
- `rightsStatus` and review metadata.

Prefer a verified official source link. Embedding is a separate decision from linking and requires explicit permission or a documented licence that permits embedding. A video link is not proof that the demonstration depicts the exact model or variant.

## 4. Rights state machine

Allowed states:
- `not_reviewed`: default for new records.
- `permission_not_confirmed`: source known, reuse rights not established.
- `review_required`: evidence submitted but not yet reviewed.
- `approved`: only after human review and complete evidence.
- `rejected`: evidence does not permit the intended use.
- `expired` / `revoked`: previously approved rights no longer valid.

An `approved` item must include `rightsEvidence.reference`, `rightsEvidence.reviewedAt`, `rightsEvidence.reviewer`, and `rightsEvidence.basis` (licence identifier, written permission reference, or documented ownership). Missing any required field means the item is not approved. The UI must fail closed.

## 5. OpenSeadragon / deep-zoom preparation

OpenSeadragon is reserved for genuinely high-resolution, rights-cleared photographs where zoom adds engineering value. The current gallery remains PhotoSwipe for ordinary approved images.

Preparation requirements:
- keep original master files immutable and preserve their checksums;
- generate tiled pyramids (e.g. DZI or IIIF) only from rights-cleared masters;
- store tile-manifest URL, tile format, dimensions, source master hash, and generator/version metadata;
- load the viewer lazily only when an approved deep-zoom manifest exists;
- retain a normal responsive image fallback for mobile, accessibility, and unsupported browsers;
- do not load OpenSeadragon from a third-party CDN at runtime; vendor and pin a reviewed release before enabling;
- validate tile path/origin, manifest dimensions, resource limits, and content type;
- do not generate or upload tile pyramids until storage, licensing, and cost are explicitly reviewed.

This phase documents the integration contract only. It does not add a viewer dependency or activate a tile service.

## 6. Display and approval gates

- The profile renderer may show only photographs whose rights state is `approved` and whose evidence reference and review timestamp are present.
- The same fail-closed gate applies independently to video entries.
- Video cards are rendered in a separate section/collection from photographs.
- Rights metadata is not inferred from source domain, HTTPS, public availability, or the presence of attribution.
- A profile with no approved media must say so plainly; empty states are preferable to misleading gallery content.

## 7. Review checklist

Before approving an item, verify: exact asset identity; exact model/variant; rights holder; licence/permission scope; permitted display, modification, derivative/tile, and embedding uses; attribution text; territory/term/expiry; evidence reference; reviewer; review timestamp. Re-review on licence changes, takedown requests, or source changes.
