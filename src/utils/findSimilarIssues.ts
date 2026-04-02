import type { IssueDoc } from "../types/issue"

/**
 * Lightweight title overlap for “possible duplicate” hints (client-side).
 * Not fuzzy matching — substring / prefix overlap on the reporter’s own issues.
 */
export function findSimilarIssueTitles(
  candidates: IssueDoc[],
  currentTitle: string,
  excludeId?: string
): IssueDoc[] {
  const t = currentTitle.trim().toLowerCase()
  if (t.length < 4) return []

  const prefixLen = Math.min(14, t.length)
  const prefix = t.slice(0, prefixLen)
  const out: IssueDoc[] = []

  for (const issue of candidates) {
    if (excludeId && issue.id === excludeId) continue
    const ot = (issue.title ?? "").trim().toLowerCase()
    if (!ot) continue

    if (ot === t) {
      out.push(issue)
      if (out.length >= 5) break
      continue
    }

    const op = ot.slice(0, Math.min(prefixLen, ot.length))
    if (ot.includes(prefix) || t.includes(op)) {
      out.push(issue)
      if (out.length >= 5) break
    }
  }

  return out
}
