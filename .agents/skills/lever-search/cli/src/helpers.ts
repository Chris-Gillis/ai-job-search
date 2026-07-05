// Data source: Lever public Postings API. No authentication required.
//
// Lever is a multi-tenant ATS: every company has its own board keyed by a
// board token (usually the company name lowercased, e.g. "spotify"). There is no
// global cross-company search and no server-side keyword filtering or pagination
// — a board returns all of its jobs in a single JSON response, so the search
// command fetches the whole board and filters client-side.

export const BASE_URL = "https://api.lever.co/v0/postings"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

/**
 * Fetch JSON with exponential backoff on 429/5xx. Returns null on 404 (an
 * unknown board token or job id) so callers can skip a bad board gracefully.
 */
export async function apiFetch<T>(url: string): Promise<T | null> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      redirect: "follow",
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as T
  }
  throw new Error("Request failed after max retries")
}

/** Normalized job shape shared by search and detail output across skills. */
export interface Job {
  id: string
  title: string
  company: string | null
  location: string | null
  remote: boolean
  department: string | null
  url: string
  applyUrl: string | null
  updatedAt: string | null
  board: string
}

export interface JobDetail extends Job {
  description: string | null
  employmentType: string | null
  compensation: string | null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&nbsp;/g, " ")
}

/**
 * Greenhouse `content` is HTML-entity-encoded HTML. Decode entities so the tags
 * become real, turn block/line elements into newlines, strip the remaining tags,
 * then decode once more for any entities that were nested inside.
 */
export function stripHtml(html: string): string {
  const decoded = decodeHtmlEntities(html)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n• ")
    .replace(/<\/(p|li|ul|ol|div|h\d|tr)>/gi, "\n")
  const text = decodeHtmlEntities(decoded.replace(/<[^>]+>/g, ""))
  return text
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Case-insensitive AND-match of whitespace-separated query tokens in a haystack. */
export function matchesQuery(haystack: string, query: string | undefined): boolean {
  if (!query) return true
  const hay = haystack.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => hay.includes(tok))
}
