import { BASE_URL, apiFetch, stripHtml, writeError, type JobDetail } from "../helpers.js"
import { normalizeRemotive, type RemotiveJob } from "./search.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

interface RemotiveList {
  jobs: RemotiveJob[]
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    // Remotive has no single-job endpoint, so fetch the feed once (a large cap
    // in a single ToS-friendly call) and locate the posting by its id.
    const url = `${BASE_URL}?limit=1000`
    const data = await apiFetch<RemotiveList>(url)
    if (data === null) {
      writeError("Remotive returned no data (404)", "NOT_FOUND")
      return 1
    }
    const raw = (data.jobs ?? []).find((x) => String(x.id) === opts.id)
    if (!raw) {
      writeError(`Job "${opts.id}" not found on Remotive`, "NOT_FOUND")
      return 1
    }
    const base = normalizeRemotive(raw)
    const detail: JobDetail = {
      ...base,
      description: raw.description ? stripHtml(raw.description) : null,
      employmentType: raw.job_type ?? null,
      compensation: raw.salary || null,
    }

    if (opts.format === "plain") {
      const lines = [
        detail.title,
        `${detail.company || detail.board} · ${detail.location || (detail.remote ? "Remote" : "—")}`,
        "",
        detail.department ? `Department: ${detail.department}` : "",
        detail.employmentType ? `Employment: ${detail.employmentType}` : "",
        detail.compensation ? `Compensation: ${detail.compensation}` : "",
        "",
        detail.description || "(no description)",
        "",
        `URL: ${detail.url}`,
        detail.applyUrl ? `Apply: ${detail.applyUrl}` : "",
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(detail, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
