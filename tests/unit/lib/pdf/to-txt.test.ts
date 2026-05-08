import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { pdfToTxt } from '@/lib/pdf/to-txt'

describe('lib/pdf/to-txt', () => {
  it('deve gerar um txt com o texto extraido do PDF', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const samplePdf = readFileSync(path.join(fixtureDir, 'sample.pdf'))

    const result = await pdfToTxt(samplePdf)
    const text = result.toString('utf-8')

    expect(text).toContain('Sample PDF for Testing')
    expect(text).toContain('This is page 1')
    expect(text.endsWith('\n')).toBe(true)
  })

  it('deve preservar separacao entre paginas no txt', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))

    const result = await pdfToTxt(multiPagePdf)
    const text = result.toString('utf-8')

    expect(text).toContain('Page 1')
    expect(text).toContain('Page 2')
    expect(text).toContain('Page 3')
    expect(text).toContain('\n\f\n')
  })
})
