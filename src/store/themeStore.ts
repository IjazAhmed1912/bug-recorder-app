import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "light" | "dark"

const STORAGE_KEY = "traceflow-theme"

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { theme?: Theme } }
    const t = parsed?.state?.theme
    if (t === "dark" || t === "light") return t
  } catch {
    /* ignore */
  }
  return null
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = readStoredTheme()
  if (stored) return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export const useThemeStore = create(
  persist<{
    theme: Theme
    setTheme: (t: Theme) => void
    toggleTheme: () => void
  }>(
    (set, get) => ({
      theme: getInitialTheme(),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark"
        set({ theme: next })
      },
    }),
    { name: STORAGE_KEY }
  )
)
