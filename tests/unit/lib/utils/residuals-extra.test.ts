import { describe, expect, it, vi, afterEach } from 'vitest'
import { logInfo, logError } from '@/lib/utils/logger'
import { normalizeApiError, defaultApiErrorMessage } from '@/lib/utils/api-error'

describe('lib/utils residual gaps', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('RATE_LIMIT_ExpiryCleanup_DeletesExpiredEntries', async () => {
    // import dinâmico com fake timers ativos: o setInterval do módulo é criado fake
    vi.useFakeTimers()
    const { rateLimit } = await import('@/lib/utils/rate-limit')
    // 'a' expira em 120s (vivo), 'b' expira em 1s (morto ao chegar em 60s)
    expect(rateLimit('a', { limit: 1, windowMs: 120_000 })).toBe(true)
    expect(rateLimit('a', { limit: 1, windowMs: 120_000 })).toBe(false)
    expect(rateLimit('b', { limit: 1, windowMs: 1000 })).toBe(true)

    vi.advanceTimersByTime(60_001) // setInterval de limpeza dispara

    // 'a' permanece no cache (não expirou) → ainda limitado
    expect(rateLimit('a', { limit: 1, windowMs: 120_000 })).toBe(false)
    // 'b' foi removido/expirado → novo slot permitido
    expect(rateLimit('b', { limit: 1, windowMs: 1000 })).toBe(true)
  })

  it('RATE_LIMIT_CountsWithinWindowAndLimits', async () => {
    const { rateLimit } = await import('@/lib/utils/rate-limit')
    expect(rateLimit('c', { limit: 2, windowMs: 1000 })).toBe(true)
    expect(rateLimit('c', { limit: 2, windowMs: 1000 })).toBe(true)
    expect(rateLimit('c', { limit: 2, windowMs: 1000 })).toBe(false)
  })

  it('LOGGER_UnserializableMeta_FallsBackToPlaceholder', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const circular: Record<string, unknown> = {}
    circular.self = circular

    logInfo('scope', 'msg', circular)

    expect(logSpy).toHaveBeenCalledWith('"[unserializable]"')
    logSpy.mockRestore()
  })

  it('LOGGER_LogErrorWithPlainValue_SerializesAsIs', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logError('scope', { reason: 'plain' }, { requestId: 'r1' })

    const emitted = errorSpy.mock.calls[0][0] as string
    expect(emitted).toContain('"error":{"reason":"plain"}')
    expect(emitted).toContain('"requestId":"r1"')
    errorSpy.mockRestore()
  })

  it('API_ERROR_LegacyObjectWithValidCode_NormalizesDetails', () => {
    const result = normalizeApiError({ code: 'RATE_LIMITED', message: 'ocupado', retryable: false }, 429)
    expect(result).toMatchObject({ code: 'RATE_LIMITED', message: 'ocupado', retryable: false, status: 429 })
  })

  it('API_ERROR_LegacyObjectMissingMessage_UsesDefaultMessage', () => {
    const result = normalizeApiError({ code: 'NOT_FOUND' }, 404)
    expect(result.message).toBe(defaultApiErrorMessage('NOT_FOUND'))
    expect(result.code).toBe('NOT_FOUND')
    expect(result.retryable).toBe(false)
  })

  it('API_ERROR_LegacyObjectRetryableUndefined_InferredFromStatus', () => {
    const result = normalizeApiError({ code: 'INTERNAL_ERROR' }, 503)
    expect(result.retryable).toBe(true)
  })
})