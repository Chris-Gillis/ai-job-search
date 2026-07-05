# Ashby Posting API URL Reference

Public, unauthenticated Ashby posting API endpoint used by this skill. Ashby is **board-scoped**:
the endpoint requires a `{board_name}`. There is **no global cross-company search** and **no
server-side keyword filtering or pagination** — a board returns all of its listed jobs (with
descriptions inline) in one response, so this CLI filters client-side.

> Posting data is public — no authentication required.

## Job board (list + descriptions)

```
GET https://api.ashbyhq.com/posting-api/job-board/{board_name}?includeCompensation=true
```

`{board_name}` is the last segment of the careers URL `jobs.ashbyhq.com/<board_name>` and can be
case-sensitive (e.g. `Ashby`). `includeCompensation=true` adds the compensation summary. Response:

```
{ "jobs": [ {
    "id": "<uuid>",
    "title": "...",
    "department": "Engineering",
    "team": "Platform",
    "location": "San Francisco",
    "secondaryLocations": [ { "location": "Remote - US" } ],
    "employmentType": "FullTime",
    "isRemote": true,
    "isListed": true,
    "workplaceType": "Remote",
    "publishedAt": "2026-...",
    "jobUrl": "https://jobs.ashbyhq.com/...",
    "applyUrl": "https://jobs.ashbyhq.com/.../application",
    "descriptionHtml": "<...>",
    "descriptionPlain": "...",
    "compensation": { "compensationTierSummary": "$x – $y", "scrapeableCompensationSalarySummary": "..." }
} ] }
```

No pagination — the array holds every listed posting on the board, and the description is inline.

## Detail

There is **no public single-posting endpoint** in the posting API. To fetch one job, request the
board (above) and locate the posting by its `id` (UUID). That is exactly what this skill's
`detail` command does.

## Notes

- No authentication required for the public posting API.
- `descriptionPlain` is already plain text; `descriptionHtml` is real HTML (the CLI uses
  `descriptionPlain` when present and falls back to stripping `descriptionHtml`).
- Respect rate limits — the CLI backs off on 429/5xx.
- Country-agnostic: the board name selects the company; roles can be in any country or remote.
