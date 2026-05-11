import { describe, expect, it, vi, beforeEach } from 'vitest'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import { validatePageRangeSyntax, normalizePageRange } from '@/lib/pdf/page-range'
import { watermarkPdf } from '@/lib/pdf/watermark'
import { jpgToPdf } from '@/lib/pdf/from-jpg'
import { pdfToJpg } from '@/lib/pdf/to-jpg'
import { pdfToPng } from '@/lib/pdf/to-png'
import { pdfToMarkdown } from '@/lib/pdf/to-markdown'
import { redactPdf } from '@/lib/pdf/redact'

vi.mock('@/lib/utils/http', () => ({
  createApiError: (status: number, code: string, message: string, details?: unknown) =>
    Object.assign(new Error(message), { status, code, details }),
}))

vi.mock('child_process', () => ({
  execFile: vi.fn(),
}))

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual<typeof import('fs/promises')>('fs/promises')
  return {
    ...actual,
    writeFile: vi.fn(),
    readFile: vi.fn(async () => Buffer.from('%PDF mock')),
    unlink: vi.fn(async () => undefined),
  }
})

vi.mock('crypto', async () => {
  const actual = await vi.importActual<typeof import('crypto')>('crypto')
  return {
    ...actual,
    randomUUID: () => 'uuid-mock',
  }
})

vi.mock('@/lib/utils/tmp', () => ({
  withTmpFile: vi.fn(async (_buffer: Buffer, _inputExt: string, _outputExt: string, fn: (inputPath: string, outputPath: string) => Promise<void>) => {
    await fn('/tmp/in.pdf', '/tmp/out.pdf')
    return Buffer.from('%PDF tmp')
  }),
}))

describe('lib/pdf extras', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function buildPdf(pages: string[]): Promise<Buffer> {
    const doc = await PDFDocument.create()
    for (const text of pages) {
      const page = doc.addPage([600, 800])
      page.drawText(text, { x: 50, y: 750, size: 24 })
    }
    return Buffer.from(await doc.save())
  }

  it('deve validar intervalos de páginas', () => {
    expect(normalizePageRange(' 1-3 ')).toBe('1-3')
    expect(validatePageRangeSyntax('1-3, 5')).toBeNull()
    expect(validatePageRangeSyntax('abc')).toMatch(/Formato inválido/i)
    expect(validatePageRangeSyntax('2-1')).toMatch(/maior ou igual/i)
  })

  it('deve converter JPG em PDF e respeitar orientação', async () => {
    const jpg = await sharp({
      create: {
        width: 2,
        height: 1,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer()
    const pdfBuffer = await jpgToPdf([jpg], 'landscape')
    const pdf = await PDFDocument.load(pdfBuffer)

    expect(pdf.getPageCount()).toBe(1)
    const page = pdf.getPage(0)
    expect(page.getWidth()).toBeGreaterThan(page.getHeight())
  })

  it('deve converter PDF em JPG e PNG', async () => {
    const multiPagePdf = await buildPdf(['Page 1', 'Page 2', 'Page 3'])

    const jpgBuffer = await pdfToJpg(multiPagePdf, '72')
    const pngBuffer = await pdfToPng(multiPagePdf, '72')

    expect(jpgBuffer.slice(0, 2).toString('hex')).toBe('504b')
    expect(pngBuffer.slice(0, 2).toString('hex')).toBe('504b')
  })

  it('deve converter PDF para markdown e manter texto', async () => {
    const samplePdf = await buildPdf(['Sample PDF for Testing', 'This is page 1'])

    const markdown = await pdfToMarkdown(samplePdf)
    const text = markdown.toString('utf-8')

    expect(text).toContain('Sample PDF for Testing')
    expect(text).toContain('This is page 1')
  })

  it('deve redigir um PDF com e sem regiões válidas', async () => {
    const samplePdf = await buildPdf(['Sample PDF for Testing'])

    await expect(redactPdf(samplePdf, [{ page: -1, x: 0, y: 0, width: 0.1, height: 0.1 }])).rejects.toThrow(
      /regiões de redação são inválidas/i,
    )

    const redacted = await redactPdf(samplePdf, [{ page: 0, x: 0.1, y: 0.1, width: 0.2, height: 0.2 }])
    const pdf = await PDFDocument.load(redacted)
    expect(pdf.getPageCount()).toBe(1)
  })

  it('deve aplicar marca d\'água e validar texto obrigatório', async () => {
    const samplePdf = await buildPdf(['Sample PDF for Testing'])

    await expect(watermarkPdf(samplePdf, { text: '   ' })).rejects.toMatchObject({ status: 400 })

    const marked = await watermarkPdf(samplePdf, { text: 'CONFIDENCIAL', color: 'red', opacity: 0.5 })
    const pdf = await PDFDocument.load(marked)
    expect(pdf.getPageCount()).toBe(1)
  })
})
