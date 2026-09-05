import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type CanvasFactoryInstance = {
  create: (width: number, height: number) => { canvas: FakeCanvas; context: unknown }
  reset: (obj: { canvas: FakeCanvas | null }, width: number, height: number) => void
  destroy: (obj: { canvas: FakeCanvas | null; context: unknown }) => void
}

class FakeCanvas {
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  getContext(_type: string) {
    return { canvas: this }
  }

  toBuffer(format: string, quality?: number) {
    return Buffer.from(`${format}:${this.width}x${this.height}:${quality ?? ''}`)
  }
}

const canvasMock = {
  Canvas: FakeCanvas,
  ImageData: class ImageData {},
  Path2D: class Path2D {},
  DOMMatrix: class DOMMatrix {},
}

function mockPdfjsWithPages(pages: Array<{ getTextContent?: () => Promise<{ items: unknown[] }>; render?: () => { promise: Promise<void> } }>) {
  const getDocument = vi.fn((opts: { CanvasFactory?: new () => CanvasFactoryInstance }) => {
    const CanvasCtor =
      opts.CanvasFactory ?? (class {} as unknown as new () => CanvasFactoryInstance)
    const factory = new CanvasCtor()
    if ('create' in factory) {
      expect(() => factory.create(0, 10)).toThrow('Invalid canvas size')
      const created = factory.create(10, 20)
      const wrapper = { canvas: created.canvas }
      factory.reset(wrapper, 30, 40)
      expect(created.canvas.width).toBe(30)
      expect(created.canvas.height).toBe(40)
      expect(() => factory.reset({ canvas: null }, 1, 1)).toThrow('Canvas is not specified')
      const destroyTarget = { canvas: created.canvas, context: created.context }
      factory.destroy(destroyTarget)
      expect(destroyTarget.canvas).toBeNull()
    }

    return {
      promise: Promise.resolve({
        numPages: pages.length,
        getPage: vi.fn(async (pageNumber: number) => {
          const page = pages[pageNumber - 1]
          return {
            getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 50 * scale }),
            render: page.render ?? (() => ({ promise: Promise.resolve() })),
            getTextContent: page.getTextContent ?? (async () => ({ items: [] })),
            cleanup: vi.fn(),
          }
        }),
      }),
    }
  })

  vi.doMock('@napi-rs/canvas', () => canvasMock)
  vi.doMock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
    getDocument,
    GlobalWorkerOptions: {},
  }))

  return getDocument
}

describe('branches extras dos conversores de PDF', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.doUnmock('@napi-rs/canvas')
    vi.doUnmock('pdfjs-dist/legacy/build/pdf.mjs')
  })

  it('rejeita DPI inválido em JPG e PNG antes de carregar dependências', async () => {
    const { pdfToJpg } = await import('@/lib/pdf/to-jpg')
    const { pdfToPng } = await import('@/lib/pdf/to-png')

    await expect(pdfToJpg(Buffer.from('%PDF'), '999' as never)).rejects.toThrow('DPI inválido.')
    await expect(pdfToPng(Buffer.from('%PDF'), '999' as never)).rejects.toThrow('DPI inválido.')
  })

  it('cobre os ramos internos de JPG com múltiplas páginas', async () => {
    const getDocument = mockPdfjsWithPages([
      { render: () => ({ promise: Promise.resolve() }) },
      { render: () => ({ promise: Promise.resolve() }) },
    ])

    const { pdfToJpg } = await import('@/lib/pdf/to-jpg')
    const buffer = await pdfToJpg(Buffer.from('%PDF mock'), '72')

    expect(getDocument).toHaveBeenCalledTimes(1)
    expect(buffer.subarray(0, 2).toString('hex')).toBe('504b')
  })

  it('retorna JPG puro quando há apenas uma página', async () => {
    mockPdfjsWithPages([{ render: () => ({ promise: Promise.resolve() }) }])

    const { pdfToJpg } = await import('@/lib/pdf/to-jpg')
    const buffer = await pdfToJpg(Buffer.from('%PDF mock'), '300')

    expect(buffer.toString()).toContain('image/jpeg')
    expect(buffer.subarray(0, 2).toString('hex')).not.toBe('504b')
  })

  it('cobre os ramos internos de PNG com múltiplas páginas', async () => {
    const getDocument = mockPdfjsWithPages([
      { render: () => ({ promise: Promise.resolve() }) },
      { render: () => ({ promise: Promise.resolve() }) },
    ])

    const { pdfToPng } = await import('@/lib/pdf/to-png')
    const buffer = await pdfToPng(Buffer.from('%PDF mock'), '150')

    expect(getDocument).toHaveBeenCalledTimes(1)
    expect(buffer.subarray(0, 2).toString('hex')).toBe('504b')
  })

  it('retorna PNG puro quando há apenas uma página', async () => {
    mockPdfjsWithPages([{ render: () => ({ promise: Promise.resolve() }) }])

    const { pdfToPng } = await import('@/lib/pdf/to-png')
    const buffer = await pdfToPng(Buffer.from('%PDF mock'), '72')

    expect(buffer.toString()).toContain('image/png')
    expect(buffer.subarray(0, 2).toString('hex')).not.toBe('504b')
  })

  it('rejeita PDF sem texto ao converter para markdown', async () => {
    vi.doMock('@napi-rs/canvas', () => canvasMock)
    vi.doMock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
      getDocument: vi.fn(() => ({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn(async () => ({
            getTextContent: async () => ({ items: [{ str: '   ' }] }),
            cleanup: vi.fn(),
          })),
        }),
      })),
    }))

    const { pdfToMarkdown } = await import('@/lib/pdf/to-markdown')

    await expect(pdfToMarkdown(Buffer.from('%PDF mock'))).rejects.toMatchObject({ status: 422 })
  })

  it('monta markdown com heading, lista e quebra de parágrafo', async () => {
    vi.doMock('@napi-rs/canvas', () => canvasMock)
    vi.doMock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
      getDocument: vi.fn(() => ({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn(async () => ({
            getTextContent: async () => ({
              items: [
                { str: 'Title', transform: [1, 0, 0, 24, 50, 700], height: 24 },
                { str: 'Subheading', transform: [1, 0, 0, 18, 50, 680], height: 18 },
                { str: 'Minor heading', transform: [1, 0, 0, 15, 50, 660], height: 15 },
                { str: 'Hello', transform: [1, 0, 0, 12, 50, 650], height: 12 },
                { str: 'World', transform: [1, 0, 0, 12, 120, 650], height: 12 },
                { str: 'Next paragraph', transform: [1, 0, 0, 12, 50, 590], height: 12 },
                { str: '• Bullet-like', transform: [1, 0, 0, 12, 50, 560], height: 12 },
                { str: '1. Ordered item', transform: [1, 0, 0, 12, 50, 530], height: 12 },
                { str: 'Tail', transform: [1, 0, 0, 12, 50, 500], height: 12 },
              ],
            }),
            cleanup: vi.fn(),
          })),
        }),
      })),
    }))

    const { pdfToMarkdown } = await import('@/lib/pdf/to-markdown')
    const markdown = (await pdfToMarkdown(Buffer.from('%PDF mock'))).toString('utf-8')

    expect(markdown).toContain('# Title')
    expect(markdown).toContain('## Subheading')
    expect(markdown).toContain('### Minor heading')
    expect(markdown).toContain('Hello World')
    expect(markdown).toContain('Next paragraph')
    expect(markdown).toContain('- Bullet-like')
    expect(markdown).toContain('1. Ordered item')
    expect(markdown).toContain('Tail')
  })

  it('usa o fallback de corpo e normaliza travessão em linhas sem tamanho útil', async () => {
    vi.doMock('@napi-rs/canvas', () => canvasMock)
    vi.doMock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
      getDocument: vi.fn(() => ({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn(async () => ({
            getTextContent: async () => ({
              items: [
                { str: 'First body', transform: [1, 0, 0, 0, 50, 700], height: 0 },
                { str: 'Second body', transform: [1, 0, 0, 0, 50, 640], height: 0 },
                { str: '— Dash item', transform: [1, 0, 0, 0, 50, 580], height: 0 },
              ],
            }),
            cleanup: vi.fn(),
          })),
        }),
      })),
    }))

    const { pdfToMarkdown } = await import('@/lib/pdf/to-markdown')
    const markdown = (await pdfToMarkdown(Buffer.from('%PDF mock'))).toString('utf-8')

    expect(markdown).toContain('First body')
    expect(markdown).toContain('Second body')
    expect(markdown).toContain('- Dash item')
  })
})
