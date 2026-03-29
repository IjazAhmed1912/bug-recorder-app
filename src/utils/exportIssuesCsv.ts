import type { IssueDoc } from "../types/issue"

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatCreated(issue: IssueDoc): string {
  const t = issue.createdAt?.toDate?.()
  return t ? t.toISOString() : ""
}

/** RFC-style CSV (UTF-8) for spreadsheet import. */
export function buildIssuesCsv(issues: IssueDoc[]): string {
  const header = [
    "id",
    "title",
    "status",
    "priority",
    "tags",
    "external_link",
    "steps",
    "created_at",
  ]
  const rows = issues.map((issue) => {
    const steps = (issue.steps ?? []).join(" | ")
    const tags = (issue.tags ?? []).join("; ")
    return [
      issue.id,
      issue.title ?? "",
      issue.status ?? "",
      issue.priority ?? "",
      tags,
      issue.externalLink ?? "",
      steps,
      formatCreated(issue),
    ]
      .map((cell) => csvEscape(String(cell)))
      .join(",")
  })
  return [header.join(","), ...rows].join("\r\n")
}

export function downloadCsvFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
