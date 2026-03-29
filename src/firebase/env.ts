/**
 * Vite exposes env as strings. `??` only replaces null/undefined — an empty
 * `VITE_FIREBASE_API_KEY=` in .env would become "" and must be rejected.
 */
export function requireEnv(
  viteName: string,
  value: string | undefined
): string {
  const t = typeof value === "string" ? value.trim() : ""
  if (!t) {
    throw new Error(
      `Missing ${viteName}. Copy .env.example to .env.local and add your Firebase web app config from the Firebase console (Project settings → Your apps).`
    )
  }
  return t
}
