import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-400">
        That URL doesn’t exist in TraceFlow. If you followed a link, check for
        typos.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500"
      >
        Back to home
      </Link>
    </div>
  )
}
