import type { ReactNode } from "react"

interface ToolFlowShellProps {
  children: ReactNode
  className?: string
}

export function ToolFlowShell({ children, className = "" }: ToolFlowShellProps) {
  return (
    <div className={`mx-auto flex w-full max-w-2xl flex-col gap-6 ${className}`}>
      {children}
    </div>
  )
}
