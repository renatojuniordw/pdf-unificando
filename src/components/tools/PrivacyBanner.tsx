export function PrivacyBanner() {
  return (
    <div className="bg-slate-950 border-4 border-[#ccff00] shadow-[4px_4px_0px_#ccff00] px-6 py-4 flex items-center gap-4">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccff00" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="flex-shrink-0">
        <path d="M10 2L4 5v5c0 4 2.4 7.4 6 9 3.6-1.6 6-5 6-9V5l-6-3z" />
        <path d="M7 10l2 2 4-4" />
      </svg>
      <div>
        <p className="text-[#ccff00] font-black uppercase tracking-widest text-[10px]">
          SEUS ARQUIVOS NÃO SÃO ARMAZENADOS
        </p>
        <p className="text-slate-400 font-mono text-[9px] uppercase tracking-widest mt-0.5">
          Processados em memória e descartados imediatamente.
        </p>
      </div>
    </div>
  )
}
