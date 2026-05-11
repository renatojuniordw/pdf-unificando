// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRetryCountdown } from '@/hooks/useRetryCountdown'

describe('hooks/useRetryCountdown', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve contar regressivamente e liberar bloqueio', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRetryCountdown())

    act(() => {
      result.current.startCountdown(3)
    })

    expect(result.current.secondsLeft).toBe(3)
    expect(result.current.isBlocked).toBe(true)
    expect(result.current.progress).toBe(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.secondsLeft).toBe(2)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.isBlocked).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('deve resetar o contador manualmente', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRetryCountdown())

    act(() => {
      result.current.startCountdown(5)
    })
    act(() => {
      result.current.reset()
    })

    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.isBlocked).toBe(false)
    expect(result.current.progress).toBe(0)
  })
})
