import { describe, expect, it, vi } from 'vitest'
import { isAbortError, normalizeFetchError, safeReadErrorBody } from '@/lib/utils/fetch-error'

describe('lib/utils/fetch-error', () => {
  it('deve reconhecer AbortError', () => {
    expect(isAbortError(new DOMException('aborted', 'AbortError'))).toBe(true)
    expect(isAbortError(new Error('x'))).toBe(false)
  })

  it('deve normalizar timeout, rede e erro genérico', () => {
    expect(normalizeFetchError(new DOMException('aborted', 'AbortError'))).toMatchObject({
      code: 'TIMEOUT_ERROR',
      retryable: true,
    })
    expect(normalizeFetchError(new TypeError('Failed to fetch'))).toMatchObject({
      code: 'NETWORK_ERROR',
      retryable: true,
    })
    expect(normalizeFetchError(new Error('boom'))).toMatchObject({
      code: 'INTERNAL_ERROR',
      retryable: false,
    })
  })

  it('deve ler corpo JSON de erro', async () => {
    const res = new Response(JSON.stringify({ error: 'x' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
    await expect(safeReadErrorBody(res)).resolves.toEqual({ error: 'x' })
  })

  it('deve ler corpo de erro não-JSON como texto', async () => {
    const res = new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
    await expect(safeReadErrorBody(res)).resolves.toEqual({ error: 'Internal Server Error' })
  })

  it('deve retornar null em caso de falha na leitura', async () => {
    const res = new Response('x', {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
    vi.spyOn(res, 'json').mockRejectedValueOnce(new Error('parse fail'))
    await expect(safeReadErrorBody(res)).resolves.toBeNull()
  })
})