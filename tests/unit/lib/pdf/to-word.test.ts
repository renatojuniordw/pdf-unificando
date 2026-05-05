import { execFile } from 'child_process'
import { mkdtemp, writeFile, rm } from 'fs/promises'
import { readFileSync } from 'fs'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import { describe, expect, it } from 'vitest'
import { pdfToWord } from '@/lib/pdf/to-word'

const execFileAsync = promisify(execFile)

async function readDocxEntry(buffer: Buffer, entry: string): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'pdf-to-word-test-'))
  const docxPath = path.join(tempDir, 'output.docx')

  try {
    await writeFile(docxPath, buffer)
    const { stdout } = await execFileAsync('/usr/bin/unzip', ['-p', docxPath, entry], {
      encoding: 'utf8',
    })

    return stdout
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

async function listDocxEntries(buffer: Buffer): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'pdf-to-word-test-'))
  const docxPath = path.join(tempDir, 'output.docx')

  try {
    await writeFile(docxPath, buffer)
    const { stdout } = await execFileAsync('/usr/bin/zipinfo', ['-1', docxPath], {
      encoding: 'utf8',
    })

    return stdout
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

describe('lib/pdf/to-word', () => {
  it('deve gerar um docx valido com o texto extraido do PDF', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const samplePdf = readFileSync(path.join(fixtureDir, 'sample.pdf'))

    const result = await pdfToWord(samplePdf)
    const documentXml = await readDocxEntry(result, 'word/document.xml')
    const entries = await listDocxEntries(result)

    expect(result.slice(0, 2).toString()).toBe('PK')
    expect(entries).toContain('[Content_Types].xml')
    expect(entries).toContain('word/document.xml')
    expect(documentXml).toContain('Sample PDF for Testing')
    expect(documentXml).toContain('This is page 1')
  })

  it('deve inserir quebra de pagina entre paginas do PDF', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))

    const result = await pdfToWord(multiPagePdf)
    const documentXml = await readDocxEntry(result, 'word/document.xml')

    expect(documentXml).toContain('Page 1')
    expect(documentXml).toContain('Page 2')
    expect(documentXml).toContain('Page 3')
    expect(documentXml).toContain('<w:br w:type="page"/>')
  })
})
