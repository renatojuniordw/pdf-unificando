import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { mergePdfs } from '@/lib/pdf/merge'
import { PDFDocument } from 'pdf-lib'

describe('lib/pdf/merge', () => {
  let samplePdf: Buffer
  let multiPagePdf: Buffer

  beforeAll(() => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    samplePdf = readFileSync(path.join(fixtureDir, 'sample.pdf'))
    multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))
  })

  it('deve retornar buffer válido de PDF', async () => {
    const result = await mergePdfs([samplePdf, samplePdf])
    expect(result).toBeInstanceOf(Buffer)
    expect(result.slice(0, 4).toString()).toBe('%PDF')
  })

  it('deve combinar dois PDFs em um', async () => {
    const result = await mergePdfs([samplePdf, samplePdf])
    const merged = await PDFDocument.load(result)
    expect(merged.getPageCount()).toBe(2)
  })

  it('deve preservar múltiplas páginas ao fazer merge', async () => {
    const result = await mergePdfs([multiPagePdf, multiPagePdf])
    const merged = await PDFDocument.load(result)
    expect(merged.getPageCount()).toBe(6) // 3 + 3
  })

  it('deve manter conteúdo das páginas após merge', async () => {
    const result = await mergePdfs([samplePdf, multiPagePdf])
    const merged = await PDFDocument.load(result)
    expect(merged.getPageCount()).toBe(4) // 1 + 3
  })

  it('deve retornar um PDF válido mesmo se array estiver vazio', async () => {
    const result = await mergePdfs([])
    const merged = await PDFDocument.load(result)

    expect(result).toBeInstanceOf(Buffer)
    expect(result.slice(0, 4).toString()).toBe('%PDF')
    expect(merged.getPageCount()).toBe(1)
  })

  it('deve lidar com merge de múltiplos PDFs', async () => {
    const result = await mergePdfs([samplePdf, samplePdf, samplePdf, samplePdf])
    const merged = await PDFDocument.load(result)
    expect(merged.getPageCount()).toBe(4)
  })
})
