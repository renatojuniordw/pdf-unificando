"use client";
import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";

const ANGLES = ["90", "180", "270"];

export function RodarPdfClient() {
  const [angle, setAngle] = useState("90");
  const {
    status,
    error,
    downloadUrl,
    outputName,
    processedSize,
    process,
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

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
            <p className="text-xs font-black uppercase tracking-widest mb-3">
              ÂNGULO DE ROTAÇÃO
            </p>
            <div className="flex gap-3">
              {ANGLES.map((a) => (
                <button
                  key={a}
                  onClick={() => setAngle(a)}
                  className={`flex-1 border-4 p-3 font-black uppercase text-sm tracking-widest transition-all ${
                    angle === a
                      ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
                      : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>
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
          onRetry={reset}
        />
      )}
      {status === "error" && (
        <div className="bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
          <p className="font-black uppercase tracking-widest text-sm">
            ERRO: {error}
          </p>
          <button
            onClick={reset}
            className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}
      {status === "done" && downloadUrl && (
        <>
          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            toolName="rodar-pdf"
            fileSize={processedSize}
            onReset={reset}
          />
          <PromotionBanner />
        </>
      )}
    </div>
  );
}
