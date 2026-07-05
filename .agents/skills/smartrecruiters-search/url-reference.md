# SmartRecruiters Posting API URL Reference

Public, unauthenticated SmartRecruiters Posting API endpoints used by this skill. SmartRecruiters
is **board-scoped**: every endpoint requires a `{company}` identifier. There is **no global
cross-company search**, but unlike some boards SmartRecruiters supports **server-side keyword
search (`q=`) and offset/limit pagination**, which this CLI uses.

> Posting data is public — no authentication required for any GET endpoint.

Base URL:

```
https://api.smartrecruiters.com/v1/companies/{company}
```

The company identifier is **case-sensitive**; find it in the careers-page URL
(`jobs.smartrecruiters.com/<identifier>`). Examples: `Visa`, `Square`.

## List postings (search)

```
GET https://api.smartrecruiters.com/v1/companies/{company}/postings?limit=100&offset=0
```

Optional `&q={keywords}` runs a **server-side full-text search** over the board's postings
(URL-encode the value). Response wrapper:

```
{
  "offset": 0,
  "limit": 100,
  "totalFound": 1234,
  "content": [ {
    "id": "744000133907678",
    "name": "Sr. Manager",
    "company": { "identifier": "Visa", "name": "Visa" },
    "releasedDate": "2026-06-24T10:00:11.853Z",
    "location": { "city": "Austin", "region": "TX", "country": "us", "remote": false, "hybrid": false, "fullLocation": "Austin, TX, United States" },
    "department": { "label": "Software Development/Engineering" },
    "typeOfEmployment": { "label": "Full-time" },
    "experienceLevel": { "label": "Mid-Senior Level" },
    "ref": "https://api.smartrecruiters.com/v1/companies/Visa/postings/744000133907678"
  } ]
}
```

**Pagination**: page with `offset += 100` while `content.length === 100`. The CLI caps at a safety
maximum of 10 pages (1000 postings) per board to avoid hammering a huge board; if it stops early
because of the cap, it prints a `{ "warn": "result set truncated at N postings (board has M)",
"code": "TRUNCATED" }` note to stderr so a truncated result never looks like full coverage.

An unknown/mistyped company identifier does **not** 404 on this endpoint — it returns HTTP 200 with
`{ "totalFound": 0, "content": [] }` (the same shape as a real board with no matches). The CLI
therefore detects a missing board with an **unfiltered** existence probe (offset 0, no `q`): an
empty unfiltered result means the board is unknown, and it is skipped with a `BOARD_NOT_FOUND`
warning. Probing without the query is what keeps a real board that simply has no keyword matches
from being misreported as missing.

## Retrieve a single posting (detail)

```
GET https://api.smartrecruiters.com/v1/companies/{company}/postings/{id}
```

Adds the full job ad and canonical URLs:

```
{
  "id": "...", "name": "...",
  "postingUrl": "https://jobs.smartrecruiters.com/Visa/<id>-slug",
  "applyUrl":   "https://jobs.smartrecruiters.com/Visa/<id>-slug?oga=true",
  "typeOfEmployment": { "label": "Full-time" },
  "experienceLevel":  { "label": "Mid-Senior Level" },
  "location": { ... }, "department": { "label": "..." }, "company": { "name": "Visa" },
  "jobAd": { "sections": {
      "companyDescription":    { "title": "Company Description", "text": "<HTML>" },
      "jobDescription":        { "title": "Job Description", "text": "<HTML>" },
      "qualifications":        { "title": "Qualifications", "text": "<HTML>" },
      "additionalInformation": { "title": "Additional Information", "text": "<HTML>" }
  } }
}
```

The CLI concatenates the sections that exist, in order (companyDescription, jobDescription,
qualifications, additionalInformation), each as its title heading followed by the tag-stripped
text.

## Notes

- No authentication required for these GET endpoints.
- Section `text` values are HTML; the CLI decodes entities, converts block/line elements to
  newlines, and strips tags for the `plain`/description output.
- SmartRecruiters rarely exposes pay here, so `compensation` is left `null`.
- Respect rate limits — the CLI backs off on 429/5xx.
- Country-agnostic: the company identifier selects the company; roles can be in any country or
  remote.
