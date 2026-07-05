---
name: remotive-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to discover fully-remote job openings
  across many companies at once — Remotive is a global remote-job aggregator with
  server-side keyword search, so there is no per-company board: one query searches
  every company and every listing is remote by definition. Invoke to find remote
  roles by keyword, category, candidate location, or job type, in any sector
  (software, data, design, marketing, sales, support, finance, operations, etc.).
  Trigger phrases: remotive, remote jobs, remote job search, find remote roles,
  fully remote <role> jobs, work from home jobs, remote-only positions, remotive.com.
context: fork
allowed-tools: Bash(bun run skills/remotive-search/cli/src/cli.ts *)
---

# Remotive Search Skill

Search live, fully-remote job listings from **Remotive**, a global remote-job aggregator. No
authentication, no API key, and **zero runtime dependencies** — it runs with just `bun`.

> Remotive is an **aggregator**, not a board-scoped ATS. Unlike greenhouse-search, ashby-search,
> or lever-search — which each target one company's board via a token — Remotive has **no
> `--board`**. The `--query` is a **server-side full-text search across every company**, and every
> listing is remote by definition (so there is no `--remote` flag either).

## ⚠️ Be ToS-friendly

Remotive asks callers to hit its API **only a few times per day** and to **credit Remotive as the
source**. Treat this as a low-frequency discovery tool, not something to poll. The CLI backs off on
429/5xx and, even with no `--limit`, caps `search` at 50 and `detail` at a single 1000-item call.

## When to use this skill

- Discover fully-remote roles across many companies at once, filtered by keyword or category
- Narrow remote results by candidate-required location (e.g. `USA`, `Europe`, `Worldwide`) or job type
- Get the full description (and salary, when published) of a specific Remotive job

## Commands

### Search job listings

```bash
bun run skills/remotive-search/cli/src/cli.ts search [--query "<text>"] [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keywords, a **server-side** full-text search across all companies.
- `--category <slug>` — server-side category slug (e.g. `software-dev`).
- `--location <text>` / `-l <text>` — **client-side** substring on candidate-required location
  (e.g. `"USA"`, `"Europe"`, `"Worldwide"`).
- `--job-type <type>` — **client-side** filter: `full_time`, `contract`, `freelance`, `part_time`, `internship`.
- `--limit <n>` / `-n <n>` — cap results (server-side; **defaults to 50** to stay ToS-friendly).
- `--format json|table|plain` — default `json`.

Running `search` with no flags is allowed — it returns the latest remote jobs (capped at 50).

### Fetch full job detail

```bash
bun run skills/remotive-search/cli/src/cli.ts detail <id> [--format json|plain]
```

`id` is the numeric job ID from `search` results. Remotive has no single-job endpoint, so `detail`
re-fetches the feed once and locates the job by id; an unknown id returns `NOT_FOUND` and exit `1`.
Descriptions are included inline, so no extra call is made. Returns the full description, employment
type, and salary (when the company publishes it).

## Usage examples

```bash
# Software engineering roles, remote
bun run skills/remotive-search/cli/src/cli.ts search -q "software engineer" --limit 5 --format table

# Go roles limited to US-eligible candidates
bun run skills/remotive-search/cli/src/cli.ts search -q golang --location "USA" --limit 5 --format table

# Full-time backend roles in the software-dev category
bun run skills/remotive-search/cli/src/cli.ts search -q backend --category software-dev --job-type full_time --format table

# Full details for a specific job
bun run skills/remotive-search/cli/src/cli.ts detail 1933887 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

`json` search output wraps results as `{ "meta": { "count", "query", "category" }, "results": [...] }`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from Remotive's public Remote Jobs API — no credentials required. **Credit Remotive** as the source.
- Aggregator, not board-scoped: **no `--board`**, and every listing is remote so there is **no `--remote`**.
- `--query` and `--category` are server-side; `--location` and `--job-type` are applied client-side.
- **Call sparingly** — a few times per day (Remotive ToS). Do not poll or loop over the API.
- Remotive may rate-limit; the CLI retries 429/5xx with exponential backoff.
