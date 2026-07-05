---
name: smartrecruiters-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search a specific company's job
  openings on SmartRecruiters — the SmartRecruiters-hosted careers/job board of a
  named employer, in any country or remotely. SmartRecruiters is a multi-tenant
  ATS, so each request targets one company's board by its company identifier
  (case-sensitive, from jobs.smartrecruiters.com/<identifier>). Unlike some
  boards it supports server-side keyword search. Invoke for open roles at a given
  company across any sector (software, data, design, marketing, sales, finance,
  operations, etc.). Trigger phrases: smartrecruiters jobs, jobs at <company>,
  careers at <company>, <company> openings, does <company> have any X roles,
  jobs.smartrecruiters.com, ATS job board, look up this smartrecruiters job.
context: fork
allowed-tools: Bash(bun run skills/smartrecruiters-search/cli/src/cli.ts *)
---

# SmartRecruiters Search Skill

Search live job listings from **SmartRecruiters public job boards**. No authentication, no
API key, and **zero runtime dependencies** — it runs with just `bun`.

> SmartRecruiters is a **board-scoped** ATS. Unlike a job aggregator, there is **no global
> cross-company search**: every query targets one company's board via its **company identifier**.
> Pass the identifier(s) with `--board`. Unlike some boards, SmartRecruiters supports **server-side
> keyword search** (`--query` is pushed to the API) and **offset/limit pagination** (the CLI pages
> through the board for you).

## Finding a company's identifier

The company identifier is **case-sensitive**. Find it in the careers-page URL:

- `https://jobs.smartrecruiters.com/<identifier>` → identifier is the path segment after the host
- API calls use the same identifier in `api.smartrecruiters.com/v1/companies/<identifier>/postings`

Examples: `Visa`, `Square`. Note the case — `Visa` resolves, `visa` does not.

## When to use this skill

- List or search the open roles at a specific company (or several) that uses SmartRecruiters
- Filter those roles by keyword, location, department, or remote
- Get the full description of a specific SmartRecruiters job

## Commands

### Search job listings

```bash
bun run skills/smartrecruiters-search/cli/src/cli.ts search --board "<identifier>" [flags]
```

Key flags:
- `--board <identifier>` / `-b <identifier>` — **required.** One or more company identifiers,
  comma-separated (e.g. `-b Visa` or `-b Visa,Square`). Case-sensitive.
- `--query <text>` / `-q <text>` — keywords, run as a **server-side** full-text search over the board.
- `--location <text>` / `-l <text>` — location substring (e.g. `"Austin"`, `"United States"`).
- `--department <text>` — department substring (e.g. `"Engineering"`).
- `--remote` — only roles whose location looks remote.
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run skills/smartrecruiters-search/cli/src/cli.ts detail <id> --board "<identifier>" [--format json|plain]
```

`id` is the job ID from `search` results. `--board` is required (the same board the job belongs
to). Returns the full description (company description, job description, qualifications, and
additional information sections) and employment type.

## Usage examples

```bash
# Engineering roles at Visa
bun run skills/smartrecruiters-search/cli/src/cli.ts search -b Visa -q engineer --format table

# Software roles across two companies, remote only
bun run skills/smartrecruiters-search/cli/src/cli.ts search -b Visa,Square -q "software engineer" --remote --format table

# Full details for a specific job
bun run skills/smartrecruiters-search/cli/src/cli.ts detail 744000133907678 --board Visa --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from SmartRecruiters' public Posting API — no credentials required.
- No global search: a company identifier is mandatory, and it is **case-sensitive**. Passing
  several unknown identifiers skips them with a `BOARD_NOT_FOUND` warning; if none resolve, the
  command exits `1`.
- `--query` is a **server-side** keyword search; `--location`/`--department`/`--remote`/`--limit`
  are applied client-side.
- Big boards are paginated (offset/limit) and capped at a safety maximum of **1000 postings** per
  board. If a board is truncated at the cap, a `{ "warn": "...", "code": "TRUNCATED" }` note is
  printed to stderr so partial coverage is never mistaken for full coverage.
- SmartRecruiters may rate-limit; the CLI retries 429/5xx with exponential backoff.
