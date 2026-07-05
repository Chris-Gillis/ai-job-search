# remotive-cli

A self-contained CLI for searching **Remotive**, a global remote-job aggregator. No authentication,
no API key, and **zero runtime dependencies** — it runs with just [Bun](https://bun.sh).

Unlike a per-company ATS (Greenhouse, Ashby, Lever), Remotive is an **aggregator**: there is no
board token. The `--query` is a **server-side full-text search across every company**, and every
listing is remote by definition. See `../url-reference.md` for the endpoints.

> **Be ToS-friendly.** Remotive asks callers to hit the API only a few times per day and to credit
> Remotive as the source. This is a low-frequency discovery tool, not something to poll.

## Install

Optional — the CLI has no runtime dependencies. `bun install` only pulls TypeScript dev types:

```bash
bun install
```

## Usage

```bash
# Keyword search across all companies
bun run src/cli.ts search --query "software engineer" --limit 5 --format table

# Narrow by candidate location (client-side substring) and job type
bun run src/cli.ts search -q golang --location "USA" --job-type full_time --format table

# Latest remote jobs (no query) — defaults to a limit of 50
bun run src/cli.ts search --format table

# Full detail for one job
bun run src/cli.ts detail 1933887 --format plain
```

### Commands

- `search [--query] [--category] [--location] [--job-type] [--limit] [--format]`
- `detail <id> [--format json|plain]`

### Flags

| Flag | Alias | Meaning |
|------|-------|---------|
| `--query` | `-q` | Keywords — server-side full-text search across all companies. |
| `--category` | | Category slug, e.g. `software-dev` (server-side). |
| `--location` | `-l` | Substring filter on candidate-required location (client-side), e.g. `USA`, `Europe`. |
| `--job-type` | | `full_time` \| `contract` \| `freelance` \| `part_time` \| `internship` (client-side). |
| `--limit` | `-n` | Cap results (server-side; defaults to `50` to stay ToS-friendly). |
| `--format` | | `json` (default), `table`, or `plain`. |

There is **no `--board`** (aggregator) and **no `--remote`** (everything is remote).

## Output

`json` (default) wraps results as `{ "meta": { "count", "query", "category" }, "results": [...] }`.
Errors go to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Typecheck

```bash
bun run typecheck
```
