import { useState } from "react"
import AuthModal from "../components/AuthModal"
import { AppLogoIcon } from "../components/AppLogo"
import GlowCard from "../components/GlowCard"
import ThemeToggle from "../components/ThemeToggle"

function PreviewMock() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40">
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          app — Issues
        </span>
      </div>
      <div className="bg-zinc-50/50 p-3 dark:bg-zinc-950/50">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Inbox
          </span>
          <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-violet-600">
            + New
          </span>
        </div>
        {["Checkout — Safari", "Upload spinner", "Reset link 404"].map(
          (t) => (
            <div
              key={t}
              className="mb-1.5 flex items-center justify-between rounded border border-zinc-200 bg-white px-2.5 py-2 text-left text-[12px] font-medium text-zinc-800 last:mb-0 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {t}
              <span className="font-mono text-[10px] text-zinc-400">3</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authView, setAuthView] = useState<"signin" | "signup">("signup")

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-200/90 bg-white/95 backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <AppLogoIcon className="h-7 w-7" />
            </div>
            <span className="text-sm font-semibold tracking-tight dark:text-zinc-100">
              TraceFlow
            </span>
          </a>

          <nav
            className="hidden items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex"
            aria-label="Sections"
          >
            <a
              href="#product"
              className="transition hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Product
            </a>
            <a
              href="#how"
              className="transition hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              How it works
            </a>
            <a
              href="#features"
              className="transition hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Features
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                setAuthView("signin")
                setAuthOpen(true)
              }}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthView("signup")
                setAuthOpen(true)
              }}
              className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-zinc-100/80 dark:border-zinc-800/80">
          <div
            className="pointer-events-none absolute inset-0 glow-aurora"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div>
              <p className="text-sm font-medium text-violet-600/90">
                Bug reports that engineers can actually use
              </p>
              <h1 className="glow-text mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15] dark:text-zinc-50">
                Stop shipping “can’t reproduce” to your backlog.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                TraceFlow turns messy reports into one structured issue: clear
                steps, proof from the browser, and the environment metadata your
                team usually has to chase down in chat.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView("signup")
                    setAuthOpen(true)
                  }}
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-zinc-800"
                >
                  Get started free
                </button>
                <a
                  href="#product"
                  className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
                >
                  View product
                </a>
              </div>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
                Email sign-in · No credit card
              </p>
            </div>

            <div id="product" className="scroll-mt-28">
              <GlowCard>
                <PreviewMock />
              </GlowCard>
              <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-500">
                Illustrative preview — not live data.
              </p>
            </div>
          </div>
          </div>
        </section>

        <section
          id="how"
          className="scroll-mt-28 border-y border-zinc-100 bg-zinc-50/80 py-14 sm:py-16 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-50">
              How it works
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              From “something broke” to a ticket your team can act on — without
              another round of “what page were you on?”
            </p>
            <ol className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  n: "1",
                  t: "Reproduce with proof",
                  d: "Walk through the bug in your browser: add steps, grab screenshots, optionally record clicks, and capture session errors — all tied to one report.",
                },
                {
                  n: "2",
                  t: "Context fills itself in",
                  d: "TraceFlow saves URL, viewport, language, time zone, and device details the moment you file. Less detective work for whoever picks it up.",
                },
                {
                  n: "3",
                  t: "Ship it to your workflow",
                  d: "Everything lands in a shared inbox. Copy the whole issue as Markdown and paste into Slack, Jira, or email in one click.",
                },
              ].map((step) => (
                <li
                  key={step.n}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-violet-600">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                    {step.t}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {step.d}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-28 py-14 sm:py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-50">
              What makes a report actionable
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Not another generic form — each piece exists so the next person can
              reproduce, prioritize, or hand off without starting a thread.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  t: "Environment on the record",
                  d: "Page URL, viewport, browser fingerprint, language, and time zone are captured automatically — so “works on my machine” debates start with facts.",
                },
                {
                  t: "Evidence, not vibes",
                  d: "Screenshots, a click-by-click timeline, and optional runtime errors from the filing session — attached to the same issue as your written steps.",
                },
                {
                  t: "Markdown in one click",
                  d: "Export the full report for Slack, Jira, Linear, or email. No retyping steps into another tool.",
                },
                {
                  t: "One inbox, same shape",
                  d: "Every issue uses the same structure: triage faster when priority, status, and assignee live in one place.",
                },
              ].map((f) => (
                <div
                  key={f.t}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <h3 className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                    {f.t}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {f.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-zinc-500 dark:text-zinc-500 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} TraceFlow</span>
          <span className="text-xs text-center sm:text-right">
            Structured reports. Less back-and-forth.
          </span>
        </div>
      </footer>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialView={authView}
      />
    </div>
  )
}
