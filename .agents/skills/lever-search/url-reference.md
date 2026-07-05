# Lever Postings URL Reference

Public, unauthenticated Lever Postings API endpoints used by this skill. Lever is
**board-scoped**: every endpoint requires a `{board_token}`. There is **no global cross-company
search** and **no server-side keyword filtering or pagination** — a board returns all of its jobs
in one response, so this CLI filters client-side.

> Postings data is public — no authentication required for any GET endpoint.

Base URL:

```
https://api.lever.co/v0/postings/{board_token}
```

The board token is usually the company name lowercased; find it in the careers-page URL
(`jobs.lever.co/<token>` — the last path segment).

## List jobs

```
GET https://api.lever.co/v0/postings/{board_token}?mode=json
```

`mode=json` returns a **JSON array** (not wrapped in an object) of posting objects — every live
posting on the board. An empty array `[]` means the board exists but has no open roles. Each
posting:

```
[ {
    "id": "66acb66f-...",                          // string UUID
    "text": "Advertiser Solutions Vendor Lead",    // the TITLE
    "categories": {
       "commitment": "Permanent",                  // employment type
       "department": "Advertising",
       "team": "Advertising Sales - ...",
       "location": "London",
       "allLocations": ["London"]
    },
    "workplaceType": "hybrid",                      // "remote" | "hybrid" | "onsite" | "unspecified"
    "country": "GB",
    "createdAt": 1781109739214,                     // epoch MILLISECONDS (number)
    "hostedUrl": "https://jobs.lever.co/spotify/<id>",
    "applyUrl":  "https://jobs.lever.co/spotify/<id>/apply",
    "descriptionPlain": "...plain text intro...",
    "description": "<HTML intro>",
    "additionalPlain": "...", "additional": "<HTML>",
    "lists": [ { "text": "What You'll Do", "content": "<ul><li>...</li></ul>" }, ... ],
    "salaryRange": { "min": 100000, "max": 150000, "currency": "USD", "interval": "per-year-salary" }
} ]
```

No pagination — the array holds every live posting on the board. (Optional `&limit=` and `&skip=`
query params exist, but the CLI just fetches all with `?mode=json`.)

## Retrieve a single job (detail)

```
GET https://api.lever.co/v0/postings/{board_token}/{posting_id}?mode=json
```

Returns a single posting object with the same fields as the list item. `posting_id` is the UUID
from a search result. A 404 means the id is unknown on that board.

## Notes

- No authentication required (only Lever's Apply/Data APIs need a key — unused here).
- `descriptionPlain`/`additionalPlain` are already plain text; the `lists[i].content` blocks are
  HTML — the CLI decodes entities, converts block/line elements to newlines, and strips tags for
  the `plain`/description output.
- `createdAt` is epoch **milliseconds**; the CLI converts it to an ISO string for `updatedAt`.
- `salaryRange` is often null/absent; compensation is only shown when present.
- Respect rate limits — the CLI backs off on 429/5xx.
- Country-agnostic: the board token selects the company; roles can be in any country or remote.
