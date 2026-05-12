"use client";
import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ChoiceGroup } from "@/components/shared/ChoiceGroup";
import { StateBanner } from "@/components/shared/StateBanner";
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
          <PromotionBanner />
        </>
      )}
    </div>
  );
}
