"use client";

import { useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";

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
    endpoint: "/api/pdf/watermark",
    toolName: "marca-dagua",
    outputFilename: (name) => name.replace(".pdf", "-marca-dagua.pdf"),
  });

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
              {!text.trim() && (
                <p className="text-xs font-mono text-slate-500 mt-2 uppercase tracking-widest">
                  Informe o texto antes de selecionar o arquivo
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3">COR</p>
              <div className="flex gap-3">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setColor(opt.value)}
                    className={`flex-1 border-4 p-3 transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2 justify-center ${
                      color === opt.value
                        ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
                        : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
                    }`}
                  >
                    <span className={`w-3 h-3 border border-current ${opt.bg}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3">OPACIDADE</p>
              <div className="flex gap-3">
                {OPACITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setOpacity(opt.value)}
                    className={`flex-1 border-4 p-3 transition-all font-black uppercase text-xs tracking-widest ${
                      opacity === opt.value
                        ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
                        : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
                    }`}
                  >
                    <span className="block text-sm">{opt.label}</span>
                    <span className="block text-[9px] font-mono mt-1 opacity-70">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
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
              MARCA D&apos;ÁGUA APLICADA
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
            toolName="marca-dagua"
            fileSize={processedSize}
            onReset={reset}
          />
          <PromotionBanner />
        </div>
      )}
    </div>
  );
}
