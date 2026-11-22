# ROBOSCOPIA — Product Requirements and Phase 2 Blueprint

**Status:** Product decisions approved for planning; implementation not yet started.  
**Scope:** Visual robotics/CNC encyclopedia, equipment Marketplace, seller messaging, transaction-confirmed ratings, and audience requirements.  
**Operating constraints:** One branch (main); reuse-first; no production deployment, DNS changes, paid services, paid APIs or billable infrastructure without explicit approval.

## 1. Product direction

ROBOSCOPIA is a global visual robotics and CNC knowledge platform with three connected pillars:

1. **Knowledge Encyclopedia** — manufacturer, model, configuration, specifications, documentation, history and source provenance.
2. **Visual Explorer** — multi-image galleries, high-resolution viewing, zoom, optional 3D/CAD previews and embedded source-hosted videos.
3. **Marketplace** — listings for new and used robots, CNC machines, industrial equipment, components, spare parts and accessories.

Marketplace is a separate commercial module integrated with canonical encyclopedia records. Seller statements and listing condition must never overwrite manufacturer specifications.

## 2. Target audiences

### Primary audiences
- Robotics and automation engineers.
- Mechanical engineers.
- CNC operators and programmers.
- Manufacturing and industrial companies.
- Robotic-system integrators.
- Researchers and students.
- Robot and CNC-equipment manufacturers.
- Equipment distributors and vendors.

### Secondary audiences
- Small and medium-sized businesses.
- Service and maintenance companies.
- Investors and technology analysts.
- Buyers of new and used industrial equipment.
- Technology enthusiasts.

Design should support both professional research workflows and practical equipment discovery/purchase journeys.

## 3. Manufacturer-first technical information policy

- Official manufacturer documentation is the primary source for the manufacturer's own product specifications.
- A value may be published as **“According to official manufacturer documentation”** when it is extracted from an identified official manufacturer page/document and tied to the exact model and applicable configuration.
- This label attributes the statement to the manufacturer; it does **not** imply independent laboratory testing.
- Independent verification is not required for every manufacturer-stated specification.
- Each published value must retain traceable provenance: publisher/manufacturer, source URL, document/page title, document revision/date where available, capture/retrieval date, and page/section/table locator where available.
- Preserve the original value, unit, qualifiers, footnotes and configuration. Any unit conversion must be explicit and reversible.
- If official documents conflict, retain both source versions and values, display/flag the discrepancy where appropriate, and do not silently choose one.
- Route uncertain OCR, ambiguous table associations, model/variant ambiguity, safety-critical claims and conflicting sources to targeted human review.
- Distributors, user submissions and community content must be visibly attributed to their actual source and must not be represented as manufacturer statements.
- Source authority, extraction confidence, review status, independent test status and reuse rights are separate metadata dimensions.
- Public availability does not grant permission to republish documents, images, CAD files or videos.

## 4. Visual presentation requirements

### Image galleries
Each model profile should support multiple images, ideally including:
- Front, rear and side views.
- Three-quarter and overall views.
- Close-ups of joints, spindle, tool changer, controller, work envelope or other relevant details.
- Equipment in a real industrial environment.
- Accessories and model/configuration differences.

Each image needs its own source/creator, rights/license or permission basis, attribution, model/configuration association, capture date where known, and alt text.

### Resolution, compression and interaction
- Preserve the highest-quality permitted original when storage and rights allow.
- Generate responsive derivatives (thumbnail, gallery and large/lightbox sizes) for efficient delivery.
- Support click/tap to open a large viewer, zoom and pan.
- Use lazy loading and responsive image selection.
- Do not upscale a low-resolution source and present it as an original high-resolution image.
- Do not bulk-copy external preview images until reuse rights are recorded.
- Do not assume Cloudflare R2, paid image transformation or other paid media infrastructure is approved. Check current free quotas/costs and obtain explicit approval before account-side provisioning or public exposure.

### 3D and CAD
- Plan an optional interactive 3D viewer with orbit/rotate, zoom and suitable mobile controls.
- Prefer web-delivery formats such as glTF/GLB when licensed and available.
- Retain references to original CAD formats where permitted; do not promise in-browser support for every CAD format.
- Support exploded views and work-envelope visualizations where source assets exist.
- 3D availability is optional and is not a condition for publishing a model profile.

### Video
- Prefer embedding the original manufacturer's or rights-holder's video player so large video files are streamed by the source provider and played within the Roboscopia page.
- Store source URL, provider/video ID, publisher, title, attribution and rights/embedding status.
- Load the player only after user interaction where practical; use a poster/thumbnail first.
- If embedding is blocked or not permitted, show a clear link to the original source.
- Do not download/rehost videos by default. No Cloudflare Stream or other paid video service without explicit approval.

## 5. Marketplace scope

### Listing categories
- Industrial robots and collaborative robots.
- CNC machines and machining centres.
- Industrial automation equipment and production machinery.
- Controllers, tooling, peripherals and accessories.
- Spare parts, components and replacement units.
- Related industrial equipment and workshop equipment.

### Listing intent and condition
Support:
- For sale.
- Wanted / purchase request.
- Rental / lease.
- Exchange (later release if operationally justified).

Condition vocabulary:
- New.
- Used.
- Refurbished by manufacturer.
- Professionally refurbished/repaired.
- For parts / non-operational.
- Made to order.

A listing should include, when applicable: title, category, manufacturer/model link, configuration, condition, description, price and currency or price-on-request, negotiability, location, availability, year, operating hours, included accessories, known defects, warranty/return terms, delivery/installation options, seller identity, multiple photos, optional video/3D links, and supporting documents. Unknown values remain unknown; never invent them.

### Listing-to-encyclopedia connection
- A listing may link to an existing canonical manufacturer/model profile.
- A listing may refer to an unlisted model, but must not create a manufacturer fact automatically.
- Show manufacturer specifications separately from seller-provided condition, operating hours, price, availability and claims.
- A seller's listing must never modify canonical manufacturer data.

## 6. On-platform messaging

- Buyers and sellers must be able to exchange private messages on Roboscopia.
- Conversations are associated with a listing and its buyer/seller participants.
- Provide unread state, timestamps, basic attachments subject to file-type/size/security controls, blocking/reporting, and abuse moderation.
- Protect conversations with access controls; only participants and authorized moderation processes may access them.
- Keep an auditable transaction event trail without exposing private message contents publicly.
- Provide clear privacy notices, retention/deletion rules and abuse-reporting procedures before launch.
- Do not require users to expose personal phone numbers or email addresses publicly.

## 7. Verified transaction and ratings policy

### Required transaction flow
1. Buyer contacts seller through Roboscopia messaging about a specific listing.
2. The parties record a purchase agreement/intent tied to the listing, item, participants and agreed terms.
3. The transaction moves to an agreed/in-progress state.
4. Buyer and seller separately confirm that the sale/purchase was completed.
5. Only after both confirmations does the system create a **Verified Transaction** rating entitlement for each eligible participant.
6. Each participant may submit one rating/review for the other party for that transaction.

### State and integrity rules
- Suggested states: inquiry, negotiating, agreement_recorded, in_progress, completed_pending_confirmation, verified_completed, cancelled, disputed, expired.
- One transaction can produce at most one rating per eligible participant.
- A seller cannot self-confirm for the buyer, and neither participant can grant themselves a rating entitlement.
- A single-party completion claim is not sufficient for a verified transaction.
- If confirmations disagree, a party disputes, or evidence is suspicious, keep the transaction out of the verified-completed state pending review.
- Both parties confirming is evidence of mutual attestation, not automatic proof of payment, delivery, title transfer or equipment condition. The UI must not claim more than the system actually establishes.
- Preserve edit history and timestamps for agreement and confirmation events.
- Prevent duplicate/fabricated ratings through account controls, rate limits, anomaly detection, transaction uniqueness and moderation.
- Ratings must not be removed merely because a seller dislikes them. Provide a fair report, response and appeal process.
- Clearly distinguish verified-transaction reviews from unverified comments (prefer not to allow public unverified seller ratings at all).

### Reputation display
Show positive and negative ratings, total eligible ratings, score calculation method, review count and relevant transaction context. Do not treat a new seller with no reviews as a poorly rated seller. Prevent misleading percentages when sample sizes are small.

## 8. Trust, safety and commercial boundaries

- Provide seller profiles for individuals and businesses, with verification levels clearly described.
- Do not display a “verified business” or “authorized distributor” badge without an actual verification basis.
- Add listing reporting, moderation, fraud/scam signals, prohibited-item rules and dispute workflows.
- Clearly label sponsored listings, affiliate/referral links and paid placement.
- Commercial relationships must not influence manufacturer specifications, technical comparisons or source status.
- Do not accept payments, deposits, escrow funds, guarantee delivery, offer warranties or become seller of record in the initial Marketplace scope. Those require a separate legal, tax, payment, consumer-protection and operational decision.
- International launch requires localization, currency handling, time zones, privacy and applicable marketplace/legal review.

## 9. Suggested architecture boundaries

Keep these domains separately permissioned and auditable:
- identity: user, seller, organization and verification status.
- catalog: canonical manufacturer, family, model, configuration and specifications.
- media: image/video/3D metadata, rights, variants and source references.
- listings: offers, wanted ads, condition, price, availability and seller statements.
- messaging: private listing conversations and attachments.
- transactions: agreement, state transitions, bilateral completion confirmations and disputes.
- reviews: transaction-bound rating entitlements and reviews.
- moderation: reports, enforcement, appeals and audit trail.

Use stable IDs, explicit ownership/authorization checks, append-only or tamper-evident transaction events, idempotent state transitions, rate limits and audit logging. Do not create a live database, paid service or production integration as part of this requirements document.

### 9.1 Marketplace as the fourth logical data/storage domain

Marketplace is a separate fourth logical domain in the platform's planned storage architecture. It owns its commercial and user-generated records and must not be merged into the canonical encyclopedia database.

It must maintain its own data records for:
- buyer and seller user identities, account status, roles and permissions;
- seller profiles and, where applicable, business profile and verification evidence;
- new and used listings, condition, seller descriptions, prices/currencies, negotiability, location and availability;
- listing photographs and other listing media, with source/rights metadata;
- buyer enquiries, private conversations, agreements, orders/transaction records, completion confirmations and disputes;
- transaction-bound reviews, ratings, moderation reports and audit events.

The logical storage map is planned as:
1. Oracle domain — robot encyclopedia data and associated robot media.
2. Cloudflare R2 domain — CNC machine media.
3. Cloudflare R2 domain — robot/CNC parts and accessories media.
4. Marketplace domain — its own database for buyers, sellers, listings and commercial records, plus a separately managed Marketplace media area for listing photographs and attachments.

The Marketplace database and media area are a logical separation, not a commitment to a specific provider, account, bucket, database product or number of physical accounts. Provider selection and exact account/bucket topology remain subject to free-tier, cost, security, backup, data-residency and compatibility evaluation. Do not assume that multiple accounts multiply free quotas.

Marketplace listings may reference canonical encyclopedia IDs, but the listing, seller, price, condition, availability and transaction records remain Marketplace-owned data. A listing reference must not copy or mutate the canonical model record. A single encyclopedia profile may be referenced by many listings.

A central storage-routing layer should resolve the logical domain to configured storage adapters and keep provider/account/bucket/object identifiers in server-side configuration or protected metadata. Credentials must never be exposed to browsers. Store stable object IDs, SHA-256 checksums, media type, ownership, source/rights status, creation time and lifecycle status. Design metadata backup, object backup/replication, integrity checks, provider health checks and a documented recovery/migration path; category separation alone is not a backup.

No account creation, bucket/database provisioning, public endpoint activation, paid usage, code deployment or DNS change is authorized by this plan. Those actions require separate explicit approval.

## 10. Delivery sequence

### Phase 1 foundation
- Manufacturer-first source attribution and scalable document ingestion.
- Evidence/provenance schema that separates source authority, extraction confidence, review, independent testing and reuse rights.
- Canonical model IDs and listing-compatible model references.
- Media metadata and rights model for images, video and 3D assets.
- Architecture decisions for identity, messaging, transactions and reviews; no premature production Marketplace launch.
- Prove extraction on a representative set of real, lawfully processable manufacturer documents and measure accuracy, throughput and failure modes.

### Phase 2 product implementation
- Complete visual galleries, high-resolution viewer, zoom/pan and embedded source-hosted videos.
- Optional 3D viewer for rights-cleared supported assets.
- Marketplace listings, categories, conditions, pricing, search and filters.
- Seller profiles and on-platform private messaging.
- Agreement and bilateral completion-confirmation workflow.
- Transaction-bound positive/negative ratings, moderation, reporting and anti-abuse controls.
- Link listings to canonical encyclopedia profiles.

### Later stages
- Business verification, manufacturer/distributor feeds, RFQs, auctions, rental workflows, logistics and payment integrations only after separate research, legal review and explicit approval.

## 11. Acceptance principles

- No technical value is displayed without traceable source attribution.
- Manufacturer statements are not mislabeled as independent test results.
- No image, video, CAD model or document is republished without a recorded rights basis.
- No listing statement is silently merged into manufacturer data.
- No public seller rating is enabled without an eligible on-platform transaction and bilateral completion confirmation.
- No production deployment, DNS change or paid infrastructure activation occurs without explicit approval.
