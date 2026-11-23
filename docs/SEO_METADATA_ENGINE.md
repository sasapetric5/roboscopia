# SEO Metadata Engine

The deterministic metadata engine at `scripts/seo-metadata-engine.mjs` is the first executable SEO/GEO/AEO integration for the current canonical robot catalog.

## What it does

- Generates bilingual page titles and descriptions from existing model data.
- Generates canonical URLs using the currently implemented `robot-profile.html?id=<id>` route; it does not invent a future route.
- Generates Open Graph metadata and Schema.org `WebPage` / `Thing` / `BreadcrumbList` JSON-LD from canonical data.
- Builds relevant internal profile links only from existing catalog records (same manufacturer, family or category).
- Builds deduplicated HTTPS external source links from registered profile and specification source fields.
- Exposes image/video metadata only when the corresponding rights status is approved and required rights evidence fields are present.
- Flags missing image alt text and incomplete video metadata rather than inventing descriptions.
- Returns a deterministic fingerprint and warning list. It never mutates the catalog or publishes a page.

## Usage

```js
import { readFile } from "node:fs/promises";
import { buildRobotPageSEO } from "./scripts/seo-metadata-engine.mjs";

const db = JSON.parse(await readFile("data/robots.json", "utf8"));
const seo = buildRobotPageSEO({
  db,
  recordId: "spot",
  baseUrl: "https://roboscopia.com",
  language: "en"
});
console.log(JSON.stringify(seo, null, 2));
```

The current static profile renderer has not yet been wired to inject these fields into the live HTML head. This module is a tested generator, not a claim that deployed pages already carry generated metadata.

## Boundaries

- No invented image alt text: visual descriptions need actual image inspection or verified editorial input.
- No Product/Offer/Review markup is emitted for a technical profile.
- No third-party media is exposed unless the separate media rights evidence gate passes.
- SEO metadata readiness does not override factual, provenance, security or media publication gates.
- Search rankings, indexing and generative-answer citations cannot be guaranteed.
