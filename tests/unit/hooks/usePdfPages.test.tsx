// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { friendlyPdfError, renderPdfThumbnails, usePdfPages } from '@/hooks/usePdfPages'

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}))

function mockPdfjsDocument({
  numPages = 2,
  renderImpl,
  destroyImpl,
}: {
  numPages?: number
  renderImpl?: () => { promise: Promise<void> }
  destroyImpl?: () => Promise<void>
} = {}) {
  return import('pdfjs-dist').then((pdfjsLib) => {
    const getDocumentMock = vi.mocked(pdfjsLib.getDocument)
    const destroy = vi.fn(destroyImpl ?? (async () => undefined))
    const getPage = vi.fn(async (pageNumber: number) => ({
      getViewport: () => ({ width: 200, height: 100 }),
      render: renderImpl ?? (() => ({ promise: Promise.resolve() })),
      cleanup: vi.fn(),
      pageNumber,
    }))

    getDocumentMock.mockReturnValue({
      promise: Promise.resolve({
        numPages,
        getPage,
        destroy,
      }),
    } as never)

    return { destroy, getPage, getDocumentMock }
  })
}

describe('hooks/usePdfPages', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: vi.fn(() => ({})),
    })

    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      value: vi.fn(() => 'data:image/png;base64,thumb'),
    })
  })

  it('deve traduzir erros do helper em mensagens amigáveis', () => {
    expect(friendlyPdfError(new Error('canvas unavailable'))).toBe(
      'Não foi possível gerar as miniaturas deste PDF.',
    )
    expect(friendlyPdfError(new Error('worker crashed'))).toBe(
      'Não foi possível gerar as miniaturas deste PDF.',
    )
    expect(friendlyPdfError(new Error('render failed'))).toBe(
      'Não foi possível gerar as miniaturas deste PDF.',
    )
    expect(friendlyPdfError(new Error('password required'))).toBe(
      'Este PDF parece estar protegido por senha.',
    )
    expect(friendlyPdfError(new Error('encrypted document'))).toBe(
      'Este PDF parece estar protegido por senha.',
    )
    expect(friendlyPdfError(new Error('  mensagem direta  '))).toBe('mensagem direta')
    expect(friendlyPdfError(new Error('   '))).toBe('Não foi possível gerar as miniaturas deste PDF.')
    expect(friendlyPdfError('qualquer coisa')).toBe('Não foi possível gerar as miniaturas deste PDF.')
  })

  it('deve gerar miniaturas de páginas do PDF', async () => {
    const { destroy, getPage } = await mockPdfjsDocument()
    const progress: Array<[number, number]> = []

    const file = new File(['pdf'], 'sample.pdf', { type: 'application/pdf' })
    const thumbs = await renderPdfThumbnails(file, (current, total) => {
      progress.push([current, total])
    })

    expect(thumbs).toHaveLength(2)
    expect(progress).toEqual([
      [1, 2],
      [2, 2],
    ])
    expect(getPage).toHaveBeenCalledTimes(2)
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('deve atualizar o estado do hook enquanto carrega miniaturas', async () => {
    const { getDocumentMock } = await mockPdfjsDocument()

    const file = new File(['pdf'], 'sample.pdf', { type: 'application/pdf' })
    const { result } = renderHook(() => usePdfPages())

    await act(async () => {
      const thumbs = await result.current.loadFile(file)
      expect(thumbs).toHaveLength(2)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pages).toHaveLength(2)
    expect(result.current.pages[0]).toMatchObject({
      index: 0,
      dataUrl: 'data:image/png;base64,thumb',
    })
    expect(result.current.error).toBeNull()
    expect(result.current.progress).toBe(1)
    expect(result.current.currentPage).toBe(2)
    expect(result.current.totalPages).toBe(2)
    expect(getDocumentMock).toHaveBeenCalledTimes(1)
  })

  it('deve expor erro amigável quando o canvas não pode ser criado', async () => {
    const { destroy } = await mockPdfjsDocument()
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: vi.fn(() => null),
    })

    const file = new File(['pdf'], 'sample.pdf', { type: 'application/pdf' })
    const { result } = renderHook(() => usePdfPages())

    await act(async () => {
      const thumbs = await result.current.loadFile(file)
      expect(thumbs).toEqual([])
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pages).toEqual([])
    expect(result.current.error).toBe('Não foi possível gerar as miniaturas deste PDF.')
    expect(result.current.progress).toBe(0)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(0)
    expect(destroy).toHaveBeenCalledTimes(1)
  })
})
