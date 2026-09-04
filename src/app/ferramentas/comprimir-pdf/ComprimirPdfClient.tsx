"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ChoiceGroup } from "@/components/shared/ChoiceGroup";
import { StateBanner } from "@/components/shared/StateBanner";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

const QUALITY_OPTIONS = [
  { value: "screen", label: "BAIXA", description: "Máxima compressão" },
  { value: "ebook", label: "MÉDIA", description: "Boa qualidade" },
  { value: "printer", label: "ALTA", description: "Impressão profissional" },
];

export function ComprimirPdfClient() {
  const [quality, setQuality] = useState("ebook");
  const {
    status,
    error,
    downloadUrl,
    outputName,
    originalSize,
    processedSize,
    process,
    retryLast,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/compress",
    toolName: "comprimir-pdf",
    outputFilename: (name) => name.replace(".pdf", "-comprimido.pdf"),
  });

  const handleDrop = useCallback(
    (files: File[]) => {
      process(files[0], { quality });
    },
    [process, quality],
  );
  const handleDownload = useDownloadTracking("comprimir-pdf", outputName);

  return (
    <div className="max-w-2xl mx-auto">
      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <ChoiceGroup
            label="QUALIDADE"
            value={quality}
            onChange={setQuality}
            options={QUALITY_OPTIONS}
          />
          <DropZone
            accept={{ "application/pdf": [".pdf"] }}
            onDrop={handleDrop}
          />
        </div>
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

      {status === "done" && downloadUrl && (
        <div className="flex flex-col gap-6">
          <StateBanner
            tone="success"
            title="ARQUIVO COMPRIMIDO"
            message={
              originalSize && processedSize
                ? `${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(processedSize / 1024 / 1024).toFixed(1)}MB`
                : "Arquivo pronto para download."
            }
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              >
                <path d="M4 10l4 4 8-8" />
              </svg>
            }
          />
          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            onDownload={handleDownload}
            fileSize={processedSize}
            onReset={reset}
          />
        </div>
      )}
    </div>
  );
}
