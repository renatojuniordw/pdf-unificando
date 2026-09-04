"use client";

import { useCallback, useId } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ChoiceGroup } from "@/components/shared/ChoiceGroup";
import { StateBanner } from "@/components/shared/StateBanner";
import { BrutalistCard } from "@/components/layout/BrutalistCard";
import { ToolFlowShell } from "@/components/layout/ToolFlowShell";
import { useNumberingOptions, type Alignment, type Placement } from "./hooks/useNumberingOptions";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

const PLACEMENT_OPTIONS = [
  { value: "footer", label: "RODAPÉ" },
  { value: "header", label: "CABEÇALHO" },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: "left", label: "ESQUERDA" },
  { value: "center", label: "CENTRO" },
  { value: "right", label: "DIREITA" },
] as const;

export function NumerarPaginasClient() {
  const {
    placement,
    setPlacement,
    alignment,
    setAlignment,
    startAt,
    setStartAt,
    startAtError,
    canSubmit,
    extraData,
  } = useNumberingOptions();
  const startAtId = useId();

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
    endpoint: "/api/pdf/page-numbers",
    toolName: "numerar-paginas",
    outputFilename: (name) => name.replace(/\.pdf$/i, "-numerado.pdf"),
  });
  const handleDownload = useDownloadTracking("numerar-paginas", outputName);

  const handleDrop = useCallback(
    (files: File[]) => {
      if (!canSubmit) return
      process(files[0], extraData)
    },
    [canSubmit, extraData, process],
  );

  return (
    <ToolFlowShell>
      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <ChoiceGroup
              label="POSIÇÃO"
              value={placement}
              onChange={(value) => setPlacement(value as Placement)}
              options={PLACEMENT_OPTIONS}
            />

            <ChoiceGroup
              label="ALINHAMENTO"
              value={alignment}
              onChange={(value) => setAlignment(value as Alignment)}
              options={ALIGNMENT_OPTIONS}
            />

            <BrutalistCard className="p-6">
              <label htmlFor={startAtId} className="text-xs font-black uppercase tracking-widest mb-3 block">
                COMEÇAR EM
              </label>
              <input
                id={startAtId}
                type="number"
                min={1}
                max={9999}
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full border-4 border-slate-950 px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-[#ccff00] transition-colors"
              />
              <p className="mt-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
                Valor inicial da numeração. Padrão: 1.
              </p>
              {startAtError && (
                <p role="alert" aria-live="assertive" className="mt-2 text-xs font-black uppercase tracking-widest text-[#b91c1c]">
                  {startAtError}
                </p>
              )}
            </BrutalistCard>
          </div>

          <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} disabled={Boolean(startAtError)} />
        </div>
      )}

      {(status === "uploading" || status === "processing") && <ProcessingStatus status={status} />}

      {status === "rate_limited" && (
      <RetryCountdown secondsLeft={secondsLeft} progress={progress} onRetry={retryLast} />
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
            title="PÁGINAS NUMERADAS"
            message={
              processedSize
                ? `${(processedSize / 1024 / 1024).toFixed(1)}MB`
                : "Arquivo pronto para download."
            }
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
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
    </ToolFlowShell>
  );
}
