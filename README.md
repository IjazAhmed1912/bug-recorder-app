# TraceFlow

**TraceFlow** helps teams file bugs with enough context to reproduce them: structured steps, automatic environment metadata, screenshots, optional click traces, and a one-click **Markdown** handoff for Slack, Jira, or email.

### For GitHub (quick read)

- **What it is:** A signed-in **inbox** for bug reports—steps, tags, optional external links, screenshots, optional click recording, captured **environment** (URL, viewport, UA, …), search/filter, **CSV** export, and **Copy as Markdown**.
- **Why it exists:** A **portfolio / CV** project to show React + TypeScript + Firebase (Auth, Firestore, Storage, rules) and **Vitest** tests in something that feels like a small product—not a commercial SaaS.
- **Run it:** Node 20+, a Firebase project, then **[Getting started](#getting-started)** (`npm install`, copy `.env.example` → `.env.local`, `npm run dev`).

Tip: add a **screenshot or GIF** near the top of this file on GitHub (drag-and-drop in the README editor) so visitors see the UI immediately.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand |
| Backend | Firebase Authentication, Cloud Firestore, Cloud Storage |

---

## What you can do

- Sign in and manage **issues** in a single inbox (title, steps, **tags**, optional **link elsewhere**, priority, status, assignee, comments).
- **Search** across title, steps, tags, and external links; **filter by tag**; **export CSV** for the issues currently shown in the inbox.
- On **New issue**, capture **screenshots**, optional **click recording**, and (while that tab is open) **browser errors** to attach to the report.
- At create time, **environment** is saved automatically: URL, viewport, language, time zone, platform, user agent.
- On **Issue detail**, review everything in one place and use **Copy as Markdown** to paste into another tool.
- Switch **light / dark** theme; data access is limited to the signed-in reporter via security rules.

---

## Markdown export (where it lives)

There is **no separate Markdown file per issue** in the repo. Export text is **built in code** when you need it:

| What | Where |
|------|--------|
| **Generator** | [`src/utils/issueMarkdown.ts`](src/utils/issueMarkdown.ts) — `buildIssueMarkdown(issue)` returns a string (headings, lists, links to screenshots). |
| **In the UI** | Open any issue (**Issue detail**). In the **top bar**, click **Copy as Markdown**. That copies the generated string to your clipboard. |

So: **Markdown = runtime output**, same idea as “Export as…” in other apps. To change the format, edit `issueMarkdown.ts`.

---

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 20+ (or current LTS)
- A [Firebase](https://console.firebase.google.com/) project with **Authentication**, **Cloud Firestore**, and **Cloud Storage**

### Install and run

```bash
git clone <your-repo-url>
cd bug-recorder-app
npm install
cp .env.example .env.local
```

Add your Firebase web app keys to `.env.local` (see `.env.example`). For local development, empty `VITE_*` values fall back to defaults in `src/firebase/config.ts`; use **your own** project for anything public or production.

```bash
npm run dev
```

Then open the printed URL (typically `http://localhost:5173`).

### Firebase setup (short checklist)

1. **Authentication** — Enable the providers you want (Email, Google, GitHub).
2. **Firestore** — Create a database; then deploy the rules in this repo (`firestore.rules`).
3. **Storage** — Enable it; then deploy `storage.rules`.

With the [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
firebase deploy --only firestore:rules,storage
```

**Rule of thumb:** Each issue document must include **`userUid`** matching the signed-in user. Older documents **without** `userUid` will be rejected by the current rules until you migrate or remove them.

### Build and preview

```bash
npm run build
npm run preview
```

### Deploying under a subpath (e.g. GitHub Pages)

Set `base` in `vite.config.ts` to your repository path, for example:

```ts
base: "/your-repo-name/",
```

The app router uses `import.meta.env.BASE_URL` so routes stay correct. Rebuild after changing `base`.

---

## Useful paths in this repo

| Path | Role |
|------|------|
| `src/pages/` | Landing, dashboard, new issue, issue detail |
| `src/firebase/` | Config, auth helpers, storage uploads |
| `src/utils/environment.ts` | Snapshot of browser context for new issues |
| `src/utils/issueMarkdown.ts` | Markdown string for “Copy as Markdown” |
| `src/hooks/useSessionClientErrors.ts` | Session error listeners on the new-issue page |
| `firestore.rules` / `storage.rules` | Owner-scoped access |

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest (unit tests; `npm run test:watch` for watch mode) |

---

## License

Add a `LICENSE` file if you open-source the project.
