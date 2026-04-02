import type { IssueDoc } from "../types/issue"

function formatDate(issue: IssueDoc): string {
  const t = issue.createdAt?.toDate?.()
  if (t) return t.toLocaleString()
  return "—"
}

/** Markdown blob for Slack / Jira / email handoff. */
export function buildIssueMarkdown(issue: IssueDoc): string {
  const lines: string[] = []
  lines.push(`# ${issue.title ?? "Untitled"}`)
  lines.push("")
  lines.push(`**Status:** ${issue.status ?? "open"} · **Priority:** ${issue.priority ?? "medium"}`)
  lines.push(`**Reported by:** ${issue.createdByLabel ?? issue.userId ?? "—"} · **Created:** ${formatDate(issue)}`)
  if (issue.assigneeEmail) {
    lines.push(`**Assignee:** ${issue.assigneeEmail}`)
  }
  const tags = issue.tags ?? []
  if (tags.length > 0) {
    lines.push(`**Tags:** ${tags.map((t) => `\`${t}\``).join(", ")}`)
  }
  if (issue.externalLink) {
    lines.push(`**Linked:** ${issue.externalLink}`)
  }
  lines.push("")

  const env = issue.environment
  if (env) {
    lines.push("## Environment")
    lines.push(`- **URL:** ${env.pageUrl || "—"}`)
    lines.push(`- **Viewport:** ${env.viewportWidth}×${env.viewportHeight}`)
    lines.push(`- **Language:** ${env.language}`)
    lines.push(`- **Time zone:** ${env.timeZone || "—"}`)
    lines.push(`- **Platform:** ${env.platform}`)
    lines.push(`- **Captured:** ${env.capturedAtIso}`)
    lines.push(`- **User agent:** \`${env.userAgent.replace(/`/g, "'")}\``)
    lines.push("")
  }

  const exp = (issue.expectedBehavior ?? "").trim()
  const act = (issue.actualBehavior ?? "").trim()
  if (exp || act) {
    lines.push("## Expected vs actual")
    if (exp) lines.push(`- **Expected:** ${exp}`)
    else lines.push("- **Expected:** _Not specified_")
    if (act) lines.push(`- **Actual:** ${act}`)
    else lines.push("- **Actual:** _Not specified_")
    lines.push("")
  }

  lines.push("## Steps to reproduce")
  const steps = issue.steps ?? []
  if (steps.length === 0) {
    lines.push("_No steps listed._")
  } else {
    steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
  }
  lines.push("")

  const shots = issue.screenshotUrls ?? []
  if (shots.length > 0) {
    lines.push("## Screenshots")
    shots.forEach((url, i) => lines.push(`- [Screenshot ${i + 1}](${url})`))
    lines.push("")
  }

  const events = issue.recordingEvents ?? []
  if (events.length > 0) {
    lines.push("## Click recording")
    lines.push(`_${events.length} pointer event(s) captured (see TraceFlow for timeline)._`)
    lines.push("")
  }

  const errs = issue.clientErrors ?? []
  if (errs.length > 0) {
    lines.push("## Client errors (this session)")
    errs.forEach((e, i) => {
      lines.push(`### ${i + 1}. ${e.message}`)
      if (e.stack) {
        lines.push("```")
        lines.push(e.stack)
        lines.push("```")
      }
    })
    lines.push("")
  }

  lines.push("---")
  lines.push(`_Exported from TraceFlow · Issue ID: \`${issue.id}\`_`)
  return lines.join("\n")
}
