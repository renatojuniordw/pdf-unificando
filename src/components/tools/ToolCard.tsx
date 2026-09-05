import Link from 'next/link'
import type { ToolDefinition } from '@/types/tools'

import { getToolIcon } from './ToolIcons'

interface ToolCardProps {
  tool: ToolDefinition
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/ferramentas/${tool.slug}`}
      data-testid={`tool-card-${tool.slug}`}
      aria-label={tool.name}
    >
      <article className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6 hover:-translate-y-2 hover:bg-[#ccff00] transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="text-slate-950">
          {getToolIcon(tool.icon, 32)}
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter leading-none mt-3 text-slate-950">{tool.name}</h3>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-2 leading-relaxed flex-1">{tool.description}</p>
        <span className="mt-3 self-start bg-slate-950 text-[#ccff00] text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-slate-950 shadow-[2px_2px_0px_#ccff00]">
          GRÁTIS
        </span>
      </article>
    </Link>
  )
}
