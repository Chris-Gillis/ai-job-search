---
name: ashby-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search a specific company's job
  openings on Ashby (AshbyHQ) — the Ashby-hosted careers/job board of a named
  employer, in any country or remotely. Ashby is a multi-tenant ATS, so each
  request targets one company's board by its board name/slug (the last segment of
  jobs.ashbyhq.com/<board>). Invoke for open roles at a given company across any
  sector (software, data, design, marketing, sales, finance, operations, etc.).
  Trigger phrases: ashby jobs, ashbyhq, ashby board, jobs at <company>, careers at
  <company>, <company> openings, does <company> have any X roles, jobs.ashbyhq.com,
  ATS job board, look up this ashby job.
context: fork
allowed-tools: Bash(bun run skills/ashby-search/cli/src/cli.ts *)
---

# Ashby Search Skill

Search live job listings from **Ashby (AshbyHQ) public job boards**. No authentication, no
API key, and **zero runtime dependencies** — it runs with just `bun`.

> Ashby is a **board-scoped** ATS. Unlike a job aggregator, there is **no global cross-company
> search**: every query targets one company's board via its **board name/slug**. Pass the
> name(s) with `--board`. The tool fetches the whole board (descriptions included) and filters
> client-side (the API has no server-side keyword filter or pagination).

## Finding a company's board name

The board name/slug is the last segment of the Ashby careers URL:

- `https://jobs.ashbyhq.com/<board>` → the board name is that segment

It can be **case-sensitive** (e.g. `Ashby`, `Ramp`, `Notion`). Use it exactly as it appears in the URL.

## When to use this skill

- List or search the open roles at a specific company (or several) that uses Ashby
- Filter those roles by keyword, location, department/team, or remote
- Get the full description (and pay range, when published) of a specific Ashby job

## Commands

### Search job listings

```bash
bun run skills/ashby-search/cli/src/cli.ts search --board "<name>" [flags]
```

Key flags:
- `--board <name>` / `-b <name>` — **required.** One or more board names, comma-separated
  (e.g. `-b Ashby` or `-b Ashby,Ramp`).
- `--query <text>` / `-q <text>` — keywords, matched in job title and department/team.
- `--location <text>` / `-l <text>` — location substring (matches primary + secondary locations).
- `--department <text>` — department/team substring (e.g. `"Engineering"`).
- `--remote` — only roles Ashby marks remote (`isRemote` / `workplaceType`).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run skills/ashby-search/cli/src/cli.ts detail <id> --board "<name>" [--format json|plain]
```

`id` is the UUID from `search` results. `--board` is required (the same board the job belongs to).
Ashby has no single-posting endpoint, so `detail` re-fetches the board and locates the posting by
its UUID. Returns the full description, employment type, and pay range where published.

## Usage examples

```bash
# Engineering roles at Ashby
bun run skills/ashby-search/cli/src/cli.ts search -b Ashby -q engineer --format table

# Software roles across two companies, remote only
bun run skills/ashby-search/cli/src/cli.ts search -b Ashby,Ramp -q "software engineer" --remote --format table

# Full details for a specific job
bun run skills/ashby-search/cli/src/cli.ts detail <uuid> --board Ashby --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from Ashby's public posting API — no credentials required.
- No global search: a board name is mandatory. Passing several unknown names skips them with a
  `BOARD_NOT_FOUND` warning; if none resolve, the command exits `1`.
- There is no server-side keyword search or pagination; a board returns all its listed jobs at
  once and the CLI filters locally, so `--query`/`--location`/`--department`/`--remote` are client-side.
- Descriptions are included in the board response, so `detail` needs no extra network call beyond
  re-fetching the board.
- Ashby may rate-limit; the CLI retries 429/5xx with exponential backoff.
