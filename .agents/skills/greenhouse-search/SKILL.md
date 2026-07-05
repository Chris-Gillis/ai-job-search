---
name: greenhouse-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search a specific company's job
  openings on Greenhouse — the Greenhouse-hosted careers/job board of a named
  employer, in any country or remotely. Greenhouse is a multi-tenant ATS, so
  each request targets one company's board by its board token (usually the
  company name lowercased). Invoke for open roles at a given company across any
  sector (software, data, design, marketing, sales, finance, operations, etc.).
  Trigger phrases: greenhouse jobs, greenhouse board, jobs at <company>, careers
  at <company>, <company> openings, does <company> have any X roles, job-boards
  .greenhouse.io, boards.greenhouse.io, ATS job board, look up this greenhouse job.
context: fork
allowed-tools: Bash(bun run skills/greenhouse-search/cli/src/cli.ts *)
---

# Greenhouse Search Skill

Search live job listings from **Greenhouse public job boards**. No authentication, no
API key, and **zero runtime dependencies** — it runs with just `bun`.

> Greenhouse is a **board-scoped** ATS. Unlike a job aggregator, there is **no global
> cross-company search**: every query targets one company's board via its **board token**.
> Pass the token(s) with `--board`. The tool fetches the whole board and filters
> client-side (the API has no server-side keyword filter or pagination).

## Finding a company's board token

The board token is usually the company name lowercased. Find it in the careers-page URL:

- `https://job-boards.greenhouse.io/<token>` → token is the last path segment
- `https://boards.greenhouse.io/<token>` → same
- Embedded boards use the same token in `boards-api.greenhouse.io/v1/boards/<token>/jobs`

Examples: `stripe`, `figma`, `anthropic`, `databricks`.

## When to use this skill

- List or search the open roles at a specific company (or several) that uses Greenhouse
- Filter those roles by keyword, location, department, or remote
- Get the full description (and pay range, when published) of a specific Greenhouse job

## Commands

### Search job listings

```bash
bun run skills/greenhouse-search/cli/src/cli.ts search --board "<token>" [flags]
```

Key flags:
- `--board <token>` / `-b <token>` — **required.** One or more board tokens, comma-separated
  (e.g. `-b stripe` or `-b stripe,figma`).
- `--query <text>` / `-q <text>` — keywords, matched in job title and department (all tokens must appear).
- `--location <text>` / `-l <text>` — location substring (e.g. `"London"`, `"United States"`).
- `--department <text>` — department substring (e.g. `"Engineering"`).
- `--remote` — only roles whose location/office looks remote.
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run skills/greenhouse-search/cli/src/cli.ts detail <id> --board "<token>" [--format json|plain]
```

`id` is the numeric job ID from `search` results. `--board` is required (the same board the
job belongs to). Returns the full description and, when the company publishes it, the pay range.

## Usage examples

```bash
# Engineering roles at Stripe
bun run skills/greenhouse-search/cli/src/cli.ts search -b stripe -q engineer --format table

# Software roles across two companies, remote only
bun run skills/greenhouse-search/cli/src/cli.ts search -b stripe,figma -q "software engineer" --remote --format table

# Full details for a specific job
bun run skills/greenhouse-search/cli/src/cli.ts detail 6317879 --board stripe --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from Greenhouse's public Job Board API — no credentials required.
- No global search: a board token is mandatory. Passing several unknown tokens skips them with a
  `BOARD_NOT_FOUND` warning; if none resolve, the command exits `1`.
- There is no server-side keyword search or pagination; a board returns all its jobs at once and
  the CLI filters locally, so `--query`/`--location`/`--department`/`--remote` are client-side.
- Greenhouse may rate-limit; the CLI retries 429/5xx with exponential backoff.
