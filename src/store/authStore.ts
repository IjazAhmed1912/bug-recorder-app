import { create } from "zustand"

/** Snapshot for UI; `label` is always safe to show (email, name, or fallback). */
export type AuthUser = {
  email: string | null
  label: string
}

type AuthStore = {
  user: AuthUser | null
  login: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: (email) => set({ user: { email, label: email } }),
  logout: () => set({ user: null }),
}))
