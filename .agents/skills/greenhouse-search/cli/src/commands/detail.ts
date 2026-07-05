import { BASE_URL, apiFetch, stripHtml, writeError, type JobDetail } from "../helpers.js"
import { normalizeGh } from "./search.js"

export interface DetailOpts {
  board: string
  id: string
  format: "json" | "plain"
}

interface GhPayRange {
  title?: string
  min_cents?: number | null
  max_cents?: number | null
  currency_type?: string
}

interface GhDetail {
  id: number
  title: string
  location?: { name?: string } | null
  absolute_url: string
  updated_at?: string
  content?: string
  departments?: { name?: string }[]
  offices?: { name?: string }[]
  company_name?: string
  pay_input_ranges?: GhPayRange[]
}

function formatPay(ranges?: GhPayRange[]): string | null {
  if (!ranges || ranges.length === 0) return null
  return ranges
    .map((r) => {
      const cur = r.currency_type ?? ""
      const min = r.min_cents != null ? (r.min_cents / 100).toLocaleString() : "?"
      const max = r.max_cents != null ? (r.max_cents / 100).toLocaleString() : "?"
      const label = r.title ? `${r.title}: ` : ""
      return `${label}${min}–${max} ${cur}`.trim()
    })
    .join("; ")
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    const url = `${BASE_URL}/${encodeURIComponent(opts.board)}/jobs/${encodeURIComponent(opts.id)}?pay_transparency=true`
    const j = await apiFetch<GhDetail>(url)
    if (j === null) {
      writeError(`Job "${opts.id}" not found on board "${opts.board}"`, "NOT_FOUND")
      return 1
    }
    const base = normalizeGh(j, opts.board)
    const detail: JobDetail = {
      ...base,
      description: j.content ? stripHtml(j.content) : null,
      employmentType: null,
      compensation: formatPay(j.pay_input_ranges),
    }

    if (opts.format === "plain") {
      const lines = [
        detail.title,
        `${detail.company || detail.board} · ${detail.location || (detail.remote ? "Remote" : "—")}`,
        "",
        detail.department ? `Department: ${detail.department}` : "",
        detail.compensation ? `Compensation: ${detail.compensation}` : "",
        "",
        detail.description || "(no description)",
        "",
        `URL: ${detail.url}`,
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
