import { describe, expect, it } from "vitest"
import type { IssueDoc } from "../types/issue"
import { issueMatchesSearch } from "./issueSearch"

function issue(partial: Partial<IssueDoc> & { id: string }): IssueDoc {
  const { id, ...rest } = partial
  return { id, ...rest } as IssueDoc
}

describe("issueMatchesSearch", () => {
  it("matches empty query for any issue", () => {
    const i = issue({ id: "1", title: "A" })
    expect(issueMatchesSearch(i, "")).toBe(true)
    expect(issueMatchesSearch(i, "   ")).toBe(true)
  })

  it("matches title", () => {
    const i = issue({ id: "1", title: "Login broken" })
    expect(issueMatchesSearch(i, "login")).toBe(true)
    expect(issueMatchesSearch(i, "xyz")).toBe(false)
  })

  it("matches steps", () => {
    const i = issue({
      id: "1",
      title: "T",
      steps: ["Open modal", "Click save"],
    })
    expect(issueMatchesSearch(i, "modal")).toBe(true)
    expect(issueMatchesSearch(i, "SAVE")).toBe(true)
  })

  it("matches tags", () => {
    const i = issue({ id: "1", title: "T", tags: ["regression", "safari"] })
    expect(issueMatchesSearch(i, "safari")).toBe(true)
    expect(issueMatchesSearch(i, "REG")).toBe(true)
  })

  it("matches external link", () => {
    const i = issue({
      id: "1",
      title: "T",
      externalLink: "https://github.com/org/repo/issues/42",
    })
    expect(issueMatchesSearch(i, "github")).toBe(true)
    expect(issueMatchesSearch(i, "issues/42")).toBe(true)
  })

  it("matches expected and actual", () => {
    const i = issue({
      id: "1",
      title: "T",
      expectedBehavior: "Button should be blue",
      actualBehavior: "Button is red",
    })
    expect(issueMatchesSearch(i, "blue")).toBe(true)
    expect(issueMatchesSearch(i, "red")).toBe(true)
  })
})
