import { useEffect, useMemo, useState } from "react"
import { db } from "../firebase/config"
import { collection, getDocs } from "firebase/firestore"
import { useAuthStore } from "../store/authStore"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, Download } from "lucide-react"
import { logoutUser } from "../firebase/auth"
import { AppLogoIcon } from "../components/AppLogo"
import Sidebar from "../components/layout/Sidebar"
import MobileMenuButton from "../components/MobileMenuButton"
import GlowCard from "../components/GlowCard"
import type { IssueDoc } from "../types/issue"
import { issueMatchesSearch } from "../utils/issueSearch"
import { buildIssuesCsv, downloadCsvFile } from "../utils/exportIssuesCsv"

export default function Dashboard() {
  const [issues, setIssues] = useState<IssueDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")

  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const [showSavedToast, setShowSavedToast] = useState(false)

  useEffect(() => {
    const state = location.state as { issueSaved?: boolean } | null
    if (state?.issueSaved) {
      setShowSavedToast(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (!showSavedToast) return
    const t = window.setTimeout(() => setShowSavedToast(false), 6000)
    return () => window.clearTimeout(t)
  }, [showSavedToast])

  useEffect(() => {
    let cancelled = false
    const fetchIssues = async () => {
      try {
        const snapshot = await getDocs(collection(db, "bugs"))
        if (cancelled) return
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as IssueDoc[]
        setIssues(data)
      } catch (err) {
        console.error("Error fetching issues:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchIssues()
    return () => {
      cancelled = true
    }
  }, [])

  const allTags = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const issue of issues) {
      for (const t of issue.tags ?? []) {
        const k = t.toLowerCase()
        if (seen.has(k)) continue
        seen.add(k)
        out.push(t)
      }
    }
    out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    return out
  }, [issues])

  const filtered = useMemo(() => {
    let list = [...issues]
    if (query.trim()) {
      list = list.filter((b) => issueMatchesSearch(b, query))
    }
    if (statusFilter !== "all") {
      list = list.filter((b) => (b.status ?? "open") === statusFilter)
    }
    if (priorityFilter !== "all") {
      list = list.filter((b) => (b.priority ?? "medium") === priorityFilter)
    }
    if (tagFilter !== "all") {
      const want = tagFilter.toLowerCase()
      list = list.filter((b) =>
        (b.tags ?? []).some((t) => t.toLowerCase() === want)
      )
    }
    list.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0
      const tb = b.createdAt?.toMillis?.() ?? 0
      return tb - ta
    })
    return list
  }, [issues, query, statusFilter, priorityFilter, tagFilter])

  const handleLogout = async () => {
    await logoutUser()
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200/90 bg-white px-4 dark:border-zinc-800/90 dark:bg-zinc-950 sm:px-6">
          <MobileMenuButton />
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
              Issues
            </h1>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-500">
              All bugs in this workspace
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <span
                className="hidden max-w-[200px] truncate rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 sm:inline-block"
                title={user.email ?? user.label}
              >
                {user.label}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </header>

        {showSavedToast && (
          <div
            role="status"
            className="flex items-center justify-center gap-2 border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-[13px] font-medium text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-100"
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
              aria-hidden
            />
            Bug report saved — it’s in your inbox below.
            <button
              type="button"
              className="ml-2 rounded-md px-2 py-0.5 text-[12px] font-medium text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-200"
              onClick={() => setShowSavedToast(false)}
            >
              Dismiss
            </button>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Inbox
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-500">
                  Search, filter, and open an issue for full detail.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="issue-search">
                  Search issues
                </label>
                <input
                  id="issue-search"
                  type="search"
                  placeholder="Search title, steps, tags, link…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-[180px] flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:max-w-xs"
                />
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  aria-label="Filter by tag"
                >
                  <option value="all">All tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  aria-label="Filter by priority"
                >
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  type="button"
                  disabled={loading || filtered.length === 0}
                  onClick={() => {
                    const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
                    downloadCsvFile(
                      buildIssuesCsv(filtered),
                      `traceflow-issues-${stamp}.csv`
                    )
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Export CSV
                </button>
                <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-right shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                    Showing
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {loading ? "—" : filtered.length}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-20 dark:border-zinc-700 dark:bg-zinc-900">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent"
                  aria-hidden
                />
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
                  Loading…
                </p>
              </div>
            ) : issues.length === 0 ? (
              <GlowCard>
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="flex flex-col justify-center p-8 md:p-10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                      Empty
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                      No issues yet
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Create your first issue — add steps, screenshots, and
                      comments in one place.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/new")}
                      className="mt-6 w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500"
                    >
                      Create first issue
                    </button>
                  </div>
                  <div className="flex min-h-[200px] items-center justify-center border-t border-zinc-100 bg-gradient-to-br from-violet-50/50 to-cyan-50/30 p-8 dark:border-zinc-800 dark:from-violet-950/40 dark:to-cyan-950/20 md:border-l md:border-t-0">
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                      <AppLogoIcon className="mx-auto h-12 w-12 text-violet-500" />
                      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-500">
                        Ready when you are
                      </p>
                    </div>
                  </div>
                </div>
              </GlowCard>
            ) : filtered.length === 0 ? (
              <p className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                No issues match your filters.{" "}
                <button
                  type="button"
                  className="font-medium text-violet-700 hover:underline dark:text-violet-400"
                  onClick={() => {
                    setQuery("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                    setTagFilter("all")
                  }}
                >
                  Clear filters
                </button>
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((bug, i) => (
                  <motion.article
                    key={bug.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/issues/${bug.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        navigate(`/issues/${bug.id}`)
                    }}
                    className="group cursor-pointer rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm transition hover:border-violet-300/80 hover:shadow-glow dark:border-zinc-700/90 dark:bg-zinc-900 dark:hover:border-violet-500/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-medium leading-snug text-zinc-900 group-hover:text-violet-900 dark:text-zinc-100 dark:group-hover:text-violet-300">
                        {bug.title || "Untitled"}
                      </h3>
                      <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {bug.steps?.length ?? 0} steps
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {bug.status ?? "open"}
                      </span>
                      <span className="rounded bg-violet-50 px-2 py-0.5 font-medium text-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
                        {bug.priority ?? "medium"}
                      </span>
                      {(bug.tags ?? []).map((t) => (
                        <span
                          key={t}
                          className="rounded border border-zinc-200/90 bg-zinc-50 px-2 py-0.5 font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {bug.externalLink && (
                      <a
                        href={bug.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="mt-2 inline-block max-w-full truncate text-[12px] font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
                      >
                        {bug.externalLink}
                      </a>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {bug.flags &&
                        Object.entries(bug.flags).map(([key, value]) => (
                          <span
                            key={key}
                            className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                              value
                                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/80"
                                : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-500 dark:ring-zinc-700/80"
                            }`}
                          >
                            {key}
                          </span>
                        ))}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
