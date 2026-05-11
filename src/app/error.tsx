"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/errors/ErrorScreen";
import { logError } from "@/lib/utils/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError('App Error', error, { digest: error.digest })
  }, [error])

  return (
    <ErrorScreen
      title="Algo falhou"
      message="Não conseguimos carregar esta parte da aplicação agora. Tente novamente."
      onRetry={reset}
    />
  )
}
