# Media review queue

Status: implemented as a pure, non-persistent review-queue adapter.

## Workflow

1. Run Openverse and Wikimedia Commons discovery using `adapters/media-discovery.mjs`.
2. Pass the combined candidate list and an explicit canonical model ID to `buildMediaReviewQueue`.
3. Render each queue item for a human reviewer, linking to the original asset page.
4. Record a separate human decision and validate it with `validateMediaReviewDecision`.
5. Only a separately authorized catalog integration may apply an approved decision to `data/robots.json`.

## Safety boundaries

- Queue construction never changes the canonical catalog.
- Every item remains `review_required`, with no rights evidence and `publicationEligible: false`.
- Only HTTPS source, media, preview, licence and evidence URLs are accepted.
- Duplicate candidate IDs are rejected.
- Approval requires an evidence reference, review timestamp, reviewer, legal basis, licence, licence version and intended use.
- The evidence reviewer must match the decision reviewer; the reviewed licence must match the discovered licence when one was supplied.
- A valid approval decision is validation output only. It does not mutate the queue, grant copyright, or publish media.
- Reviewers must still verify the original asset page, rightsholder authority, commercial contextual display, permitted storage/transformations, attribution and third-party rights.

## API

`buildMediaReviewQueue({ modelId, candidates, createdAt })` creates a deterministic model-scoped review envelope.

`validateMediaReviewDecision(decision, queue)` returns validation errors. An empty array means the decision record is structurally complete; it is not an automatic legal determination.

## Tests

Run `node --test tests/media-review-queue.test.mjs`.
