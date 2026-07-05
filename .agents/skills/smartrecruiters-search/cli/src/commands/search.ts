import { BASE_URL, apiFetch, matchesQuery, writeError, type Job } from "../helpers.js"

export interface SearchOpts {
  board: string // one or more company identifiers, comma-separated
  query?: string
  location?: string
  department?: string
  remote: boolean
  limit?: number
  format: "json" | "table" | "plain"
}

interface SrPosting {
  id: string
  name: string
  company?: { identifier?: string; name?: string } | null
  releasedDate?: string
  location?: {
    city?: string
    region?: string
    country?: string
    remote?: boolean
    hybrid?: boolean
    fullLocation?: string
  } | null
  department?: { label?: string } | null
}

interface SrList {
  offset: number
  limit: number
  totalFound: number
  content: SrPosting[]
}

const PAGE_SIZE = 100
const MAX_PAGES = 10 // safety cap: 1000 postings per board

export function normalizeSr(p: SrPosting, board: string): Job {
  const location =
    p.location?.fullLocation ??
    ([p.location?.city, p.location?.region, p.location?.country].filter(Boolean).join(", ") || null)
  const remote =
    p.location?.remote === true || (p.location?.hybrid !== true && /remote/i.test(location ?? ""))
  return {
    id: p.id,
    title: p.name,
    company: p.company?.name ?? board,
    location,
    remote,
    department: p.department?.label ?? null,
    url: `https://jobs.smartrecruiters.com/${encodeURIComponent(board)}/${p.id}`,
    applyUrl: `https://jobs.smartrecruiters.com/${encodeURIComponent(board)}/${p.id}`,
    updatedAt: p.releasedDate ?? null,
    board,
  }
}

function renderTable(jobs: Job[]): string {
  if (jobs.length === 0) return "No results."
  const rows = jobs.map((j) => {
    const id = j.id.slice(0, 9).padEnd(9)
    const title = (j.title || "").slice(0, 40).padEnd(40)
    const company = (j.company || j.board || "—").slice(0, 20).padEnd(20)
    const loc = (j.location || (j.remote ? "Remote" : "—")).slice(0, 26)
    return `${id} ${title} ${company} ${loc}`
  })
  const header =
    "ID".padEnd(9) + " " + "TITLE".padEnd(40) + " " + "COMPANY".padEnd(20) + " LOCATION"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const boards = opts.board.split(",").map((b) => b.trim()).filter(Boolean)
    // When a query is given, push it server-side (q=). The server has then
    // already filtered by keyword, so we skip the client-side keyword re-match.
    const usedServerQuery = Boolean(opts.query)
    const all: Job[] = []
    let resolved = 0

    for (const board of boards) {
      // Existence probe. The list endpoint returns HTTP 200 with an empty
      // content array (not a 404) for an unknown company, so a missing board is
      // detected here by an empty unfiltered result. Probe WITHOUT the query so
      // a real board that simply has no keyword matches is never mistaken for a
      // missing board. This first unfiltered page is reused below when there is
      // no query, so it costs an extra request only when --query is set.
      const probeUrl = `${BASE_URL}/${encodeURIComponent(board)}/postings?limit=${PAGE_SIZE}&offset=0`
      const probe = await apiFetch<SrList>(probeUrl)
      if (
        probe === null ||
        ((probe.totalFound ?? 0) === 0 && (probe.content?.length ?? 0) === 0)
      ) {
        writeError(
          `Unknown or empty SmartRecruiters company identifier: "${board}" (skipped)`,
          "BOARD_NOT_FOUND",
        )
        continue
      }
      resolved++

      let offset = 0
      let page = 0
      let totalFound = 0

      while (page < MAX_PAGES) {
        // Reuse the unfiltered probe as the first page when there is no query.
        let data: SrList | null
        if (!opts.query && offset === 0) {
          data = probe
        } else {
          const params = new URLSearchParams({
            limit: String(PAGE_SIZE),
            offset: String(offset),
          })
          if (opts.query) params.set("q", opts.query)
          data = await apiFetch<SrList>(
            `${BASE_URL}/${encodeURIComponent(board)}/postings?${params.toString()}`,
          )
        }
        if (data === null) break
        totalFound = data.totalFound ?? totalFound

        const content = data.content ?? []
        for (const raw of content) {
          const job = normalizeSr(raw, board)
          // If the query was not pushed server-side, match it here against the
          // title + department only (matching a full description over-matches
          // badly on a big company's board). With server q= we skip this.
          if (!usedServerQuery && !matchesQuery(`${job.title} ${job.department ?? ""}`, opts.query))
            continue
          if (
            opts.location &&
            !(job.location ?? "").toLowerCase().includes(opts.location.toLowerCase())
          )
            continue
          if (opts.remote && !job.remote) continue
          if (
            opts.department &&
            !(job.department ?? "").toLowerCase().includes(opts.department.toLowerCase())
          )
            continue
          all.push(job)
        }

        if (content.length < PAGE_SIZE) break
        offset += PAGE_SIZE
        page++
      }

      // Hit the safety cap while more postings remained: warn, don't pretend
      // full coverage.
      if (page >= MAX_PAGES && totalFound > MAX_PAGES * PAGE_SIZE) {
        process.stderr.write(
          JSON.stringify({
            warn: `result set truncated at ${MAX_PAGES * PAGE_SIZE} postings (board "${board}" has ${totalFound})`,
            code: "TRUNCATED",
          }) + "\n",
        )
      }
    }

    if (resolved === 0) return 1

    let results = all
    if (opts.limit && opts.limit > 0) results = results.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(results) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        results
          .map(
            (j) =>
              `${j.title}\n  ${j.company || j.board} · ${j.location || (j.remote ? "Remote" : "—")}\n  id: ${j.id}\n  ${j.url}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify({ meta: { count: results.length, boards }, results }, null, 2) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
