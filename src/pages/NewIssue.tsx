import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { getAuth } from "firebase/auth"
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "../firebase/config"
import { uploadIssueAsset } from "../firebase/storageUpload"
import { useAuthStore } from "../store/authStore"
import Sidebar from "../components/layout/Sidebar"
import MobileMenuButton from "../components/MobileMenuButton"
import { Link, useNavigate } from "react-router-dom"
import type { IssueDoc, RecordingEvent } from "../types/issue"
import { findSimilarIssueTitles } from "../utils/findSimilarIssues"
import { captureScreenshot } from "../utils/screenshot"
import { startRecording, stopRecording } from "../utils/recorder"
import { collectEnvironment } from "../utils/environment"
import { useSessionClientErrors } from "../hooks/useSessionClientErrors"
import GlowCard from "../components/GlowCard"
import {
  Camera,
  CheckCircle2,
  Clapperboard,
  MousePointerClick,
  Square,
} from "lucide-react"
import { parseTagsInput } from "../utils/tags"

export default function NewIssue() {
  const [title, setTitle] = useState("")
  const [steps, setSteps] = useState<string[]>([""])
  const [priority, setPriority] = useState("medium")
  const [status, setStatus] = useState("open")
  const [error, setError] = useState("")
  /** Single source of truth so the button can’t stay stuck on “Saving…”. */
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "saving" | "success"
  >("idle")
  const navigateAfterSaveRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  useEffect(() => {
    return () => {
      if (navigateAfterSaveRef.current) {
        clearTimeout(navigateAfterSaveRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const uid = getAuth().currentUser?.uid
    const trimmed = title.trim()
    if (!uid || trimmed.length < 4) {
      setSimilarIssues([])
      return
    }
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const q = query(
            collection(db, "bugs"),
            where("userUid", "==", uid),
            limit(80)
          )
          const snap = await getDocs(q)
          const list = snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as IssueDoc
          )
          setSimilarIssues(findSimilarIssueTitles(list, trimmed))
        } catch {
          setSimilarIssues([])
        }
      })()
    }, 450)
    return () => window.clearTimeout(t)
  }, [title])
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [recordingEvents, setRecordingEvents] = useState<RecordingEvent[]>([])
  const [recordingActive, setRecordingActive] = useState(false)
  const [tagsInput, setTagsInput] = useState("")
  const [externalLink, setExternalLink] = useState("")
  const [expectedBehavior, setExpectedBehavior] = useState("")
  const [actualBehavior, setActualBehavior] = useState("")
  const [similarIssues, setSimilarIssues] = useState<IssueDoc[]>([])

  const sessionClientErrors = useSessionClientErrors()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const addStep = () => setSteps([...steps, ""])

  const updateStep = (value: string, index: number) => {
    const next = [...steps]
    next[index] = value
    setSteps(next)
  }

  const handleScreenshot = async () => {
    try {
      const dataUrl = await captureScreenshot()
      setScreenshotPreviews((s) => [...s, dataUrl])
    } catch (e) {
      console.error(e)
      setError("Screenshot failed. Try again.")
    }
  }

  const handleStartRecording = () => {
    startRecording()
    setRecordingActive(true)
  }

  const handleStopRecording = () => {
    const events = stopRecording() as RecordingEvent[]
    setRecordingEvents(events)
    setRecordingActive(false)
  }

  const handleSubmit = async () => {
    setError("")
    const trimmed = title.trim()
    if (!trimmed) {
      setError("Give this issue a title.")
      return
    }
    const filledSteps = steps.map((s) => s.trim()).filter(Boolean)
    if (filledSteps.length === 0) {
      setError("Add at least one reproduction step.")
      return
    }

    const authUser = getAuth().currentUser
    if (!authUser) {
      setError("You must be signed in.")
      return
    }

    const tags = parseTagsInput(tagsInput)
    const external: string | null = externalLink.trim() || null
    if (external) {
      try {
        const u = new URL(external)
        if (!["http:", "https:"].includes(u.protocol)) {
          setError("Link must start with http:// or https://")
          return
        }
      } catch {
        setError("Enter a valid URL (e.g. https://jira…/ABC-1).")
        return
      }
    }

    setSubmitStatus("saving")
    try {
      const exp = expectedBehavior.trim()
      const act = actualBehavior.trim()

      const docRef = await addDoc(collection(db, "bugs"), {
        title: trimmed,
        steps: filledSteps,
        priority,
        status,
        userId: user?.email ?? null,
        userUid: authUser.uid,
        createdByLabel: user?.label ?? authUser.email ?? "Unknown",
        assigneeEmail: null,
        tags: tags.length > 0 ? tags : null,
        externalLink: external,
        expectedBehavior: exp || null,
        actualBehavior: act || null,
        screenshotUrls: [],
        recordingEvents: recordingEvents.length ? recordingEvents : null,
        environment: collectEnvironment(),
        clientErrors:
          sessionClientErrors.length > 0 ? sessionClientErrors : null,
        comments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const previews = [...screenshotPreviews]
      const uid = authUser.uid
      const bugId = docRef.id

      // Don’t block navigation on Storage — large PNGs were keeping "Saving…" forever.
      if (previews.length > 0) {
        void (async () => {
          try {
            const urls = await Promise.all(
              previews.map((dataUrl, i) =>
                uploadIssueAsset(uid, bugId, dataUrl, i)
              )
            )
            await updateDoc(doc(db, "bugs", bugId), {
              screenshotUrls: urls,
              screenshotUploadError: null,
              updatedAt: serverTimestamp(),
            })
          } catch (e) {
            console.error("Screenshot upload failed", e)
            try {
              await updateDoc(doc(db, "bugs", bugId), {
                screenshotUploadError:
                  "Screenshots didn’t finish uploading. Check Storage rules and connection, or add images again from the issue.",
                updatedAt: serverTimestamp(),
              })
            } catch (inner) {
              console.error(inner)
            }
          }
        })()
      }

      setSubmitStatus("success")
      navigateAfterSaveRef.current = setTimeout(() => {
        navigateAfterSaveRef.current = null
        navigate("/dashboard", { state: { issueSaved: true } })
      }, 550)
    } catch (e) {
      console.error(e)
      setError("Could not save. Check Firestore rules and Storage access.")
      setSubmitStatus("idle")
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200/90 bg-white px-4 dark:border-zinc-800/90 dark:bg-zinc-950 sm:px-6">
          <MobileMenuButton />
          <h1 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
            New issue
          </h1>
        </header>

        {submitStatus === "success" && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex shrink-0 items-start gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/80 sm:items-center sm:px-6"
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 sm:mt-0"
              strokeWidth={2}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                Issue saved — you’re all set
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-emerald-900 dark:text-emerald-200/95">
                Opening your inbox…
              </p>
              {screenshotPreviews.length > 0 && (
                <p className="mt-2 text-[12px] leading-snug text-emerald-800/95 dark:text-emerald-200/85">
                  {screenshotPreviews.length} screenshot
                  {screenshotPreviews.length === 1 ? "" : "s"} still upload in the
                  background. If they don’t show on the issue yet, open it again
                  in a few seconds — or look for an upload warning on the issue
                  page.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/80 to-white px-4 py-4 dark:border-zinc-800/80 dark:from-zinc-900/50 dark:to-zinc-950 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20">
                <Clapperboard className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Capture evidence
                </h2>
                <p className="mt-0.5 text-[13px] leading-snug text-zinc-500 dark:text-zinc-500">
                  Optional — add a screenshot of the problem and/or a short
                  click trace so engineers see what you saw.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-700/90 dark:bg-zinc-900/80">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Camera
                    className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="text-[13px] font-semibold">Screenshot</span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-500">
                  Freezes the current tab view — use after the bug is visible.
                </p>
                <button
                  type="button"
                  onClick={() => void handleScreenshot()}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2.5 text-[13px] font-medium text-violet-900 transition hover:bg-violet-100 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-950/70"
                >
                  <Camera className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Screenshot
                </button>
              </div>

              <div
                className={`flex flex-col rounded-xl border p-4 shadow-sm transition-colors ${
                  recordingActive
                    ? "border-rose-300/80 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/25"
                    : "border-zinc-200/90 bg-white dark:border-zinc-700/90 dark:bg-zinc-900/80"
                }`}
              >
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <MousePointerClick
                    className={`h-4 w-4 shrink-0 ${
                      recordingActive
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-violet-600 dark:text-violet-400"
                    }`}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="text-[13px] font-semibold">
                    Click recording
                  </span>
                  {recordingActive && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-rose-800 dark:bg-rose-500/20 dark:text-rose-200">
                      <span
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-600 dark:bg-rose-400"
                        aria-hidden
                      />
                      Live
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-500">
                  {recordingActive
                    ? "Reproduce the issue in this tab, then finish to attach the click trail."
                    : "Records pointer clicks and timestamps while you walk through the bug."}
                </p>
                {!recordingActive ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[13px] font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <MousePointerClick
                      className="h-4 w-4"
                      strokeWidth={2}
                      aria-hidden
                    />
                    Start recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2.5 text-[13px] font-medium text-rose-900 shadow-sm transition hover:bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-950/80"
                  >
                    <Square
                      className="h-3.5 w-3.5 fill-current"
                      strokeWidth={2}
                      aria-hidden
                    />
                    Finish and save clicks
                  </button>
                )}
                {recordingEvents.length > 0 && !recordingActive && (
                  <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
                    {recordingEvents.length} click
                    {recordingEvents.length === 1 ? "" : "s"} saved — will
                    attach when you create the issue.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="mx-auto max-w-2xl">
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Describe the bug and the steps to reproduce it. It will appear in
              your inbox on the dashboard.
            </p>

            {error && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </p>
            )}

            {screenshotPreviews.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {screenshotPreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-20 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                  />
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlowCard variant="intense">
                <div className="space-y-5 p-6">
                  <div>
                    <label
                      htmlFor="issue-title"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500"
                    >
                      Title
                    </label>
                    <input
                      id="issue-title"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 sm:text-sm"
                      placeholder="Short summary of the bug"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoComplete="off"
                    />
                    {similarIssues.length > 0 && submitStatus === "idle" && (
                      <div
                        className="mt-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/35"
                        role="status"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200/95">
                          Possible duplicates in your inbox
                        </p>
                        <ul className="mt-2 space-y-1.5 text-[13px] text-amber-950 dark:text-amber-100/95">
                          {similarIssues.map((si) => (
                            <li key={si.id}>
                              <Link
                                to={`/issues/${si.id}`}
                                className="font-medium text-amber-900 underline-offset-2 hover:underline dark:text-amber-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {si.title || "Untitled"}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                      Reproduction steps
                    </h2>
                    {steps.map((step, i) => (
                      <input
                        key={i}
                        className="mb-2 w-full rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900"
                        placeholder={`Step ${i + 1}`}
                        value={step}
                        onChange={(e) => updateStep(e.target.value, i)}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={addStep}
                      className="min-h-[44px] py-2 text-sm font-medium text-violet-700 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      + Add step
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="issue-expected"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500"
                      >
                        Expected
                      </label>
                      <textarea
                        id="issue-expected"
                        rows={3}
                        className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 sm:text-sm"
                        placeholder="What should happen"
                        value={expectedBehavior}
                        onChange={(e) => setExpectedBehavior(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="issue-actual"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500"
                      >
                        Actual
                      </label>
                      <textarea
                        id="issue-actual"
                        rows={3}
                        className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 sm:text-sm"
                        placeholder="What actually happened"
                        value={actualBehavior}
                        onChange={(e) => setActualBehavior(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="issue-tags"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500"
                    >
                      Tags
                    </label>
                    <input
                      id="issue-tags"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900"
                      placeholder="ui, regression, safari (comma-separated)"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="issue-external"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500"
                    >
                      Link elsewhere (optional)
                    </label>
                    <input
                      id="issue-external"
                      type="url"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900"
                      placeholder="https://… (Jira, GitHub issue, Slack, …)"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        Priority
                      </label>
                      <select
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        Status
                      </label>
                      <select
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      submitStatus === "saving" || submitStatus === "success"
                    }
                    onClick={() => void handleSubmit()}
                    className={`min-h-[48px] w-full touch-manipulation rounded-lg py-3 text-sm font-semibold shadow-glow transition disabled:opacity-90 ${
                      submitStatus === "success"
                        ? "bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-600"
                        : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500"
                    } disabled:cursor-default`}
                  >
                    {submitStatus === "saving" ? (
                      "Saving…"
                    ) : submitStatus === "success" ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                        Saved
                      </span>
                    ) : (
                      "Create issue"
                    )}
                  </button>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
