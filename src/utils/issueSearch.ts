import type { IssueDoc } from "../types/issue"

/** Case-insensitive match across title, steps, tags, and external link. */
export function issueMatchesSearch(issue: IssueDoc, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return true

  if ((issue.title ?? "").toLowerCase().includes(q)) return true

  for (const s of issue.steps ?? []) {
    if (s.toLowerCase().includes(q)) return true
  }

  for (const t of issue.tags ?? []) {
    if (t.toLowerCase().includes(q)) return true
  }

  if ((issue.externalLink ?? "").toLowerCase().includes(q)) return true

  return false
}
