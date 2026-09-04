import { normalizeApiError } from "@/lib/utils/api-error"

const REQUEST_TIMEOUT_MS = 60_000
const REQUEST_MAX_RETRIES = 2
const REQUEST_BASE_DELAY_MS = 350

class RetryableRequestError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "RetryableRequestError"
    this.status = status
  }
}

function isRetryableTransportError(error: unknown) {
  return (
    error instanceof DOMException && error.name === "AbortError"
  ) || (error instanceof Error && error.name === "TypeError")
}

function isRetryableResponseStatus(status: number) {
  return status === 408 || status === 429 || status >= 500
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function requestWithRetry<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  parse: (res: Response) => Promise<T>,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= REQUEST_MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutHandle = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(input, {
        ...init,
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const normalized = normalizeApiError(data, res.status)
        if (isRetryableResponseStatus(res.status)) {
          throw new RetryableRequestError(normalized.message, res.status)
        }
        throw new Error(normalized.message)
      }

      return await parse(res)
    } catch (error) {
      lastError = error

      if (
        attempt < REQUEST_MAX_RETRIES &&
        (error instanceof RetryableRequestError || isRetryableTransportError(error))
      ) {
        await delay(REQUEST_BASE_DELAY_MS * 2 ** attempt)
        continue
      }

      throw error
    } finally {
      window.clearTimeout(timeoutHandle)
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Falha inesperada.")
}

export function requestJsonWithRetry<T>(input: RequestInfo | URL, init: RequestInit) {
  return requestWithRetry<T>(input, init, async (res) => {
    return (await res.json()) as T
  })
}

export function requestBlobWithRetry(input: RequestInfo | URL, init: RequestInit) {
  return requestWithRetry<Blob>(input, init, (res) => res.blob())
}

export function friendlyMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}