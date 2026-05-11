export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export interface ApiErrorDetails {
  field?: string
  reason?: string
  [key: string]: unknown
}

export interface ApiErrorEnvelope {
  success: false
  error: {
    code: ApiErrorCode
    message: string
    details?: ApiErrorDetails
    retryable: boolean
  }
}

export interface NormalizedApiError {
  code: ApiErrorCode | 'NETWORK_ERROR' | 'TIMEOUT_ERROR'
  message: string
  details?: ApiErrorDetails
  retryable: boolean
  status?: number
}

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: 'Há um problema com os dados enviados.',
  NOT_FOUND: 'O recurso solicitado não foi encontrado.',
  UNAUTHORIZED: 'Sua sessão expirou. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
  CONFLICT: 'Existe um conflito com o estado atual.',
  RATE_LIMITED: 'Muitas requisições no momento. Aguarde e tente novamente.',
  INTERNAL_ERROR: 'Algo deu errado no servidor. Tente novamente em instantes.',
}

export function defaultApiErrorMessage(code: ApiErrorCode): string {
  return DEFAULT_MESSAGES[code]
}

export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ApiErrorEnvelope>
  return (
    candidate.success === false &&
    !!candidate.error &&
    typeof candidate.error.code === 'string' &&
    typeof candidate.error.message === 'string'
  )
}

export function normalizeApiError(input: unknown, status?: number): NormalizedApiError {
  if (isApiErrorEnvelope(input)) {
    return {
      code: input.error.code,
      message: input.error.message,
      details: input.error.details,
      retryable: input.error.retryable,
      status,
    }
  }

  if (input && typeof input === 'object') {
    const candidate = input as {
      code?: string
      error?: string
      message?: string
      details?: ApiErrorDetails
      retryable?: boolean
    }

    if (
      candidate.code &&
      [
        'VALIDATION_ERROR',
        'NOT_FOUND',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'CONFLICT',
        'RATE_LIMITED',
        'INTERNAL_ERROR',
      ].includes(candidate.code)
    ) {
      const code = candidate.code as ApiErrorCode
      return {
        code,
        message: candidate.message ?? candidate.error ?? defaultApiErrorMessage(code),
        details: candidate.details,
        retryable:
          candidate.retryable ??
          (status === 429 ||
            status === 408 ||
            (typeof status === 'number' && status >= 500)),
        status,
      }
    }
  }

  const code = inferCodeFromStatus(status)
  return {
    code,
    message: readLegacyMessage(input) ?? defaultApiErrorMessage(code),
    retryable:
      status === 429 || status === 408 || (typeof status === 'number' && status >= 500),
    status,
  }
}

export function inferCodeFromStatus(status?: number): ApiErrorCode {
  switch (status) {
    case 400:
    case 413:
    case 422:
      return 'VALIDATION_ERROR'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 429:
      return 'RATE_LIMITED'
    default:
      return 'INTERNAL_ERROR'
  }
}

export function readLegacyMessage(input: unknown): string | undefined {
  if (!input || typeof input !== 'object') return undefined
  const candidate = input as { error?: unknown; message?: unknown }
  if (typeof candidate.error === 'string' && candidate.error.trim()) return candidate.error
  if (typeof candidate.message === 'string' && candidate.message.trim()) return candidate.message
  return undefined
}
