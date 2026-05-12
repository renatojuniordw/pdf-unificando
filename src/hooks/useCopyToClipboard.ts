"use client";

import { useCallback, useEffect, useState } from "react";

export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    setIsCopying(true);
    setError(null);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        const copiedViaFallback = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!copiedViaFallback) {
          throw new Error("Não foi possível copiar o texto.");
        }
      }

      setCopied(true);
    } catch {
      setCopied(false);
      setError("Não foi possível copiar agora. Tente novamente.");
    } finally {
      setIsCopying(false);
    }
  }, []);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), resetAfterMs);
    return () => window.clearTimeout(timer);
  }, [copied, resetAfterMs]);

  useEffect(() => {
    if (!error) return;

    const timer = window.setTimeout(() => setError(null), resetAfterMs);
    return () => window.clearTimeout(timer);
  }, [error, resetAfterMs]);

  return { copied, copy, error, isCopying };
}
