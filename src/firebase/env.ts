/**
 * Known template strings from .env.example — not substring matching on real IDs.
 */
function looksLikePlaceholder(raw: string): boolean {
  const s = raw.trim().toLowerCase()
  if (!s) return true

  if (s.startsWith("your_")) return true

  const exact = new Set([
    "your_firebase_api_key",
    "your-project-id.firebaseapp.com",
    "your-project-id",
    "your-project-id.appspot.com",
    "your_sender_id",
    "your_app_id",
  ])
  if (exact.has(s)) return true

  if (s.includes("your_firebase")) return true

  return false
}

/** Strip optional surrounding quotes from .env values (common mistake). */
function stripEnvQuotes(raw: string): string {
  const t = raw.trim()
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim()
  }
  return t
}

/**
 * Google browser API keys used by Firebase web apps almost always start with "AIza".
 */
function looksLikeGoogleApiKey(key: string): boolean {
  const k = stripEnvQuotes(key)
  return k.length >= 30 && k.startsWith("AIza")
}

const VITE_ENV_LABELS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const

/**
 * Human-readable reasons env is incomplete (no secret values).
 */
export function getFirebaseEnvIssues(): string[] {
  const e = import.meta.env
  const issues: string[] = []

  for (const label of VITE_ENV_LABELS) {
    const raw = e[label] as string | undefined
    const t = stripEnvQuotes(String(raw ?? ""))

    if (!t) {
      issues.push(`${label} is missing or empty`)
      continue
    }
    if (looksLikePlaceholder(t)) {
      issues.push(
        `${label} still looks like a template — paste the real value from Firebase → Project settings → Your apps`
      )
      continue
    }
    if (label === "VITE_FIREBASE_API_KEY" && !looksLikeGoogleApiKey(t)) {
      issues.push(
        `${label} should be the web app apiKey (long string starting with AIza)`
      )
    }
  }

  return issues
}

/**
 * True when all Firebase web config vars are set and not still template placeholders.
 */
export function hasFirebaseEnv(): boolean {
  return getFirebaseEnvIssues().length === 0
}

/**
 * Vite exposes env as strings. `??` only replaces null/undefined — an empty
 * `VITE_FIREBASE_API_KEY=` in .env would become "" and must be rejected.
 */
export function requireEnv(
  viteName: string,
  value: string | undefined
): string {
  const t = stripEnvQuotes(typeof value === "string" ? value : "")
  if (!t) {
    throw new Error(
      `Missing ${viteName}. Copy .env.example to .env.local and add your Firebase web app config from the Firebase console (Project settings → Your apps).`
    )
  }
  if (looksLikePlaceholder(t)) {
    throw new Error(
      `${viteName} still looks like a placeholder. Replace it with the real value from Firebase → Project settings → Your apps.`
    )
  }
  if (viteName === "VITE_FIREBASE_API_KEY" && !looksLikeGoogleApiKey(t)) {
    throw new Error(
      `VITE_FIREBASE_API_KEY does not look like a valid Google API key (should start with "AIza"). Copy apiKey exactly from Firebase → Project settings → Your apps.`
    )
  }
  return t
}
