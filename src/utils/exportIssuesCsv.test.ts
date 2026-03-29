import { describe, expect, it } from "vitest"
import type { IssueDoc } from "../types/issue"
import { buildIssuesCsv } from "./exportIssuesCsv"

describe("buildIssuesCsv", () => {
  it("includes header and escapes commas and quotes", () => {
    const issues: IssueDoc[] = [
      {
        id: "abc",
        title: 'Hello, "world"',
        status: "open",
        priority: "high",
        tags: ["a", "b"],
        externalLink: "https://x.test",
        steps: ["Step 1", "Step, two"],
        createdAt: {
          toDate: () => new Date("2026-03-28T12:00:00.000Z"),
        } as IssueDoc["createdAt"],
      },
    ]
    const csv = buildIssuesCsv(issues)
    expect(csv).toContain("id,title,status,priority,tags,external_link,steps,created_at")
    expect(csv).toContain("abc")
    expect(csv).toContain('"Hello, ""world"""')
    expect(csv).toContain("a; b")
    expect(csv).toContain("Step 1 | Step, two")
    expect(csv).toContain("2026-03-28T12:00:00.000Z")
  })

  it("handles missing optional fields", () => {
    const issues: IssueDoc[] = [{ id: "x" }]
    const csv = buildIssuesCsv(issues)
    const lines = csv.split("\r\n")
    expect(lines[0]).toBe(
      "id,title,status,priority,tags,external_link,steps,created_at"
    )
    expect(lines[1]).toContain("x")
  })
})
