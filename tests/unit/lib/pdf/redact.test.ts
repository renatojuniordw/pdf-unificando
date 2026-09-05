import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { redactPdf, type RedactRegion } from '@/lib/pdf/redact'

async function buildPdf(pages: number): Promise<Buffer> {
  const doc = await PDFDocument.create()
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage([600, 800])
    page.drawText(`Page ${i}`, { x: 50, y: 750, size: 24 })
  }
  return Buffer.from(await doc.save())
}

const VALID_REGION: RedactRegion = { page: 0, x: 0.1, y: 0.1, width: 0.2, height: 0.2 }

describe('lib/pdf/redact', () => {
  it('REDACT_NoRegions_CopiesAllPagesWithoutStartingPdfjs', async () => {
    const pdf = await buildPdf(2)
    const result = await redactPdf(pdf, [])
    const out = await PDFDocument.load(result)
    expect(out.getPageCount()).toBe(2)
  })

  it('REDACT_SubsetOfPagesRedacted_PreservesPageCountAndCopiesUnredactedAsIs', async () => {
    const pdf = await buildPdf(2)
    const result = await redactPdf(pdf, [{ page: 1, x: 0.2, y: 0.2, width: 0.3, height: 0.3 }])
    const out = await PDFDocument.load(result)
    expect(out.getPageCount()).toBe(2)
  })

  it('REDACT_AllPagesRedacted_PreservesPageCount', async () => {
    const pdf = await buildPdf(2)
    const result = await redactPdf(pdf, [
      { page: 0, x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      { page: 1, x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
    ])
    const out = await PDFDocument.load(result)
    expect(out.getPageCount()).toBe(2)
  })

  it('REDACT_RegionAtFullPageBoundaries_Accepted', async () => {
    const pdf = await buildPdf(2)
    const result = await redactPdf(pdf, [{ page: 0, x: 0, y: 0, width: 1, height: 1 }])
    const out = await PDFDocument.load(result)
    expect(out.getPageCount()).toBe(2)
  })

  it.each<[string, RedactRegion]>([
    ['x_plus_width_overflows', { page: 0, x: 0.6, y: 0, width: 0.5, height: 0.1 }],
    ['y_plus_height_overflows', { page: 0, x: 0, y: 0.6, width: 0.1, height: 0.5 }],
    ['zero_width', { page: 0, x: 0.1, y: 0.1, width: 0, height: 0.1 }],
    ['zero_height', { page: 0, x: 0.1, y: 0.1, width: 0.1, height: 0 }],
    ['negative_x', { page: 0, x: -0.1, y: 0, width: 0.1, height: 0.1 }],
    ['negative_y', { page: 0, x: 0, y: -0.1, width: 0.1, height: 0.1 }],
    ['x_above_one', { page: 0, x: 1.5, y: 0, width: 0.1, height: 0.1 }],
    ['width_above_one', { page: 0, x: 0, y: 0, width: 1.5, height: 0.1 }],
    ['float_page', { page: 0.5, x: 0, y: 0, width: 0.1, height: 0.1 }],
    ['negative_page', { page: -1, x: 0, y: 0, width: 0.1, height: 0.1 }],
    ['nan_x', { page: 0, x: Number.NaN, y: 0, width: 0.1, height: 0.1 }],
    ['infinity_width', { page: 0, x: 0, y: 0, width: Number.POSITIVE_INFINITY, height: 0.1 }],
  ])('REDACT_InvalidRegion_%s_RejectsWith400', async (_label, region) => {
    const pdf = await buildPdf(1)
    await expect(redactPdf(pdf, [region])).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/regiões de redação são inválidas/i),
    })
  })

  it('REDACT_AnyInvalidRegionAmongValidOnes_RejectsWith400', async () => {
    const pdf = await buildPdf(2)
    await expect(
      redactPdf(pdf, [VALID_REGION, { page: 0, x: 1.2, y: 0, width: 0.1, height: 0.1 }]),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('REDACT_PageIndexOutOfRange_IsSilentlyIgnored', async () => {
    // O loop de páginas só percorre páginas reais: região com page >= pageCount
    // não referencia copyPages, logo não lança e não altera a contagem.
    const pdf = await buildPdf(2)
    const result = await redactPdf(pdf, [{ page: 10, x: 0.1, y: 0.1, width: 0.2, height: 0.2 }])
    const out = await PDFDocument.load(result)
    expect(out.getPageCount()).toBe(2)
  })
})