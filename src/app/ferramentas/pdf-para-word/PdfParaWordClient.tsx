"use client";
import { useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

export function PdfParaWordClient() {
  const {
    status,
    error,
    downloadUrl,
    outputName,
    processedSize,
    process,
    retryLast,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/to-word",
    toolName: "pdf-para-word",
    outputFilename: (name) => name.replace(".pdf", ".docx"),
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0]),
    [process],
  );
  const handleDownload = useDownloadTracking("pdf-para-word", outputName);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-4 flex items-center gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="#ccff00"
          strokeWidth="2"
          strokeLinecap="square"
        >
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v4l3 3" />
        </svg>
        <p className="text-[#ccff00] font-mono text-xs uppercase tracking-widest">
          PDFs digitalizados (escaneados) podem não manter a formatação
          original.
        </p>
      </div>
      {status === "idle" && (
        <DropZone
          accept={{ "application/pdf": [".pdf"] }}
          onDrop={handleDrop}
        />
      )}
      <ProcessingStatePanel
        status={status}
        secondsLeft={secondsLeft}
        progress={progress}
        onRetry={retryLast}
        error={error}
        onReset={reset}
      />
      {status === "done" && downloadUrl && (
        <SuccessDownload
          url={downloadUrl}
          filename={outputName!}
          onDownload={handleDownload}
          fileSize={processedSize}
          onReset={reset}
        />
      )}
    </div>
  );
}
