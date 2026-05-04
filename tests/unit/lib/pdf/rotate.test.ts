import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { rotatePdf } from '@/lib/pdf/rotate'
import { PDFDocument } from 'pdf-lib'

describe('lib/pdf/rotate', () => {
  let multiPagePdf: Buffer

  beforeAll(() => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))
  })

  it('deve retornar buffer válido de PDF', async () => {
    const result = await rotatePdf(multiPagePdf, 90, 'all')
    expect(result).toBeInstanceOf(Buffer)
    expect(result.slice(0, 4).toString()).toBe('%PDF')
  })

  it('deve rotacionar todas as páginas em 90 graus', async () => {
    const result = await rotatePdf(multiPagePdf, 90, 'all')
    const rotated = await PDFDocument.load(result)
    expect(rotated.getPageCount()).toBe(3)
  })

  it('deve rotacionar apenas uma página', async () => {
    const result = await rotatePdf(multiPagePdf, 90, 'page', 0)
    const rotated = await PDFDocument.load(result)
    expect(rotated.getPageCount()).toBe(3)
  })

  it('deve suportar rotações em 180 graus', async () => {
    const result = await rotatePdf(multiPagePdf, 180, 'all')
    const rotated = await PDFDocument.load(result)
    expect(rotated.getPageCount()).toBe(3)
  })

  it('deve suportar rotações em 270 graus', async () => {
    const result = await rotatePdf(multiPagePdf, 270, 'all')
    const rotated = await PDFDocument.load(result)
    expect(rotated.getPageCount()).toBe(3)
  })

  it('deve lançar erro se página não existe', async () => {
    await expect(rotatePdf(multiPagePdf, 90, 'page', 10)).rejects.toThrow()
  })

  it('deve lançar erro se escopo é inválido', async () => {
    await expect(rotatePdf(multiPagePdf, 90, 'page' as any)).rejects.toThrow()
  })
})
