"use client";
import { useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { StateBanner } from "@/components/shared/StateBanner";
import { TextPreviewPanel } from "@/components/shared/TextPreviewPanel";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

export function PdfParaMarkdownClient() {
  const {
    status,
    error,
    downloadUrl,
    outputName,
    processedSize,
    textContent,
    process,
    retryLast,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/to-markdown",
    toolName: "pdf-para-markdown",
    outputFilename: (name) => name.replace(/\.pdf$/i, ".md"),
    captureText: true,
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0]),
    [process],
  );
  const handleDownload = useDownloadTracking("pdf-para-markdown", outputName);

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
          onRetry={retryLast}
        />
      )}
      {status === "error" && (
        <StateBanner
          tone="error"
          title="ERRO"
          message={error ?? "Falha ao processar o arquivo."}
          actionLabel="Tentar novamente"
          onAction={reset}
        />
      )}
      {status === "done" && downloadUrl && textContent && (
        <>
          <TextPreviewPanel title="MARKDOWN GERADO" text={textContent} />

          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            onDownload={handleDownload}
            fileSize={processedSize}
            onReset={reset}
          />
          <PromotionBanner />
        </>
      )}
    </div>
  );
}
