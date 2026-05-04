"use client";
import { useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { getTool } from "@/config/tools";

const tool = getTool("pdf-para-word");

export default function PdfParaWordPage() {
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
    endpoint: "/api/pdf/to-word",
    outputFilename: (name) => name.replace(".pdf", ".docx"),
  });

  const handleDrop = useCallback(
    (files: File[]) => process(files[0]),
    [process],
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

        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="bg-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-4 flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="#ccff00"
              strokeWidth="2"
              strokeLinecap="square"
            >
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4l3 3" />
            </svg>
            <p className="text-[#ccff00] font-mono text-xs uppercase tracking-widest">
              PDFs digitalizados (escaneados) podem não manter a formatação
              original.
            </p>
          </div>
          {status === "idle" && (
            <DropZone
              accept={{ "application/pdf": [".pdf"] }}
              onDrop={handleDrop}
            />
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
            <DownloadButton
              url={downloadUrl}
              filename={outputName!}
              fileSize={processedSize}
              onReset={reset}
            />
          )}
        </div>
      </div>
      <EcosystemSection />
    </>
  );
}
