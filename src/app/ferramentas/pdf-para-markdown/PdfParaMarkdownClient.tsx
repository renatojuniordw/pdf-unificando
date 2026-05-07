"use client";
import { useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";

export function PdfParaMarkdownClient() {
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
    endpoint: "/api/pdf/to-markdown",
    toolName: "pdf-para-markdown",
    outputFilename: (name) => name.replace(/\.pdf$/i, ".md"),
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0]),
    [process],
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <div className="border-4 border-slate-950 bg-slate-950 text-[#ccff00] shadow-[8px_8px_0px_#ccff00] p-4 flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">✦</span>
            <p className="text-xs font-mono font-bold uppercase leading-relaxed">
              Ideal para RAG, LLMs e inteligência artificial. Funciona apenas com PDFs de texto — não suporta PDFs escaneados.
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
          <p className="font-black uppercase tracking-widest text-sm">
            ERRO: {error}
          </p>
          <button
            onClick={reset}
            className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}
      {status === "done" && downloadUrl && (
        <>
          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            toolName="pdf-para-markdown"
            fileSize={processedSize}
            onReset={reset}
          />
          <PromotionBanner />
        </>
      )}
    </div>
  );
}
