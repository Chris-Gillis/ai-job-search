import { BASE_URL, apiFetch, matchesQuery, writeError, type Job } from "../helpers.js"

export interface SearchOpts {
  board: string // one or more board names, comma-separated
  query?: string
  location?: string
  department?: string
  remote: boolean
  limit?: number
  format: "json" | "table" | "plain"
}

export interface AshbyJob {
  id: string
  title: string
  department?: string
  team?: string
  location?: string
  secondaryLocations?: { location?: string }[]
  employmentType?: string
  isRemote?: boolean
  isListed?: boolean
  workplaceType?: string
  publishedAt?: string
  jobUrl?: string
  applyUrl?: string
  descriptionHtml?: string
  descriptionPlain?: string
  compensation?: {
    compensationTierSummary?: string
    scrapeableCompensationSalarySummary?: string
  }
}

interface AshbyList {
  jobs: AshbyJob[]
}

/** All location strings for a posting (primary + secondary), for filtering. */
export function locationHaystack(j: AshbyJob): string {
  const secondary = (j.secondaryLocations ?? []).map((s) => s.location).filter(Boolean)
  return [j.location, ...secondary].filter(Boolean).join(", ")
}

export function normalizeAshby(j: AshbyJob, board: string): Job {
  const department = [j.department, j.team].filter(Boolean).join(" / ") || null
  const remote =
    Boolean(j.isRemote) ||
    /remote/i.test(j.workplaceType ?? "") ||
    /remote/i.test(locationHaystack(j))
  return {
    id: j.id,
    title: j.title,
    company: board,
    location: j.location ?? null,
    remote,
    department,
    url: j.jobUrl ?? "",
    applyUrl: j.applyUrl ?? j.jobUrl ?? null,
    updatedAt: j.publishedAt ?? null,
    board,
  }
}

function renderTable(jobs: Job[]): string {
  if (jobs.length === 0) return "No results."
  const rows = jobs.map((j) => {
    const id = j.id.slice(0, 36).padEnd(36)
    const title = (j.title || "").slice(0, 36).padEnd(36)
    const loc = (j.location || (j.remote ? "Remote" : "—")).slice(0, 24)
    return `${id} ${title} ${loc}`
  })
  const header = "ID".padEnd(36) + " " + "TITLE".padEnd(36) + " LOCATION"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const boards = opts.board.split(",").map((b) => b.trim()).filter(Boolean)
    const all: Job[] = []
    let resolved = 0

    for (const board of boards) {
      const url = `${BASE_URL}/${encodeURIComponent(board)}?includeCompensation=true`
      const data = await apiFetch<AshbyList>(url)
      if (data === null) {
        writeError(`Unknown Ashby board: "${board}" (skipped)`, "BOARD_NOT_FOUND")
        continue
      }
      resolved++

      for (const raw of data.jobs ?? []) {
        if (raw.isListed === false) continue
        const job = normalizeAshby(raw, board)
        // Match the query against title + department/team only (predictable keyword search).
        if (!matchesQuery(`${job.title} ${job.department ?? ""}`, opts.query)) continue
        if (
          opts.location &&
          !locationHaystack(raw).toLowerCase().includes(opts.location.toLowerCase())
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
