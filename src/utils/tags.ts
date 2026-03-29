/** Comma-separated tags → unique non-empty strings. */
export function parseTagsInput(input: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of input.split(",")) {
    const t = part.trim()
    if (!t) continue
    const key = t.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  return out
}
