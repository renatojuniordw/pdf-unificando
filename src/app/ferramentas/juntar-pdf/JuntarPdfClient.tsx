"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { FileQueue } from "@/components/upload/FileQueue";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";
import { MAX_TOTAL_UPLOAD_BYTES, MAX_UPLOAD_FILES, checkUploadBatch } from "@/lib/limits";

interface FileItem {
  id: string;
  file: File;
}

export function JuntarPdfClient() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [listError, setListError] = useState<string | null>(null);
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
    endpoint: "/api/pdf/merge",
    toolName: "juntar-pdf",
    outputFilename: "unificado.pdf",
    timeoutMs: 120_000,
  });

  const handleDrop = useCallback(
    (dropped: File[]) => {
      const check = checkUploadBatch(
        files.map((f) => f.file),
        dropped,
        MAX_UPLOAD_FILES,
        MAX_TOTAL_UPLOAD_BYTES,
      )

      if (!check.ok) {
        setListError(
          check.exceedsCount
            ? `Muitos arquivos. Limite: ${MAX_UPLOAD_FILES}.`
            : `Tamanho total excede ${Math.round(MAX_TOTAL_UPLOAD_BYTES / 1024 / 1024)}MB. Remova alguns arquivos.`,
        )
        return
      }

      setListError(null)
      setFiles((prev) => [
        ...prev,
        ...dropped.map((f) => ({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
        })),
      ]);
    },
    [files],
  );

  const handleProcess = useCallback(() => {
    process(files.map((f) => f.file));
  }, [process, files]);

  const handleReset = useCallback(() => {
    reset();
    setFiles([]);
    setListError(null);
  }, [reset]);
  const handleDownload = useDownloadTracking("juntar-pdf", outputName);

  return (
    <div className="max-w-2xl mx-auto">
      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <DropZone
            accept={{ "application/pdf": [".pdf"] }}
            multiple
            onDrop={handleDrop}
          />
          {files.length > 0 && (
            <>
              <FileQueue
                files={files}
                onReorder={setFiles}
                onRemove={(id) => {
                  setListError(null)
                  setFiles((prev) => prev.filter((f) => f.id !== id))
                }}
              />
              {listError && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-xs font-black uppercase tracking-widest text-[#b91c1c] border-2 border-[#b91c1c] px-3 py-2"
                >
                  {listError}
                </p>
              )}
              <button
                type="button"
                onClick={handleProcess}
                disabled={files.length < 2}
                className="w-full bg-slate-950 text-[#ccff00] border-4 border-slate-950 shadow-[8px_8px_0px_#ccff00] px-8 py-5 font-black uppercase tracking-[0.2em] hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                JUNTAR {files.length} PDFs
              </button>
            </>
          )}
        </div>
      )}

      <ProcessingStatePanel
        status={status}
        secondsLeft={secondsLeft}
        progress={progress}
        onRetry={retryLast}
        error={error}
        onReset={handleReset}
      />

      {status === "done" && downloadUrl && (
        <SuccessDownload
          url={downloadUrl}
          filename={outputName!}
          onDownload={handleDownload}
          fileSize={processedSize}
          onReset={handleReset}
          title="PDFS UNIDOS COM SUCESSO"
        />
      )}
    </div>
  );
}
