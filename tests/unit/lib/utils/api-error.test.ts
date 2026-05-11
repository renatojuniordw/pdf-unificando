import { describe, expect, it } from 'vitest'
import {
  defaultApiErrorMessage,
  inferCodeFromStatus,
  isApiErrorEnvelope,
  normalizeApiError,
  readLegacyMessage,
} from '@/lib/utils/api-error'

describe('lib/utils/api-error', () => {
  it('deve inferir o código correto a partir do status', () => {
    expect(inferCodeFromStatus(400)).toBe('VALIDATION_ERROR')
    expect(inferCodeFromStatus(401)).toBe('UNAUTHORIZED')
    expect(inferCodeFromStatus(403)).toBe('FORBIDDEN')
    expect(inferCodeFromStatus(404)).toBe('NOT_FOUND')
    expect(inferCodeFromStatus(409)).toBe('CONFLICT')
    expect(inferCodeFromStatus(429)).toBe('RATE_LIMITED')
    expect(inferCodeFromStatus(500)).toBe('INTERNAL_ERROR')
  })

  it('deve reconhecer envelope de erro da API', () => {
    expect(
      isApiErrorEnvelope({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Erro',
          retryable: false,
        },
      }),
    ).toBe(true)
  })

  it('deve normalizar envelope de erro da API', () => {
    const normalized = normalizeApiError(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Muitas requisições',
          retryable: true,
          details: { reason: 'ip_rate_limited' },
        },
      },
      429,
    )

    expect(normalized).toMatchObject({
      code: 'RATE_LIMITED',
      message: 'Muitas requisições',
      retryable: true,
      status: 429,
    })
  })

  it('deve manter mensagens legadas quando necessário', () => {
    expect(readLegacyMessage({ error: 'Falha antiga' })).toBe('Falha antiga')
    expect(readLegacyMessage({ message: 'Falha antiga' })).toBe('Falha antiga')
    expect(readLegacyMessage({ error: '   ' })).toBeUndefined()
  })

  it('deve usar mensagem padrão quando o payload for desconhecido', () => {
    const normalized = normalizeApiError({ foo: 'bar' }, 500)
    expect(normalized.code).toBe('INTERNAL_ERROR')
    expect(normalized.message).toBe(defaultApiErrorMessage('INTERNAL_ERROR'))
    expect(normalized.retryable).toBe(true)
  })
})
