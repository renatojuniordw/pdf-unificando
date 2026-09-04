"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ChoiceGroup } from "@/components/shared/ChoiceGroup";
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
          title="ARQUIVO COMPRIMIDO"
          message={
            originalSize && processedSize
              ? `${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(processedSize / 1024 / 1024).toFixed(1)}MB`
              : undefined
          }
        />
      )}
    </div>
  );
}
