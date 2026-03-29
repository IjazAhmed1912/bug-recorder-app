# TraceFlow

TraceFlow is a web app for **filing and managing bug reports**. Reporters sign in, create issues with reproduction steps, and can attach screenshots, optional click recordings, and automatically captured **environment** data (URL, viewport, language, time zone, platform, user agent). The inbox supports **search** (title, steps, tags, external links), **filters**, **CSV export**, and each issue can be copied as **Markdown** for tools like Jira, GitHub, or Slack.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Local setup](#local-setup)
- [Firebase rules](#firebase-rules)
- [Scripts](#scripts)
- [Build and hosting](#build-and-hosting)
- [Project layout](#project-layout)
- [Markdown export](#markdown-export)
- [License](#license)

---

## Features

| | |
|:---|:---|
| **Inbox** | List, search, and filter issues; export the current view to CSV. |
| **New issue** | Steps, tags, optional external link, screenshots, optional recording; session **client errors** can be captured while filing. |
| **Issue detail** | Status, priority, assignee, tags, link, comments; **Copy as Markdown**. |
| **Theme** | Light / dark. Data access is limited to the signed-in user via Firestore and Storage rules. |

---

## Tech stack

| Layer | Details |
|--------|---------|
| Frontend | React 19, TypeScript, Vite |
| UI | Tailwind CSS, Framer Motion |
| State | Zustand |
| Backend | Firebase Authentication, Cloud Firestore, Cloud Storage |
| Tests | Vitest (helpers for search, tags, CSV, etc.) |

---

## Local setup

**Prerequisites**

- [Node.js](https://nodejs.org/) **20+**
- A [Firebase](https://console.firebase.google.com/) project with **Authentication**, **Cloud Firestore**, and **Cloud Storage**
- A Firebase **web app** registered in that project (you need the config keys for `.env.local`)

**Install and run**

1. Clone and install dependencies:

   ```bash
   git clone <your-repo-url>
   cd bug-recorder-app
   npm install
   ```

2. Create your env file and add keys:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set the `VITE_*` variables as described in `.env.example`. For local-only hacking, empty values may fall back via `src/firebase/config.ts`; for any shared or production deployment, use **your own** Firebase project and real keys.

3. In the Firebase console, enable at least one **Authentication** provider, create a **Firestore** database, and enable **Storage**.

4. Deploy security rules (see [Firebase rules](#firebase-rules) below).

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open the URL from the terminal (typically `http://localhost:5173`), sign up or sign in, and create a test issue.

---

## Firebase rules

This repository includes `firestore.rules` and `storage.rules` so users only read and write their own data.

Install the [Firebase CLI](https://firebase.google.com/docs/cli), then from the project root:

```bash
firebase deploy --only firestore:rules,storage
```

Each issue document is expected to include **`userUid`** matching the signed-in user. Older or manual documents **without** `userUid` may be rejected until updated or removed.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (Vite) |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |

---

## Build and hosting

**Preview a production build**

```bash
npm run build
npm run preview
```

**Static hosting on a subpath (e.g. GitHub Pages)**

1. Set `base` in `vite.config.ts` to your repository path, e.g. `base: "/your-repo-name/"`.
2. Run `npm run build` and deploy the `dist` folder.
3. The router respects `import.meta.env.BASE_URL`; rebuild whenever you change `base`.

Adding a **screenshot or GIF** at the top of this README on GitHub helps visitors see the UI at a glance.

---

## Project layout

| Path | Role |
|------|------|
| `src/pages/` | Landing, dashboard, new issue, issue detail |
| `src/firebase/` | Firebase config, auth helpers, Storage uploads |
| `src/utils/environment.ts` | Snapshot of browser context when an issue is created |
| `src/utils/issueMarkdown.ts` | Builds Markdown for **Copy as Markdown** |
| `src/hooks/useSessionClientErrors.ts` | Captures errors during the new-issue session |
| `firestore.rules`, `storage.rules` | Security rules |

---

## Markdown export

Markdown is **not** stored as files in the repo. When you click **Copy as Markdown** on an issue, the app builds a string in code.

- **Implementation:** [`src/utils/issueMarkdown.ts`](src/utils/issueMarkdown.ts) — `buildIssueMarkdown(issue)`.
- **UI:** Issue detail → top bar → **Copy as Markdown**.

Adjust wording or structure by editing `issueMarkdown.ts`.

---

## License

Add a `LICENSE` file when you want to specify how others may use or contribute to the project.
