import { Writable } from 'stream'
import archiver from 'archiver'
import { PDFDocument } from 'pdf-lib'
import { parsePageRange } from '@/lib/utils/file'
import { createApiError } from '@/lib/utils/http'

export async function extractPdfPages(buffer: Buffer, rangeInput: string): Promise<Buffer> {
  const source = await PDFDocument.load(buffer)
  const totalPages = source.getPageCount()
  const indices = parsePageRange(rangeInput, totalPages)

  if (!indices.length) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Nenhuma página válida no intervalo informado.', {
      field: 'range',
      reason: 'invalid_range',
    })
  }

  const pageBuffers = await Promise.all(
    indices.map(async (pageIndex) => ({
      pageIndex,
      buffer: await createSinglePagePdf(source, pageIndex),
    })),
  )

  return zipPages(pageBuffers)
}

async function createSinglePagePdf(source: PDFDocument, pageIndex: number): Promise<Buffer> {
  const result = await PDFDocument.create()
  const [page] = await result.copyPages(source, [pageIndex])
  result.addPage(page)

  return Buffer.from(await result.save())
}

async function zipPages(pages: Array<{ pageIndex: number; buffer: Buffer }>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const archive = archiver('zip', { zlib: { level: 6 } })
    const sink = new Writable({
      write(chunk: Buffer, _enc: string, cb: () => void) {
        chunks.push(chunk)
        cb()
      },
    })

    sink.on('finish', () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)
    archive.pipe(sink)

    for (const page of pages) {
      archive.append(page.buffer, {
        name: `pagina-${String(page.pageIndex + 1).padStart(3, '0')}.pdf`,
      })
    }

    archive.finalize()
  })
}
