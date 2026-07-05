# ashby-cli

A self-contained CLI for searching **Ashby (AshbyHQ) public job boards**. No authentication, no
API key, and **zero runtime dependencies** — it runs with just [Bun](https://bun.sh).

Ashby is a multi-tenant ATS: every request targets one company's board via its **board name/slug**
(the last segment of `jobs.ashbyhq.com/<name>`, e.g. `Ashby` — can be case-sensitive). There is no
global cross-company search, so `--board` is required. See `../url-reference.md` for the endpoint.

## Install

Optional — the CLI has no runtime dependencies. `bun install` only pulls TypeScript dev types:

```bash
bun install
```

## Usage

```bash
# Search a company's board
bun run src/cli.ts search --board Ashby --query engineer --format table

# Search several boards, remote only, capped
bun run src/cli.ts search -b Ashby,Ramp -q "software engineer" --remote --limit 10

# Full detail for one job (board required)
bun run src/cli.ts detail <uuid> --board Ashby --format plain
```

### Commands

- `search --board <name[,name2,...]> [--query] [--location] [--department] [--remote] [--limit] [--format]`
- `detail <id> --board <name> [--format json|plain]`

### Flags

| Flag | Alias | Meaning |
|------|-------|---------|
| `--board` | `-b` | Board name/slug(s), comma-separated. **Required.** |
| `--query` | `-q` | Keywords — matched in job title and department/team (all tokens must appear). |
| `--location` | `-l` | Location substring filter (primary + secondary locations). |
| `--department` | | Department/team substring filter. |
| `--remote` | | Only roles Ashby marks remote. |
| `--limit` | `-n` | Cap results emitted (client-side). |
| `--format` | | `json` (default), `table`, or `plain`. |

## Output

`json` (default) wraps results as `{ "meta": { "count", "boards" }, "results": [...] }`. Errors go
to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

Ashby has no single-posting endpoint, so `detail` re-fetches the board and locates the posting by
its UUID (descriptions are included inline in the board response).

## Typecheck

```bash
bun run typecheck
```
