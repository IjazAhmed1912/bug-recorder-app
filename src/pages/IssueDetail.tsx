import { useEffect, useState } from "react"
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { db } from "../firebase/config"
import { useAuthStore } from "../store/authStore"
import Sidebar from "../components/layout/Sidebar"
import MobileMenuButton from "../components/MobileMenuButton"
import { useNavigate, useParams } from "react-router-dom"
import type { IssueDoc } from "../types/issue"
import GlowCard from "../components/GlowCard"
import { buildIssueMarkdown } from "../utils/issueMarkdown"
import { parseTagsInput } from "../utils/tags"
import { Copy, Check } from "lucide-react"

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [issue, setIssue] = useState<IssueDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [commentText, setCommentText] = useState("")
  const [assigneeEmail, setAssigneeEmail] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [externalLinkInput, setExternalLinkInput] = useState("")
  const [expectedInput, setExpectedInput] = useState("")
  const [actualInput, setActualInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)
  const [copyError, setCopyError] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, "bugs", id))
        if (cancelled) return
        if (!snap.exists()) {
          setIssue(null)
          setError("Issue not found.")
          return
        }
        setError("")
        const data = snap.data() as Omit<IssueDoc, "id">
        setIssue({ id: snap.id, ...data })
        setAssigneeEmail(data.assigneeEmail ?? "")
        setTagsInput((data.tags ?? []).join(", "))
        setExternalLinkInput(data.externalLink ?? "")
        setExpectedInput(data.expectedBehavior ?? "")
        setActualInput(data.actualBehavior ?? "")
      } catch (e) {
        console.error(e)
        setError("Could not load issue.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const persistMeta = async (patch: Record<string, unknown>) => {
    if (!id) return
    setSaving(true)
    setError("")
    try {
      await updateDoc(doc(db, "bugs", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      })
      const snap = await getDoc(doc(db, "bugs", id))
      if (snap.exists()) {
        const data = snap.data() as Omit<IssueDoc, "id">
        setIssue({ id: snap.id, ...data })
      }
    } catch (e) {
      console.error(e)
      setError("Could not save changes.")
    } finally {
      setSaving(false)
    }
  }

  const handleAddComment = async () => {
    const text = commentText.trim()
    if (!text || !id) return
    const entry = {
      id: crypto.randomUUID(),
      text,
      authorLabel: user?.label ?? "Unknown",
      createdAt: Timestamp.now(),
    }
    setCommentText("")
    try {
      await updateDoc(doc(db, "bugs", id), {
        comments: arrayUnion(entry),
        updatedAt: serverTimestamp(),
      })
      const snap = await getDoc(doc(db, "bugs", id))
      if (snap.exists()) {
        const data = snap.data() as Omit<IssueDoc, "id">
        setIssue({ id: snap.id, ...data })
      }
    } catch (e) {
      console.error(e)
      setError("Could not add comment.")
    }
  }

  if (!id) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200/90 bg-white px-4 dark:border-zinc-800/90 dark:bg-zinc-950 sm:px-6">
          <MobileMenuButton />
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
          >
            ← Issues
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
            {loading ? "Loading…" : issue?.title ?? "Issue"}
          </h1>
          {issue && (
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  try {
                    setCopyError(false)
                    await navigator.clipboard.writeText(
                      buildIssueMarkdown(issue)
                    )
                    setCopiedMd(true)
                    setTimeout(() => setCopiedMd(false), 2000)
                  } catch {
                    setCopyError(true)
                  }
                })()
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {copiedMd ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              )}
              {copiedMd ? "Copied" : "Copy as Markdown"}
            </button>
          )}
        </header>
        {copyError && (
          <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[12px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200 sm:px-6">
            Clipboard unavailable — try a secure context (HTTPS) or paste
            manually from the issue fields.
          </p>
        )}

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
              >
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
              </div>
            ) : issue ? (
              <>
                <GlowCard>
                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        Status
                        <select
                          className="mt-1 block w-full min-w-[140px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          value={issue.status ?? "open"}
                          disabled={saving}
                          onChange={(e) =>
                            void persistMeta({ status: e.target.value })
                          }
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                        </select>
                      </label>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        Priority
                        <select
                          className="mt-1 block w-full min-w-[140px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          value={issue.priority ?? "medium"}
                          disabled={saving}
                          onChange={(e) =>
                            void persistMeta({ priority: e.target.value })
                          }
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        Assignee email
                      </p>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="email"
                          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          placeholder="name@company.com"
                          value={assigneeEmail}
                          onChange={(e) => setAssigneeEmail(e.target.value)}
                        />
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            void persistMeta({
                              assigneeEmail: assigneeEmail.trim() || null,
                            })
                          }
                          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        Tags
                      </p>
                      <div className="mt-1 flex gap-2">
                        <input
                          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          placeholder="ui, regression, safari"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                        />
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            const tags = parseTagsInput(tagsInput)
                            void persistMeta({
                              tags: tags.length > 0 ? tags : null,
                            })
                          }}
                          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        Link elsewhere
                      </p>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="url"
                          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          placeholder="https://…"
                          value={externalLinkInput}
                          onChange={(e) => setExternalLinkInput(e.target.value)}
                        />
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            const raw = externalLinkInput.trim()
                            if (!raw) {
                              void persistMeta({ externalLink: null })
                              return
                            }
                            try {
                              const u = new URL(raw)
                              if (!["http:", "https:"].includes(u.protocol)) {
                                setError(
                                  "Link must start with http:// or https://"
                                )
                                return
                              }
                            } catch {
                              setError("Enter a valid URL.")
                              return
                            }
                            void persistMeta({ externalLink: raw })
                          }}
                          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
                        >
                          Save
                        </button>
                      </div>
                      {issue.externalLink && (
                        <p className="mt-1.5 text-[12px]">
                          <a
                            href={issue.externalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
                          >
                            Open linked page
                          </a>
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        Reported by{" "}
                        <span className="font-medium text-zinc-800 dark:text-zinc-300">
                          {issue.createdByLabel ?? issue.userId ?? "—"}
                        </span>
                        {issue.createdAt && (
                          <>
                            {" "}
                            ·{" "}
                            {issue.createdAt.toDate?.().toLocaleString?.() ??
                              ""}
                          </>
                        )}
                      </p>
                    </div>

                    {issue.environment && (
                      <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          Environment
                        </h2>
                        <dl className="mt-2 grid gap-1.5 text-[13px] sm:grid-cols-2">
                          <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                              Page URL
                            </dt>
                            <dd className="break-all font-mono text-zinc-800 dark:text-zinc-200">
                              {issue.environment.pageUrl || "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                              Viewport
                            </dt>
                            <dd className="text-zinc-800 dark:text-zinc-200">
                              {issue.environment.viewportWidth}×
                              {issue.environment.viewportHeight}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                              Language / time zone
                            </dt>
                            <dd className="text-zinc-800 dark:text-zinc-200">
                              {issue.environment.language}
                              {issue.environment.timeZone
                                ? ` · ${issue.environment.timeZone}`
                                : ""}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                              Platform
                            </dt>
                            <dd className="text-zinc-800 dark:text-zinc-200">
                              {issue.environment.platform || "—"}
                            </dd>
                          </div>
                          <div className="sm:col-span-2 flex flex-col gap-0.5 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                              User agent
                            </dt>
                            <dd className="break-all font-mono text-[11px] leading-snug text-zinc-700 dark:text-zinc-300">
                              {issue.environment.userAgent || "—"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}

                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        Expected vs actual
                      </h2>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <label className="block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                          Expected
                          <textarea
                            className="mt-1 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            rows={3}
                            disabled={saving}
                            value={expectedInput}
                            onChange={(e) => setExpectedInput(e.target.value)}
                            placeholder="What should happen"
                          />
                        </label>
                        <label className="block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                          Actual
                          <textarea
                            className="mt-1 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            rows={3}
                            disabled={saving}
                            value={actualInput}
                            onChange={(e) => setActualInput(e.target.value)}
                            placeholder="What happened instead"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          void persistMeta({
                            expectedBehavior: expectedInput.trim() || null,
                            actualBehavior: actualInput.trim() || null,
                          })
                        }
                        className="mt-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
                      >
                        Save expected / actual
                      </button>
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        Steps
                      </h2>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
                        {(issue.steps ?? []).map((s, i) => (
                          <li key={i}>{String(s)}</li>
                        ))}
                      </ol>
                    </div>

                    {issue.screenshotUploadError && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                        {issue.screenshotUploadError}
                      </p>
                    )}

                    {issue.screenshotUrls && issue.screenshotUrls.length > 0 && (
                      <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          Screenshots
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {issue.screenshotUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
                            >
                              <img
                                src={url}
                                alt=""
                                className="h-24 w-auto max-w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {issue.clientErrors && issue.clientErrors.length > 0 && (
                      <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          Client errors (filing session)
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                          Captured from this tab while the report was being
                          created (same session only).
                        </p>
                        <ul className="mt-2 space-y-2">
                          {issue.clientErrors.map((e, i) => (
                            <li
                              key={`${e.time}-${i}`}
                              className="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-[13px] dark:border-rose-900/50 dark:bg-rose-950/30"
                            >
                              <p className="font-medium text-rose-900 dark:text-rose-100">
                                {e.message}
                              </p>
                              {e.stack && (
                                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] text-rose-900/90 dark:text-rose-200/90">
                                  {e.stack}
                                </pre>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </GlowCard>

                <GlowCard>
                  <div className="p-5 sm:p-6">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Comments
                    </h2>
                    <ul className="mt-3 space-y-3">
                      {(issue.comments ?? []).map((c) => (
                        <li
                          key={c.id}
                          className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/80"
                        >
                          <p className="text-zinc-800 dark:text-zinc-200">
                            {c.text}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                            {c.authorLabel}
                            {c.createdAt?.toDate
                              ? ` · ${c.createdAt.toDate().toLocaleString()}`
                              : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="Add a comment…"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleAddComment()
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => void handleAddComment()}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </GlowCard>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
