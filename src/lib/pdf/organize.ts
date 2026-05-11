import { PDFDocument } from 'pdf-lib'
import { parseOrder } from '@/lib/utils/file'
import { createApiError } from '@/lib/utils/http'

export async function organizePdf(buffer: Buffer, orderInput: string): Promise<Buffer> {
  const source = await PDFDocument.load(buffer)
  const totalPages = source.getPageCount()
  const order = parseOrder(orderInput).filter(i => i >= 0 && i < totalPages)

  if (!order.length) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Ordem de páginas inválida.', {
      field: 'order',
      reason: 'invalid_order',
    })
  }

  const result = await PDFDocument.create()
  const pages = await result.copyPages(source, order)
  pages.forEach(p => result.addPage(p))

  const bytes = await result.save()
  return Buffer.from(bytes)
}
