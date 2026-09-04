"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { PageRangeField } from "@/components/shared/PageRangeField";
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
          title="PÁGINAS EXTRAÍDAS COM SUCESSO"
        />
      )}
    </div>
  );
}
