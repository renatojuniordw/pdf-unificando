"use client";

import { useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { StateBanner } from "@/components/shared/StateBanner";
import { TextPreviewPanel } from "@/components/shared/TextPreviewPanel";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

export function PdfParaTxtClient() {
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
    endpoint: "/api/pdf/to-txt",
    toolName: "pdf-para-txt",
    outputFilename: (name) => name.replace(/\.pdf$/i, ".txt"),
    captureText: true,
  });

  const handleDrop = useCallback((files: File[]) => process(files[0]), [process]);
  const handleDownload = useDownloadTracking("pdf-para-txt", outputName);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <div className="border-4 border-slate-950 bg-slate-950 text-[#ccff00] shadow-[8px_8px_0px_#ccff00] p-4 flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">TXT</span>
            <p className="text-xs font-mono font-bold uppercase leading-relaxed">
              Extrai apenas o texto do PDF para um arquivo simples. Ideal para copiar conteúdo, leitura rápida e automações.
            </p>
          </div>
          <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} />
        </>
      )}

      {(status === "uploading" || status === "processing") && <ProcessingStatus status={status} />}

      {status === "rate_limited" && (
        <RetryCountdown secondsLeft={secondsLeft} progress={progress} onRetry={retryLast} />
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
          <TextPreviewPanel title="TEXTO EXTRAÍDO" text={textContent} />

          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            onDownload={handleDownload}
            fileSize={processedSize}
            onReset={reset}
          />
        </>
      )}
    </div>
  );
}
