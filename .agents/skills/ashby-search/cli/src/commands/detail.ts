import { BASE_URL, apiFetch, stripHtml, writeError, type JobDetail } from "../helpers.js"
import { normalizeAshby, type AshbyJob } from "./search.js"

export interface DetailOpts {
  board: string
  id: string
  format: "json" | "plain"
}

interface AshbyList {
  jobs: AshbyJob[]
}

function ashbyComp(c?: AshbyJob["compensation"]): string | null {
  if (!c) return null
  return c.compensationTierSummary || c.scrapeableCompensationSalarySummary || null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    // Ashby's public posting API has no single-posting endpoint, so fetch the
    // board and locate the posting by its UUID.
    const url = `${BASE_URL}/${encodeURIComponent(opts.board)}?includeCompensation=true`
    const data = await apiFetch<AshbyList>(url)
    if (data === null) {
      writeError(`Unknown Ashby board: "${opts.board}"`, "BOARD_NOT_FOUND")
      return 1
    }
    const raw = (data.jobs ?? []).find((x) => x.id === opts.id)
    if (!raw) {
      writeError(`Job "${opts.id}" not found on board "${opts.board}"`, "NOT_FOUND")
      return 1
    }
    const base = normalizeAshby(raw, opts.board)
    const detail: JobDetail = {
      ...base,
      description:
        raw.descriptionPlain ?? (raw.descriptionHtml ? stripHtml(raw.descriptionHtml) : null),
      employmentType: raw.employmentType ?? null,
      compensation: ashbyComp(raw.compensation),
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
