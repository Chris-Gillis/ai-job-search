import { BASE_URL, apiFetch, stripHtml, writeError, type JobDetail } from "../helpers.js"
import { normalizeSr } from "./search.js"

export interface DetailOpts {
  board: string
  id: string
  format: "json" | "plain"
}

interface SrSection {
  title?: string
  text?: string
}

interface SrDetail {
  id: string
  name: string
  postingUrl?: string
  applyUrl?: string
  company?: { identifier?: string; name?: string } | null
  releasedDate?: string
  typeOfEmployment?: { label?: string } | null
  experienceLevel?: { label?: string } | null
  location?: {
    city?: string
    region?: string
    country?: string
    remote?: boolean
    hybrid?: boolean
    fullLocation?: string
  } | null
  department?: { label?: string } | null
  jobAd?: {
    sections?: {
      companyDescription?: SrSection
      jobDescription?: SrSection
      qualifications?: SrSection
      additionalInformation?: SrSection
    }
  } | null
}

function buildDescription(detail: SrDetail): string | null {
  const sections = detail.jobAd?.sections
  if (!sections) return null
  const ordered: (SrSection | undefined)[] = [
    sections.companyDescription,
    sections.jobDescription,
    sections.qualifications,
    sections.additionalInformation,
  ]
  const blocks = ordered
    .filter((s): s is SrSection => Boolean(s && s.text))
    .map((s) => {
      const heading = s.title ? `${s.title}\n\n` : ""
      return `${heading}${stripHtml(s.text ?? "")}`
    })
  return blocks.length > 0 ? blocks.join("\n\n") : null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    const url = `${BASE_URL}/${encodeURIComponent(opts.board)}/postings/${encodeURIComponent(opts.id)}`
    const d = await apiFetch<SrDetail>(url)
    if (d === null) {
      writeError(`Job "${opts.id}" not found on board "${opts.board}"`, "NOT_FOUND")
      return 1
    }
    const base = normalizeSr(d, opts.board)
    const detail: JobDetail = {
      ...base,
      url: d.postingUrl ?? base.url,
      applyUrl: d.applyUrl ?? base.applyUrl,
      description: buildDescription(d),
      employmentType: d.typeOfEmployment?.label ?? null,
      compensation: null,
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
