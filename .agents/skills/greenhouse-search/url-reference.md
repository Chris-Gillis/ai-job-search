# Greenhouse Job Board URL Reference

Public, unauthenticated Greenhouse Job Board API endpoints used by this skill. Greenhouse is
**board-scoped**: every endpoint requires a `{board_token}`. There is **no global cross-company
search** and **no server-side keyword filtering or pagination** — a board returns all of its jobs
in one response, so this CLI filters client-side.

> Job Board data is public — no authentication required for any GET endpoint.

Base URL:

```
https://boards-api.greenhouse.io/v1/boards/{board_token}
```

The board token is usually the company name lowercased; find it in the careers-page URL
(`job-boards.greenhouse.io/<token>` or `boards.greenhouse.io/<token>`).

## List jobs

```
GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
```

`content=true` includes the full HTML description plus `departments` and `offices`. Response:

```
{ "jobs": [ {
    "id": 6317879,
    "title": "...",
    "location": { "name": "London" },
    "absolute_url": "https://...",
    "updated_at": "2026-...",
    "first_published": "2026-...",
    "content": "<HTML-entity-encoded description>",
    "departments": [ { "name": "Engineering" } ],
    "offices":     [ { "name": "Remote" } ],
    "company_name": "Stripe",
    "metadata": ...
} ] }
```

No pagination — the array holds every live posting on the board.

## Retrieve a single job (detail)

```
GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}?pay_transparency=true
```

Same fields as the list item, plus `pay_input_ranges` (an array of `{ title, min_cents, max_cents,
currency_type }`) when the company has enabled pay transparency.

## Notes

- No authentication required (only the POST application endpoint needs an API key — unused here).
- `content` is HTML-entity-encoded HTML; the CLI decodes entities, converts block/line elements to
  newlines, and strips tags for the `plain`/description output.
- Respect rate limits — the CLI backs off on 429/5xx.
- Country-agnostic: the board token selects the company; roles can be in any country or remote.
