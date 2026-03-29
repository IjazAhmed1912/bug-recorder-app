import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "./app/routes"
import RootErrorBoundary from "./components/RootErrorBoundary"
import { observeAuthState } from "./firebase/auth"
import { useAuthStore } from "./store/authStore"
import { useThemeStore } from "./store/themeStore"
import { SidebarProvider } from "./contexts/SidebarContext"

export function mountMainApp(rootEl: HTMLElement) {
  function syncThemeClass() {
    document.documentElement.classList.toggle(
      "dark",
      useThemeStore.getState().theme === "dark"
    )
  }
  syncThemeClass()
  useThemeStore.subscribe(() => syncThemeClass())
  useThemeStore.persist?.onFinishHydration(() => {
    syncThemeClass()
  })

  observeAuthState((user) => {
    if (user) {
      const email = user.email ?? user.providerData[0]?.email ?? null
      const label = email ?? user.displayName ?? "Signed in"
      useAuthStore.setState({
        user: { email, label },
      })
    } else {
      useAuthStore.setState({ user: null })
    }
  })

  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <SidebarProvider>
          <RouterProvider router={router} />
        </SidebarProvider>
      </RootErrorBoundary>
    </StrictMode>
  )
}
