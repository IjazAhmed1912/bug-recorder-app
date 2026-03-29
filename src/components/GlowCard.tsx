import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
  variant?: "default" | "intense"
}

/** Jam-style animated gradient border + soft inner surface */
export default function GlowCard({
  children,
  className = "",
  variant = "default",
}: Props) {
  const outer =
    variant === "intense" ? "glow-border-intense p-[1.5px]" : "glow-border p-px"
  return (
    <div className={`rounded-2xl ${outer} ${className}`}>
      <div className="rounded-[0.9rem] bg-white dark:bg-zinc-950">
        {children}
      </div>
    </div>
  )
}
