"use client";

import { useCallback } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useTextStats } from "@/hooks/useTextStats";
import { BrutalistCard } from "@/components/layout/BrutalistCard";

interface TextPreviewPanelProps {
  title: string;
  text: string;
}

export function TextPreviewPanel({ title, text }: TextPreviewPanelProps) {
  const { copied, copy, error, isCopying } = useCopyToClipboard();
  const { wordCount, characterCount } = useTextStats(text);
  const handleCopy = useCallback(() => copy(text), [copy, text]);

  return (
    <BrutalistCard tone="accent">
      <div className="flex items-center justify-between bg-slate-950 px-4 py-3 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[#ccff00] font-black uppercase text-xs tracking-widest">
            {title}
          </span>
          <span className="text-slate-400 font-mono text-xs truncate">
            {wordCount.toLocaleString("pt-BR")} palavras ·{" "}
            {characterCount.toLocaleString("pt-BR")} caracteres
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={isCopying}
          aria-busy={isCopying}
          className="border-2 border-slate-950 px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isCopying ? "COPIANDO..." : copied ? "COPIADO ✓" : "COPIAR"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-800 bg-white overflow-auto max-h-80 leading-relaxed whitespace-pre-wrap break-words">
        {text}
      </pre>
      {error ? (
        <p role="alert" aria-live="assertive" className="border-t-2 border-slate-950 bg-red-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#b91c1c]">
          {error}
        </p>
      ) : null}
    </BrutalistCard>
  );
}
