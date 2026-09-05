import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { rotatePdf } from '@/lib/pdf/rotate'
import { validatePageRangeSyntax } from '@/lib/pdf/page-range'
import { addPageNumbers } from '@/lib/pdf/page-numbers'
import { extractPdfTextLines, ensurePdfHasExtractableText } from '@/lib/pdf/text'
import { extractPdfPages } from '@/lib/pdf/extract-pages'
import { pdfToWord } from '@/lib/pdf/to-word'
import { jpgToPdf } from '@/lib/pdf/from-jpg'

async function buildPdf(texts?: string[][]): Promise<Buffer> {
  const doc = await PDFDocument.create()
  for (const pageTexts of texts ?? [[]]) {
    const page = doc.addPage([600, 800])
    for (let i = 0; i < pageTexts.length; i++) {
      page.drawText(pageTexts[i], { x: 50 + i * 10, y: 750, size: 12 })
    }
  }
  return Buffer.from(await doc.save())
}

describe('lib/pdf residual gaps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ROTATE_InvalidDegrees_Throws400', async () => {
    const pdf = await buildPdf()
    await expect(rotatePdf(pdf, 45 as 90 | 180 | 270, 'all')).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/Ângulo de rotação inválido/i),
    })
  })

  it('ROTATE_PageScopeWithoutPageIndex_Throws400MissingPage', async () => {
    const pdf = await buildPdf()
    await expect(rotatePdf(pdf, 90, 'page')).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/Página não informada/i),
    })
  })

  it('PAGE_RANGE_EndBeforeStart_RejectsOutOfRangeEnd', () => {
    expect(validatePageRangeSyntax('1-0')).toBe('Use apenas números inteiros positivos.')
  })

  it('PAGE_NUMBERS_LeftHeader_AppliesOffsets', async () => {
    const pdf = await buildPdf([['a']])
    const result = await addPageNumbers(pdf, { alignment: 'left', placement: 'header', startAt: 5 })
    const out = await PDFDocument.load(result)
    expect(out.getPageCount()).toBe(1)
  })

  it('PAGE_NUMBERS_RightAlignment_Applies', async () => {
    const pdf = await buildPdf([['a']])
    const result = await addPageNumbers(pdf, { alignment: 'right', fontSize: 12 })
    const out = await PDFDocument.load(result)
    expect(out.getPageCount()).toBe(1)
  })

  it('TEXT_EnsureExtractableText_EmptyPages_Throws422', () => {
    expect(() => ensurePdfHasExtractableText([[''], ['']])).toThrow(/OCR/i)
  })

  it('TEXT_ExtractLines_SortsFragmentsByXWithinRow', async () => {
    const pdf = await buildPdf([['bbb', 'aaa']])
    const lines = await extractPdfTextLines(pdf)
    // 'bbb' desenhado em x=50 e 'aaa' em x=60: fragmentos ordenados por x
    expect(lines[0][0]).toBe('bbb aaa')
  })

  it('EXTRACT_PAGES_InvalidRange_Throws400', async () => {
    const pdf = await buildPdf()
    await expect(extractPdfPages(pdf, '99')).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/Nenhuma página válida/i),
    })
  })

  it('TO_WORD_PdfWithoutText_Throws422', async () => {
    const blank = await buildPdf([])
    await expect(pdfToWord(blank)).rejects.toMatchObject({
      status: 422,
      message: expect.stringMatching(/OCR/i),
    })
  })

  it('FROM_JPG_LandscapePortraitImage_SwapsDimensions', async () => {
    const portraitJpeg = await sharp({
      create: { width: 100, height: 200, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .jpeg()
      .toBuffer()

    const result = await jpgToPdf([portraitJpeg], 'landscape')
    const out = await PDFDocument.load(result)
    const { width, height } = out.getPage(0).getSize()
    // imagem retrato (100x200) em landscape → página 200x100
    expect(width).toBe(200)
    expect(height).toBe(100)
  })
})