"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { getTool } from "@/config/tools";

const tool = getTool("comprimir-pdf");

const QUALITY_OPTIONS = [
  { value: "screen", label: "BAIXA", description: "Máxima compressão" },
  { value: "ebook", label: "MÉDIA", description: "Boa qualidade" },
  { value: "printer", label: "ALTA", description: "Impressão profissional" },
];

export default function ComprirPdfPage() {
  const [quality, setQuality] = useState("ebook");
  const {
    status,
    error,
    downloadUrl,
    outputName,
    originalSize,
    processedSize,
    process,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/compress",
    outputFilename: (name) => name.replace(".pdf", "-comprimido.pdf"),
  });

  const handleDrop = useCallback(
    (files: File[]) => {
      process(files[0], { quality });
    },
    [process, quality],
  );

  return (
    <>
      <section className="bg-[#ccff00] border-b-4 border-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-slate-950 text-[#ccff00] font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000] mb-4">
            FERRAMENTA GRATUITA
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] text-slate-950">
            {tool.name}
          </h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-700 mt-4 max-w-xl">
            {tool.seoDescription}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <PrivacyBanner />
        </div>

        <div className="max-w-2xl mx-auto">
          {status === "idle" && (
            <div className="flex flex-col gap-6">
              <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
                <p className="text-xs font-black uppercase tracking-widest mb-4">
                  QUALIDADE
                </p>
                <div className="flex gap-3">
                  {QUALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuality(opt.value)}
                      className={`flex-1 border-4 p-3 transition-all font-black uppercase text-xs tracking-widest ${
                        quality === opt.value
                          ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
                          : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
                      }`}
                    >
                      <span className="block text-sm">{opt.label}</span>
                      <span className="block text-[9px] font-mono mt-1 opacity-70">
                        {opt.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <DropZone
                accept={{ "application/pdf": [".pdf"] }}
                onDrop={handleDrop}
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
              onRetry={reset}
            />
          )}

          {status === "error" && (
            <div className="bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <div>
                <p className="font-black uppercase tracking-widest text-sm">
                  ERRO
                </p>
                <p className="font-mono text-xs uppercase mt-1">{error}</p>
              </div>
              <button
                onClick={reset}
                className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#ff4d4d] transition-colors"
              >
                TENTAR NOVAMENTE
              </button>
            </div>
          )}

          {status === "done" && downloadUrl && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#00ff66] text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-4 flex items-center gap-3">
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
                <p className="font-black uppercase tracking-widest text-sm">
                  ARQUIVO COMPRIMIDO
                  {originalSize && processedSize && (
                    <span className="font-mono text-xs ml-2">
                      {(originalSize / 1024 / 1024).toFixed(1)}MB →{" "}
                      {(processedSize / 1024 / 1024).toFixed(1)}MB
                    </span>
                  )}
                </p>
              </div>
              <DownloadButton
                url={downloadUrl}
                filename={outputName!}
                fileSize={processedSize}
                onReset={reset}
              />
            </div>
          )}
        </div>
      </div>

      <EcosystemSection />
    </>
  );
}
