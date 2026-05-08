import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export type PageNumberPlacement = 'header' | 'footer'
export type PageNumberAlignment = 'left' | 'center' | 'right'

export interface PageNumberOptions {
  placement?: PageNumberPlacement
  alignment?: PageNumberAlignment
  startAt?: number
  fontSize?: number
}

export async function addPageNumbers(
  buffer: Buffer,
  {
    placement = 'footer',
    alignment = 'center',
    startAt = 1,
    fontSize = 11,
  }: PageNumberOptions = {},
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const pages = pdfDoc.getPages()

  for (const [index, page] of pages.entries()) {
    const numberText = String(startAt + index)
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(numberText, fontSize)
    const x = resolveX(width, textWidth, alignment)
    const y = placement === 'header' ? height - 28 : 18

    page.drawText(numberText, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
  }

  return Buffer.from(await pdfDoc.save())
}

function resolveX(pageWidth: number, textWidth: number, alignment: PageNumberAlignment): number {
  if (alignment === 'left') return 24
  if (alignment === 'right') return Math.max(24, pageWidth - textWidth - 24)
  return Math.max(24, (pageWidth - textWidth) / 2)
}
