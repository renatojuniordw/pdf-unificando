import { execFile } from 'child_process'
import { readFileSync } from 'fs'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { extractPdfPages } from '@/lib/pdf/extract-pages'

const execFileAsync = promisify(execFile)

async function listZipEntries(buffer: Buffer): Promise<string[]> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'extract-pages-test-'))
  const zipPath = path.join(tempDir, 'output.zip')

  try {
    await writeFile(zipPath, buffer)
    const { stdout } = await execFileAsync('/usr/bin/zipinfo', ['-1', zipPath], {
      encoding: 'utf8',
    })

    return stdout.trim().split('\n').filter(Boolean)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

async function readZipEntry(buffer: Buffer, entry: string): Promise<Buffer> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'extract-pages-test-'))
  const zipPath = path.join(tempDir, 'output.zip')

  try {
    await writeFile(zipPath, buffer)
    const { stdout } = await execFileAsync('/usr/bin/unzip', ['-p', zipPath, entry], {
      encoding: 'buffer',
    })

    return stdout as Buffer
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

describe('lib/pdf/extract-pages', () => {
  it('deve gerar um zip com um PDF por pagina selecionada', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))

    const result = await extractPdfPages(multiPagePdf, '1,3')
    const entries = await listZipEntries(result)

    expect(result.slice(0, 2).toString()).toBe('PK')
    expect(entries).toEqual(['pagina-001.pdf', 'pagina-003.pdf'])
  })

  it('deve criar PDFs individuais validos dentro do zip', async () => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    const multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))

    const result = await extractPdfPages(multiPagePdf, '2')
    const pagePdf = await readZipEntry(result, 'pagina-002.pdf')
    const pdf = await PDFDocument.load(pagePdf)

    expect(pdf.getPageCount()).toBe(1)
  })
})
