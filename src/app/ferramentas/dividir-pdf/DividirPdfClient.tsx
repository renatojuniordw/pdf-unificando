"use client";

import { useCallback, useState } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { PageRangeField } from "@/components/shared/PageRangeField";
import { ToolFlowShell } from "@/components/layout/ToolFlowShell";
import { usePageRangeForm } from "@/hooks/usePageRangeForm";
import { trackToolDownload } from "@/lib/analytics";

export function DividirPdfClient() {
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    endpoint: "/api/pdf/split",
    toolName: "dividir-pdf",
    outputFilename: (name) => name.replace(".pdf", "-dividido.pdf"),
  });

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
      process(files[0], { range })
    },
    [isValid, process, range, rangeSyntaxError],
  );

  const handleRangeChange = useCallback((value: string) => {
    setSubmitError(null)
    setRange(value)
  }, [setRange])

  return (
    <ToolFlowShell>
      {status === "idle" && (
        <>
          <PageRangeField
            label="INTERVALO DE PÁGINAS"
            value={range}
            onChange={handleRangeChange}
            hint="Use vírgula para separar intervalos. Ex: 1-3, 5, 7-9"
            error={submitError ?? rangeSyntaxError}
          />
          <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} disabled={!isValid} />
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
          onDownload={() => trackToolDownload("dividir-pdf", outputName!)}
          fileSize={processedSize}
          onReset={reset}
          title="PDF DIVIDIDO COM SUCESSO"
        />
      )}
    </ToolFlowShell>
  );
}
