/**
 * Vite exposes env as strings. `??` only replaces null/undefined — an empty
 * `VITE_FIREBASE_API_KEY=` in .env would become "" and break Firebase init.
 */
export function envOr(
  value: string | undefined,
  fallback: string
): string {
  const t = typeof value === "string" ? value.trim() : ""
  return t.length > 0 ? t : fallback
}
