// @vitest-environment jsdom

import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from '@/components/network/OfflineBanner'

describe('OfflineBanner (connectivity events)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('OFFLINE_AbortTimeout_FiresWhenHealthcheckHangs', async () => {
    vi.useFakeTimers()
    // fetch nunca resolve: o timeout de 2.5s deve abortar o controller
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    render(<OfflineBanner />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2501)
    })

    expect(abortSpy).toHaveBeenCalled()
  })

  it('OFFLINE_OnlineAndOfflineEvents_ScheduleVerification', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))
      .mockResolvedValueOnce(new Response('bad', { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)

    render(<OfflineBanner />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.queryByText(/VOCÊ ESTÁ OFFLINE/i)).toBeNull()

    // evento offline → nova verificação agendada (debounce 400ms)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(401)
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(screen.getByText(/VOCÊ ESTÁ OFFLINE/i)).toBeTruthy()

    // evento online → verificação imediata sem debounce
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('OFFLINE_DoubleOfflineEvent_ClearsPendingTimer', async () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    render(<OfflineBanner />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(clearTimeoutSpy).toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(401)
    })
    // segunda verificação substituiu a primeira: apenas 1 nova chamada
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('OFFLINE_HealthyResponse_HidesBannerAfterRecovery', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('bad', { status: 503 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    render(<OfflineBanner />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByText(/VOCÊ ESTÁ OFFLINE/i)).toBeTruthy()

    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.queryByText(/VOCÊ ESTÁ OFFLINE/i)).toBeNull()
  })
})