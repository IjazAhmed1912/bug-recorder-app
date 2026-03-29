import { describe, expect, it } from "vitest"
import { parseTagsInput } from "./tags"

describe("parseTagsInput", () => {
  it("splits on commas and trims", () => {
    expect(parseTagsInput("a, b , c")).toEqual(["a", "b", "c"])
  })

  it("drops empty segments", () => {
    expect(parseTagsInput("x,,  ,y")).toEqual(["x", "y"])
  })

  it("dedupes case-insensitively and keeps first casing", () => {
    expect(parseTagsInput("UI, ui, Bug")).toEqual(["UI", "Bug"])
  })

  it("returns empty array for blank input", () => {
    expect(parseTagsInput("")).toEqual([])
    expect(parseTagsInput("  ,  ")).toEqual([])
  })
})
