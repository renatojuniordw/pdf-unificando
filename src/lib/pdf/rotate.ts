import { PDFDocument, degrees } from 'pdf-lib'

export type RotationDegrees = 90 | 180 | 270
export type RotationScope = 'all' | 'page'

export async function rotatePdf(
  buffer: Buffer,
  deg: RotationDegrees,
  scope: RotationScope,
  pageIndex?: number
): Promise<Buffer> {
  const doc = await PDFDocument.load(buffer)
  const pages = doc.getPages()

  if (scope === 'all') {
    pages.forEach(p => {
      const current = p.getRotation().angle
      p.setRotation(degrees((current + deg) % 360))
    })
  } else if (scope === 'page' && pageIndex !== undefined) {
    const page = pages[pageIndex]
    if (!page) throw new Error('Página não encontrada.')
    const current = page.getRotation().angle
    page.setRotation(degrees((current + deg) % 360))
  }

  const bytes = await doc.save()
  return Buffer.from(bytes)
}
