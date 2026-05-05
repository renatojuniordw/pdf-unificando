import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

export type WatermarkColor = 'gray' | 'black' | 'red'

export interface WatermarkOptions {
  text: string
  opacity?: number
  fontSize?: number
  color?: WatermarkColor
}

const COLOR_MAP: Record<WatermarkColor, [number, number, number]> = {
  gray:  [0.6, 0.6, 0.6],
  black: [0.1, 0.1, 0.1],
  red:   [0.8, 0.1, 0.1],
}

export async function watermarkPdf(
  buffer: Buffer,
  { text, opacity = 0.3, fontSize = 60, color = 'gray' }: WatermarkOptions
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const [r, g, b] = COLOR_MAP[color]

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(45),
    })
  }

  return Buffer.from(await pdfDoc.save())
}
