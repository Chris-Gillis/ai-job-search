#!/usr/bin/env bun
// Self-contained CLI for searching Ashby public job boards, for any company and
// any country. No authentication, no API key, and zero runtime dependencies, so
// it runs anywhere `bun` is available with nothing to install.
//
// Ashby is board-scoped: every request targets one company's board via its board
// name/slug (the last segment of jobs.ashbyhq.com/<board>, e.g. "Ashby"). There
// is no global cross-company search, so you must pass --board.

import { runSearch, type SearchOpts } from "./commands/search.js"
import { runDetail, type DetailOpts } from "./commands/detail.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  const alias: Record<string, string> = { b: "board", q: "query", l: "location", n: "limit" }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--") || a.startsWith("-")) {
      const key = alias[a.replace(/^-+/, "")] ?? a.replace(/^-+/, "")
      const next = argv[i + 1]
      if (next === undefined || next.startsWith("-")) {
        flags[key] = true
      } else {
        flags[key] = next
        i++
      }
    } else {
      ;(flags._ as string[]).push(a)
    }
  }
  return flags
}

const HELP = `ashby-cli — search Ashby public job boards (any company, any country)

USAGE
  bun run src/cli.ts search --board "<name[,name2,...]>" [flags]
  bun run src/cli.ts detail <id> --board "<name>" [--format json|plain]

SEARCH FLAGS
  --board, -b <name>      Board name/slug(s). REQUIRED. Comma-separate to search several
                          companies, e.g. "Ashby,Ramp". The slug is the last segment of the
                          careers URL jobs.ashbyhq.com/<name> (it can be case-sensitive).
  --query, -q <text>      Keywords (matched in title and department/team).
  --location, -l <text>   Location substring filter, e.g. "London", "United States".
  --department <text>     Department/team substring filter, e.g. "Engineering".
  --remote                Only roles Ashby marks remote (isRemote / workplaceType).
  --limit, -n <n>         Cap results emitted (client-side).
  --format <fmt>          json (default) | table | plain.

EXAMPLES
  bun run src/cli.ts search -b Ashby -q engineer --format table
  bun run src/cli.ts search -b Ashby,Ramp -q "software engineer" --remote --limit 10
  bun run src/cli.ts detail <uuid> --board Ashby --format plain

Posting data is public — no authentication required.
`

async function main(): Promise<number> {
  const argv = process.argv.slice(2)
  const flags = parseFlags(argv)
  const cmd = (flags._ as string[])[0]

  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP)
    return cmd ? 0 : 1
  }

  if (cmd === "search") {
    const board = typeof flags.board === "string" ? flags.board : undefined
    if (!board) {
      process.stderr.write(
        JSON.stringify({
          error: 'the --board/-b flag is required (an Ashby board name, e.g. -b Ashby; comma-separate for several)',
          code: "NO_BOARD",
        }) + "\n",
      )
      return 1
    }
    const fmt = (flags.format as string) || "json"
    const opts: SearchOpts = {
      board,
      query: typeof flags.query === "string" ? flags.query : undefined,
      location: typeof flags.location === "string" ? flags.location : undefined,
      department: typeof flags.department === "string" ? flags.department : undefined,
      remote: flags.remote === true || flags.remote === "true",
      limit: flags.limit ? parseInt(flags.limit as string, 10) : undefined,
      format: (["json", "table", "plain"].includes(fmt) ? fmt : "json") as SearchOpts["format"],
    }
    return runSearch(opts)
  }

  if (cmd === "detail") {
    const id = (flags._ as string[])[1]
    if (!id) {
      process.stderr.write(JSON.stringify({ error: "detail requires an <id>", code: "NO_ID" }) + "\n")
      return 1
    }
    const board = typeof flags.board === "string" ? flags.board : undefined
    if (!board) {
      process.stderr.write(
        JSON.stringify({ error: "the --board/-b flag is required for detail", code: "NO_BOARD" }) + "\n",
      )
      return 1
    }
    const fmt = (flags.format as string) || "json"
    const opts: DetailOpts = {
      board,
      id,
      format: (fmt === "plain" ? "plain" : "json") as DetailOpts["format"],
    }
    return runDetail(opts)
  }

  process.stderr.write(JSON.stringify({ error: `Unknown command "${cmd}"`, code: "BAD_CMD" }) + "\n")
  return 1
}

main().then((code) => process.exit(code))
