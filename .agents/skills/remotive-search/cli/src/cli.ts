#!/usr/bin/env bun
// Self-contained CLI for searching Remotive, a global remote-job aggregator. No
// authentication, no API key, and zero runtime dependencies, so it runs anywhere
// `bun` is available with nothing to install.
//
// Remotive is an aggregator, not a per-company ATS: there is no board token. The
// `search` query is a server-side full-text search across every company, and
// every listing is remote by definition. Please be ToS-friendly — Remotive asks
// callers to hit the endpoint only a few times per day and to credit Remotive.

import { runSearch, type SearchOpts } from "./commands/search.js"
import { runDetail, type DetailOpts } from "./commands/detail.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  const alias: Record<string, string> = { q: "query", l: "location", n: "limit" }
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

const HELP = `remotive-cli — search Remotive, a global remote-job aggregator (every listing is remote)

USAGE
  bun run src/cli.ts search [--query "<text>"] [flags]
  bun run src/cli.ts detail <id> [--format json|plain]

SEARCH FLAGS
  --query, -q <text>      Keywords — server-side full-text search across all companies.
  --category <slug>       Category slug, e.g. "software-dev" (server-side).
  --location, -l <text>   Substring filter on candidate-required location, e.g. "USA",
                          "Europe", "Worldwide" (client-side).
  --job-type <type>       full_time | contract | freelance | part_time | internship
                          (client-side filter on job_type).
  --limit, -n <n>         Cap results (server-side; defaults to 50 to stay ToS-friendly).
  --format <fmt>          json (default) | table | plain.

EXAMPLES
  bun run src/cli.ts search -q "software engineer" --limit 5 --format table
  bun run src/cli.ts search -q golang --location "USA" --limit 5 --format table
  bun run src/cli.ts search -q backend --category software-dev --job-type full_time
  bun run src/cli.ts detail 1933887 --format plain

Data is from Remotive's public API — no authentication required. Be ToS-friendly:
call it only a few times per day and credit Remotive as the source.
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
    const fmt = (flags.format as string) || "json"
    const opts: SearchOpts = {
      query: typeof flags.query === "string" ? flags.query : undefined,
      category: typeof flags.category === "string" ? flags.category : undefined,
      location: typeof flags.location === "string" ? flags.location : undefined,
      jobType: typeof flags["job-type"] === "string" ? (flags["job-type"] as string) : undefined,
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
    const fmt = (flags.format as string) || "json"
    const opts: DetailOpts = {
      id,
      format: (fmt === "plain" ? "plain" : "json") as DetailOpts["format"],
    }
    return runDetail(opts)
  }

  process.stderr.write(JSON.stringify({ error: `Unknown command "${cmd}"`, code: "BAD_CMD" }) + "\n")
  return 1
}

main().then((code) => process.exit(code))
