import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom"

/** Shown when a route throws or a lazy chunk fails to load (e.g. stale Vite dev cache). */
export default function RouteErrorFallback() {
  const error = useRouteError()
  let message = "Something went wrong loading this screen."
  if (isRouteErrorResponse(error)) {
    message = error.statusText || `${error.status}`
  } else if (error instanceof Error) {
    message = error.message
  } else if (typeof error === "string") {
    message = error
  }

  const chunkHint =
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-6 text-center dark:bg-zinc-950">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Couldn’t load this page
      </p>
      <pre className="max-h-48 max-w-full overflow-auto rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
        {message}
      </pre>
      {chunkHint && import.meta.env.DEV && (
        <p className="max-w-md text-xs text-zinc-600 dark:text-zinc-400">
          In development this often means the dev server refreshed while a lazy chunk was loading.
          Try <strong className="font-medium text-zinc-800 dark:text-zinc-200">Reload</strong> or
          restart <code className="rounded bg-zinc-200/80 px-1 py-0.5 dark:bg-zinc-800">npm run dev</code>
          .
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-violet-600"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
        <Link
          to="/"
          className="text-sm font-medium text-violet-600 underline underline-offset-2 dark:text-violet-400"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
