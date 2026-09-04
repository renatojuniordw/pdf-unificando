"use client";
import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ChoiceGroup } from "@/components/shared/ChoiceGroup";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

const ANGLES = ["90", "180", "270"].map((value) => ({
  value,
  label: `${value}°`,
}));

export function RodarPdfClient() {
  const [angle, setAngle] = useState("90");
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
    endpoint: "/api/pdf/rotate",
    toolName: "rodar-pdf",
    outputFilename: (name) => name.replace(".pdf", "-rotacionado.pdf"),
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0], { angle }),
    [process, angle],
  );
  const handleDownload = useDownloadTracking("rodar-pdf", outputName);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <ChoiceGroup
            label="ÂNGULO DE ROTAÇÃO"
            value={angle}
            onChange={setAngle}
            options={ANGLES}
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
