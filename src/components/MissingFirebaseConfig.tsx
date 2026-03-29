import { getFirebaseEnvIssues } from "../firebase/env"

/** Shown when VITE_* Firebase vars are missing (avoids a silent blank screen). */
export default function MissingFirebaseConfig() {
  const issues = getFirebaseEnvIssues()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-6 text-center dark:bg-zinc-950">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Firebase configuration missing
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Put a file named <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">.env.local</code> in the{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">same folder as package.json</strong>, copy from{" "}
        <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">.env.example</code>, and paste values from Firebase →{" "}
        <strong>Project settings</strong> → <strong>Your apps</strong> (web app config).
      </p>
      {issues.length > 0 && (
        <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left dark:border-amber-900/50 dark:bg-amber-950/40">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
            What needs fixing
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-amber-950 dark:text-amber-100/95">
            {issues.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        After saving, <strong className="text-zinc-800 dark:text-zinc-200">restart</strong> the dev server (
        <code className="font-mono text-xs">Ctrl+C</code> then{" "}
        <code className="font-mono text-xs">npm run dev</code>
        ). Vite only reads <code className="font-mono text-xs">.env.local</code> when it starts.
      </p>
    </div>
  )
}
