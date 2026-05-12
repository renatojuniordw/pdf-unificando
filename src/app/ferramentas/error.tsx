"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/errors/ErrorScreen";
import { logError } from "@/lib/utils/logger";

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError("Tools Error", error, { digest: error.digest })
  }, [error])

  return (
    <ErrorScreen
      title="Ferramenta indisponível"
      message="Esta ferramenta encontrou um erro inesperado. Tente novamente para continuar."
      onRetry={reset}
    />
  )
}
