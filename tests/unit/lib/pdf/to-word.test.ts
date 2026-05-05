import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { pdfToWord } from '@/lib/pdf/to-word'

describe('lib/pdf/to-word', () => {
  it('deve gerar um docx valido com o texto extraido do PDF', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const samplePdf = readFileSync(path.join(fixtureDir, 'sample.pdf'))

    const result = await pdfToWord(samplePdf)
    const output = result.toString('utf8')

    expect(result.slice(0, 2).toString()).toBe('PK')
    expect(output).toContain('word/document.xml')
    expect(output).toContain('Sample PDF for Testing')
    expect(output).toContain('This is page 1')
  })

  it('deve inserir quebra de pagina entre paginas do PDF', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))

    const result = await pdfToWord(multiPagePdf)
    const output = result.toString('utf8')

    expect(output).toContain('Page 1')
    expect(output).toContain('Page 2')
    expect(output).toContain('Page 3')
    expect(output).toContain('<w:br w:type="page"/>')
  })
})
