import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { splitPdf } from '@/lib/pdf/split'
import { PDFDocument } from 'pdf-lib'

describe('lib/pdf/split', () => {
  let multiPagePdf: Buffer

  beforeAll(() => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))
  })

  it('deve retornar buffer válido de PDF', async () => {
    const result = await splitPdf(multiPagePdf, '1-2')
    expect(result).toBeInstanceOf(Buffer)
    expect(result.slice(0, 4).toString()).toBe('%PDF')
  })

  it('deve extrair intervalo simples "1-2"', async () => {
    const result = await splitPdf(multiPagePdf, '1-2')
    const split = await PDFDocument.load(result)
    expect(split.getPageCount()).toBe(2)
  })

  it('deve extrair página única "2"', async () => {
    const result = await splitPdf(multiPagePdf, '2')
    const split = await PDFDocument.load(result)
    expect(split.getPageCount()).toBe(1)
  })

  it('deve extrair múltiplos intervalos "1,3"', async () => {
    const result = await splitPdf(multiPagePdf, '1,3')
    const split = await PDFDocument.load(result)
    expect(split.getPageCount()).toBe(2)
  })

  it('deve extrair intervalo complexo "1-2,3"', async () => {
    const result = await splitPdf(multiPagePdf, '1-2,3')
    const split = await PDFDocument.load(result)
    expect(split.getPageCount()).toBe(3)
  })

  it('deve truncar intervalo que ultrapassa total de páginas', async () => {
    // multi-page tem 3 páginas, 2-10 deve retornar apenas páginas 2-3
    const result = await splitPdf(multiPagePdf, '2-10')
    const split = await PDFDocument.load(result)
    expect(split.getPageCount()).toBe(2)
  })

  it('deve lançar erro para intervalo inválido (nenhuma página válida)', async () => {
    await expect(splitPdf(multiPagePdf, '10-15')).rejects.toThrow()
  })

  it('deve lançar erro para string vazia', async () => {
    await expect(splitPdf(multiPagePdf, '')).rejects.toThrow()
  })
})
