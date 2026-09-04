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

const DPI_OPTIONS = ["72", "150", "300"].map((value) => ({
  value,
  label: `${value} DPI`,
}));

export function PdfParaJpgClient() {
  const [dpi, setDpi] = useState("150");
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
    endpoint: "/api/pdf/to-jpg",
    toolName: "pdf-para-jpg",
    outputFilename: (name) => name.replace(".pdf", ".zip"),
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0], { dpi }),
    [process, dpi],
  );
  const handleDownload = useDownloadTracking("pdf-para-jpg", outputName);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <ChoiceGroup
            label="RESOLUÇÃO (DPI)"
            value={dpi}
            onChange={setDpi}
            options={DPI_OPTIONS}
          />
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
      {status === "done" && downloadUrl && (
        <>
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
