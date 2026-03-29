export default function PageLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400 border-t-transparent"
        aria-hidden
      />
      <p className="text-sm">Loading…</p>
    </div>
  )
}
