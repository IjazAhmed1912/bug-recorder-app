import type { IssueEnvironment } from "../types/issue"

/** Snapshot of browser context at report time (client-only, safe for Firestore). */
export function collectEnvironment(): IssueEnvironment {
  if (typeof window === "undefined") {
    return {
      pageUrl: "",
      userAgent: "",
      language: "",
      platform: "",
      viewportWidth: 0,
      viewportHeight: 0,
      timeZone: "",
      capturedAtIso: new Date().toISOString(),
    }
  }
  return {
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    capturedAtIso: new Date().toISOString(),
  }
}
