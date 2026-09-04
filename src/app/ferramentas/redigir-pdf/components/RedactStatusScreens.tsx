import { DropZone } from "@/components/upload/DropZone"
import { DownloadButton } from "@/components/processing/DownloadButton"
import type { Phase } from "../types"

interface RedactStatusScreensProps {
  state: Phase
  onDrop: (files: File[]) => void
  onReset: () => void
}

/**
 * Telas de estado fora do editor de redação: idle, loading, done e error.
 */
export function RedactStatusScreens({ state, onDrop, onReset }: RedactStatusScreensProps) {
  if (state.phase === "idle") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
          <p className="text-xs font-black uppercase tracking-widest mb-2">COMO FUNCIONA</p>
          <ol className="text-xs font-mono text-slate-600 space-y-1 list-decimal list-inside uppercase tracking-widest">
            <li>Faça upload do PDF</li>
            <li>Desenhe retângulos ou use a busca para marcar o que deseja ocultar</li>
            <li>Clique em &quot;Aplicar Alterações&quot; para gerar o PDF final</li>
          </ol>
        </div>
        <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={onDrop} />
      </div>
    )
  }

  if (state.phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-12 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-[#ccff00] rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-sm">CARREGANDO PÁGINAS...</p>
      </div>
    )
  }

  if (state.phase === "done") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="bg-[#00ff66] text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-4 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M4 10l4 4 8-8" />
          </svg>
          <p className="font-black uppercase tracking-widest text-sm">
            ALTERAÇÕES APLICADAS
            <span className="font-mono text-xs ml-2">{(state.size / 1024 / 1024).toFixed(1)} MB</span>
          </p>
        </div>
        <DownloadButton url={state.url} filename={state.filename} fileSize={state.size} onReset={onReset} />
      </div>
    )
  }

  if (state.phase === "error") {
    return (
      <div className="max-w-2xl mx-auto bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
        <div>
          <p className="font-black uppercase tracking-widest text-sm">ERRO</p>
          <p className="font-mono text-xs uppercase mt-1">{state.message}</p>
        </div>
        <button onClick={onReset} className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#ff4d4d] transition-colors">
          TENTAR NOVAMENTE
        </button>
      </div>
    )
  }

  return null
}