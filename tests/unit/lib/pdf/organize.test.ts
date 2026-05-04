import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { organizePdf } from '@/lib/pdf/organize'
import { PDFDocument } from 'pdf-lib'

describe('lib/pdf/organize', () => {
  let multiPagePdf: Buffer

  beforeAll(() => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))
  })

  it('deve retornar buffer válido de PDF', async () => {
    const result = await organizePdf(multiPagePdf, '1,2,3')
    expect(result).toBeInstanceOf(Buffer)
    expect(result.slice(0, 4).toString()).toBe('%PDF')
  })

  it('deve reordenar páginas em ordem simples', async () => {
    const result = await organizePdf(multiPagePdf, '1,2,3')
    const organized = await PDFDocument.load(result)
    expect(organized.getPageCount()).toBe(3)
  })

  it('deve reordenar páginas em ordem reversa "3,2,1"', async () => {
    const result = await organizePdf(multiPagePdf, '3,2,1')
    const organized = await PDFDocument.load(result)
    expect(organized.getPageCount()).toBe(3)
  })

  it('deve remover páginas quando ordem tem menos elementos', async () => {
    const result = await organizePdf(multiPagePdf, '2,3')
    const organized = await PDFDocument.load(result)
    expect(organized.getPageCount()).toBe(2)
  })

  it('deve duplicar página se repetida na ordem', async () => {
    const result = await organizePdf(multiPagePdf, '1,1,2')
    const organized = await PDFDocument.load(result)
    expect(organized.getPageCount()).toBe(3)
  })

  it('deve lançar erro se ordem é inválida', async () => {
    await expect(organizePdf(multiPagePdf, '')).rejects.toThrow()
  })

  it('deve lançar erro se índice está fora do intervalo', async () => {
    await expect(organizePdf(multiPagePdf, '1,2,10')).rejects.toThrow()
  })

  it('deve ignorar índices negativos', async () => {
    const result = await organizePdf(multiPagePdf, '2,3')
    const organized = await PDFDocument.load(result)
    expect(organized.getPageCount()).toBe(2)
  })
})
