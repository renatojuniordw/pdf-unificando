"use client";

import { useCallback, useState } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="border-2 border-slate-950 px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-white"
    >
      {copied ? "COPIADO ✓" : "COPIAR"}
    </button>
  );
}

export function PdfParaTxtClient() {
  const {
    status,
    error,
    downloadUrl,
    outputName,
    processedSize,
    textContent,
    process,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/to-txt",
    toolName: "pdf-para-txt",
    outputFilename: (name) => name.replace(/\.pdf$/i, ".txt"),
    captureText: true,
  });

  const handleDrop = useCallback((files: File[]) => process(files[0]), [process]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {status === "idle" && (
        <>
          <div className="border-4 border-slate-950 bg-slate-950 text-[#ccff00] shadow-[8px_8px_0px_#ccff00] p-4 flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">TXT</span>
            <p className="text-xs font-mono font-bold uppercase leading-relaxed">
              Extrai apenas o texto do PDF para um arquivo simples. Ideal para copiar conteúdo, leitura rápida e automações.
            </p>
          </div>
          <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} />
        </>
      )}

      {(status === "uploading" || status === "processing") && <ProcessingStatus status={status} />}

      {status === "rate_limited" && (
        <RetryCountdown secondsLeft={secondsLeft} progress={progress} onRetry={reset} />
      )}

      {status === "error" && (
        <div className="bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
          <p className="font-black uppercase tracking-widest text-sm">ERRO: {error}</p>
          <button
            onClick={reset}
            className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {status === "done" && downloadUrl && textContent && (
        <>
          <div className="border-4 border-slate-950 shadow-[8px_8px_0px_#ccff00]">
            <div className="flex items-center justify-between bg-slate-950 px-4 py-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#ccff00] font-black uppercase text-xs tracking-widest">
                  TEXTO EXTRAÍDO
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  {wordCount(textContent).toLocaleString("pt-BR")} palavras ·{" "}
                  {textContent.length.toLocaleString("pt-BR")} caracteres
                </span>
              </div>
              <CopyButton text={textContent} />
            </div>
            <pre className="p-4 text-xs font-mono text-slate-800 bg-white overflow-auto max-h-80 leading-relaxed whitespace-pre-wrap break-words">
              {textContent}
            </pre>
          </div>

          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            toolName="pdf-para-txt"
            fileSize={processedSize}
            onReset={reset}
          />
          <PromotionBanner />
        </>
      )}
    </div>
  );
}
