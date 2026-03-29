import { useEffect, useState } from "react"
import type { ClientErrorEntry } from "../types/issue"

/**
 * Captures window error + unhandled rejection while the new-issue page is mounted.
 * Helps attach console/runtime errors to the report without a full observability stack.
 */
export function useSessionClientErrors(): ClientErrorEntry[] {
  const [errors, setErrors] = useState<ClientErrorEntry[]>([])

  useEffect(() => {
    const push = (message: string, stack: string | undefined, extra?: Partial<ClientErrorEntry>) => {
      setErrors((prev) => [
        ...prev,
        {
          message,
          stack,
          time: Date.now(),
          ...extra,
        },
      ])
    }

    const onError = (e: ErrorEvent) => {
      const msg = e.message || "Error"
      const stack = e.error?.stack ?? `${e.filename ?? ""}:${e.lineno}:${e.colno}`
      push(msg, stack, {
        source: e.filename,
        line: e.lineno,
        col: e.colno,
      })
    }

    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason
      const message =
        typeof reason === "string"
          ? reason
          : reason instanceof Error
            ? reason.message
            : "Unhandled promise rejection"
      const stack = reason instanceof Error ? reason.stack : undefined
      push(message, stack)
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejection)
    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejection)
    }
  }, [])

  return errors
}
