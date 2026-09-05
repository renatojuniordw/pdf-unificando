"use client";

import { useId, useState, useCallback } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatePanel } from "@/components/processing/ProcessingStatePanel";
import { SuccessDownload } from "@/components/processing/SuccessDownload";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";

export function ProtegerPdfClient() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordId = useId();
  const passwordConfirmId = useId();

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
    endpoint: "/api/pdf/protect",
    toolName: "proteger-pdf",
    outputFilename: (name) => name.replace(".pdf", "-protegido.pdf"),
    timeoutMs: 120_000,
  });
  const passwordValidationError =
    !password.trim()
      ? null
      : password.trim().length < 4
        ? "A senha precisa ter ao menos 4 caracteres."
        : !passwordConfirm.trim()
          ? "Confirme a senha antes de selecionar o arquivo."
          : password !== passwordConfirm
            ? "As senhas não coincidem."
            : null;

  const handleDrop = useCallback(
    (files: File[]) => {
      if (!password.trim()) return;
      if (passwordValidationError) return;
      process(files[0], { password });
    },
    [password, passwordValidationError, process],
  );
  const handleDownload = useDownloadTracking("proteger-pdf", outputName);

  return (
    <div className="max-w-2xl mx-auto">
      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
            <label htmlFor={passwordId} className="text-xs font-black uppercase tracking-widest mb-4 block">
              SENHA DE PROTEÇÃO
            </label>
            <div className="relative">
              <input
                id={passwordId}
                data-testid="protect-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full border-4 border-slate-950 px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-[#ccff00] transition-colors pr-12"
                aria-describedby={passwordValidationError ? "password-error" : undefined}
              />
              <button
                type="button"
                data-testid="protect-password-toggle"
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
            <div className="mt-4">
              <label htmlFor={passwordConfirmId} className="text-xs font-black uppercase tracking-widest mb-3 block">
                CONFIRMAR SENHA
              </label>
              <input
                id={passwordConfirmId}
                data-testid="protect-password-confirm-input"
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Digite novamente..."
                className="w-full border-4 border-slate-950 px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-[#ccff00] transition-colors"
                aria-describedby={passwordValidationError ? "password-error" : undefined}
              />
            </div>
            {passwordValidationError && (
              <p id="password-error" data-testid="protect-password-error" role="alert" aria-live="assertive" className="mt-2 text-xs font-black uppercase tracking-widest text-[#b91c1c]">
                {passwordValidationError}
              </p>
            )}
            {!password.trim() && (
              <p className="text-xs font-mono text-slate-500 mt-2 uppercase tracking-widest">
                Informe a senha antes de selecionar o arquivo
              </p>
            )}
          </div>

          <DropZone
            accept={{ "application/pdf": [".pdf"] }}
            onDrop={handleDrop}
            disabled={!password.trim() || Boolean(passwordValidationError)}
          />
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
          title="PDF PROTEGIDO"
        />
      )}
    </div>
  );
}
