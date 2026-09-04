import type { NormalizedApiError } from "./api-error"

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError"
}

export function normalizeFetchError(err: unknown): NormalizedApiError {
  if (isAbortError(err)) {
    return {
      code: "TIMEOUT_ERROR",
      message: "A requisição demorou demais. Tente novamente.",
      retryable: true,
    }
  }

  if (err instanceof Error && err.name === "TypeError") {
    return {
      code: "NETWORK_ERROR",
      message: "Erro de conexão. Verifique sua internet.",
      retryable: true,
    }
  }

  return {
    code: "INTERNAL_ERROR",
    message: "Erro inesperado ao processar o arquivo.",
    retryable: false,
  }
}

export async function safeReadErrorBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    try {
      return { error: await res.text() }
    } catch {
      return null
    }
  }

  try {
    return await res.json()
  } catch {
    return null
  }
}