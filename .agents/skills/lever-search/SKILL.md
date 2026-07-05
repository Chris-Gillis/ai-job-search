---
name: lever-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search a specific company's job
  openings on Lever — the Lever-hosted careers/job board of a named employer, in
  any country or remotely. Lever is a multi-tenant ATS, so each request targets
  one company's board by its board token (usually the company name lowercased,
  the last path segment of jobs.lever.co/<board>). Invoke for open roles at a
  given company across any sector (software, data, design, marketing, sales,
  finance, operations, etc.). Trigger phrases: lever jobs, lever board,
  jobs.lever.co, jobs at <company>, careers at <company>, <company> openings,
  does <company> have any X roles, ATS job board, look up this lever job.
context: fork
allowed-tools: Bash(bun run skills/lever-search/cli/src/cli.ts *)
---

# Lever Search Skill

Search live job listings from **Lever public job boards**. No authentication, no
API key, and **zero runtime dependencies** — it runs with just `bun`.

> Lever is a **board-scoped** ATS. Unlike a job aggregator, there is **no global
> cross-company search**: every query targets one company's board via its **board token**.
> Pass the token(s) with `--board`. The tool fetches the whole board and filters
> client-side (the API has no server-side keyword filter or pagination).

## Finding a company's board token

The board token is usually the company name lowercased. It is the **last path segment** of
the careers-page URL:

- `https://jobs.lever.co/<token>` → token is the last path segment
- Individual postings live at `https://jobs.lever.co/<token>/<posting-id>`
- The public API uses the same token in `api.lever.co/v0/postings/<token>`

Examples: `spotify`, `aledade`, `netlify`, `plaid`.

## When to use this skill

- List or search the open roles at a specific company (or several) that uses Lever
- Filter those roles by keyword, location, department, or remote
- Get the full description (and pay range, when published) of a specific Lever job

## Commands

### Search job listings

```bash
bun run skills/lever-search/cli/src/cli.ts search --board "<token>" [flags]
```

Key flags:
- `--board <token>` / `-b <token>` — **required.** One or more board tokens, comma-separated
  (e.g. `-b spotify` or `-b spotify,aledade`).
- `--query <text>` / `-q <text>` — keywords, matched in job title and department (all tokens must appear).
- `--location <text>` / `-l <text>` — location substring (e.g. `"London"`, `"United States"`).
- `--department <text>` — department substring (e.g. `"Engineering"`).
- `--remote` — only roles whose location/workplace looks remote.
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run skills/lever-search/cli/src/cli.ts detail <id> --board "<token>" [--format json|plain]
```

`id` is the posting UUID from `search` results. `--board` is required (the same board the
job belongs to). Returns the full description and, when the company publishes it, the pay range.

## Usage examples

```bash
# Engineering roles at Spotify
bun run skills/lever-search/cli/src/cli.ts search -b spotify -q engineer --format table

# Software roles across two companies, remote only
bun run skills/lever-search/cli/src/cli.ts search -b spotify,aledade -q "software engineer" --remote --format table

# Full details for a specific job
bun run skills/lever-search/cli/src/cli.ts detail 66acb66f-0000-0000-0000-000000000000 --board spotify --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from Lever's public Postings API — no credentials required.
- No global search: a board token is mandatory. Passing several unknown tokens skips them with a
  `BOARD_NOT_FOUND` warning; if none resolve, the command exits `1`.
- There is no server-side keyword search or pagination; a board returns all its jobs at once and
  the CLI filters locally, so `--query`/`--location`/`--department`/`--remote` are client-side.
- Lever may rate-limit; the CLI retries 429/5xx with exponential backoff.
