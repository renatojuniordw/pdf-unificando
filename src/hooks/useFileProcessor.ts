"use client";

import { useState, useCallback, useRef } from "react";
import type { ProcessingStatus } from "@/types/pdf";
import { trackToolUpload, trackToolSuccess, trackToolError } from "@/lib/analytics";
import { useRetryCountdown } from "./useRetryCountdown";

interface UseFileProcessorOptions {
  endpoint: string;
  toolName: string;
  outputFilename?: string | ((originalName: string) => string);
  captureText?: boolean;
}

interface UseFileProcessorReturn {
  status: ProcessingStatus;
  error: string | null;
  downloadUrl: string | null;
  outputName: string | null;
  originalSize: number | null;
  processedSize: number | null;
  textContent: string | null;
  process: (
    files: File | File[],
    extraData?: Record<string, string>,
  ) => Promise<void>;
  reset: () => void;
  secondsLeft: number;
  isBlocked: boolean;
  progress: number;
}

export function useFileProcessor({
  endpoint,
  toolName,
  outputFilename,
  captureText = false,
}: UseFileProcessorOptions): UseFileProcessorReturn {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const {
    secondsLeft,
    isBlocked,
    progress,
    startCountdown,
    reset: resetCountdown,
  } = useRetryCountdown();

  const process = useCallback(
    async (files: File | File[], extraData?: Record<string, string>) => {
      const fileArray = Array.isArray(files) ? files : [files];
      const firstFile = fileArray[0];
      const totalSize = fileArray.reduce((acc, f) => acc + f.size, 0);

      setStatus("uploading");
      setError(null);
      setDownloadUrl(null);
      setOutputName(null);
      setOriginalSize(totalSize);
      setProcessedSize(null);

      // GA: Track Upload Start
      trackToolUpload(toolName, fileArray.length);

      try {
        const honeypotValue =
          document.querySelector<HTMLInputElement>('[data-honeypot]')?.value ?? '';

        if (honeypotValue) {
          setStatus('error');
          setError('Erro de validação.');
          trackToolError(toolName, 'honeypot');
          return;
        }

        const formData = new FormData();
        fileArray.forEach((f) => formData.append("file", f));
        formData.append('_hp', honeypotValue);
        if (extraData) {
          Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));
        }

        setStatus("processing");

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (res.status === 429) {
          const retryAfter = parseInt(
            res.headers.get("Retry-After") ?? "30",
            10,
          );
          startCountdown(retryAfter);
          setStatus("rate_limited");
          trackToolError(toolName, 'rate_limit');
          return;
        }

        if (res.status === 413) {
          setError("Arquivo muito grande. Limite: 50MB.");
          setStatus("error");
          trackToolError(toolName, 'payload_too_large');
          return;
        }

        if (!res.ok) {
          const body = await res
            .json()
            .catch(() => ({ error: "Erro desconhecido." }));
          const errorMsg = body.error ?? "Erro ao processar arquivo.";
          setError(errorMsg);
          setStatus("error");
          trackToolError(toolName, `api_error:${res.status}`);
          return;
        }

        const blob = await res.blob();
        if (captureText) setTextContent(await blob.text());
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const contentDisposition = res.headers.get("Content-Disposition");
        const serverFilename =
          contentDisposition?.match(/filename="([^"]+)"/)?.[1];
        const name =
          serverFilename ??
          (typeof outputFilename === "function"
            ? outputFilename(firstFile.name)
            : (outputFilename ?? firstFile.name));

        setDownloadUrl(url);
        setOutputName(name);
        setProcessedSize(blob.size);
        setStatus("done");

        // GA: Track Success
        trackToolSuccess(toolName, blob.size);
      } catch {
        setError("Erro de conexão. Verifique sua internet.");
        setStatus("error");
        trackToolError(toolName, 'connection_error');
      }
    },
    [endpoint, toolName, outputFilename, captureText, startCountdown],
  );

  const reset = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setStatus("idle");
    setError(null);
    setDownloadUrl(null);
    setOutputName(null);
    setOriginalSize(null);
    setProcessedSize(null);
    setTextContent(null);
    resetCountdown();
  }, [resetCountdown]);

  return {
    status,
    error,
    downloadUrl,
    outputName,
    originalSize,
    processedSize,
    textContent,
    process,
    reset,
    secondsLeft,
    isBlocked,
    progress,
  };
}
