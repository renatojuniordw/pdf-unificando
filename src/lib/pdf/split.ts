import { PDFDocument } from 'pdf-lib'
import { parsePageRange } from '@/lib/utils/file'
import { createApiError } from '@/lib/utils/http'

export async function splitPdf(buffer: Buffer, rangeInput: string): Promise<Buffer> {
  const source = await PDFDocument.load(buffer)
  const totalPages = source.getPageCount()
  const indices = parsePageRange(rangeInput, totalPages)

  if (!indices.length) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Nenhuma página válida no intervalo informado.', {
      field: 'range',
      reason: 'invalid_range',
    })
  }

  const result = await PDFDocument.create()
  const pages = await result.copyPages(source, indices)
  pages.forEach(p => result.addPage(p))

  const bytes = await result.save()
  return Buffer.from(bytes)
}
