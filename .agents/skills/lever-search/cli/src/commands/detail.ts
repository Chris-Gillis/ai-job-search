import { BASE_URL, apiFetch, stripHtml, writeError, type JobDetail } from "../helpers.js"
import { normalizeLever, type LeverPosting } from "./search.js"

export interface DetailOpts {
  board: string
  id: string
  format: "json" | "plain"
}

function formatPay(range?: LeverPosting["salaryRange"]): string | null {
  if (!range) return null
  const cur = range.currency ?? ""
  const interval = range.interval ?? ""
  const min = range.min != null ? range.min.toLocaleString() : "?"
  const max = range.max != null ? range.max.toLocaleString() : "?"
  if (range.min == null && range.max == null) return null
  return `${min}–${max} ${cur} ${interval}`.replace(/\s+/g, " ").trim()
}

function composeDescription(j: LeverPosting): string | null {
  const parts: string[] = []
  if (j.descriptionPlain) parts.push(j.descriptionPlain.trim())
  for (const list of j.lists ?? []) {
    const heading = (list.text ?? "").trim()
    const body = list.content ? stripHtml(list.content) : ""
    const block = [heading, body].filter(Boolean).join("\n")
    if (block) parts.push(block)
  }
  if (j.additionalPlain) parts.push(j.additionalPlain.trim())
  const text = parts.join("\n\n").trim()
  return text || null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    const url = `${BASE_URL}/${encodeURIComponent(opts.board)}/${encodeURIComponent(opts.id)}?mode=json`
    const j = await apiFetch<LeverPosting>(url)
    if (j === null) {
      writeError(`Job "${opts.id}" not found on board "${opts.board}"`, "NOT_FOUND")
      return 1
    }
    const base = normalizeLever(j, opts.board)
    const detail: JobDetail = {
      ...base,
      description: composeDescription(j),
      employmentType: j.categories?.commitment ?? null,
      compensation: formatPay(j.salaryRange),
    }

    if (opts.format === "plain") {
      const lines = [
        detail.title,
        `${detail.company || detail.board} · ${detail.location || (detail.remote ? "Remote" : "—")}`,
        "",
        detail.department ? `Department: ${detail.department}` : "",
        detail.employmentType ? `Employment type: ${detail.employmentType}` : "",
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
