import type { HTMLAttributes, ReactNode } from "react"

interface BrutalistCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tone?: "default" | "accent"
}

const TONE_CLASSES: Record<NonNullable<BrutalistCardProps["tone"]>, string> = {
  default: "bg-white shadow-[8px_8px_0px_#000]",
  accent: "bg-white shadow-[8px_8px_0px_#ccff00]",
}

export function BrutalistCard({
  children,
  className = "",
  tone = "default",
  ...props
}: BrutalistCardProps) {
  return (
    <div
      {...props}
      className={`border-4 border-slate-950 ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </div>
  )
}
