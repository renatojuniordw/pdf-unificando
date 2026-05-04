"use client";
import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { FileQueue } from "@/components/upload/FileQueue";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { getTool } from "@/config/tools";

const tool = getTool("jpg-para-pdf");
interface FileItem {
  id: string;
  file: File;
}

export default function JpgParaPdfPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
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
    endpoint: "/api/pdf/from-jpg",
    outputFilename: "imagens.pdf",
  });
  const handleDrop = useCallback((dropped: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...dropped.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
      })),
    ]);
  }, []);
  const handleProcess = useCallback(
    () => process(files.map((f) => f.file)),
    [process, files],
  );
  const handleReset = useCallback(() => {
    reset();
    setFiles([]);
  }, [reset]);

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
          {status === "idle" && (
            <>
              <DropZone
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                }}
                multiple
                onDrop={handleDrop}
              />
              {files.length > 0 && (
                <>
                  <FileQueue
                    files={files}
                    onReorder={setFiles}
                    onRemove={(id) =>
                      setFiles((prev) => prev.filter((f) => f.id !== id))
                    }
                  />
                  <button
                    onClick={handleProcess}
                    className="w-full bg-slate-950 text-[#ccff00] border-4 border-slate-950 shadow-[8px_8px_0px_#ccff00] px-8 py-5 font-black uppercase tracking-[0.2em] hover:bg-slate-800 hover:-translate-y-1 transition-all"
                  >
                    CONVERTER {files.length} IMAGEM{files.length > 1 ? "S" : ""}{" "}
                    PARA PDF
                  </button>
                </>
              )}
            </>
          )}
          {(status === "uploading" || status === "processing") && (
            <ProcessingStatus status={status} />
          )}
          {status === "rate_limited" && (
            <RetryCountdown
              secondsLeft={secondsLeft}
              progress={progress}
              onRetry={handleReset}
            />
          )}
          {status === "error" && (
            <div className="bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
              <p className="font-black uppercase tracking-widest text-sm">
                ERRO: {error}
              </p>
              <button
                onClick={handleReset}
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
              onReset={handleReset}
            />
          )}
        </div>
      </div>
      <EcosystemSection />
    </>
  );
}
