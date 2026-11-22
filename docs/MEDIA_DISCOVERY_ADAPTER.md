# Media Discovery Adapter — Initial Implementation

Status: implemented as a discovery-only module; no production API is enabled by default.

## Scope

The first functional unit provides two provider adapters:

- Openverse image search, filtered to commercial-use licence types, photographs and live results.
- Wikimedia Commons file search, requesting image URL and extended file metadata for creator, licence and attribution.

Both adapters return normalized candidate records. The adapter does not download media bytes, host images, create thumbnails, approve rights, write to the canonical catalog, or alter profile galleries.

## Safety boundary

Every returned candidate has rightsStatus set to review_required, rightsEvidence set to null, and publicationEligible set to false.

A commercial-use filter or a Commons licence field is discovery metadata, not a legal decision. A reviewer must open the original asset page, verify the actual licence and author/rightsholder, determine whether the licence covers the intended commercial contextual display and any local transformations, and record complete evidence before publication.

Openverse anonymous/authenticated API rate limits and pagination limits apply. This adapter deliberately requests page 1 only and caps a request at 20 candidates per provider. It does not crawl result pages or harvest the Openverse index. Wikimedia Commons extended metadata may be incomplete or free-text; missing metadata remains unresolved.

## API endpoints

- Openverse: https://api.openverse.org/v1/images/
- Wikimedia Commons MediaWiki Action API: https://commons.wikimedia.org/w/api.php

## Usage

Import searchMediaSources from adapters/media-discovery.mjs and call it with a robotics/CNC query and a pageSize up to 20. Present candidates in a review queue; do not publish them directly.

The caller may inject a fetch implementation for tests. No API keys or secrets are required by this first adapter version. No paid service or deployment is involved.

## Verification

Run: node --test tests/media-discovery.test.mjs
