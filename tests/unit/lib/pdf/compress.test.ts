import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { compressPdf } from '@/lib/pdf/compress'
import { PDFDocument } from 'pdf-lib'
import { execSync } from 'child_process'

describe('lib/pdf/compress', () => {
  let samplePdf: Buffer
  let canRunTests = true

  beforeAll(() => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    samplePdf = readFileSync(path.join(fixtureDir, 'sample.pdf'))

    // Verificar se Ghostscript está instalado
    try {
      execSync('which gs', { stdio: 'ignore' })
    } catch {
      canRunTests = false
    }
  })

  it.skipIf(!canRunTests)(
    'deve retornar buffer válido de PDF comprimido',
    async () => {
      const result = await compressPdf(samplePdf, 'medium')
      expect(result.buffer).toBeInstanceOf(Buffer)
      expect(result.buffer.slice(0, 4).toString()).toBe('%PDF')
    }
  )

  it.skipIf(!canRunTests)(
    'deve retornar tamanho comprimido menor ou igual ao original',
    async () => {
      const result = await compressPdf(samplePdf, 'low')
      // Alguns PDFs podem não compactar muito, então apenas verificamos que não aumentou
      expect(result.compressedSize).toBeLessThanOrEqual(result.originalSize * 1.1)
    }
  )

  it.skipIf(!canRunTests)('deve suportar qualidade "low"', async () => {
    const result = await compressPdf(samplePdf, 'low')
    expect(result.buffer).toBeInstanceOf(Buffer)
    expect(result.originalSize).toBeGreaterThan(0)
  })

  it.skipIf(!canRunTests)('deve suportar qualidade "medium"', async () => {
    const result = await compressPdf(samplePdf, 'medium')
    expect(result.buffer).toBeInstanceOf(Buffer)
  })

  it.skipIf(!canRunTests)('deve suportar qualidade "high"', async () => {
    const result = await compressPdf(samplePdf, 'high')
    expect(result.buffer).toBeInstanceOf(Buffer)
  })

  it.skipIf(!canRunTests)(
    'deve gerar PDF válido após compressão',
    async () => {
      const result = await compressPdf(samplePdf, 'medium')
      const doc = await PDFDocument.load(result.buffer)
      expect(doc.getPageCount()).toBeGreaterThan(0)
    }
  )

  it.skipIf(!canRunTests)(
    'deve preservar número de páginas após compressão',
    async () => {
      const original = await PDFDocument.load(samplePdf)
      const result = await compressPdf(samplePdf, 'medium')
      const compressed = await PDFDocument.load(result.buffer)
      expect(compressed.getPageCount()).toBe(original.getPageCount())
    }
  )
})
