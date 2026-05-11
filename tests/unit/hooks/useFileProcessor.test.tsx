// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFileProcessor } from '@/hooks/useFileProcessor'
import {
  trackToolError,
  trackToolSuccess,
  trackToolUpload,
} from '@/lib/analytics'

vi.mock('@/lib/analytics', () => ({
  trackToolUpload: vi.fn(),
  trackToolSuccess: vi.fn(),
  trackToolError: vi.fn(),
}))

describe('hooks/useFileProcessor', () => {
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

  it('deve processar com sucesso e expor download', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(Uint8Array.from([1, 2, 3]), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="saida.pdf"',
        },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['arquivo'], 'entrada.pdf', { type: 'application/pdf' })
    const { result } = renderHook(() =>
      useFileProcessor({
        endpoint: '/api/pdf/compress',
        toolName: 'comprimir-pdf',
      }),
    )

    await act(async () => {
      await result.current.process(file)
    })

    expect(result.current.status).toBe('done')
    expect(result.current.downloadUrl).toBe('blob:download-url')
    expect(result.current.outputName).toBe('saida.pdf')
    expect(result.current.originalSize).toBe(file.size)
    expect(result.current.processedSize).toBe(3)
    expect(trackToolUpload).toHaveBeenCalledWith('comprimir-pdf', 1)
    expect(trackToolSuccess).toHaveBeenCalledWith('comprimir-pdf', 3)
    expect(trackToolError).not.toHaveBeenCalled()
  })

  it('deve tratar rate limit e iniciar contagem regressiva', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Servidor ocupado.',
              retryable: true,
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '2',
            },
          },
        ),
      ),
    )

    const file = new File(['arquivo'], 'entrada.pdf', { type: 'application/pdf' })
    const { result } = renderHook(() =>
      useFileProcessor({
        endpoint: '/api/pdf/compress',
        toolName: 'comprimir-pdf',
        maxRetries: 0,
      }),
    )

    await act(async () => {
      await result.current.process(file)
    })

    expect(result.current.status).toBe('rate_limited')
    expect(result.current.secondsLeft).toBe(2)
    expect(result.current.isBlocked).toBe(true)
    expect(trackToolError).toHaveBeenCalledWith('comprimir-pdf', 'rate_limit')
  })

  it('deve normalizar erro da API e expor mensagem', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Falha no servidor',
              retryable: false,
            },
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    )

    const file = new File(['arquivo'], 'entrada.pdf', { type: 'application/pdf' })
    const { result } = renderHook(() =>
      useFileProcessor({
        endpoint: '/api/pdf/compress',
        toolName: 'comprimir-pdf',
        maxRetries: 0,
      }),
    )

    await act(async () => {
      await result.current.process(file)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Falha no servidor')
    expect(result.current.errorCode).toBe('INTERNAL_ERROR')
    expect(result.current.retryable).toBe(false)
    expect(trackToolError).toHaveBeenCalledWith('comprimir-pdf', 'api_error:500')
  })
})
