import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import {
  loginUser,
  registerUser,
  sendPasswordReset,
  signInWithGithub,
  signInWithGoogle,
} from "../firebase/auth"
import { getAuthErrorMessage } from "../firebase/authErrors"
import { useNavigate } from "react-router-dom"

type Props = {
  isOpen: boolean
  onClose: () => void
  initialView?: "signin" | "signup"
}

type Panel = "auth" | "reset"

function IconGoogle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function IconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export default function AuthModal({
  isOpen,
  onClose,
  initialView = "signin",
}: Props) {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState("")
  const [panel, setPanel] = useState<Panel>("auth")
  const [resetSent, setResetSent] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<null | "google" | "github">(
    null
  )

  useEffect(() => {
    if (isOpen) {
      setIsSignup(initialView === "signup")
      setError("")
      setPanel("auth")
      setResetSent(false)
    }
  }, [isOpen, initialView])

  const finishAuth = () => {
    onClose()
    navigate("/dashboard")
  }

  const handleSubmit = async () => {
    try {
      setError("")

      const trimmed = email.trim()
      if (!trimmed || !password) {
        setError("Enter both email and password.")
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }

      if (isSignup) {
        await registerUser(trimmed, password)
      } else {
        await loginUser(trimmed, password)
      }

      finishAuth()
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
    }
  }

  const handleGoogle = async () => {
    try {
      setError("")
      setOauthLoading("google")
      const user = await signInWithGoogle()
      if (user) finishAuth()
      /* null = signInWithRedirect started; page will navigate away */
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
    } finally {
      setOauthLoading(null)
    }
  }

  const handleGithub = async () => {
    try {
      setError("")
      setOauthLoading("github")
      const user = await signInWithGithub()
      if (user) finishAuth()
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
    } finally {
      setOauthLoading(null)
    }
  }

  const handleSendReset = async () => {
    try {
      setError("")
      setResetSent(false)
      const trimmed = email.trim()
      if (!trimmed) {
        setError("Enter the email for your account.")
        return
      }
      await sendPasswordReset(trimmed)
      setResetSent(true)
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
    }
  }

  const title =
    panel === "reset"
      ? "Reset password"
      : isSignup
        ? "Create an account"
        : "Welcome back"

  const subtitle =
    panel === "reset"
      ? "We’ll email you a link to choose a new password."
      : isSignup
        ? "Start recording issues in minutes."
        : "Sign in to open your dashboard."

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm dark:bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto overflow-x-hidden rounded-3xl border border-stone-200/90 bg-white shadow-card dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stone-100 bg-gradient-to-br from-amber-50/80 to-white px-6 py-5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
              <h2
                id="auth-modal-title"
                className="text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-50"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-zinc-400">
                {subtitle}
              </p>
            </div>

            <div className="space-y-4 px-6 py-6">
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </p>
              )}

              {panel === "auth" && (
                <>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={oauthLoading !== null}
                      onClick={handleGoogle}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <IconGoogle className="h-5 w-5" />
                      {oauthLoading === "google"
                        ? "Opening Google…"
                        : "Continue with Google"}
                    </button>
                    <button
                      type="button"
                      disabled={oauthLoading !== null}
                      onClick={handleGithub}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-800 bg-stone-900 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      <IconGithub className="h-5 w-5" />
                      {oauthLoading === "github"
                        ? "Opening GitHub…"
                        : "Continue with GitHub"}
                    </button>
                  </div>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200 dark:border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-stone-500 dark:bg-zinc-900 dark:text-zinc-500">
                        or use email
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-500"
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-2.5 text-stone-900 outline-none ring-0 transition placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/25 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-500 dark:focus:bg-zinc-800 dark:focus:ring-violet-500/25"
                />
              </div>

              {panel === "auth" && (
                <>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="auth-password"
                        className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-500"
                      >
                        Password
                      </label>
                      {!isSignup && (
                        <button
                          type="button"
                          onClick={() => {
                            setPanel("reset")
                            setError("")
                            setResetSent(false)
                          }}
                          className="text-xs font-medium text-amber-700 hover:underline dark:text-violet-400"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      id="auth-password"
                      type="password"
                      autoComplete={
                        isSignup ? "new-password" : "current-password"
                      }
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-2.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/25 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-500 dark:focus:bg-zinc-800 dark:focus:ring-violet-500/25"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={oauthLoading !== null}
                    className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-stone-800 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
                  >
                    {isSignup ? "Create account" : "Sign in"}
                  </button>

                  <p className="text-center text-sm text-stone-600 dark:text-zinc-400">
                    {isSignup ? "Already have an account?" : "New here?"}{" "}
                    <button
                      type="button"
                      className="font-semibold text-amber-700 underline-offset-2 hover:underline dark:text-violet-400"
                      onClick={() => {
                        setIsSignup(!isSignup)
                        setError("")
                      }}
                    >
                      {isSignup ? "Sign in" : "Create an account"}
                    </button>
                  </p>
                </>
              )}

              {panel === "reset" && (
                <>
                  {resetSent ? (
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                      Check your inbox for a reset link. If you don’t see it, look
                      in spam.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleSendReset}
                    className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-stone-800 dark:bg-violet-600 dark:hover:bg-violet-500"
                  >
                    Send reset link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPanel("auth")
                      setError("")
                      setResetSent(false)
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Back to sign in
                  </button>
                </>
              )}

              {panel === "auth" && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
