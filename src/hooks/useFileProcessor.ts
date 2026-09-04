"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  ApiErrorDetails,
  ApiErrorCode,
} from "@/lib/utils/api-error";
import { normalizeApiError } from "@/lib/utils/api-error";
import type { ProcessingStatus } from "@/types/pdf";
import {
  trackToolUpload,
  trackToolSuccess,
  trackToolError,
} from "@/lib/analytics";
import { useRetryCountdown } from "./useRetryCountdown";
import { normalizeFetchError, safeReadErrorBody } from "@/lib/utils/fetch-error";

interface UseFileProcessorOptions {
  endpoint: string;
  toolName: string;
  outputFilename?: string | ((originalName: string) => string);
  captureText?: boolean;
  maxRetries?: number;
  timeoutMs?: number;
}

interface UseFileProcessorReturn {
  status: ProcessingStatus;
  error: string | null;
  errorCode: ApiErrorCode | "NETWORK_ERROR" | "TIMEOUT_ERROR" | null;
  errorDetails: ApiErrorDetails | null;
  retryable: boolean;
  downloadUrl: string | null;
  outputName: string | null;
  originalSize: number | null;
  processedSize: number | null;
  textContent: string | null;
  process: (
    files: File | File[],
    extraData?: Record<string, string>,
  ) => Promise<void>;
  retryLast: () => void;
  reset: () => void;
  secondsLeft: number;
  isBlocked: boolean;
  progress: number;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 60_000;
const RETRY_MAX_DELAY_MS = 60_000;

export function useFileProcessor({
  endpoint,
  toolName,
  outputFilename,
  captureText = false,
  maxRetries = DEFAULT_MAX_RETRIES,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: UseFileProcessorOptions): UseFileProcessorReturn {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<
    ApiErrorCode | "NETWORK_ERROR" | "TIMEOUT_ERROR" | null
  >(null);
  const [errorDetails, setErrorDetails] = useState<ApiErrorDetails | null>(
    null,
  );
  const [retryable, setRetryable] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRequestRef = useRef<{
    files: File[];
    extraData?: Record<string, string>;
  } | null>(null);
  const requestSeqRef = useRef(0);

  const {
    secondsLeft,
    isBlocked,
    progress,
    startCountdown,
    reset: resetCountdown,
  } = useRetryCountdown();

  const clearTimers = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [clearTimers]);

  async function runRequest(
    request: { files: File[]; extraData?: Record<string, string> },
    attempt = 0,
    shouldTrackUpload = false,
    requestSeq = ++requestSeqRef.current,
  ): Promise<void> {
    clearTimers();
    resetCountdown();

      if (shouldTrackUpload) {
        trackToolUpload(toolName, request.files.length);
      }

      setStatus("uploading");
      setError(null);
      setErrorCode(null);
      setErrorDetails(null);
      setRetryable(false);
      setDownloadUrl(null);
      setOutputName(null);
      setOriginalSize(request.files.reduce((acc, f) => acc + f.size, 0));
      setProcessedSize(null);

      const honeypotValue =
        document.querySelector<HTMLInputElement>("[data-honeypot]")?.value ??
        "";

      if (honeypotValue) {
        const validationError = normalizeApiError(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Erro de validação.",
              details: { field: "_hp", reason: "honeypot_triggered" },
              retryable: false,
            },
          },
          400,
        );
        setStatus("error");
        setError(validationError.message);
        setErrorCode(validationError.code);
        setErrorDetails(validationError.details ?? null);
        setRetryable(validationError.retryable);
        trackToolError(toolName, "honeypot");
        return;
      }

      const formData = new FormData();
      request.files.forEach((file) => formData.append("file", file));
      formData.append("_hp", honeypotValue);
      if (request.extraData) {
        Object.entries(request.extraData).forEach(([key, value]) =>
          formData.append(key, value),
        );
      }

      setStatus("processing");

      const controller = new AbortController();
      abortRef.current = controller;
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (res.status === 429) {
          const retryAfterSeconds = Math.max(
            1,
            parseInt(res.headers.get("Retry-After") ?? "30", 10) || 30,
          );

          setStatus("rate_limited");
          startCountdown(retryAfterSeconds);
          trackToolError(toolName, "rate_limit");

          if (attempt < maxRetries) {
            retryTimerRef.current = setTimeout(() => {
              if (requestSeq !== requestSeqRef.current) return;
              void runRequest(request, attempt + 1, false, requestSeq);
            }, retryAfterSeconds * 1000);
          }
          return;
        }

        if (!res.ok) {
          const body = await safeReadErrorBody(res);
          const normalized = normalizeApiError(body, res.status);

          if (normalized.retryable && attempt < maxRetries) {
            const delay = Math.min(1000 * 2 ** attempt, RETRY_MAX_DELAY_MS);
            retryTimerRef.current = setTimeout(() => {
              if (requestSeq !== requestSeqRef.current) return;
              void runRequest(request, attempt + 1, false, requestSeq);
            }, delay);
            return;
          }

          setError(normalized.message);
          setErrorCode(normalized.code);
          setErrorDetails(normalized.details ?? null);
          setRetryable(normalized.retryable);
          setStatus("error");
          trackToolError(toolName, `api_error:${res.status}`);
          resetCountdown();
          return;
        }

        const blob = await res.blob();
        if (captureText) setTextContent(await blob.text());
        const url = URL.createObjectURL(blob);

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        objectUrlRef.current = url;

        const contentDisposition = res.headers.get("Content-Disposition");
        const serverFilename =
          contentDisposition?.match(/filename="([^"]+)"/)?.[1];
        const name =
          serverFilename ??
          (typeof outputFilename === "function"
            ? outputFilename(request.files[0].name)
            : (outputFilename ?? request.files[0].name));

        setDownloadUrl(url);
        setOutputName(name);
        setProcessedSize(blob.size);
        setStatus("done");
        setRetryable(false);
        trackToolSuccess(toolName, blob.size);
        resetCountdown();
      } catch (err) {
        const normalized = normalizeFetchError(err);

        if (normalized.retryable && attempt < maxRetries) {
          const delay = Math.min(1000 * 2 ** attempt, RETRY_MAX_DELAY_MS);
          retryTimerRef.current = setTimeout(() => {
            if (requestSeq !== requestSeqRef.current) return;
            void runRequest(request, attempt + 1, false, requestSeq);
          }, delay);
          return;
        }

        setError(normalized.message);
        setErrorCode(normalized.code);
        setErrorDetails(normalized.details ?? null);
        setRetryable(normalized.retryable);
        setStatus("error");
        trackToolError(toolName, normalized.code.toLowerCase());
        resetCountdown();
      } finally {
        clearTimeout(timeoutHandle);
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
  }

  const process = async (files: File | File[], extraData?: Record<string, string>) => {
    const fileArray = Array.isArray(files) ? files : [files];
    lastRequestRef.current = { files: fileArray, extraData };
    await runRequest({ files: fileArray, extraData }, 0, true);
  };

  const retryLast = () => {
    if (!lastRequestRef.current) return;
    clearTimers();
    resetCountdown();
    void runRequest(lastRequestRef.current, 0, true);
  };

  const reset = useCallback(() => {
    clearTimers();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setStatus("idle");
    setError(null);
    setErrorCode(null);
    setErrorDetails(null);
    setRetryable(false);
    setDownloadUrl(null);
    setOutputName(null);
    setOriginalSize(null);
    setProcessedSize(null);
    setTextContent(null);
    resetCountdown();
  }, [clearTimers, resetCountdown]);

  return {
    status,
    error,
    errorCode,
    errorDetails,
    retryable,
    downloadUrl,
    outputName,
    originalSize,
    processedSize,
    textContent,
    process,
    retryLast,
    reset,
    secondsLeft,
    isBlocked,
    progress,
  };
}
