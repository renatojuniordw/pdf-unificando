import { describe, expect, it, vi } from 'vitest'

const queueState = vi.hoisted(() => ({
  activeCount: 0,
  pendingCount: 0,
}))

vi.mock('p-limit', () => ({
  default: () =>
    Object.defineProperties(() => undefined, {
      activeCount: {
        get: () => queueState.activeCount,
      },
      pendingCount: {
        get: () => queueState.pendingCount,
      },
    }),
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: vi.fn(() => true),
}))

vi.mock('@/lib/utils/logger', () => ({
  logWarn: vi.fn(),
}))

import { isOverloaded, validateRateLimit } from '@/lib/queue'
import { siteUrl } from '@/lib/site'
import { rateLimit } from '@/lib/utils/rate-limit'
import { logWarn } from '@/lib/utils/logger'

describe('lib/queue e site', () => {
  it('deve montar URLs públicas corretamente', () => {
    expect(siteUrl()).toBe('https://pdf.unificando.com.br/')
    expect(siteUrl('/tutoriais')).toBe('https://pdf.unificando.com.br/tutoriais')
  })

  it('deve identificar sobrecarga e validar rate limit', () => {
    queueState.activeCount = 0
    queueState.pendingCount = 0
    expect(isOverloaded()).toBe(false)

    queueState.activeCount = 10
    queueState.pendingCount = 0
    expect(isOverloaded()).toBe(true)

    queueState.activeCount = 0
    queueState.pendingCount = 0

    const req = new Request('http://localhost/api/test', {
      headers: { 'x-real-ip': '127.0.0.1' },
    }) as never

    expect(() => validateRateLimit(req, 2, 1000)).not.toThrow()
    expect(rateLimit).toHaveBeenCalledWith('127.0.0.1', { limit: 2, windowMs: 1000 })
  })

  it('deve lançar erro quando o IP ou o servidor bloqueia', () => {
    vi.mocked(rateLimit).mockReturnValueOnce(false)
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-real-ip': '127.0.0.2' },
    }) as never

    expect(() => validateRateLimit(req, 1, 1000)).toThrow(/Muitas requisições/i)
    expect(logWarn).toHaveBeenCalled()

    vi.mocked(rateLimit).mockReturnValue(true)
    queueState.activeCount = 20
    queueState.pendingCount = 0

    expect(() => validateRateLimit(req, 1, 1000)).toThrow(/Servidor ocupado/i)
  })
})
