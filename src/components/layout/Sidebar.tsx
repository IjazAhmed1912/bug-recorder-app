import { NavLink } from "react-router-dom"
import { AppLogoIcon } from "../AppLogo"
import ThemeToggle from "../ThemeToggle"
import { useSidebar } from "../../contexts/SidebarContext"

function IconHome({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
    isActive
      ? "bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-50"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200",
  ].join(" ")

export default function Sidebar() {
  const { mobileOpen, closeMobile } = useSidebar()

  const afterNav = () => {
    closeMobile()
  }

  const inner = (
    <>
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800/80">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-[0_0_20px_-5px_rgba(167,139,250,0.45)] dark:bg-zinc-100 dark:text-zinc-900">
            <AppLogoIcon className="h-7 w-7" />
          </div>
          <span className="truncate text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            TraceFlow
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 md:hidden"
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Workspace">
        <NavLink to="/dashboard" end className={linkClass} onClick={afterNav}>
          <IconHome className="h-[15px] w-[15px] shrink-0 opacity-90" />
          Issues
        </NavLink>
        <NavLink to="/new" className={linkClass} onClick={afterNav}>
          <IconPlus className="h-[15px] w-[15px] shrink-0 opacity-90" />
          New issue
        </NavLink>
      </nav>

      <div className="border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800/80">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
          Workspace
        </p>
        <p className="truncate text-[12px] text-zinc-600 dark:text-zinc-500">
          Default
        </p>
      </div>
    </>
  )

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 dark:bg-zinc-950/60 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[220px] flex-col border-r border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 transition-transform duration-200 ease-out dark:border-zinc-800/90 dark:bg-zinc-950 dark:shadow-[4px_0_40px_-10px_rgba(139,92,246,0.35)] md:relative md:z-auto md:translate-x-0 md:shadow-none md:dark:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {inner}
      </aside>
    </>
  )
}
