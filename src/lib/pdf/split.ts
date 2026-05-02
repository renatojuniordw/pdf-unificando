import { PDFDocument } from 'pdf-lib'
import { parsePageRange } from '@/lib/utils/file'

export async function splitPdf(buffer: Buffer, rangeInput: string): Promise<Buffer> {
  const source = await PDFDocument.load(buffer)
  const totalPages = source.getPageCount()
  const indices = parsePageRange(rangeInput, totalPages)

  if (!indices.length) throw new Error('Nenhuma página válida no intervalo informado.')

  const result = await PDFDocument.create()
  const pages = await result.copyPages(source, indices)
  pages.forEach(p => result.addPage(p))

  const bytes = await result.save()
  return Buffer.from(bytes)
}
