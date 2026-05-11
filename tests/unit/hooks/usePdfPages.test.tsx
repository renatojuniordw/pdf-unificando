// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePdfPages } from '@/hooks/usePdfPages'

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}))

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

  it('deve gerar miniaturas de páginas do PDF', async () => {
    const pdfjsLib = await import('pdfjs-dist')
    const getDocumentMock = vi.mocked(pdfjsLib.getDocument)

    getDocumentMock.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: vi.fn(async (pageNumber: number) => ({
          getViewport: () => ({ width: 200, height: 100 }),
          render: () => ({ promise: Promise.resolve() }),
          cleanup: vi.fn(),
          pageNumber,
        })),
      }),
    } as never)

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
  })
})
