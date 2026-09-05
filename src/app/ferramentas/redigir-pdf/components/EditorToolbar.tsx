"use client"

import type { Resolution } from "../types"

interface SearchState {
  query: string
  isSearching: boolean
  resultCount: number | null
  errorMessage?: string | null
}

interface Props {
  // History
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  // Zoom
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  // Resolution
  resolution: Resolution
  onResolutionChange: (r: Resolution) => void
  // Search
  search: SearchState
  onSearchQueryChange: (q: string) => void
  onSearchSubmit: () => void
  // Actions
  rectCount: number
  isProcessing: boolean
  onApply: () => void
  onCancel: () => void
}

export function EditorToolbar({
  canUndo, canRedo, onUndo, onRedo,
  zoom, onZoomIn, onZoomOut,
  resolution, onResolutionChange,
  search, onSearchQueryChange, onSearchSubmit,
  rectCount, isProcessing,
  onApply, onCancel,
}: Props) {
  return (
    <div className="border-b-4 border-slate-950 bg-white p-2 md:p-3 flex flex-col gap-2 md:gap-3" aria-label="Ferramentas do editor">
 
       {/* Row 1: tools */}
       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
 
         {/* Undo / Redo */}
         <div className="flex border-2 border-slate-950 flex-shrink-0">
           <ToolButton onClick={onUndo} disabled={!canUndo || isProcessing} title="Desfazer (Ctrl+Z)">
             <UndoIcon />
           </ToolButton>
           <div className="w-px bg-slate-950" />
           <ToolButton onClick={onRedo} disabled={!canRedo || isProcessing} title="Refazer (Ctrl+Shift+Z)">
             <RedoIcon />
           </ToolButton>
         </div>
 
         {/* Zoom */}
         <div className="flex items-center border-2 border-slate-950 flex-shrink-0">
           <ToolButton onClick={onZoomOut} disabled={zoom <= 75 || isProcessing} title="Diminuir zoom">
             <MinusIcon />
           </ToolButton>
           <span className="px-1 text-[9px] font-black font-mono w-10 text-center select-none">{zoom}%</span>
           <ToolButton onClick={onZoomIn} disabled={zoom >= 200 || isProcessing} title="Aumentar zoom">
             <PlusIcon />
           </ToolButton>
         </div>
 
         {/* Resolution - Hidden on very small screens, shown as icon or simplified */}
         <select
           value={resolution}
           onChange={(e) => onResolutionChange(Number(e.target.value) as Resolution)}
           disabled={isProcessing}
           className="hidden sm:block border-2 border-slate-950 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white disabled:opacity-40 cursor-pointer flex-shrink-0"
           title="Qualidade do PDF gerado"
         >
           <option value={72}>Rápido (72 DPI)</option>
           <option value={144}>Padrão (144 DPI)</option>
           <option value={216}>Alta (216 DPI)</option>
         </select>
 
 
         {/* Status badge - desktop only */}
         <span className="hidden md:block ml-auto text-[10px] font-black uppercase tracking-widest text-slate-600">
           {rectCount === 0 ? "Nenhuma área" : `${rectCount} área${rectCount > 1 ? "s" : ""}`}
         </span>
       </div>
 
       {/* Row 2: search + actions */}
       <div className="flex items-center gap-2">
 
         {/* Search */}
        <div className="flex flex-1 min-w-0 border-2 border-slate-950">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex">
              <input
                type="text"
                data-testid="redact-search-input"
                value={search.query}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !isProcessing) onSearchSubmit() }}
                placeholder="Buscar e censurar..."
                disabled={isProcessing}
                className="flex-1 min-w-0 px-2 py-1.5 text-[10px] font-mono bg-white placeholder-slate-400 outline-none disabled:opacity-40"
              />
              <button
                type="button"
                data-testid="redact-search-submit"
                onClick={onSearchSubmit}
                disabled={!search.query.trim() || search.isSearching || isProcessing}
                className="px-2 border-l-2 border-slate-950 text-[10px] font-black uppercase tracking-widest bg-slate-950 text-[#ccff00] hover:bg-slate-800 transition-colors disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                aria-label="Marcar todas as ocorrências"
              >
                {search.isSearching ? (
                  <span className="w-3 h-3 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SearchIcon />
                )}
                <span className="hidden sm:inline">Marcar tudo</span>
              </button>
            </div>
            {search.errorMessage && (
              <p className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#ff4d4d] border-t border-slate-950 bg-red-50">
                {search.errorMessage}
              </p>
            )}
          </div>
        </div>
 
         {/* Primary actions */}
         <div className="flex gap-1.5 ml-auto flex-shrink-0">
           <button
             type="button"
             onClick={onCancel}
             disabled={isProcessing}
             className="border-2 border-slate-950 px-2 py-1.5 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-colors disabled:opacity-40"
             title="Fechar Editor"
           >
             <span className="hidden sm:inline">Cancelar</span>
             <span className="sm:hidden">Sair</span>
           </button>
           <button
             type="button"
             onClick={onApply}
             disabled={rectCount === 0 || isProcessing}
             className="border-2 border-slate-950 bg-slate-950 text-[#ccff00] px-2 py-1.5 font-black uppercase text-[10px] tracking-widest shadow-[2px_2px_0px_#ccff00] hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:shadow-none flex items-center gap-1"
           >
             {isProcessing && <span className="w-3 h-3 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />}
             Aplicar <span className="hidden sm:inline">Alterações</span>
           </button>
         </div>
       </div>
     </div>
   )
 }

function ToolButton({ onClick, disabled, title, children }: {
  onClick: () => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M2 5h6a3 3 0 010 6H5" />
      <path d="M2 2l-2 3 2 3" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M12 5H6a3 3 0 000 6h3" />
      <path d="M12 2l2 3-2 3" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M2 6h8" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M6 2v8M2 6h8" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <circle cx="5" cy="5" r="3.5" />
      <path d="M8 8l2.5 2.5" />
    </svg>
  )
}
