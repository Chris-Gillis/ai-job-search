# smartrecruiters-cli

A self-contained CLI for searching **SmartRecruiters public job boards**. No authentication, no
API key, and **zero runtime dependencies** — it runs with just [Bun](https://bun.sh).

SmartRecruiters is a multi-tenant ATS: every request targets one company's board via its
**company identifier** (case-sensitive, e.g. `Visa`). There is no global cross-company search, so
`--board` is required. Unlike some boards, SmartRecruiters supports server-side keyword search
(`q=`) and offset/limit pagination, which this CLI uses. See `../url-reference.md` for the
endpoints.

## Install

Optional — the CLI has no runtime dependencies. `bun install` only pulls TypeScript dev types:

```bash
bun install
```

## Usage

```bash
# Search a company's board
bun run src/cli.ts search --board Visa --query engineer --format table

# Search several boards, remote only, capped
bun run src/cli.ts search -b Visa,Square -q "software engineer" --remote --limit 10

# Full detail for one job (board required)
bun run src/cli.ts detail 744000133907678 --board Visa --format plain
```

### Commands

- `search --board <identifier[,identifier2,...]> [--query] [--location] [--department] [--remote] [--limit] [--format]`
- `detail <id> --board <identifier> [--format json|plain]`

### Flags

| Flag | Alias | Meaning |
|------|-------|---------|
| `--board` | `-b` | Company identifier(s), comma-separated (case-sensitive). **Required.** |
| `--query` | `-q` | Keywords — pushed **server-side** as a full-text search over the board's postings. |
| `--location` | `-l` | Location substring filter. |
| `--department` | | Department substring filter. |
| `--remote` | | Only roles whose location looks remote. |
| `--limit` | `-n` | Cap results emitted (client-side). |
| `--format` | | `json` (default), `table`, or `plain`. |

## Output

`json` (default) wraps results as `{ "meta": { "count", "boards" }, "results": [...] }`. Errors go
to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`. A board with more than
1000 postings is paged up to a safety cap and emits a `{ "warn": "...", "code": "TRUNCATED" }`
note to stderr.

## Typecheck

```bash
bun run typecheck
```
