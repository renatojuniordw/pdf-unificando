"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";

const DPI_OPTIONS = ["72", "150", "300"];

export function PdfParaPngClient() {
  const [dpi, setDpi] = useState("150");
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
    endpoint: "/api/pdf/to-png",
    toolName: "pdf-para-png",
    outputFilename: (name) => name.replace(".pdf", ".zip"),
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0], { dpi }),
    [process, dpi],
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
            <p className="text-xs font-black uppercase tracking-widest mb-3">
              RESOLUÇÃO (DPI)
            </p>
            <div className="flex gap-3">
              {DPI_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDpi(d)}
                  className={`flex-1 border-4 p-3 font-black uppercase text-sm tracking-widest transition-all ${
                    dpi === d
                      ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
                      : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
                  }`}
                >
                  {d} DPI
                </button>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-3 uppercase tracking-widest">
              PNG com canal alpha — fundo transparente quando disponível
            </p>
          </div>
          <DropZone
            accept={{ "application/pdf": [".pdf"] }}
            onDrop={handleDrop}
          />
        </>
      )}

      {(status === "uploading" || status === "processing") && (
        <ProcessingStatus status={status} />
      )}

      {status === "rate_limited" && (
        <RetryCountdown
          secondsLeft={secondsLeft}
          progress={progress}
          onRetry={reset}
        />
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
              PDF CONVERTIDO
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
            toolName="pdf-para-png"
            fileSize={processedSize}
            onReset={reset}
          />
          <PromotionBanner />
        </div>
      )}
    </div>
  );
}
