import Link from 'next/link'
import type { ToolDefinition } from '@/types/tools'

const ICONS: Record<string, React.ReactNode> = {
  compress: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M16 4v10M10 10l6-6 6 6M16 28v-10M10 22l6 6 6-6" />
    </svg>
  ),
  merge: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="10" height="14" />
      <rect x="18" y="4" width="10" height="14" />
      <path d="M9 18v4h14v-4M16 22v6" />
    </svg>
  ),
  split: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="24" height="14" />
      <line x1="4" y1="24" x2="28" y2="24" strokeDasharray="3,2" />
      <path d="M9 28h6M17 28h6" />
    </svg>
  ),
  'pdf-to-word': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="18" />
      <path d="M22 10l6 6-6 6M18 16h10" />
    </svg>
  ),
  'pdf-to-jpg': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="18" />
      <rect x="16" y="12" width="12" height="16" />
      <path d="M19 18l2 2 4-4" />
    </svg>
  ),
  'jpg-to-pdf': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="16" />
      <rect x="14" y="12" width="14" height="16" />
      <path d="M14 8l6 6-6 6" />
    </svg>
  ),
  rotate: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M26 16a10 10 0 1 1-3-7" />
      <path d="M26 6v7h-7" />
    </svg>
  ),
  organize: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="8" height="10" />
      <rect x="14" y="4" width="8" height="10" />
      <rect x="24" y="4" width="4" height="10" />
      <line x1="4" y1="20" x2="28" y2="20" />
      <line x1="4" y1="26" x2="20" y2="26" />
    </svg>
  ),
}

interface ToolCardProps {
  tool: ToolDefinition
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/ferramentas/${tool.slug}`}>
      <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6 hover:-translate-y-2 hover:bg-[#ccff00] transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="text-slate-950">
          {ICONS[tool.icon] ?? (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <rect x="4" y="4" width="24" height="24" />
            </svg>
          )}
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter leading-none mt-3 text-slate-950">{tool.name}</h3>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-2 leading-relaxed flex-1">{tool.description}</p>
        <span className="mt-3 self-start bg-slate-950 text-[#ccff00] text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-slate-950 shadow-[2px_2px_0px_#ccff00]">
          GRÁTIS
        </span>
      </div>
    </Link>
  )
}
