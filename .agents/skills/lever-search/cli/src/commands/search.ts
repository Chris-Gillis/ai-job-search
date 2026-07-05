import { BASE_URL, apiFetch, matchesQuery, writeError, type Job } from "../helpers.js"

export interface SearchOpts {
  board: string // one or more board tokens, comma-separated
  query?: string
  location?: string
  department?: string
  remote: boolean
  limit?: number
  format: "json" | "table" | "plain"
}

export interface LeverPosting {
  id: string
  text: string
  categories?: {
    commitment?: string
    department?: string
    team?: string
    location?: string
    allLocations?: string[]
  } | null
  workplaceType?: string
  country?: string
  createdAt?: number
  hostedUrl?: string
  applyUrl?: string
  descriptionPlain?: string
  description?: string
  additionalPlain?: string
  additional?: string
  lists?: { text?: string; content?: string }[]
  salaryRange?: {
    min?: number | null
    max?: number | null
    currency?: string
    interval?: string
  } | null
}

export function normalizeLever(j: LeverPosting, board: string): Job {
  const location =
    j.categories?.location ?? ((j.categories?.allLocations ?? []).join(", ") || null)
  const remote = j.workplaceType === "remote" || /remote/i.test(location ?? "")
  const department =
    [j.categories?.department, j.categories?.team].filter(Boolean).join(" — ") || null
  return {
    id: j.id,
    title: j.text,
    company: board,
    location,
    remote,
    department,
    url: j.hostedUrl ?? "",
    applyUrl: j.applyUrl ?? j.hostedUrl ?? null,
    updatedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
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
    const all: Job[] = []
    let resolved = 0

    for (const board of boards) {
      const url = `${BASE_URL}/${encodeURIComponent(board)}?mode=json`
      const data = await apiFetch<LeverPosting[]>(url)
      if (data === null) {
        writeError(`Unknown Lever board token: "${board}" (skipped)`, "BOARD_NOT_FOUND")
        continue
      }
      resolved++

      for (const raw of data ?? []) {
        const job = normalizeLever(raw, board)
        // Match the query against title + department only. Matching the full
        // description over-matches badly on a big company's board (e.g. "engineer"
        // hits nearly every posting), so keep keyword search predictable.
        if (!matchesQuery(`${job.title} ${job.department ?? ""}`, opts.query)) continue
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
