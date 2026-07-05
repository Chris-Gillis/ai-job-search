# greenhouse-cli

A self-contained CLI for searching **Greenhouse public job boards**. No authentication, no API
key, and **zero runtime dependencies** — it runs with just [Bun](https://bun.sh).

Greenhouse is a multi-tenant ATS: every request targets one company's board via its **board
token** (usually the company name lowercased, e.g. `stripe`). There is no global cross-company
search, so `--board` is required. See `../url-reference.md` for the endpoints.

## Install

Optional — the CLI has no runtime dependencies. `bun install` only pulls TypeScript dev types:

```bash
bun install
```

## Usage

```bash
# Search a company's board
bun run src/cli.ts search --board stripe --query engineer --format table

# Search several boards, remote only, capped
bun run src/cli.ts search -b stripe,figma -q "software engineer" --remote --limit 10

# Full detail for one job (board required)
bun run src/cli.ts detail 6317879 --board stripe --format plain
```

### Commands

- `search --board <token[,token2,...]> [--query] [--location] [--department] [--remote] [--limit] [--format]`
- `detail <id> --board <token> [--format json|plain]`

### Flags

| Flag | Alias | Meaning |
|------|-------|---------|
| `--board` | `-b` | Board token(s), comma-separated. **Required.** |
| `--query` | `-q` | Keywords — matched in job title and department (all tokens must appear). |
| `--location` | `-l` | Location substring filter. |
| `--department` | | Department substring filter. |
| `--remote` | | Only roles whose location/office looks remote. |
| `--limit` | `-n` | Cap results emitted (client-side). |
| `--format` | | `json` (default), `table`, or `plain`. |

## Output

`json` (default) wraps results as `{ "meta": { "count", "boards" }, "results": [...] }`. Errors go
to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Typecheck

```bash
bun run typecheck
```
