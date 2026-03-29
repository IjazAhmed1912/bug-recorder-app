import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { children: ReactNode }

type State = { error: Error | null }

/** Catches render errors so the app doesn’t stay a blank screen. */
export default class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Root error:", error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-6 text-center dark:bg-zinc-950">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </p>
          <pre className="max-h-48 max-w-full overflow-auto rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-violet-600"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
