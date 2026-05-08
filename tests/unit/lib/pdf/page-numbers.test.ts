import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { addPageNumbers } from '@/lib/pdf/page-numbers'
import { extractPdfTextLines } from '@/lib/pdf/text'

describe('lib/pdf/page-numbers', () => {
  it('deve adicionar numeracao no cabecalho com inicio customizado', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))

    const result = await addPageNumbers(multiPagePdf, {
      placement: 'header',
      alignment: 'center',
      startAt: 7,
    })
    const pages = await extractPdfTextLines(result)

    expect(pages[0]?.[0]).toBe('7')
    expect(pages[1]?.[0]).toBe('8')
    expect(pages[2]?.[0]).toBe('9')
  })

  it('deve adicionar numeracao no rodape', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))

    const result = await addPageNumbers(multiPagePdf, {
      placement: 'footer',
      alignment: 'right',
      startAt: 1,
    })
    const pages = await extractPdfTextLines(result)

    expect(pages[0]?.at(-1)).toBe('1')
    expect(pages[1]?.at(-1)).toBe('2')
    expect(pages[2]?.at(-1)).toBe('3')
  })
})
