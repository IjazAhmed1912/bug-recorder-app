import type { Timestamp } from "firebase/firestore"

export type IssueComment = {
  id: string
  text: string
  authorLabel: string
  createdAt: Timestamp | null
}

/** Browser context captured when the issue is filed. */
export type IssueEnvironment = {
  pageUrl: string
  userAgent: string
  language: string
  platform: string
  viewportWidth: number
  viewportHeight: number
  timeZone: string
  capturedAtIso: string
}

/** Runtime errors observed during the “new issue” session (same tab). */
export type ClientErrorEntry = {
  message: string
  stack?: string
  source?: string
  line?: number
  col?: number
  time: number
}

export type IssueDoc = {
  id: string
  title?: string
  steps?: string[]
  flags?: Record<string, boolean>
  priority?: string
  status?: string
  userId?: string | null
  userUid?: string
  createdByLabel?: string
  assigneeEmail?: string | null
  /** Labels for filtering and triage, e.g. ["ui", "safari"]. */
  tags?: string[]
  /** Optional link to Jira, GitHub issue, Slack thread, etc. */
  externalLink?: string | null
  /** What should have happened (classic bug template). */
  expectedBehavior?: string | null
  /** What happened instead. */
  actualBehavior?: string | null
  screenshotUrls?: string[]
  /** Set if background upload after create failed (issue still saved). */
  screenshotUploadError?: string | null
  /** Auto-captured page / device context at create time. */
  environment?: IssueEnvironment
  /** window.onerror / unhandledrejection while filing (if any). */
  clientErrors?: ClientErrorEntry[]
  comments?: IssueComment[]
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}
