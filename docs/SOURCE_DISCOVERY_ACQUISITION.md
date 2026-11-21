# Source discovery and controlled acquisition

## Scope

This module adds a conservative first stage for manufacturer document discovery and PDF acquisition. It deliberately does not crawl arbitrary web domains, infer copyright permission, install parsers, or mutate the robotics catalogue.

## Discovery

- Input URLs must come from the existing source registry / known manufacturer source records.
- HTTPS only; embedded credentials, IP literals and obvious local/private hostnames are rejected.
- The source host's `robots.txt` must be retrievable. Failure is fail-closed.
- Sitemap URLs are accepted only on the same host; discovered PDF links are also same-host only.
- Robots rules are checked for the source path and every PDF candidate.
- Discovery output explicitly records `processingPermitted: false`; robots.txt is not treated as a licence.

## Acquisition

A PDF can be downloaded only when a reviewer supplies an explicit processing-rights decision with reviewer and basis. The downloader enforces same-host redirects, a bounded response size, timeout, host request interval, PDF content type/signature and SHA-256. Redistribution permission is recorded separately and is not inferred from processing permission.

The default maximum is 25 MiB. The downloader returns bytes to the caller; it does not write the PDF into the repository or change `data/robots.json`.

## Known limitations

This is a conservative baseline, not a complete crawler security boundary. Production deployment should add DNS/IP pinning at the network layer, persistent per-host rate limiting, a legal-rights evidence record, robots parser conformance tests, retry/backoff and a queue. It does not yet parse PDF content. OpenDataLoader, Docling and OCR adapters remain gated on a reproducible, rights-cleared benchmark corpus and pinned runtime dependencies.
