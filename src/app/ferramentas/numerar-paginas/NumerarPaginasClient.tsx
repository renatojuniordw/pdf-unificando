"use client";

import { useCallback, useId } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ChoiceGroup } from "@/components/shared/ChoiceGroup";
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
          title="PÁGINAS NUMERADAS"
        />
      )}
    </ToolFlowShell>
  );
}
