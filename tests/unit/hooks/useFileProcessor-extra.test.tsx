// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFileProcessor } from '@/hooks/useFileProcessor'

vi.mock('@/lib/analytics', () => ({
  trackToolUpload: vi.fn(),
  trackToolSuccess: vi.fn(),
  trackToolError: vi.fn(),
}))

function rateLimitedResponse(retryAfter = 30): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Servidor ocupado.', retryable: true },
    }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) } },
  )
}

function apiErrorResponse(status: number, retryable: boolean): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Falha', retryable },
    }),
    { status, headers: { 'Content-Type': 'application/json' } },
  )
}

// Garantir um Response NOVO a cada uso: body de Response é consumível uma vez.
function okResponse(): Response {
  return new Response(Uint8Array.from([1]), {
    status: 200,
    headers: { 'Content-Type': 'application/pdf' },
  })
}

describe('hooks/useFileProcessor (retry, retryLast, extras)', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:download-url'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
  })

  const file = new File(['arquivo'], 'entrada.pdf', { type: 'application/pdf' })

  it('EXTRA_DATA_AppendsFieldsAndAcceptsMultipleFiles', async () => {
    const fetchMock = vi.fn(okResponse)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/api/pdf/compress', toolName: 't', maxRetries: 0 }),
    )
    const second = new File(['outro'], 'b.pdf', { type: 'application/pdf' })

    await act(async () => {
      await result.current.process([file, second], { quality: 'high' })
    })

    expect(result.current.status).toBe('done')
    const init = (vi.mocked(fetchMock).mock.calls as unknown[][])[0]?.[1] as RequestInit | undefined
    const sentFormData = init?.body as FormData
    expect(sentFormData.getAll('file')).toHaveLength(2)
    expect(sentFormData.get('quality')).toBe('high')
    expect(sentFormData.get('_hp')).toBe('')
    expect(result.current.originalSize).toBe(file.size + second.size)
  })

  it('RATE_LIMITED_WithRetries_SchedulesRetryAndSucceeds', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(rateLimitedResponse(1))
      .mockImplementationOnce(okResponse)
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/x', toolName: 't', maxRetries: 2 }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    expect(result.current.status).toBe('rate_limited')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1001)
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe('done')
  })

  it('API_ERROR_Retryable_WithRetries_SchedulesRetryAndSucceeds', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(apiErrorResponse(500, true))
      .mockImplementationOnce(okResponse)
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/x', toolName: 't', maxRetries: 2 }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1001) // delay = 1000 * 2^0
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe('done')
  })

  it('NETWORK_ERROR_Retryable_WithRetries_SchedulesRetryAndSucceeds', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockImplementationOnce(okResponse)
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/x', toolName: 't', maxRetries: 2 }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1001)
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe('done')
  })

  it('RETRY_LAST_ReplaysLastFailedRequest', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(apiErrorResponse(500, false))
      .mockImplementationOnce(okResponse)
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/x', toolName: 't', maxRetries: 0 }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    expect(result.current.status).toBe('error')

    await act(async () => {
      result.current.retryLast()
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe('done')
  })

  it('RESET_CancelsPendingRetryTimer', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(rateLimitedResponse)
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/x', toolName: 't', maxRetries: 3 }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_001)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('STALE_RETRY_GuardSkipsOutdatedRequest', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(rateLimitedResponse(30))
      .mockImplementationOnce(okResponse)
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/x', toolName: 't', maxRetries: 3 }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    // Nova requisição invalida a retry programada (requestSeq muda)
    await act(async () => {
      await result.current.process(file)
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe('done')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_001)
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('SECOND_SUCCESS_RevokesPreviousObjectUrl', async () => {
    vi.stubGlobal('fetch', vi.fn(okResponse))
    const { result } = renderHook(() =>
      useFileProcessor({ endpoint: '/x', toolName: 't', maxRetries: 0 }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    await act(async () => {
      await result.current.process(file)
    })
    expect(result.current.status).toBe('done')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:download-url')
  })

  it('OUTPUT_NAME_FallsBackToStaticOutputFilename', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Response('raw', { status: 200 })),
    )
    const { result } = renderHook(() =>
      useFileProcessor({
        endpoint: '/x',
        toolName: 't',
        outputFilename: 'saida-fixa.pdf',
        maxRetries: 0,
      }),
    )
    await act(async () => {
      await result.current.process(file)
    })
    expect(result.current.outputName).toBe('saida-fixa.pdf')
  })
})