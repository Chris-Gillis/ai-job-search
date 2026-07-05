# Remotive Remote Jobs API URL Reference

Public, unauthenticated Remotive Remote Jobs API endpoint used by this skill. Remotive is a
**global remote-job aggregator**: there is **no board token**. A single endpoint serves a
**server-side full-text search across every company**, and every listing is remote by definition.

> Remote Jobs data is public — no authentication required.
>
> **ToS:** Remotive asks callers to query this endpoint **only a few times per day** and to
> **credit Remotive as the source**. Treat it as a low-frequency discovery source, not a poll.

Base URL:

```
https://remotive.com/api/remote-jobs
```

## Search jobs

```
GET https://remotive.com/api/remote-jobs?search={query}&category={slug}&limit={n}
```

- `search` — server-side full-text query (URL-encode).
- `category` — optional category slug (e.g. `software-dev`).
- `limit` — server-side cap on the number of jobs returned.

Response wrapper:

```
{
  "0-legal-notice": "Remotive API Legal Notice ...",
  "job-count": 30,
  "total-job-count": 30,
  "jobs": [ {
    "id": 1933887,
    "url": "https://remotive.com/remote-jobs/...",
    "title": "Senior Backend Engineer",
    "company_name": "Acme",
    "company_logo": "https://...",
    "category": "Software Development",
    "tags": ["python", "aws"],
    "job_type": "full_time",
    "publication_date": "2026-07-02T20:01:13",
    "candidate_required_location": "Worldwide",
    "salary": "$20k -$35k",
    "description": "<HTML-entity-encoded description>"
  } ]
}
```

- `id` is a **number**; the CLI stringifies it.
- `job_type` is one of `full_time`, `contract`, `freelance`, `part_time`, `internship`.
- `candidate_required_location` is free text, e.g. `Worldwide`, `USA Only`, `Europe`.
- `salary` is a free-text string and is often empty.
- The server has **no** location or job_type parameter; the CLI filters those client-side.

## Retrieve a single job (detail)

Remotive has **no single-job endpoint**. The CLI fetches the feed once with a large cap and locates
the posting by id:

```
GET https://remotive.com/api/remote-jobs?limit=1000
```

Descriptions are included inline in each job item, so no additional request is needed. An id that
is not present in the feed yields `NOT_FOUND` and exit code `1`.

## Notes

- No authentication required.
- `description` is HTML-entity-encoded HTML; the CLI decodes entities, converts block/line elements
  to newlines, and strips tags for the `plain`/description output.
- Respect the ToS — call a few times per day and credit Remotive. The CLI backs off on 429/5xx.
- Every listing is remote; `candidate_required_location` describes candidate eligibility, not an office.
