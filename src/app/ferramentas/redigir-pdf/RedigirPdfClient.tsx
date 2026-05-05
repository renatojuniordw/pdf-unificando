"use client";

import { useState, useCallback, useRef } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { DownloadButton } from "@/components/processing/DownloadButton";

type Rect = { id: string; page: number; x: number; y: number; w: number; h: number };
type PageInfo = { image: string; width: number; height: number };
type DrawingRect = { page: number; startX: number; startY: number; currentX: number; currentY: number };

type State =
  | { phase: "idle" }
  | { phase: "loading"; file: File }
  | { phase: "editing"; file: File; pages: PageInfo[]; rects: Rect[] }
  | { phase: "processing"; file: File; pages: PageInfo[]; rects: Rect[] }
  | { phase: "done"; url: string; filename: string; size: number }
  | { phase: "error"; message: string };

function getNormalized(d: DrawingRect) {
  return {
    x: Math.min(d.startX, d.currentX),
    y: Math.min(d.startY, d.currentY),
    w: Math.abs(d.currentX - d.startX),
    h: Math.abs(d.currentY - d.startY),
  };
}

export function RedigirPdfClient() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [drawing, setDrawing] = useState<DrawingRect | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const urlRef = useRef<string | null>(null);

  const handleDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    setState({ phase: "loading", file });

    const hp = document.querySelector<HTMLInputElement>("[data-honeypot]")?.value ?? "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("_hp", hp);

    try {
      const res = await fetch("/api/pdf/redact/preview", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar preview.");
      setState({ phase: "editing", file, pages: data.pages, rects: [] });
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Erro desconhecido." });
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, page: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setDrawing({ page, startX: x, startY: y, currentX: x, currentY: y });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawing) return;
    const el = pageRefs.current.get(drawing.page);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    setDrawing((prev) => prev ? { ...prev, currentX: x, currentY: y } : null);
  }, [drawing]);

  const handleMouseUp = useCallback(() => {
    if (!drawing) return;
    const norm = getNormalized(drawing);
    if (norm.w > 0.01 && norm.h > 0.005) {
      setState((prev) => {
        if (prev.phase !== "editing") return prev;
        return {
          ...prev,
          rects: [...prev.rects, { id: crypto.randomUUID(), page: drawing.page, ...norm }],
        };
      });
    }
    setDrawing(null);
  }, [drawing]);

  const removeRect = useCallback((id: string) => {
    setState((prev) => {
      if (prev.phase !== "editing") return prev;
      return { ...prev, rects: prev.rects.filter((r) => r.id !== id) };
    });
  }, []);

  const handleApply = useCallback(async () => {
    if (state.phase !== "editing" || state.rects.length === 0) return;
    const { file, pages, rects } = state;
    setState({ phase: "processing", file, pages, rects });

    const hp = document.querySelector<HTMLInputElement>("[data-honeypot]")?.value ?? "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("_hp", hp);
    formData.append(
      "regions",
      JSON.stringify(rects.map((r) => ({ page: r.page, x: r.x, y: r.y, width: r.w, height: r.h }))),
    );

    try {
      const res = await fetch("/api/pdf/redact", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao aplicar redação.");
      }
      const blob = await res.blob();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);
      setState({ phase: "done", url: urlRef.current, filename: file.name.replace(".pdf", "-redigido.pdf"), size: blob.size });
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Erro desconhecido." });
    }
  }, [state]);

  const reset = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setState({ phase: "idle" });
    setDrawing(null);
    pageRefs.current.clear();
  }, []);

  if (state.phase === "idle") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
          <p className="text-xs font-black uppercase tracking-widest mb-2">COMO FUNCIONA</p>
          <ol className="text-xs font-mono text-slate-600 space-y-1 list-decimal list-inside uppercase tracking-widest">
            <li>Faça upload do PDF</li>
            <li>Desenhe retângulos sobre as áreas a censurar</li>
            <li>Clique em &quot;Aplicar Redação&quot; para gerar o PDF final</li>
          </ol>
        </div>
        <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} />
      </div>
    );
  }

  if (state.phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-12 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-[#ccff00] rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-sm">CARREGANDO PÁGINAS...</p>
      </div>
    );
  }

  if (state.phase === "done") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="bg-[#00ff66] text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-4 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M4 10l4 4 8-8" />
          </svg>
          <p className="font-black uppercase tracking-widest text-sm">
            REDAÇÃO APLICADA
            <span className="font-mono text-xs ml-2">{(state.size / 1024 / 1024).toFixed(1)}MB</span>
          </p>
        </div>
        <DownloadButton url={state.url} filename={state.filename} fileSize={state.size} onReset={reset} />
        <PromotionBanner />
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="max-w-2xl mx-auto bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
        <div>
          <p className="font-black uppercase tracking-widest text-sm">ERRO</p>
          <p className="font-mono text-xs uppercase mt-1">{state.message}</p>
        </div>
        <button onClick={reset} className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#ff4d4d] transition-colors">
          TENTAR NOVAMENTE
        </button>
      </div>
    );
  }

  // editing or processing phase
  const isProcessing = state.phase === "processing";
  const { pages, rects } = state;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest">
            {rects.length === 0
              ? "DESENHE AS ÁREAS A CENSURAR"
              : `${rects.length} ÁREA${rects.length > 1 ? "S" : ""} MARCADA${rects.length > 1 ? "S" : ""}`}
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
            Clique e arraste sobre o texto ou área que deseja cobrir
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            disabled={isProcessing}
            className="border-4 border-slate-950 px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            CANCELAR
          </button>
          <button
            onClick={handleApply}
            disabled={rects.length === 0 || isProcessing}
            className="border-4 border-slate-950 bg-slate-950 text-[#ccff00] px-4 py-2 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#ccff00] hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:shadow-none flex items-center gap-2"
          >
            {isProcessing && <span className="w-3 h-3 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />}
            APLICAR REDAÇÃO
          </button>
        </div>
      </div>

      <div
        className="flex flex-col gap-4 select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setDrawing(null)}
      >
        {pages.map((page, pageIdx) => {
          const pageRects = rects.filter((r) => r.page === pageIdx);
          const drawingHere = drawing?.page === pageIdx ? getNormalized(drawing) : null;

          return (
            <div key={pageIdx} className="relative border-4 border-slate-950 shadow-[4px_4px_0px_#000] overflow-hidden">
              <div className="absolute top-0 left-0 z-10 bg-slate-950 text-[#ccff00] text-[10px] font-black px-2 py-1 pointer-events-none">
                PÁG {pageIdx + 1}
              </div>

              <div
                ref={(el) => { if (el) pageRefs.current.set(pageIdx, el); else pageRefs.current.delete(pageIdx); }}
                className={`relative ${isProcessing ? "cursor-not-allowed" : "cursor-crosshair"}`}
                onMouseDown={isProcessing ? undefined : (e) => handleMouseDown(e, pageIdx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.image} alt={`Página ${pageIdx + 1}`} className="w-full block" draggable={false} />

                {pageRects.map((r) => (
                  <div
                    key={r.id}
                    className="absolute bg-slate-950"
                    style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
                  >
                    {!isProcessing && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeRect(r.id); }}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-[#ff4d4d] text-white text-xs font-black flex items-center justify-center border-2 border-slate-950 z-20 hover:bg-red-700"
                        title="Remover"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {drawingHere && (
                  <div
                    className="absolute bg-slate-950 opacity-60 pointer-events-none"
                    style={{ left: `${drawingHere.x * 100}%`, top: `${drawingHere.y * 100}%`, width: `${drawingHere.w * 100}%`, height: `${drawingHere.h * 100}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
