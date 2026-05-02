import { PDFDocument } from 'pdf-lib'
import { parseOrder } from '@/lib/utils/file'

export async function organizePdf(buffer: Buffer, orderInput: string): Promise<Buffer> {
  const source = await PDFDocument.load(buffer)
  const totalPages = source.getPageCount()
  const order = parseOrder(orderInput).filter(i => i >= 0 && i < totalPages)

  if (!order.length) throw new Error('Ordem de páginas inválida.')

  const result = await PDFDocument.create()
  const pages = await result.copyPages(source, order)
  pages.forEach(p => result.addPage(p))

  const bytes = await result.save()
  return Buffer.from(bytes)
}
