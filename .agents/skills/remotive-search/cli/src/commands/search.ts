import { BASE_URL, apiFetch, writeError, type Job } from "../helpers.js"

export interface SearchOpts {
  query?: string
  category?: string
  location?: string
  jobType?: string
  limit?: number
  format: "json" | "table" | "plain"
}

export interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name?: string
  company_logo?: string
  category?: string
  tags?: string[]
  job_type?: string
  publication_date?: string
  candidate_required_location?: string
  salary?: string
  description?: string
}

interface RemotiveList {
  "job-count"?: number
  "total-job-count"?: number
  jobs: RemotiveJob[]
}

export function normalizeRemotive(j: RemotiveJob): Job {
  return {
    id: String(j.id),
    title: j.title,
    company: j.company_name ?? null,
    location: j.candidate_required_location ?? null,
    remote: true,
    department: j.category ?? null,
    url: j.url,
    applyUrl: j.url,
    updatedAt: j.publication_date ?? null,
    board: "remotive",
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
    // Remotive is an aggregator: one server-side call does the full-text search
    // across every company. `search`, `category`, and `limit` are server params.
    const params = new URLSearchParams()
    if (opts.query) params.set("search", opts.query)
    if (opts.category) params.set("category", opts.category)
    // Default to a sane cap even when the user passes no --limit, to stay
    // ToS-friendly (Remotive asks for only a few calls per day).
    params.set("limit", String(opts.limit && opts.limit > 0 ? opts.limit : 50))

    const url = `${BASE_URL}?${params.toString()}`
    const data = await apiFetch<RemotiveList>(url)
    if (data === null) {
      writeError("Remotive returned no data (404)", "NOT_FOUND")
      return 1
    }

    let results: Job[] = []
    for (const raw of data.jobs ?? []) {
      const job = normalizeRemotive(raw)
      // Client-side filters: the server has no location or job_type params.
      if (
        opts.location &&
        !(job.location ?? "").toLowerCase().includes(opts.location.toLowerCase())
      )
        continue
      if (
        opts.jobType &&
        (raw.job_type ?? "").toLowerCase() !== opts.jobType.toLowerCase()
      )
        continue
      results.push(job)
    }

    // Server `limit` already caps the feed, but re-apply after client filters.
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
        JSON.stringify(
          {
            meta: {
              count: results.length,
              query: opts.query ?? null,
              category: opts.category ?? null,
            },
            results,
          },
          null,
          2,
        ) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
