"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { PageRangeField } from "@/components/shared/PageRangeField";
import { StateBanner } from "@/components/shared/StateBanner";
import { usePageRangeForm } from "@/hooks/usePageRangeForm";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

export function ExtrairPaginasClient() {
  const { value: range, setValue: setRange, error: rangeSyntaxError, isValid } =
    usePageRangeForm();
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
    endpoint: "/api/pdf/extract-pages",
    toolName: "extrair-paginas",
    outputFilename: (name) => name.replace(/\.pdf$/i, ".zip"),
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const handleDownload = useDownloadTracking("extrair-paginas", outputName);

  const handleRangeChange = useCallback((value: string) => {
    setSubmitError(null)
    setRange(value)
  }, [setRange])

  const handleDrop = useCallback(
    (files: File[]) => {
      if (!range.trim()) {
        setSubmitError("Informe uma faixa de páginas antes de enviar.")
        return
      }

      if (!isValid) {
        setSubmitError(rangeSyntaxError)
        return
      }

      setSubmitError(null)
      process(files[0], { range });
    },
    [isValid, process, range, rangeSyntaxError],
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <PageRangeField
            label="PÁGINAS PARA EXTRAIR"
            value={range}
            onChange={handleRangeChange}
            hint="Cada página selecionada vira um PDF separado dentro de um arquivo .zip"
            error={submitError ?? rangeSyntaxError}
          />
          <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} />
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
        <div className="flex flex-col gap-6">
          <StateBanner
            tone="success"
            title="PÁGINAS EXTRAÍDAS COM SUCESSO"
            message={
              processedSize
                ? `${(processedSize / 1024 / 1024).toFixed(1)} MB`
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
          <PromotionBanner />
        </div>
      )}
    </div>
  );
}
