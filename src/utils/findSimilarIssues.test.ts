import { describe, expect, it } from "vitest"
import type { IssueDoc } from "../types/issue"
import { findSimilarIssueTitles } from "./findSimilarIssues"

describe("findSimilarIssueTitles", () => {
  it("returns empty for short titles", () => {
    expect(findSimilarIssueTitles([], "ab")).toEqual([])
  })

  it("finds exact title match", () => {
    const a: IssueDoc = { id: "1", title: "Checkout fails on Safari" }
    const b: IssueDoc = { id: "2", title: "Other" }
    expect(
      findSimilarIssueTitles([a, b], "Checkout fails on Safari")
    ).toEqual([a])
  })

  it("finds prefix overlap", () => {
    const a: IssueDoc = { id: "1", title: "Login spinner never stops" }
    const b: IssueDoc = { id: "2", title: "Logout works" }
    const r = findSimilarIssueTitles([a, b], "Login spinner broken")
    expect(r.map((x) => x.id)).toContain("1")
  })
})
