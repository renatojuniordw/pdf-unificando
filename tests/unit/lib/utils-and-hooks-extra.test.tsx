// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseOrder, parsePageRange } from '@/lib/utils/file'
import { siteUrl } from '@/lib/site'
import { logError, logInfo, logWarn } from '@/lib/utils/logger'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useDownloadTracking } from '@/hooks/useDownloadTracking'
import { useEventListener } from '@/hooks/useEventListener'
import { usePageRangeForm } from '@/hooks/usePageRangeForm'
import { useTextStats } from '@/hooks/useTextStats'
import { rateLimit } from '@/lib/utils/rate-limit'
import { validatePageRangeSyntax } from '@/lib/pdf/page-range'
import { trackToolDownload } from '@/lib/analytics'

vi.mock('@/lib/analytics', () => ({
  trackToolDownload: vi.fn(),
}))

describe('utilitários e hooks extras', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve normalizar página, URL e logs básicos', () => {
    const consoleInfo = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(parsePageRange('1, 2-4, 9', 10)).toEqual([0, 1, 2, 3, 8])
    expect(parsePageRange('2-2, 2, 1', 3)).toEqual([0, 1])
    expect(parseOrder('3, 1, 2')).toEqual([2, 0, 1])
    expect(siteUrl('/ferramentas/juntar-pdf')).toBe('https://pdf.unificando.com.br/ferramentas/juntar-pdf')

    logInfo('Scope', 'Mensagem', { id: 1 })
    logWarn('Scope', 'Aviso')
    logError('Scope', new Error('Falhou'))

    expect(consoleInfo).toHaveBeenCalled()
    expect(consoleWarn).toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalled()

    consoleInfo.mockRestore()
    consoleWarn.mockRestore()
    consoleError.mockRestore()
  })

  it('deve validar intervalos de página com mensagens úteis', () => {
    expect(validatePageRangeSyntax('')).toBeNull()
    expect(validatePageRangeSyntax('1-3, 5')).toBeNull()
    expect(validatePageRangeSyntax('a-b')).toMatch(/Formato inválido/i)
    expect(validatePageRangeSyntax('0-2')).toMatch(/inteiros positivos/i)
    expect(validatePageRangeSyntax('4-2')).toMatch(/maior ou igual/i)

    const form = renderHook(() => usePageRangeForm({ initialValue: ' 1-3 ' }))
    expect(form.result.current.normalizedValue).toBe('1-3')
    expect(form.result.current.isValid).toBe(true)

    act(() => form.result.current.setValue('3-1'))
    expect(form.result.current.error).toMatch(/maior ou igual/i)
  })

  it('deve travar o scroll do body e restaurar ao desmontar', () => {
    const { rerender, unmount } = renderHook(({ locked }) => {
      useBodyScrollLock(locked)
    }, { initialProps: { locked: false } })

    expect(document.body.style.overflow).toBe('unset')
    rerender({ locked: true })
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('unset')
  })

  it('deve disparar clique fora somente quando fora do elemento', () => {
    const onOutside = vi.fn()
    const ref = { current: document.createElement('div') }
    const child = document.createElement('button')
    ref.current.appendChild(child)
    document.body.appendChild(ref.current)

    renderHook(() => useClickOutside(ref, onOutside))

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(onOutside).toHaveBeenCalledTimes(1)

    onOutside.mockClear()
    act(() => {
      child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(onOutside).not.toHaveBeenCalled()
  })

  it('deve copiar texto com clipboard e resetar estado', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    const { result } = renderHook(() => useCopyToClipboard(1000))

    await act(async () => {
      await result.current.copy('texto')
    })

    expect(writeText).toHaveBeenCalledWith('texto')
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.copied).toBe(false)
  })

  it('deve cair no fallback de cópia quando clipboard não existe', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(() => true),
    })

    const { result } = renderHook(() => useCopyToClipboard(1000))
    await act(async () => {
      await result.current.copy('fallback')
    })

    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(result.current.copied).toBe(true)
  })

  it('deve expor erro quando a cópia falha', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('falha')),
      },
    })

    const { result } = renderHook(() => useCopyToClipboard(1000))
    await act(async () => {
      await result.current.copy('texto')
    })

    expect(result.current.copied).toBe(false)
    expect(result.current.error).toMatch(/Não foi possível copiar agora/i)
  })

  it('deve rastrear downloads apenas com filename', () => {
    const { result, rerender } = renderHook(({ filename }) => useDownloadTracking('comprimir-pdf', filename), {
      initialProps: { filename: 'saida.pdf' as string | null | undefined },
    })

    act(() => {
      result.current()
    })
    expect(trackToolDownload).toHaveBeenCalledWith('comprimir-pdf', 'saida.pdf')

    rerender({ filename: undefined })
    act(() => {
      result.current()
    })
    expect(trackToolDownload).toHaveBeenCalledTimes(1)
  })

  it('deve registrar e remover listeners de evento', () => {
    const target = new EventTarget()
    const listener = vi.fn()
    const addSpy = vi.spyOn(target, 'addEventListener')
    const removeSpy = vi.spyOn(target, 'removeEventListener')
    const { unmount } = renderHook(() => useEventListener(target, 'custom', listener))

    expect(addSpy).toHaveBeenCalledWith('custom', listener, undefined)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('custom', listener, undefined)
  })

  it('deve calcular estatísticas de texto', () => {
    const { result, rerender } = renderHook(({ text }) => useTextStats(text), {
      initialProps: { text: 'um dois tres' },
    })

    expect(result.current.wordCount).toBe(3)
    expect(result.current.characterCount).toBe(12)

    rerender({ text: '   ' })
    expect(result.current.wordCount).toBe(0)
  })

  it('deve respeitar o limite de rate limit puro', () => {
    expect(rateLimit('10.0.0.1', { limit: 1, windowMs: 1000 })).toBe(true)
    expect(rateLimit('10.0.0.1', { limit: 1, windowMs: 1000 })).toBe(false)
  })
})
