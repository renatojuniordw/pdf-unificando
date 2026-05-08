"use client";

import { useCallback, useState } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";

const PLACEMENT_OPTIONS = [
  { value: "footer", label: "RODAPÉ" },
  { value: "header", label: "CABEÇALHO" },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: "left", label: "ESQUERDA" },
  { value: "center", label: "CENTRO" },
  { value: "right", label: "DIREITA" },
] as const;

export function NumerarPaginasClient() {
  const [placement, setPlacement] = useState("footer");
  const [alignment, setAlignment] = useState("center");
  const [startAt, setStartAt] = useState("1");

  const {
    status,
    error,
    downloadUrl,
    outputName,
    processedSize,
    process,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/page-numbers",
    toolName: "numerar-paginas",
    outputFilename: (name) => name.replace(/\.pdf$/i, "-numerado.pdf"),
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0], { placement, alignment, startAt }),
    [alignment, placement, process, startAt],
  );

  return (
    <div className="max-w-2xl mx-auto">
      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6 flex flex-col gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3">POSIÇÃO</p>
              <div className="flex gap-3">
                {PLACEMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPlacement(opt.value)}
                    className={`flex-1 border-4 p-3 transition-all font-black uppercase text-xs tracking-widest ${
                      placement === opt.value
                        ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
                        : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3">ALINHAMENTO</p>
              <div className="flex gap-3">
                {ALIGNMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAlignment(opt.value)}
                    className={`flex-1 border-4 p-3 transition-all font-black uppercase text-xs tracking-widest ${
                      alignment === opt.value
                        ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
                        : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3">COMEÇAR EM</p>
              <input
                type="number"
                min={1}
                max={9999}
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full border-4 border-slate-950 px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-[#ccff00] transition-colors"
              />
            </div>
          </div>

          <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} />
        </div>
      )}

      {(status === "uploading" || status === "processing") && <ProcessingStatus status={status} />}

      {status === "rate_limited" && (
        <RetryCountdown secondsLeft={secondsLeft} progress={progress} onRetry={reset} />
      )}

      {status === "error" && (
        <div className="bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <div>
            <p className="font-black uppercase tracking-widest text-sm">ERRO</p>
            <p className="font-mono text-xs uppercase mt-1">{error}</p>
          </div>
          <button
            onClick={reset}
            className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#ff4d4d] transition-colors"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {status === "done" && downloadUrl && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#00ff66] text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-4 flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 10l4 4 8-8" />
            </svg>
            <p className="font-black uppercase tracking-widest text-sm">
              PÁGINAS NUMERADAS
              {processedSize && (
                <span className="font-mono text-xs ml-2">
                  {(processedSize / 1024 / 1024).toFixed(1)}MB
                </span>
              )}
            </p>
          </div>
          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            toolName="numerar-paginas"
            fileSize={processedSize}
            onReset={reset}
          />
          <PromotionBanner />
        </div>
      )}
    </div>
  );
}
