"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";

export function ProtegerPdfClient() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    endpoint: "/api/pdf/protect",
    outputFilename: (name) => name.replace(".pdf", "-protegido.pdf"),
  });

  const handleDrop = useCallback(
    (files: File[]) => {
      if (!password.trim()) return;
      process(files[0], { password });
    },
    [process, password],
  );

  return (
    <div className="max-w-2xl mx-auto">
      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
            <p className="text-xs font-black uppercase tracking-widest mb-4">
              SENHA DE PROTEÇÃO
            </p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full border-4 border-slate-950 px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-[#ccff00] transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {!password.trim() && (
              <p className="text-xs font-mono text-slate-500 mt-2 uppercase tracking-widest">
                Informe a senha antes de selecionar o arquivo
              </p>
            )}
          </div>

          <DropZone
            accept={{ "application/pdf": [".pdf"] }}
            onDrop={handleDrop}
            disabled={!password.trim()}
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <div>
            <p className="font-black uppercase tracking-widest text-sm">ERRO</p>
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 10l4 4 8-8" />
            </svg>
            <p className="font-black uppercase tracking-widest text-sm">
              PDF PROTEGIDO
              {processedSize && (
                <span className="font-mono text-xs ml-2">
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
          <PromotionBanner />
        </div>
      )}
    </div>
  );
}
