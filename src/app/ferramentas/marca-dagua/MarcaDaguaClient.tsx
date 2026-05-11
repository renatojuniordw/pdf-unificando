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

const COLOR_OPTIONS = [
  { value: "gray",  label: "CINZA",   bg: "bg-slate-400" },
  { value: "black", label: "PRETO",   bg: "bg-slate-950" },
  { value: "red",   label: "VERMELHO", bg: "bg-red-600"   },
] as const;

const OPACITY_OPTIONS = [
  { value: "0.15", label: "SUAVE",   description: "15%" },
  { value: "0.3",  label: "MÉDIO",   description: "30%" },
  { value: "0.5",  label: "FORTE",   description: "50%" },
];

export function MarcaDaguaClient() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("gray");
  const [opacity, setOpacity] = useState("0.3");
  const charCount = text.length;
  const remaining = 100 - charCount;

  const {
    status,
    error,
    errorDetails,
    downloadUrl,
    outputName,
    processedSize,
    process,
    retryLast,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/watermark",
    toolName: "marca-dagua",
    outputFilename: (name) => name.replace(".pdf", "-marca-dagua.pdf"),
  });
  const textError = status === "error" && errorDetails?.field === "text" ? error : null;
  const handleDownload = useDownloadTracking("marca-dagua", outputName);

  const handleDrop = useCallback(
    (files: File[]) => {
      if (!text.trim()) return;
      process(files[0], { text, color, opacity });
    },
    [process, text, color, opacity],
  );

  return (
    <div className="max-w-2xl mx-auto">
      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6 flex flex-col gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3">
                TEXTO DA MARCA D&apos;ÁGUA
              </p>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: CONFIDENCIAL, RASCUNHO..."
                maxLength={100}
                className="w-full border-4 border-slate-950 px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-[#ccff00] transition-colors"
              />
              <p className="mt-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
                {charCount}/100 caracteres{remaining <= 20 ? ` · restam ${remaining}` : ""}
              </p>
              {textError && (
                <p className="mt-2 text-xs font-black uppercase tracking-widest text-[#ff4d4d]">
                  {textError}
                </p>
              )}
              {!text.trim() && (
                <p className="text-xs font-mono text-slate-500 mt-2 uppercase tracking-widest">
                  Informe o texto antes de selecionar o arquivo
                </p>
              )}
            </div>

            <ChoiceGroup
              label="COR"
              value={color}
              onChange={setColor}
              options={COLOR_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
                icon: <span className={`w-3 h-3 border border-current ${opt.bg}`} />,
              }))}
            />

            <ChoiceGroup
              label="OPACIDADE"
              value={opacity}
              onChange={setOpacity}
              options={OPACITY_OPTIONS}
            />
          </div>

          <DropZone
            accept={{ "application/pdf": [".pdf"] }}
            onDrop={handleDrop}
            disabled={!text.trim()}
          />
        </div>
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
            title="MARCA D'ÁGUA APLICADA"
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
          <PromotionBanner />
        </div>
      )}
    </div>
  );
}
