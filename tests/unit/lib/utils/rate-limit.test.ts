import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimit } from '@/lib/utils/rate-limit'

describe('lib/utils/rate-limit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve permitir requisições até o limite', () => {
    expect(rateLimit('127.0.0.1', { limit: 2, windowMs: 1000 })).toBe(true)
    expect(rateLimit('127.0.0.1', { limit: 2, windowMs: 1000 })).toBe(true)
    expect(rateLimit('127.0.0.1', { limit: 2, windowMs: 1000 })).toBe(false)
  })

  it('deve liberar novamente após expirar a janela', () => {
    expect(rateLimit('127.0.0.2', { limit: 1, windowMs: 1000 })).toBe(true)
    expect(rateLimit('127.0.0.2', { limit: 1, windowMs: 1000 })).toBe(false)

    vi.advanceTimersByTime(1001)

    expect(rateLimit('127.0.0.2', { limit: 1, windowMs: 1000 })).toBe(true)
  })
})
