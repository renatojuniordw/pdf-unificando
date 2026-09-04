"use client";
import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ChoiceGroup } from "@/components/shared/ChoiceGroup";
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
